import express from "express";
import cookieParser from 'cookie-parser';
import { PORT } from "./config/env.js";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended: false}))

app.get('/', (req, res) => {
  res.send('Welcome to the Subscription Tracker API!');
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
});

export default app;