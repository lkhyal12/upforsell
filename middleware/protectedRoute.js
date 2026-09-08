import jwt from "jsonwebtoken";
import dotenv from "dotenv";

import UserModel from "../models/UserModel.js";
import { logControllerError } from "../lib/utils.js";

dotenv.config();

export async function protectedRoute(req, res, next) {
  const authorization = req.headers.authorization;

  if (!authorization) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  try {
    const accessToken = authorization.startsWith("Bearer ")
      ? authorization.split(" ")[1]
      : authorization;

    if (!accessToken) {
      return res.status(401).json({
        message: "Missing access token",
      });
    }

    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

    const user = await UserModel.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    req.user = user;

    next();
  } catch (err) {
    logControllerError("protectedRoute", err);

    return res.status(401).json({
      message: "Invalid or expired access token",
    });
  }
}
