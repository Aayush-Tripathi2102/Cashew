import express from "express";
import cookieParser from "cookie-parser";
import { PORT } from "./config/env.js";
import planRouter from "./routes/plan.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import tokenRouter from "./routes/token.routes.js";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

app.use("/api/v1/plans", planRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("/api/v1/token", tokenRouter);

app.get("/auth", (req, res) => {
  //const {} = req.body;

  res.send("Welcome to the Subscription Tracker API!");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
