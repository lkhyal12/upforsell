import express, { json } from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { connectToMongoDB } from "./lib/utils.js";
import authRouter from "./routes/authRoutes.js";
import productsRouter from "./routes/productsRoutes.js";
import cartRouter from "./routes/cartRoutes.js";
dotenv.config();

const app = express();
app.use(cookieParser());
app.use(json({ limit: "5mb" }));
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);
const PORT = process.env.PORT || 5000;
app.use("/api/auth", authRouter);
app.use("/api/products", productsRouter);
app.use("/api/cart", cartRouter);
app.listen(process.env.PORT, async () => {
  connectToMongoDB();
  console.log(`server is running on port ${PORT}`);
});
