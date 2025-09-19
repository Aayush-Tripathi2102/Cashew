import { config } from "dotenv";

config({ path: `.env.${process.env.NODE_ENV || "development"}.local` });

export const {
  PORT,
  REGISTRY_ADDRESS,
  RPC_URL,
  PRIVATE_KEY,
  SUBSCRIPTION_ADDRESS,
  USER_PRIVATE_KEY,
  TOKEN_ADDRESS
} = process.env;
