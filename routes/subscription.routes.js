import { Router } from "express";
import { subscriptionManagerAsUser } from "../ethers/ethers.js";

const subscriptionRouter = Router();

subscriptionRouter.post("/subscribe", async (req, res) => {
  try {
    console.log("vardhman: ", subscriptionManagerAsUser);
    const { planId, cap } = req.body;
    if (planId == null || cap == null)
      return res.status(400).send({ error: "missing params" });

    const contract = subscriptionManagerAsUser;
    const tx = await contract.subscribe(planId, cap);
    const receipt = await tx.wait();

    console.log(receipt);
    return res.send({ receipt });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: "failed to subscribe" });
  }
});

subscriptionRouter.post("/:planId/renew", async (req, res) => {
  try {
    const { planId } = req.params;
    const { subscriber } = req.body;
    if (planId == null || !subscriber)
      return res.status(400).send({ error: "missing params" });

    const contract = subscriptionManagerAsUser;
    const tx = await contract.renewSubscription(planId, subscriber);
    const receipt = await tx.wait();

    return res.send({ txHash: receipt.transactionHash, ...(eventData || {}) });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: "failed to renew" });
  }
});



export default subscriptionRouter;
