import express from "express";
import cookieParser from "cookie-parser";
import { ethers } from "ethers";
import { PORT, REGISTRY_ADDRESS, PRIVATE_KEY, RPC_URL } from "./config/env.js";

const app = express();
const provider = new ethers.JsonRpcProvider(RPC_URL);
function buildWalletFromEnv(key) {
  if (!key) {
    throw new Error("Missing PRIVATE_KEY in environment");
  }
  const trimmed = String(key).trim();
  // If it's a mnemonic (12/24 words), construct from phrase
  if (trimmed.split(/\s+/).length >= 12) {
    return ethers.Wallet.fromPhrase(trimmed, provider);
  }
  // Otherwise expect a 32-byte hex private key
  const hex = trimmed.startsWith("0x") ? trimmed : `0x${trimmed}`;
  if (!/^0x[0-9a-fA-F]{64}$/.test(hex)) {
    throw new Error(
      "Invalid PRIVATE_KEY format. Expected 32-byte hex string with or without 0x prefix, or a valid mnemonic"
    );
  }
  return new ethers.Wallet(hex, provider);
}

let wallet;
try {
  wallet = buildWalletFromEnv(PRIVATE_KEY);
  //   console.log(`Wallet loaded: ${wallet.address}`);
} catch (e) {
  console.error(e);
  process.exit(1);
}

const registryAbi = [
  // Function: createPlan
  "function createPlan(address token, uint256 amount, uint32 interval, string calldata metadata) external returns (uint256)",

  // Function: getPlan
  "function getPlan(uint256 planId) external view returns (tuple(address creator, address token, uint256 amount, uint32 interval, string metadata, bool active))",

  // Function: deactivatePlan
  "function deactivatePlan(uint256 planId) external",

  // Event: PlanCreated
  "event PlanCreated(uint256 indexed planId, address indexed creator, address token, uint256 amount, uint32 interval)",
];

const registry = new ethers.Contract(REGISTRY_ADDRESS, registryAbi, wallet);

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.send("Welcome to the Subscription Tracker API!");
});

app.post("/plans", async (req, res) => {
  try {
    const { token, amount, interval, metadata } = req.body;
    if (!token || !amount || !interval)
      return res.status(400).send({ error: "missing params" });

    const parsedAmount =
      typeof amount === "string" ? BigInt(amount) : BigInt(amount);
    const parsedInterval =
      typeof interval === "string" ? Number(interval) : Number(interval);

    // predict returned planId without sending a tx (optional)
    let predictedPlanId = null;
    try {
      const preview = await registry.createPlan.staticCall(
        token,
        parsedAmount,
        parsedInterval,
        metadata || ""
      );
      predictedPlanId = preview;
    } catch (_) {}

    const tx = await registry.createPlan(
      token,
      parsedAmount,
      parsedInterval,
      metadata || ""
    );

    const receipt = await tx.wait();

    // parse PlanCreated event to get the emitted planId
    let createdPlanId = null;
    try {
      for (const log of receipt.logs) {
        if (
          (log.address || "").toLowerCase() ===
          (REGISTRY_ADDRESS || "").toLowerCase()
        ) {
          try {
            const parsed = registry.interface.parseLog(log);
            if (parsed && parsed.name === "PlanCreated") {
              createdPlanId =
                parsed.args.planId != null
                  ? parsed.args.planId.toString()
                  : null;
              break;
            }
          } catch (_) {}
        }
      }
    } catch (_) {}

    res.send({
      txHash: receipt.transactionHash,
      planId:
        createdPlanId ||
        (predictedPlanId != null ? predictedPlanId.toString() : null),
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "failed to create plan" });
  }
});

app.get("/plans/:planId", async (req, res) => {
  try {
    const { planId } = req.params;
    if (!planId) return res.status(400).send({ error: "planId is required" });

    const plan = await registry.getPlan(planId);

    // Ethers v6 returns BigInt for uint types; convert for JSON
    const response = {
      creator: plan.creator,
      token: plan.token,
      amount: plan.amount != null ? plan.amount.toString() : null,
      interval: plan.interval != null ? Number(plan.interval) : null,
      metadata: plan.metadata,
      active: Boolean(plan.active),
    };

    res.send(response);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "failed to fetch plan" });
  }
});
app.delete("/delete/:planId", async (req, res) => {
  try {
    const { planId } = req.params;
    if (!planId) return res.status(400).send({ error: "planId is required" });

    const idArg = typeof planId === "string" ? BigInt(planId) : BigInt(planId);
    const tx = await registry.deactivatePlan(idArg);
    const receipt = await tx.wait();
    return res.send({ txHash: receipt.transactionHash });
  } catch (error) {
    const message = String(
      error && error.message ? error.message : error || ""
    );
    if (message.includes("no plan"))
      return res.status(404).send({ error: "no plan" });
    if (message.includes("not allowed"))
      return res.status(403).send({ error: "not allowed" });
    console.error(error);
    return res.status(500).send({ error: "failed to deactivate plan" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
