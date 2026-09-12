import express from "express";
import {
  createProductController,
  deleteProductController,
  getAllProductsController,
  getSingleProduct,
  toggleIsFeaturedController,
  updateProductController,
} from "../controllers/productsController.js";
import { protectedRoute } from "../middleware/protectedRoute.js";
import { isAdmin } from "../middleware/isAdmin.js";
const productsRouter = express.Router();
productsRouter.get("/", getAllProductsController);
productsRouter.get("/:id", getSingleProduct);
productsRouter.post("/", protectedRoute, isAdmin, createProductController);
productsRouter.put("/:id", protectedRoute, isAdmin, updateProductController);
productsRouter.delete("/:id", protectedRoute, isAdmin, deleteProductController);
productsRouter.put(
  "/toggle-fetured/:id",
  protectedRoute,
  isAdmin,
  toggleIsFeaturedController,
);

export default productsRouter;
