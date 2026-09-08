import express from "express";
import {
  loginController,
  registerUserController,
  logoutController,
  getProfile,
  refreshController,
} from "../controllers/authControllers.js";
import { protectedRoute } from "../middleware/protectedRoute.js";
const authRouter = express.Router();
authRouter.post("/register", registerUserController);
authRouter.post("/login", loginController);
authRouter.post("/logout", logoutController);
authRouter.get("/profile", protectedRoute, getProfile);
authRouter.get("/refresh", refreshController);
export default authRouter;
