import mongoose from "mongoose";

const CartItemSchema = new mongoose.Schema(
  {
    productId: {
      type: Number,
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    thumbnail: {
      type: String,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
  },
  { _id: false },
);

const CartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    guestId: {
      type: String,
    },
    cartItems: {
      type: [CartItemSchema],
      default: [],
    },
  },
  { timestamps: true },
);

const CartModel = mongoose.model("Cart", CartSchema);
export default CartModel;
