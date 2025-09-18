import { ethers } from "ethers";
import { REGISTRY_ADDRESS, PRIVATE_KEY, RPC_URL } from "../config/env.js";

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

const registryAbi = [
  "function createPlan(address token, uint256 amount, uint32 interval, string calldata metadata) external returns (uint256)",
  "function getPlan(uint256 planId) external view returns (tuple(address creator, address token, uint256 amount, uint32 interval, string metadata, bool active))",
  "function deactivatePlan(uint256 planId) external",
  "event PlanCreated(uint256 indexed planId, address indexed creator, address token, uint256 amount, uint32 interval)",
];

const registry = new ethers.Contract(REGISTRY_ADDRESS, registryAbi, wallet);

export { provider, wallet, registry, registryAbi };
