import mongoose from "mongoose";
import { logControllerError } from "../lib/utils.js";
import CartModel from "../models/CartModel.js";
import ProductModel from "../models/ProductModel.js";
const dummyJsonBaseUrl = "https://dummyjson.com/products";
// get cart controller
export async function getCartController(req, res) {
  const { userId, guestId } = req.query;
  if (!userId && !guestId)
    return res.status(400).json({ missing: "Guest And User ID" });
  try {
    let cart;
    if (userId) {
      cart = await CartModel.findOne({ user: userId }).populate(
        "cartItems.product",
      );
    } else
      cart = await CartModel.findOne({ guestId }).populate("cartItems.product");
    if (!cart) return res.status(404).json({ message: "Not cart was found" });

    return res
      .status(200)
      .json({ message: "Cart was sent successfully", cart });
  } catch (err) {
    logControllerError("getCartController", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// add to cart controller
export async function addToCartController(req, res) {
  const { productId, color, size, guestId, userId } = req.body;
  if (!userId && !guestId)
    return res
      .status(400)
      .json({ message: "Missing user guest identification" });

  if (productId === undefined || productId == null || productId === "")
    return res.status(400).json({ message: "Missing product ID" });
  if (!color || !size)
    return res.status(400).json({ message: "Color and Size are required" });

  try {
    let product;
    let isDummyProduct = false;

    if (mongoose.isObjectIdOrHexString(String(productId))) {
      product = await ProductModel.findById(productId);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
    } else {
      const dummyId = Number(productId);
      if (!Number.isInteger(dummyId) || dummyId <= 0) {
        return res.status(404).json({ message: "Invalid product ID" });
      }

      const response = await fetch(`${dummyJsonBaseUrl}/${productId}`);

      if (!response.ok)
        return res.status(404).json({ message: "Product not found" });
      product = await response.json();
      isDummyProduct = true;
    }
    let cart = await CartModel.findOne(userId ? { user: userId } : { guestId });
    if (!cart) {
      cart = await CartModel.create(
        userId ? { user: userId, cartItems: [] } : { guestId, cartItems: [] },
      );
    }

    const existingProduct = cart.cartItems.find((item) => {
      const sameProduct = isDummyProduct
        ? item.dummyProduct?.id == productId
        : item.product.toString() === productId.toString();

      return sameProduct && item.color === color && item.size === size;
    });

    if (existingProduct) {
      existingProduct.quantity++;
    } else {
      const newItem = {
        color,
        size,
        quantity: 1,
      };
      if (isDummyProduct) {
        newItem.dummyProduct = product;
      } else newItem.product = product._id;

      cart.cartItems.push(newItem);
    }

    await cart.save();
    if (!isDummyProduct) {
      await cart.populate("cartItems.product");
    }

    return res
      .status(200)
      .json({ message: "Product added to cart successfully", cart });
  } catch (err) {
    logControllerError("addToCartController", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// delete from cart controller
export async function deleteFromCartController(req, res) {
  console.log({ body: req.body });
  const { userId, guestId } = req.body;
  const { id: productId } = req.params;
  if (!guestId && !userId)
    return res.status(400).json({ message: "Missing user and guest ID" });

  // if (!color || !size)
  //   return res.status(400).json({ message: "Color and Size are required" });

  if (!productId && !mongoose.Types.ObjectId.isValid(productId))
    return res.status(400).json({ message: "Inavlid or missing product ID" });

  try {
    let cart;
    if (userId) {
      cart = await CartModel.findOne({ user: userId });
    } else {
      cart = await CartModel.findOne({ guestId });
    }
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.cartItems = cart.cartItems.filter(
      (p) => !(p.dummyProduct?.id?.toString() === productId?.toString()),
    );
    await cart.save();
    return res.status(200).json({ message: "product remove from cart", cart });
  } catch (err) {
    logControllerError("deleteFromCartController", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// update cart controller
export async function updateCartController(req, res) {
  const { guestId, quantity, userId } = req.body;
  const { id: productId } = req.params;
  // const userId = req.user?._id;
  console.log({ userId, guestId });
  if (!userId && !guestId)
    return res
      .status(400)
      .json({ message: "Please provide guestId or authenticate as a user" });

  // if (!color || !size)
  //   return res.status(400).json({ message: "Color and Size are required" });

  if (!Number.isInteger(quantity) || quantity <= 0)
    return res
      .status(400)
      .json({ message: "Quantity must be a postive integer" });

  if (!productId && !mongoose.Types.ObjectId.isValid(productId))
    return res.status(400).json({ message: "Missing or Invalid product ID" });

  try {
    let cart;
    if (userId) {
      cart = await CartModel.findOne({ user: userId });
    } else cart = await CartModel.findOne({ guestId });

    if (!cart) return res.status(400).json({ message: "Cart not found" });

    const index = cart.cartItems.findIndex(
      (p) => p.dummyProduct.id.toString() === productId.toString(),
    );
    if (index == -1)
      return res.status(404).json({ message: "Product not found in cart" });
    cart.cartItems[index].quantity = quantity;
    await cart.save();
    return res.status(200).json({ message: "Cart updated successfully", cart });
  } catch (err) {
    logControllerError("updateCartController", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// clear cart controller
export async function clearCartController(req, res) {
  const userId = req.user?._id;
  const { guestId } = req.body;
  if (!userId && !guestId) {
    return res
      .status(400)
      .json({ message: "Please provide guestId or auhtenticate as user" });
  }

  try {
    let cart;
    if (userId) {
      cart = await CartModel.findOne({ user: userId });
    } else cart = await CartModel.findOne({ guestId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });
    cart.cartItems = [];
    await cart.save();
    return res.status(200).json({ message: "Cart cleared successfully" });
  } catch (err) {
    logControllerError("clearCartController", err);
    return res.status(500).json({ message: "Server error" });
  }
}
