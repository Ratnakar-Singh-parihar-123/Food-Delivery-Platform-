import mongoose from "mongoose";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import Order from "../models/order.js";
import Vendor from "../models/vendor.js";
import Rider from "../models/rider.js";
import Customer from "../models/customer.js";
import SupportTicket from "../models/supportTicket.js";
import ServiceArea from "../models/serviceArea.js";

// ─── DASHBOARD STATS ──────────────────────────────────────
export const getDashboardStats = asyncHandler(async (req, res) => {
  // Get counts and aggregates
  const [
    totalOrders,
    grossOrderValue,
    platformRevenue,
    activeVendors,
    onlineRiders,
  ] = await Promise.all([
    Order.countDocuments(),
    Order.aggregate([
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]),
    Order.aggregate([
      { $match: { status: { $in: ["delivered", "completed"] } } },
      { $group: { _id: null, total: { $sum: "$platformFee" } } },
    ]),
    Vendor.countDocuments({ isActive: true }),
    Rider.countDocuments({ isOnline: true }),
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalOrders,
      grossOrderValue: grossOrderValue[0]?.total || 0,
      platformRevenue: platformRevenue[0]?.total || 0,
      activeVendors,
      onlineRiders,
    },
  });
});

// ─── ORDERS OVERVIEW (chart data) ────────────────────────
export const getOrdersOverview = asyncHandler(async (req, res) => {
  const { period = "today" } = req.query;

  let startDate = new Date();
  if (period === "today") {
    startDate.setHours(0, 0, 0, 0);
  } else if (period === "7days") {
    startDate.setDate(startDate.getDate() - 7);
  } else if (period === "30days") {
    startDate.setDate(startDate.getDate() - 30);
  } else {
    // custom – you can accept from/to dates if needed
    startDate = new Date(0); // from beginning
  }

  // Group by day and count orders
  const orders = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Format for the chart: { day, orders }
  const data = orders.map((item) => ({
    day: item._id,
    orders: item.count,
  }));

  res.status(200).json({ success: true, data });
});

// ─── REVENUE BREAKDOWN ────────────────────────────────────
export const getRevenueBreakdown = asyncHandler(async (req, res) => {
  // Example breakdown: platform fee, delivery fee, commission, etc.
  // This depends on your revenue model; adjust accordingly.
  const breakdown = await Order.aggregate([
    {
      $facet: {
        platformFee: [
          { $group: { _id: null, total: { $sum: "$platformFee" } } },
        ],
        deliveryFee: [
          { $group: { _id: null, total: { $sum: "$deliveryFee" } } },
        ],
        commission: [{ $group: { _id: null, total: { $sum: "$commission" } } }],
        other: [{ $group: { _id: null, total: { $sum: "$otherCharges" } } }],
      },
    },
  ]);

  const result = breakdown[0] || {};
  const data = [
    { name: "Platform Fee", value: result.platformFee?.[0]?.total || 0 },
    { name: "Delivery Fee", value: result.deliveryFee?.[0]?.total || 0 },
    { name: "Commission", value: result.commission?.[0]?.total || 0 },
    { name: "Other", value: result.other?.[0]?.total || 0 },
  ].filter((item) => item.value > 0);

  res.status(200).json({ success: true, data });
});

// ─── ACTIVE ORDERS ────────────────────────────────────────
export const getActiveOrders = asyncHandler(async (req, res) => {
  const statuses = [
    "preparing",
    "waiting_for_rider",
    "picked_up",
    "on_the_way",
  ];
  const counts = await Order.aggregate([
    { $match: { status: { $in: statuses } } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  const result = {
    total: 0,
    preparing: 0,
    waitingForRider: 0,
    pickedUp: 0,
    onTheWay: 0,
  };

  counts.forEach((item) => {
    result.total += item.count;
    const key = item._id.replace(/_([a-z])/g, (_, letter) =>
      letter.toUpperCase(),
    );
    result[key] = item.count;
  });

  res.status(200).json({ success: true, data: result });
});

// ─── RIDER STATUS ──────────────────────────────────────────
export const getRiderStatus = asyncHandler(async (req, res) => {
  const result = {
    total: 0,
    online: 0,
    busy: 0,
    available: 0,
    offline: 0,
  };

  const allRiders = await Rider.find({});
  result.total = allRiders.length;
  allRiders.forEach((rider) => {
    if (rider.isOnline) {
      result.online++;
      if (rider.isBusy) result.busy++;
      else result.available++;
    } else {
      result.offline++;
    }
  });

  res.status(200).json({ success: true, data: result });
});

// ─── RECENT ORDERS ────────────────────────────────────────
export const getRecentOrders = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;

  const recent = await Order.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("customerId", "name")
    .populate("vendorId", "name")
    .populate("riderId", "name")
    .lean();

  const orders = recent.map((order) => ({
    id: order._id,
    customer: order.customerId?.name || "Unknown",
    vendor: order.vendorId?.name || "Unknown",
    rider: order.riderId?.name || "Unassigned",
    amount: order.totalAmount,
    payment: order.paymentMethod || "Online",
    status: order.status,
    time: order.createdAt.toLocaleTimeString(),
  }));

  res.status(200).json({ success: true, data: orders });
});

// ─── TOP VENDORS ──────────────────────────────────────────
export const getTopVendors = asyncHandler(async (req, res) => {
  // Aggregate orders to get revenue and order count per vendor
  const vendors = await Vendor.aggregate([
    {
      $lookup: {
        from: "orders",
        localField: "_id",
        foreignField: "vendorId",
        as: "orders",
      },
    },
    {
      $addFields: {
        orderCount: { $size: "$orders" },
        revenue: { $sum: "$orders.totalAmount" },
      },
    },
    { $sort: { revenue: -1 } },
    { $limit: 5 },
    {
      $project: {
        name: 1,
        type: 1,
        orderCount: 1,
        revenue: 1,
        rating: 1,
        status: 1,
      },
    },
  ]);

  // Format response
  const data = vendors.map((v) => ({
    name: v.name,
    type: v.type || "Restaurant",
    orders: v.orderCount || 0,
    revenue: v.revenue || 0,
    rating: v.rating || 4.5,
    status: v.status === "active" ? "Open" : "Closed",
  }));

  res.status(200).json({ success: true, data });
});

// ─── PENDING VENDORS ──────────────────────────────────────
export const getPendingVendors = asyncHandler(async (req, res) => {
  const pending = await Vendor.find({ status: "pending" })
    .select("businessName type ownerName createdAt")
    .lean();

  const data = pending.map((v) => ({
    business: v.businessName,
    type: v.type,
    owner: v.ownerName,
    date: v.createdAt.toLocaleDateString(),
  }));

  res.status(200).json({ success: true, data });
});

// ─── PENDING RIDERS ──────────────────────────────────────
// export const getPendingRiders = asyncHandler(async (req, res) => {
//   const pending = await Rider.find({ kycStatus: "pending" })
//     .select("name vehicle photo createdAt")
//     .lean();

//   const data = pending.map((r) => ({
//     name: r.name,
//     vehicle: r.vehicle,
//     photo: r.photo || "/default-avatar.png",
//     date: r.createdAt.toLocaleDateString(),
//   }));

//   res.status(200).json({ success: true, data });
// });
export const getPendingRiders = asyncHandler(async (req, res) => {
  const riders = await Rider.find({
    $or: [{ approvalStatus: "pending" }, { kycStatus: "pending" }],
  })
    .select(
      "_id firstName lastName email phone " +
        "vehicleType vehicleNumber drivingLicense idProof vehicleRc " +
        "profileImage city createdAt approvalStatus kycStatus " +
        "isOnline isBlocked isActive",
    )
    .sort({ createdAt: -1 })
    .lean();

  res.status(200).json({
    success: true,
    data: {
      riders,
      total: riders.length,
    },
  });
});
// ─── SUPPORT TICKETS ──────────────────────────────────────
export const getSupportTickets = asyncHandler(async (req, res) => {
  const tickets = await SupportTicket.find({ status: "open" })
    .sort({ priority: -1, createdAt: 1 })
    .limit(5)
    .select("ticketId issue priority type")
    .lean();

  const data = tickets.map((t) => ({
    id: t.ticketId,
    issue: t.issue,
    priority: t.priority,
    type: t.type,
  }));

  res.status(200).json({ success: true, data });
});

// ─── SERVICE AREAS ────────────────────────────────────────
export const getServiceAreas = asyncHandler(async (req, res) => {
  const areas = await ServiceArea.find().select("name active").lean();
  res.status(200).json({ success: true, data: areas });
});
