import mongoose from "mongoose";
import { logControllerError } from "../lib/utils.js";
import CartModel from "../models/CartModel.js";
import ProductModel from "../models/ProductModel.js";

// get cart controller
export async function getCartController(req, res) {
  const { userId, guestId } = req.body;

  if (!userId && !guestId)
    return res.status(400).json({ missing: "Guest And User ID" });
  try {
    let cart;
    if (userId) {
      cart = await CartModel.findOne({ user: req.user._id });
    } else cart = await CartModel.findOne({ guestId });
    if (!cart) return res.status(404).json({ message: "Not cart was found" });

    return res
      .status(200)
      .json({ message: "Cart was sent successfully", cart });
  } catch (err) {
    logControllerError(getCartController, err);
    return res.status(500).json({ message: "Server error" });
  }
}

// add to cart controller
export async function addToCartController(req, res) {
  const { guestId, userId, productId, color, size } = req.body;
  if (!guestId && !userId)
    return res.status(400).json({ message: "Missing guest and user ID" });

  if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({
      message: "Invalid or missing product ID",
    });
  }
  try {
    let cart;
    if (userId) {
      cart = await CartModel.findOne({ user: userId });
    } else cart = await CartModel.findOne({ guestId });

    if (!cart) return res.status(404).json({ message: "No cart was found" });
    const product = await ProductModel.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });
    const index = cart.cartItems.findIndex(
      (p) =>
        p.product.toString() === productId.toString() &&
        p.color === color &&
        p.size === size,
    );
    if (index >= 0) cart.cartItems[index].quantity++;
    else {
      const cartItem = {
        product: productId,
        color,
        size,
      };
      cart.cartItems.push(cartItem);
    }
    await cart.save();
    return res
      .status(200)
      .json({ message: "Product add to cart", cart, product });
  } catch (err) {
    logControllerError("addToCartController", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// delete from cart controller
export async function deleteFromCartController(req, res) {
  const { color, size, userId, guestId } = req.body;
  const { id: productId } = req.params;
  if (!guestId && !userId)
    return res.status(400).json({ message: "Missing user and guest ID" });

  if (!color || !size)
    return res.status(400).json({ message: "Color and Size are required" });

  if (!productId || !mongoose.Types.ObjectId.isValid(productId))
    return res.status(400).json({ message: "Inavlid or missing product ID" });

  try {
    let cart;
    if (userId) {
      cart = await CartModel.findOne({ user: req.user?._id });
    } else {
      cart = await CartModel.findOne({ guestId });
    }
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.cartItems = cart.cartItems.filter(
      (p) =>
        !(
          p.product.toString() === productId.toString() &&
          p.color === color &&
          p.size === size
        ),
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
  const { color, size, guestId, quantity } = req.body;
  const { id: productId } = req.params;
  const userId = req.user?._id;
  if (!userId && !guestId)
    return res
      .status(400)
      .json({ message: "Please provide guestId or authenticate as a user" });

  if (!color || !size)
    return res.status(400).json({ message: "Color and Size are required" });

  if (!Number.isInteger(quantity) || quantity <= 0)
    return res
      .status(400)
      .json({ message: "Quantity must be a postive integer" });

  if (!productId || !mongoose.Types.ObjectId.isValid(productId))
    return res.status(400).json({ message: "Missing or Invalid product ID" });

  try {
    let cart;
    if (userId) {
      cart = await CartModel.findOne({ user: userId });
    } else cart = await CartModel.findOne({ guestId });

    if (!cart) return res.status(400).json({ message: "Cart nit found" });

    const index = cart.cartItems.findIndex(
      (p) =>
        p.product.toString() === productId.toString() &&
        p.color === color &&
        p.size === size,
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
