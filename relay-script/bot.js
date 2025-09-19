import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

// RPC (Sepolia via Alchemy)
const RPC_URL = process.env.RPC_URL_ALCHEMY;
const provider = new ethers.JsonRpcProvider(RPC_URL);

// Relayer wallet (pays gas, receives relayerReward)
const relayer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

//subscriber
const subscriber = "0x8FA8D5711AfEB638f228338D701a741B7B0F4Be2";
const planId = 3;

// SubscriptionManager details
const subscriptionManagerAddress = "0xCb378466F9c69FB7C2E3e63669CD9FC1A2f4C7C4";
const subscriptionManagerABI = [
  "function renewSubscription(uint256 planId, address subscriber) external"
];
const subscriptionManager = new ethers.Contract(subscriptionManagerAddress, subscriptionManagerABI, relayer);

// Nut token details
const tokenAddress = "0xB5D4863c1e4973456CB5e10b5809432462EA5737"; // replace with your token
const tokenABI = [
  "function balanceOf(address account) external view returns (uint256)"
];
const token = new ethers.Contract(tokenAddress, tokenABI, provider);

let balance = await token.balanceOf("0x96A2E283D00DAfb40cccE3A6DBA5cE1b37d9910d");
  console.log(`Initial Balance of "creator": raw=${balance.toString()} formatted=${ethers.formatUnits(balance, 18)}`);
  balance = await token.balanceOf(subscriber);
  console.log(`Initial Balance of "user": raw=${balance.toString()} formatted=${ethers.formatUnits(balance, 18)}`);



async function renewIfDue(planId, subscriber) {
  const tx = await subscriptionManager.renewSubscription(planId, subscriber);
  console.log("Renew tx sent:", tx.hash);

  await tx.wait();
  console.log("Renew confirmed");


  await new Promise((resolve) => setTimeout(resolve, 10_000));

  let balance = await token.balanceOf("0x96A2E283D00DAfb40cccE3A6DBA5cE1b37d9910d");
  console.log(`Balance of "creator": raw=${balance.toString()} formatted=${ethers.formatUnits(balance, 18)}`);
  balance = await token.balanceOf(subscriber);
  console.log(`Balance of "user": raw=${balance.toString()} formatted=${ethers.formatUnits(balance, 18)}`);
}

async function main() {
    try {
      await renewIfDue(planId, subscriber);
    } catch (e) {
      console.error(`Error renewing for ${subscriber}, plan ${planId}`, e.reason);
    }
}

setInterval(main, 65 * 1000);
