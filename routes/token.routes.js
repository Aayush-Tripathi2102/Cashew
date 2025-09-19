import { Router } from "express";
import { token, wallet } from "../ethers/ethers.js";

const tokenRouter = Router();

tokenRouter.get("/balance", async (req, res) => {
  try {
    const balance = await token.balanceOf(wallet.address);
    res.send({
      wallet: wallet.address,
      balance: balance.toString(),
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Failed to get balance" });
  }
});

export default tokenRouter;
