import mongoose from "mongoose";
import { logControllerError } from "../lib/utils.js";
import ProductModel from "../models/ProductModel.js";

export async function getAllProductsController(req, res) {
  try {
    const products = await ProductModel.find({});
    return res
      .status(200)
      .json({ message: "Products sent successfully", products });
  } catch (err) {
    logControllerError("getAllProductsController", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// getSingleProduct
export async function getSingleProduct(req, res) {
  const { id } = req.params;
  if (!id) return res.status(400).json({ message: "Missing productID" });
  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(400).json({ message: "Invalid productID" });

  try {
    const product = await ProductModel.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    return res
      .status(200)
      .json({ message: "product sent successfully", product });
  } catch (err) {
    logControllerError("getSingleProduct", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// create product controller
export async function createProductController(req, res) {
  const { name, slug, description, price, category, brand, images } = req.body;
  if (
    !name ||
    !slug ||
    !description ||
    !price ||
    !category ||
    !brand ||
    !images ||
    images.length == 0
  )
    return res.status(400).json({ message: "All fields are required" });

  try {
    const product = await ProductModel.create({
      name,
      slug,
      description,
      price,
      category,
      brand,
      images,
    });

    return res
      .status(201)
      .json({ message: "Product created successfully", product });
  } catch (err) {
    logControllerError("create product", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// update product function

export async function updateProductController(req, res) {
  const { name, slug, description, price, category, brand, images } = req.body;
  const { id: productId } = req.params;
  if (!productId)
    return res.status(400).json({ message: "Missing product ID" });
  if (!mongoose.Types.ObjectId.isValid(productId))
    return res.status(400).json({ message: "Invalid product ID" });
  try {
    const product = await ProductModel.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });
    if (name) product.name = name;
    if (price) product.price = price;
    if (description) product.description = description;
    if (category) product.category = category;
    if (slug) product.slug = slug;
    if (brand) product.brand = brand;
    if (images) product.images = images;
    await product.save();
    return res
      .status(200)
      .json({ message: "Product updated successfully", product });
  } catch (err) {
    logControllerError("updateProductController", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// delete product controller
export async function deleteProductController(req, res) {
  const { id } = req.params;
  if (!id || !mongoose.Types.ObjectId.isValid(id))
    return res.status(400).json({ message: "Invalid or missing product ID" });
  try {
    const product = await ProductModel.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    await product.deleteOne();
    return res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    logControllerError("deleteProductController", err);
    return res.status(500).json({ message: "Server error" });
  }
}
