import express, { json } from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { connectToMongoDB } from "./lib/utils.js";
import authRouter from "./routes/authRoutes.js";
dotenv.config();

const app = express();
app.use(cookieParser());
app.use(json({ limit: "5m" }));
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);
const PORT = process.env.PORT || 5000;
app.use("/api/auth", authRouter);
app.listen(process.env.PORT, async () => {
  connectToMongoDB();
  console.log(`server is running on port ${PORT}`);
});
