import express from "express";
import { protectedRoute } from "../middleware/protectedRoute.js";
import {
  deleteOrderController,
  getSingleOrderController,
  getUserOrdersController,
  updateOrderStatusController,
} from "../controllers/orderControllers.js";
import { isAdmin } from "../middleware/isAdmin.js";
const orderRouter = express.Router();

orderRouter.get("/", protectedRoute, getUserOrdersController);
orderRouter.get("/:id", protectedRoute, getSingleOrderController);
orderRouter.delete("/:id", protectedRoute, isAdmin, deleteOrderController);
orderRouter.put("/:id", protectedRoute, isAdmin, updateOrderStatusController);
export default orderRouter;
