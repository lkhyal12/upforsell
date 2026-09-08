import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export async function connectToMongoDB() {
  try {
    await mongoose.connect(process.env.MONGO_DB_URI);

    console.log("connected to mongodb successfully");
  } catch (err) {
    console.log("failed to connect to mongodb ", err);
  }
}

export function generateTokens(userId) {
  const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1h",
  });
  const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
  return { accessToken, refreshToken };
}

export function assignTokenToCookies(refreshToken, res) {
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export function logControllerError(functionName, error) {
  console.log(`error in the ${functionName}: ${error}`);
}
