import mongoose from "mongoose";
import { logControllerError } from "../lib/utils.js";
import OrderModel from "../models/OrderMidel.js";

const allowedStatuses = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

export async function getUserOrdersController(req, res) {
  const userId = req.user?._id;
  if (!userId)
    return res.status(401).json({ message: "Authentication required" });
  try {
    const orders = await OrderModel.find({ user: userId }).sort({
      createdAt: -1,
    });

    if (!orders.length)
      return res.status(404).json({ message: "No order were found" });

    return res.status(200).json({ message: "Order sent successfully", orders });
  } catch (err) {
    logControllerError("getUserOrdersController", err);
    return res.status(500).json({ message: "Server Error" });
  }
}

// get single order controller
export async function getSingleOrderController(req, res) {
  const { id } = req.params;
  if (!id) return res.status(400).json({ message: "Missing order ID" });
  try {
    const order = await OrderModel.findOne({
      _id: id,
      user: req.user?._d,
    });
    if (!order) return res.status(404).json({ message: "Order not found" });

    return res.status(200).json({ message: "Order sent successfully", order });
  } catch (err) {
    logControllerError("getSingleOrderController", err);
    return res.status(500).json({ message: "server error" });
  }
}

// delete order controller
export async function deleteOrderController(req, res) {
  const { id } = req.params;
  if (!id || !mongoose.Types.ObjectId.isValid(id))
    return res.status(400).json({ message: "Missing or invalid order ID" });

  try {
    const order = await OrderModel.findOne({
      _id: id,
      user: req.user._id,
    });
    if (!order) return res.status(404).json({ message: "Order not found" });

    await order.deleteOne();
    return res
      .status(200)
      .json({ message: "Order deleted successfully", order });
  } catch (err) {
    logControllerError("deleteOrder", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// update order status controller
export async function updateOrderStatusController(req, res) {
  const { id } = req.params;
  const { orderStatus } = req.body;
  if (!id || !mongoose.Types.ObjectId.isValid(id))
    return res.status(400).json({ message: "Missing or invalid order ID" });

  if (!orderStatus)
    return res.status(400).json({ message: "Order status is required" });

  if (!allowedStatuses.includes(orderStatus))
    return res.status(400).json({ message: "Invalid order status" });

  try {
    const order = await OrderModel.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    order.orderStatus = orderStatus;
    await order.save();
    return res
      .status(200)
      .json({ message: "Order status update successfully" });
  } catch (err) {
    logControllerError("updateOrderStatusController", err);
    return res.status(500).json({ message: "Server error" });
  }
}
