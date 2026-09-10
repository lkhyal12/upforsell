import express from "express";
import {
  getCartController,
  addToCartController,
  updateCartController,
  deleteFromCartController,
  clearCartController,
} from "../controllers/cartController.js";
const cartRouter = express.Router();

cartRouter.get("/", getCartController);
cartRouter.post("/", addToCartController);
cartRouter.put("/:id", updateCartController);
cartRouter.delete("/clear", clearCartController);
cartRouter.delete("/:id", deleteFromCartController);
export default cartRouter;
