import { ethers } from "ethers";
import {
  REGISTRY_ADDRESS,
  PRIVATE_KEY,
  RPC_URL,
  SUBSCRIPTION_ADDRESS,
  USER_PRIVATE_KEY,
} from "../config/env.js";

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const userWallet = new ethers.Wallet(USER_PRIVATE_KEY, provider);

const registryAbi = [
  "function createPlan(address token, uint256 amount, uint32 interval, string calldata metadata) external returns (uint256)",
  "function getPlan(uint256 planId) external view returns (tuple(address creator, address token, uint256 amount, uint32 interval, string metadata, bool active))",
  "function deactivatePlan(uint256 planId) external",
  "event PlanCreated(uint256 indexed planId, address indexed creator, address token, uint256 amount, uint32 interval)",
];

const subscriptionManagerAbi = [
  // External Functions
  "function getPlan(uint256 planId) view returns ((address creator, address token, uint256 amount, uint32 interval, string metadata, bool active))",
  "function subscribe(uint256 planId, uint256 cap)",
  "function renewSubscription(uint256 planId, address subscriber)",
  "function cancelSubscription(uint256 planId)",

  // Events
  "event Subscribed(address indexed subscriber, uint256 indexed planId, uint256 cap, uint256 nextBilling)",
  "event Renewed(address indexed subscriber, uint256 indexed planId, uint256 nextBilling)",
  "event Cancelled(address indexed subscriber, uint256 indexed planId)",
];
const registry = new ethers.Contract(REGISTRY_ADDRESS, registryAbi, wallet);
// const subscriptionManager = new ethers.Contract(
//   SUBSCRIPTION_ADDRESS,
//   subscriptionManagerAbi,
//   wallet
// );
const subscriptionManagerAsUser = new ethers.Contract(
  SUBSCRIPTION_ADDRESS,
  subscriptionManagerAbi,
  userWallet
);

export {
  provider,
  wallet,
  userWallet,
  registry,
  registryAbi,
  subscriptionManagerAsUser,
  subscriptionManagerAbi,
};
