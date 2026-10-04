import express from "express";
import {
  loginController,
  registerUserController,
  logoutController,
  getProfile,
  refreshController,
  sendResetPasswordCodeController,
  verifyEmailController,
  resetPasswordController,
} from "../controllers/authControllers.js";
import { protectedRoute } from "../middleware/protectedRoute.js";
const authRouter = express.Router();
authRouter.post("/register", registerUserController);
authRouter.post("/login", loginController);
authRouter.post("/logout", logoutController);
authRouter.get("/profile", protectedRoute, getProfile);
authRouter.get("/refresh", refreshController);
authRouter.post("/send-reset-code", sendResetPasswordCodeController);
authRouter.post("/verify-email", verifyEmailController);
authRouter.post("/send-reset-password-code", sendResetPasswordCodeController);
authRouter.post("/reset-password/:code", resetPasswordController);
export default authRouter;
