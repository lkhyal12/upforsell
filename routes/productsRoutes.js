import express from "express";
import {
  createProductController,
  deleteProductController,
  getAllProductsController,
  getSingleProduct,
  updateProductController,
} from "../controllers/productsController.js";

const productsRouter = express.Router();
productsRouter.get("/", getAllProductsController);
productsRouter.get("/:id", getSingleProduct);
productsRouter.post("/", createProductController);
productsRouter.put("/:id", updateProductController);
productsRouter.delete("/:id", deleteProductController);

export default productsRouter;
