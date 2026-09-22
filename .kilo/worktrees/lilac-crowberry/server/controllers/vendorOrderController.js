import mongoose from "mongoose";
import Order from "../models/order.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { getIO } from "../socket/socket.js";

// ─── DASHBOARD ─────────────────────────────────────────────
export const getVendorDashboard = asyncHandler(async (req, res) => {
  const vendorId = req.vendor._id;

  const totalOrders = await Order.countDocuments({ vendor: vendorId });
  const pendingOrders = await Order.countDocuments({
    vendor: vendorId,
    status: "placed",
  });
  const completedOrders = await Order.countDocuments({
    vendor: vendorId,
    status: "delivered",
  });
  const revenue = await Order.aggregate([
    { $match: { vendor: vendorId, status: "delivered" } },
    { $group: { _id: null, total: { $sum: "$pricing.grandTotal" } } },
  ]);

  res.json({
    success: true,
    data: {
      totalOrders,
      pendingOrders,
      completedOrders,
      revenue: revenue[0]?.total || 0,
    },
  });
});

/* =====================================================
   GET VENDOR ORDERS (with pagination & search)
===================================================== */
export const getVendorOrders = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 20, 100);
  const { status, search } = req.query;

  const query = { vendor: req.vendor._id };

  if (status) query.status = status;
  if (search?.trim()) {
    query.orderNumber = { $regex: search.trim(), $options: "i" };
  }

  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find(query)
      .populate("customer", "firstName lastName phone profileImage")
      .populate("rider", "firstName lastName phone profileImage")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Order.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    data: {
      orders,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    },
  });
});

/* =====================================================
   LIVE ORDERS (active statuses)
===================================================== */
export const getVendorLiveOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({
    vendor: req.vendor._id,
    status: {
      $in: [
        "placed",
        "confirmed",
        "preparing",
        "ready_for_pickup",
        "rider_assigned",
        "picked_up",
        "on_the_way",
      ],
    },
  })
    .populate("customer", "firstName lastName phone profileImage")
    .populate("rider", "firstName lastName phone profileImage")
    .sort({ createdAt: 1 })
    .lean();

  res.status(200).json({ success: true, data: { orders } });
});

/* =====================================================
   ORDER DETAIL
===================================================== */
export const getVendorOrderById = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.orderId)) {
    throw new ApiError(400, "Invalid order id");
  }

  const order = await Order.findOne({
    _id: req.params.orderId,
    vendor: req.vendor._id,
  })
    .populate("customer", "firstName lastName email phone profileImage")
    .populate("rider", "firstName lastName phone profileImage");

  if (!order) throw new ApiError(404, "Order not found");

  res.status(200).json({ success: true, data: { order } });
});

/* =====================================================
   ACCEPT ORDER
===================================================== */
export const acceptVendorOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({
    _id: req.params.orderId,
    vendor: req.vendor._id,
  });

  if (!order) throw new ApiError(404, "Order not found");
  if (order.status !== "placed") {
    throw new ApiError(400, "Only new orders can be accepted");
  }

  order.status = "preparing";
  await order.save();

  const io = getIO();
  if (io) {
    io.to(`order:${order._id.toString()}`).emit("order:updated", order);
    io.to(`vendor:${order.vendor}`).emit("order:updated", order);
    io.to(`customer:${order.customer}`).emit("order:updated", order);
  }

  res.status(200).json({
    success: true,
    message: "Order accepted",
    data: { order },
  });
});

/* =====================================================
   REJECT ORDER
===================================================== */
export const rejectVendorOrder = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  if (!reason?.trim()) {
    throw new ApiError(400, "Rejection reason required");
  }

  const order = await Order.findOne({
    _id: req.params.orderId,
    vendor: req.vendor._id,
  });

  if (!order) throw new ApiError(404, "Order not found");
  if (order.status !== "placed") {
    throw new ApiError(400, "This order cannot be rejected");
  }

  order.status = "rejected";
  order.cancellation = {
    cancelledBy: "vendor",
    reason: reason.trim(),
    cancelledAt: new Date(),
  };

  await order.save();

  const io = getIO();
  if (io) {
    io.to(`order:${order._id.toString()}`).emit("order:updated", order);
    io.to(`vendor:${order.vendor}`).emit("order:updated", order);
    io.to(`customer:${order.customer}`).emit("order:updated", order);
  }

  res.status(200).json({
    success: true,
    message: "Order rejected",
  });
});

/* =====================================================
   UPDATE ORDER STATUS (Vendor transitions)
   ✅ Allows vendor to mark ready and confirm pickup
===================================================== */
const allowedVendorTransitions = {
  preparing: ["ready_for_pickup"],
  ready_for_pickup: ["picked_up"], // vendor confirms rider arrived
  rider_assigned: ["picked_up"], // also allow if rider assigned
};

export const updateVendorOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const order = await Order.findOne({
    _id: req.params.orderId,
    vendor: req.vendor._id,
  });

  if (!order) throw new ApiError(404, "Order not found");

  const allowed = allowedVendorTransitions[order.status] || [];
  if (!allowed.includes(status)) {
    throw new ApiError(
      400,
      `Cannot change order from ${order.status} to ${status}`,
    );
  }

  console.log(`📦 Before vendor update: ${order.status} → ${status}`);

  // Update status
  order.status = status;

  // When order becomes ready, clear rider so it appears for new riders
  if (status === "ready_for_pickup") {
    order.rider = null;
  }

  await order.save();

  const io = getIO();

  // ─── Special event for ready orders ──────────────────
  if (status === "ready_for_pickup" && io) {
    const populatedOrder = await Order.findById(order._id)
      .populate("vendor", "businessName address location")
      .populate("items");
    io.emit("new_ready_order", populatedOrder);
  }

  // ─── Broadcast to all relevant channels ──────────────
  if (io) {
    io.to(`order:${order._id.toString()}`).emit("order:updated", order);
    io.to(`vendor:${order.vendor}`).emit("order:updated", order);
    io.to(`customer:${order.customer}`).emit("order:updated", order);
  }

  res.status(200).json({
    success: true,
    message: "Order status updated",
    data: { order },
  });
});
