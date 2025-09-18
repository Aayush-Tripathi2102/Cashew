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

// // POST /api/v1/subscriptions/:planId/cancel
// subscriptionRouter.post("/:planId/cancel", async (req, res) => {
//   try {
//     const { planId } = req.params;
//     if (planId == null)
//       return res.status(400).send({ error: "missing params" });

//     const parsedPlanId =
//       typeof planId === "string" ? BigInt(planId) : BigInt(planId);

//     const contract = subscriptionManagerAsUser || subscriptionManager;
//     const tx = await contract.cancelSubscription(parsedPlanId);
//     const receipt = await tx.wait();

//     // Parse Cancelled(subscriber, planId)
//     let eventData = null;
//     try {
//       for (const log of receipt.logs) {
//         try {
//           const parsed = (
//             contract.interface || subscriptionManager.interface
//           ).parseLog(log);
//           if (parsed && parsed.name === "Cancelled") {
//             eventData = {
//               subscriber: parsed.args.subscriber,
//               planId:
//                 parsed.args.planId != null
//                   ? parsed.args.planId.toString()
//                   : null,
//             };
//             break;
//           }
//         } catch (_) {}
//       }
//     } catch (_) {}

//     return res.send({ txHash: receipt.transactionHash, ...(eventData || {}) });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).send({ error: "failed to cancel" });
//   }
// });

export default subscriptionRouter;
