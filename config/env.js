import { config } from "dotenv";

config({ path: `.env.${process.env.NODE_ENV || 'development'}.local` });

export const {PORT, REGISTRY_ADDRESS, RPC_URL, PRIVATE_KEY} = process.env

