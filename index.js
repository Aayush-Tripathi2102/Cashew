import express from "express";
import cookieParser from "cookie-parser";
import { PORT } from "./config/env.js";
import planRouter from "./routes/plan.routes.js";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

app.use('/api/v1/plans', planRouter);


app.get("/", (req, res) => {
  res.send("Welcome to the Subscription Tracker API!");
});

// app.post("/plans", async (req, res) => {
//   try {
//     const { token, amount, interval, metadata } = req.body;
//     if (!token || !amount || !interval)
//       return res.status(400).send({ error: "missing params" });

//     const parsedAmount =
//       typeof amount === "string" ? BigInt(amount) : BigInt(amount);
//     const parsedInterval =
//       typeof interval === "string" ? Number(interval) : Number(interval);

//     // predict returned planId without sending a tx (optional)
//     let predictedPlanId = null;
//     try {
//       const preview = await registry.createPlan.staticCall(
//         token,
//         parsedAmount,
//         parsedInterval,
//         metadata || ""
//       );
//       predictedPlanId = preview;
//     } catch (_) {}

//     const tx = await registry.createPlan(
//       token,
//       parsedAmount,
//       parsedInterval,
//       metadata || ""
//     );

//     const receipt = await tx.wait();

//     // parse PlanCreated event to get the emitted planId
//     let createdPlanId = null;
//     try {
//       for (const log of receipt.logs) {
//         if (
//           (log.address || "").toLowerCase() ===
//           (REGISTRY_ADDRESS || "").toLowerCase()
//         ) {
//           try {
//             const parsed = registry.interface.parseLog(log);
//             if (parsed && parsed.name === "PlanCreated") {
//               createdPlanId =
//                 parsed.args.planId != null
//                   ? parsed.args.planId.toString()
//                   : null;
//               break;
//             }
//           } catch (_) {}
//         }
//       }
//     } catch (_) {}

//     res.send({
//       txHash: receipt.transactionHash,
//       planId:
//         createdPlanId ||
//         (predictedPlanId != null ? predictedPlanId.toString() : null),
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send({ error: "failed to create plan" });
//   }
// });

// app.get("/plans/:planId", async (req, res) => {
//   try {
//     const { planId } = req.params;
//     if (!planId) return res.status(400).send({ error: "planId is required" });

//     const plan = await registry.getPlan(planId);

//     // Ethers v6 returns BigInt for uint types; convert for JSON
//     const response = {
//       creator: plan.creator,
//       token: plan.token,
//       amount: plan.amount != null ? plan.amount.toString() : null,
//       interval: plan.interval != null ? Number(plan.interval) : null,
//       metadata: plan.metadata,
//       active: Boolean(plan.active),
//     };

//     res.send(response);
//   } catch (error) {
//     console.error(error);
//     res.status(500).send({ error: "failed to fetch plan" });
//   }
// });
// app.delete("/delete/:planId", async (req, res) => {
//   try {
//     const { planId } = req.params;
//     if (!planId) return res.status(400).send({ error: "planId is required" });

//     const idArg = typeof planId === "string" ? BigInt(planId) : BigInt(planId);
//     const tx = await registry.deactivatePlan(idArg);
//     const receipt = await tx.wait();
//     return res.send({ txHash: receipt.transactionHash });
//   } catch (error) {
//     const message = String(
//       error && error.message ? error.message : error || ""
//     );
//     if (message.includes("no plan"))
//       return res.status(404).send({ error: "no plan" });
//     if (message.includes("not allowed"))
//       return res.status(403).send({ error: "not allowed" });
//     console.error(error);
//     return res.status(500).send({ error: "failed to deactivate plan" });
//   }
// });

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
