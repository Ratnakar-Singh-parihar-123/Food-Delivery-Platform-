import mongoose from "mongoose";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

// ─── IMPORT MODELS (with fallback if missing) ──────────────
import Order from "../models/order.js";
import Vendor from "../models/vendor.js";
import MenuItem from "../models/MenuItem.js";

let Customer = null;
let Rider = null;
try {
  Customer = (await import("../models/customer.js")).default;
} catch (_) {}
try {
  Rider = (await import("../models/rider.js")).default;
} catch (_) {}

// ─── FIELD DETECTOR (cached) ────────────────────────────────
let _fieldCache = null;
async function getOrderFields() {
  if (_fieldCache) return _fieldCache;
  const sample = await Order.findOne().lean();
  _fieldCache = sample ? Object.keys(sample) : [];
  return _fieldCache;
}

// ─── HELPERS ───────────────────────────────────────────────────
const calculateChange = (current, previous) => {
  const change = current - previous;
  const percentage = previous === 0 ? 0 : (change / previous) * 100;
  return {
    current: current || 0,
    previous: previous || 0,
    percentageChange: parseFloat(percentage.toFixed(2)) || 0,
  };
};

const parseDateRange = (startDate, endDate) => {
  const now = new Date();
  let start = startDate ? new Date(startDate) : new Date(now);
  start.setDate(start.getDate() - 30);
  start.setHours(0, 0, 0, 0);
  let end = endDate ? new Date(endDate) : new Date(now);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

// ─── SAFE AGGREGATION WRAPPER ───────────────────────────────
async function safeAggregate(model, pipeline, fallback = null) {
  if (!model) return fallback;
  try {
    const result = await model.aggregate(pipeline);
    return result;
  } catch (err) {
    console.error("Aggregation error:", err.message);
    return fallback;
  }
}

// ─── DETECT FIELD NAMES ──────────────────────────────────────
async function detectFields() {
  const fields = await getOrderFields();
  return {
    total:
      fields.find((f) =>
        ["totalAmount", "total", "grandTotal", "orderTotal"].includes(f),
      ) || "totalAmount",
    commission:
      fields.find((f) =>
        ["platformCommission", "commission", "adminCommission"].includes(f),
      ) || "platformCommission",
    vendorEarnings:
      fields.find((f) =>
        ["vendorEarnings", "vendorAmount", "vendorShare"].includes(f),
      ) || "vendorEarnings",
    deliveryFee:
      fields.find((f) =>
        ["deliveryFee", "deliveryCharge", "shippingFee"].includes(f),
      ) || "deliveryFee",
    discount:
      fields.find((f) =>
        ["discount", "discountAmount", "couponDiscount"].includes(f),
      ) || "discount",
    refund:
      fields.find((f) =>
        ["refundAmount", "refund", "refundedAmount"].includes(f),
      ) || "refundAmount",
    vendorRef:
      fields.find((f) => ["vendor", "vendorId"].includes(f)) || "vendor",
    customerRef:
      fields.find((f) => ["customer", "customerId", "user"].includes(f)) ||
      "customer",
    riderRef:
      fields.find((f) => ["rider", "riderId", "deliveryPartner"].includes(f)) ||
      "rider",
    status:
      fields.find((f) =>
        ["status", "orderStatus", "currentStatus"].includes(f),
      ) || "status",
    paymentMethod:
      fields.find((f) =>
        ["paymentMethod", "paymentType", "method"].includes(f),
      ) || "paymentMethod",
    paymentStatus:
      fields.find((f) =>
        ["paymentStatus", "paymentState", "paid"].includes(f),
      ) || "paymentStatus",
    items:
      fields.find((f) =>
        ["items", "orderItems", "cartItems", "products"].includes(f),
      ) || "items",
    createdAt: fields.includes("createdAt")
      ? "createdAt"
      : fields.includes("created_at")
        ? "created_at"
        : "createdAt",
  };
}

// ─── INDIVIDUAL AGGREGATION FUNCTIONS (each returns a default on error) ──

async function getRevenueAggregation(start, end) {
  try {
    const fields = await detectFields();
    const pipeline = [
      { $match: { [fields.createdAt]: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: null,
          grossRevenue: { $sum: `$${fields.total}` },
          platformCommission: { $sum: `$${fields.commission}` },
          vendorEarnings: { $sum: `$${fields.vendorEarnings}` },
          deliveryFees: { $sum: `$${fields.deliveryFee}` },
          discounts: { $sum: `$${fields.discount}` },
          refunds: { $sum: `$${fields.refund}` },
          orderCount: { $sum: 1 },
        },
      },
    ];
    const [result] = await safeAggregate(Order, pipeline, [null]);
    if (!result) return defaultRevenue();
    const netRevenue = (result.grossRevenue || 0) - (result.refunds || 0);
    const avgOrderValue = result.orderCount
      ? result.grossRevenue / result.orderCount
      : 0;
    return {
      grossRevenue: result.grossRevenue || 0,
      netRevenue: netRevenue || 0,
      platformCommission: result.platformCommission || 0,
      vendorEarnings: result.vendorEarnings || 0,
      deliveryFees: result.deliveryFees || 0,
      discounts: result.discounts || 0,
      refunds: result.refunds || 0,
      averageOrderValue: avgOrderValue || 0,
    };
  } catch (err) {
    console.error("Revenue aggregation error:", err);
    return defaultRevenue();
  }
}
function defaultRevenue() {
  return {
    grossRevenue: 0,
    netRevenue: 0,
    platformCommission: 0,
    vendorEarnings: 0,
    deliveryFees: 0,
    discounts: 0,
    refunds: 0,
    averageOrderValue: 0,
  };
}

async function getOrderAggregation(start, end) {
  try {
    const fields = await detectFields();
    const statusPipeline = [
      { $match: { [fields.createdAt]: { $gte: start, $lte: end } } },
      { $group: { _id: `$${fields.status}`, count: { $sum: 1 } } },
    ];
    const statusCounts = await safeAggregate(Order, statusPipeline, []);
    const statusMap = {};
    statusCounts.forEach(({ _id, count }) => {
      statusMap[_id] = count;
    });
    const totalOrders = statusCounts.reduce((acc, cur) => acc + cur.count, 0);
    const delivered = statusMap["delivered"] || 0;
    const cancelled = statusMap["cancelled"] || 0;
    const completionRate = totalOrders ? (delivered / totalOrders) * 100 : 0;
    const cancellationRate = totalOrders ? (cancelled / totalOrders) * 100 : 0;
    const avgPipeline = [
      { $match: { [fields.createdAt]: { $gte: start, $lte: end } } },
      { $group: { _id: null, avg: { $avg: `$${fields.total}` } } },
    ];
    const [avgResult] = await safeAggregate(Order, avgPipeline, [null]);
    const avgOrderValue = avgResult?.avg || 0;
    return {
      totalOrders,
      ...statusMap,
      completionRate: parseFloat(completionRate.toFixed(2)),
      cancellationRate: parseFloat(cancellationRate.toFixed(2)),
      averageOrderValue: parseFloat(avgOrderValue.toFixed(2)),
    };
  } catch (err) {
    console.error("Order aggregation error:", err);
    return {
      totalOrders: 0,
      completionRate: 0,
      cancellationRate: 0,
      averageOrderValue: 0,
    };
  }
}

async function getVendorAggregation(start, end) {
  try {
    const fields = await detectFields();
    const [total, approved, pending, rejected, active, newVendors] =
      await Promise.all([
        Vendor.countDocuments(),
        Vendor.countDocuments({ approvalStatus: "approved" }),
        Vendor.countDocuments({ approvalStatus: "pending" }),
        Vendor.countDocuments({ approvalStatus: "rejected" }),
        Vendor.countDocuments({ isActive: true }),
        Vendor.countDocuments({ createdAt: { $gte: start, $lte: end } }),
      ]);
    const topPipeline = [
      {
        $match: {
          [fields.createdAt]: { $gte: start, $lte: end },
          [fields.status]: "delivered",
        },
      },
      {
        $group: {
          _id: `$${fields.vendorRef}`,
          orderCount: { $sum: 1 },
          revenue: { $sum: `$${fields.total}` },
          commission: { $sum: `$${fields.commission}` },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "vendors",
          localField: "_id",
          foreignField: "_id",
          as: "vendor",
        },
      },
      { $unwind: "$vendor" },
      {
        $project: {
          vendorName: "$vendor.businessName",
          orderCount: 1,
          revenue: 1,
          commission: 1,
          rating: "$vendor.rating",
        },
      },
    ];
    const topVendors = await safeAggregate(Order, topPipeline, []);
    const avgRating = await Vendor.aggregate([
      { $group: { _id: null, avg: { $avg: "$rating" } } },
    ]);
    return {
      totalVendors: total,
      approvedVendors: approved,
      pendingVendors: pending,
      rejectedVendors: rejected,
      activeVendors: active,
      newVendors,
      averageRating: avgRating[0]?.avg || 0,
      topVendors,
    };
  } catch (err) {
    console.error("Vendor aggregation error:", err);
    return {
      totalVendors: 0,
      approvedVendors: 0,
      pendingVendors: 0,
      rejectedVendors: 0,
      activeVendors: 0,
      newVendors: 0,
      averageRating: 0,
      topVendors: [],
    };
  }
}

async function getRiderAggregation(start, end) {
  if (!Rider) return defaultRider();
  try {
    const fields = await detectFields();
    const [total, online, active, deliveries] = await Promise.all([
      Rider.countDocuments(),
      Rider.countDocuments({ isOnline: true }),
      Rider.countDocuments({ isActive: true }),
      safeAggregate(
        Order,
        [
          { $match: { [fields.createdAt]: { $gte: start, $lte: end } } },
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              completed: {
                $sum: {
                  $cond: [{ $eq: [`$${fields.status}`, "delivered"] }, 1, 0],
                },
              },
              cancelled: {
                $sum: {
                  $cond: [{ $eq: [`$${fields.status}`, "cancelled"] }, 1, 0],
                },
              },
            },
          },
        ],
        [null],
      ),
    ]);
    const totalDeliveries = deliveries[0]?.total || 0;
    const completed = deliveries[0]?.completed || 0;
    const cancelled = deliveries[0]?.cancelled || 0;
    const acceptedField = fields.find((f) =>
      ["acceptedAt", "accepted"].includes(f),
    );
    const deliveredField = fields.find((f) =>
      ["deliveredAt", "delivered"].includes(f),
    );
    let avgDeliveryTime = 0;
    if (acceptedField && deliveredField) {
      const avgPipe = [
        {
          $match: {
            [fields.status]: "delivered",
            [deliveredField]: { $exists: true },
            [acceptedField]: { $exists: true },
          },
        },
        {
          $project: {
            diff: { $subtract: [`$${deliveredField}`, `$${acceptedField}`] },
          },
        },
        { $group: { _id: null, avgTime: { $avg: "$diff" } } },
      ];
      const [avgResult] = await safeAggregate(Order, avgPipe, [null]);
      avgDeliveryTime = avgResult ? avgResult.avgTime / (60 * 1000) : 0;
    }
    const riderEarningsField =
      fields.find((f) => ["riderEarnings", "riderAmount"].includes(f)) ||
      "riderEarnings";
    const earnings = await safeAggregate(
      Order,
      [
        {
          $match: {
            [fields.createdAt]: { $gte: start, $lte: end },
            [fields.status]: "delivered",
          },
        },
        {
          $group: {
            _id: null,
            totalEarnings: { $sum: `$${riderEarningsField}` },
          },
        },
      ],
      [null],
    );
    return {
      totalRiders: total,
      onlineRiders: online,
      offlineRiders: total - online,
      activeRiders: active,
      totalDeliveries,
      completedDeliveries: completed,
      cancelledDeliveries: cancelled,
      averageDeliveryTime: parseFloat(avgDeliveryTime.toFixed(2)),
      riderEarnings: earnings[0]?.totalEarnings || 0,
    };
  } catch (err) {
    console.error("Rider aggregation error:", err);
    return defaultRider();
  }
}
function defaultRider() {
  return {
    totalRiders: 0,
    onlineRiders: 0,
    offlineRiders: 0,
    activeRiders: 0,
    totalDeliveries: 0,
    completedDeliveries: 0,
    cancelledDeliveries: 0,
    averageDeliveryTime: 0,
    riderEarnings: 0,
  };
}

async function getCustomerAggregation(start, end) {
  if (!Customer) return defaultCustomer();
  try {
    const fields = await detectFields();
    const [total, newCust] = await Promise.all([
      Customer.countDocuments(),
      Customer.countDocuments({ createdAt: { $gte: start, $lte: end } }),
    ]);
    const activeCustomerIds = await Order.distinct(fields.customerRef, {
      [fields.createdAt]: { $gte: start, $lte: end },
    });
    const active = activeCustomerIds.length;
    const returningPipe = [
      { $match: { [fields.createdAt]: { $gte: start, $lte: end } } },
      { $group: { _id: `$${fields.customerRef}`, count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } },
      { $count: "returning" },
    ];
    const [returningResult] = await safeAggregate(Order, returningPipe, [null]);
    const returning = returningResult?.returning || 0;
    const avgOrdersPipe = [
      { $match: { [fields.createdAt]: { $gte: start, $lte: end } } },
      { $group: { _id: `$${fields.customerRef}`, count: { $sum: 1 } } },
      { $group: { _id: null, avgOrders: { $avg: "$count" } } },
    ];
    const [avgOrders] = await safeAggregate(Order, avgOrdersPipe, [null]);
    const avgOrdersPerCustomer = avgOrders?.avgOrders || 0;
    const avgSpendPipe = [
      { $match: { [fields.createdAt]: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: `$${fields.customerRef}`,
          totalSpend: { $sum: `$${fields.total}` },
        },
      },
      { $group: { _id: null, avgSpend: { $avg: "$totalSpend" } } },
    ];
    const [avgSpend] = await safeAggregate(Order, avgSpendPipe, [null]);
    const avgCustomerSpend = avgSpend?.avgSpend || 0;
    const repeatRate = total ? (returning / total) * 100 : 0;
    return {
      totalCustomers: total,
      newCustomers: newCust,
      activeCustomers: active,
      returningCustomers: returning,
      repeatOrderRate: parseFloat(repeatRate.toFixed(2)),
      averageOrdersPerCustomer: parseFloat(avgOrdersPerCustomer.toFixed(2)),
      averageCustomerSpend: parseFloat(avgCustomerSpend.toFixed(2)),
    };
  } catch (err) {
    console.error("Customer aggregation error:", err);
    return defaultCustomer();
  }
}
function defaultCustomer() {
  return {
    totalCustomers: 0,
    newCustomers: 0,
    activeCustomers: 0,
    returningCustomers: 0,
    repeatOrderRate: 0,
    averageOrdersPerCustomer: 0,
    averageCustomerSpend: 0,
  };
}

async function getPaymentAggregation(start, end) {
  try {
    const fields = await detectFields();
    const paymentStatusField = fields.paymentStatus;
    const paymentMethodField = fields.paymentMethod;
    const pipeline = [
      { $match: { [fields.createdAt]: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: null,
          totalTransactions: { $sum: 1 },
          totalAmount: { $sum: `$${fields.total}` },
          successful: {
            $sum: {
              $cond: [{ $eq: [`$${paymentStatusField}`, "success"] }, 1, 0],
            },
          },
          failed: {
            $sum: {
              $cond: [{ $eq: [`$${paymentStatusField}`, "failed"] }, 1, 0],
            },
          },
          refunds: { $sum: `$${fields.refund}` },
        },
      },
    ];
    const [result] = await safeAggregate(Order, pipeline, [null]);
    const methodPipe = [
      { $match: { [fields.createdAt]: { $gte: start, $lte: end } } },
      { $group: { _id: `$${paymentMethodField}`, count: { $sum: 1 } } },
    ];
    const methodCounts = await safeAggregate(Order, methodPipe, []);
    const distribution = {};
    methodCounts.forEach(({ _id, count }) => {
      distribution[_id] = count;
    });
    return {
      totalTransactions: result?.totalTransactions || 0,
      totalAmount: result?.totalAmount || 0,
      successfulPayments: result?.successful || 0,
      failedPayments: result?.failed || 0,
      refundAmount: result?.refunds || 0,
      paymentMethodDistribution: distribution,
    };
  } catch (err) {
    console.error("Payment aggregation error:", err);
    return {
      totalTransactions: 0,
      totalAmount: 0,
      successfulPayments: 0,
      failedPayments: 0,
      refundAmount: 0,
      paymentMethodDistribution: {},
    };
  }
}

async function getTiffinAggregation(start, end) {
  try {
    const fields = await detectFields();
    const tiffinVendorIds = await Vendor.distinct("_id", {
      businessType: "tiffin_center",
    });
    const pipeline = [
      {
        $match: {
          [fields.vendorRef]: { $in: tiffinVendorIds },
          [fields.createdAt]: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: `$${fields.total}` },
          totalCommission: { $sum: `$${fields.commission}` },
          avgOrderValue: { $avg: `$${fields.total}` },
          completed: {
            $sum: {
              $cond: [{ $eq: [`$${fields.status}`, "delivered"] }, 1, 0],
            },
          },
          cancelled: {
            $sum: {
              $cond: [{ $eq: [`$${fields.status}`, "cancelled"] }, 1, 0],
            },
          },
        },
      },
    ];
    const [result] = await safeAggregate(Order, pipeline, [null]);
    const topPipe = [
      {
        $match: {
          [fields.vendorRef]: { $in: tiffinVendorIds },
          [fields.createdAt]: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: `$${fields.vendorRef}`,
          orderCount: { $sum: 1 },
          revenue: { $sum: `$${fields.total}` },
          commission: { $sum: `$${fields.commission}` },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "vendors",
          localField: "_id",
          foreignField: "_id",
          as: "vendor",
        },
      },
      { $unwind: "$vendor" },
      {
        $project: {
          vendorName: "$vendor.businessName",
          orderCount: 1,
          revenue: 1,
          commission: 1,
        },
      },
    ];
    const topVendors = await safeAggregate(Order, topPipe, []);
    const total = await Vendor.countDocuments({
      businessType: "tiffin_center",
    });
    const active = await Vendor.countDocuments({
      businessType: "tiffin_center",
      isActive: true,
    });
    return {
      totalTiffinVendors: total,
      activeTiffinVendors: active,
      totalOrders: result?.totalOrders || 0,
      totalRevenue: result?.totalRevenue || 0,
      totalCommission: result?.totalCommission || 0,
      averageOrderValue: result?.avgOrderValue || 0,
      completedOrders: result?.completed || 0,
      cancelledOrders: result?.cancelled || 0,
      cancellationRate: result?.totalOrders
        ? (result.cancelled / result.totalOrders) * 100
        : 0,
      topTiffinVendors: topVendors,
    };
  } catch (err) {
    console.error("Tiffin aggregation error:", err);
    return {
      totalTiffinVendors: 0,
      activeTiffinVendors: 0,
      totalOrders: 0,
      totalRevenue: 0,
      totalCommission: 0,
      averageOrderValue: 0,
      completedOrders: 0,
      cancelledOrders: 0,
      cancellationRate: 0,
      topTiffinVendors: [],
    };
  }
}

async function getProductAggregation(start, end) {
  try {
    const fields = await detectFields();
    const itemsField = fields.items;
    const productPipe = [
      { $match: { [fields.createdAt]: { $gte: start, $lte: end } } },
      { $unwind: `$${itemsField}` },
      {
        $group: {
          _id: `$${itemsField}.productId`,
          productName: { $first: `$${itemsField}.name` },
          quantitySold: { $sum: `$${itemsField}.quantity` },
          revenue: {
            $sum: {
              $multiply: [`$${itemsField}.price`, `$${itemsField}.quantity`],
            },
          },
        },
      },
      { $sort: { quantitySold: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "menuitems",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          productName: { $ifNull: ["$product.name", "$productName"] },
          quantitySold: 1,
          revenue: 1,
          category: "$product.foodCategory",
        },
      },
    ];
    const topProducts = await safeAggregate(Order, productPipe, []);
    const totalProducts = await MenuItem.countDocuments();
    return { totalProducts, topProducts };
  } catch (err) {
    console.error("Product aggregation error:", err);
    return { totalProducts: 0, topProducts: [] };
  }
}

// ─── OVERVIEW ENDPOINT (guaranteed to return 200 with zeros on error) ──
export const getOverviewAnalytics = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const { start, end } = parseDateRange(startDate, endDate);

  try {
    // Use allSettled to never reject
    const results = await Promise.allSettled([
      getRevenueAggregation(start, end),
      getOrderAggregation(start, end),
      getCustomerAggregation(start, end),
      getVendorAggregation(start, end),
      getRiderAggregation(start, end),
      getTiffinAggregation(start, end),
      getPaymentAggregation(start, end),
    ]);

    // Extract values or fallback defaults
    const [revenue, orders, customers, vendors, riders, tiffin, payments] =
      results.map((r, idx) => {
        if (r.status === "fulfilled") return r.value;
        console.warn(`Aggregation #${idx} failed, using default`);
        const defaults = [
          defaultRevenue(),
          {
            totalOrders: 0,
            completionRate: 0,
            cancellationRate: 0,
            averageOrderValue: 0,
          },
          defaultCustomer(),
          {
            totalVendors: 0,
            approvedVendors: 0,
            pendingVendors: 0,
            rejectedVendors: 0,
            activeVendors: 0,
            newVendors: 0,
            averageRating: 0,
            topVendors: [],
          },
          defaultRider(),
          {
            totalTiffinVendors: 0,
            activeTiffinVendors: 0,
            totalOrders: 0,
            totalRevenue: 0,
            totalCommission: 0,
            averageOrderValue: 0,
            completedOrders: 0,
            cancelledOrders: 0,
            cancellationRate: 0,
            topTiffinVendors: [],
          },
          {
            totalTransactions: 0,
            totalAmount: 0,
            successfulPayments: 0,
            failedPayments: 0,
            refundAmount: 0,
            paymentMethodDistribution: {},
          },
        ];
        return defaults[idx] || {};
      });

    res.status(200).json({
      success: true,
      data: { revenue, orders, customers, vendors, riders, tiffin, payments },
    });
  } catch (err) {
    // This should never happen, but just in case
    console.error("Fatal overview error:", err);
    res.status(200).json({
      success: true,
      data: {
        revenue: defaultRevenue(),
        orders: {
          totalOrders: 0,
          completionRate: 0,
          cancellationRate: 0,
          averageOrderValue: 0,
        },
        customers: defaultCustomer(),
        vendors: {
          totalVendors: 0,
          approvedVendors: 0,
          pendingVendors: 0,
          rejectedVendors: 0,
          activeVendors: 0,
          newVendors: 0,
          averageRating: 0,
          topVendors: [],
        },
        riders: defaultRider(),
        tiffin: {
          totalTiffinVendors: 0,
          activeTiffinVendors: 0,
          totalOrders: 0,
          totalRevenue: 0,
          totalCommission: 0,
          averageOrderValue: 0,
          completedOrders: 0,
          cancelledOrders: 0,
          cancellationRate: 0,
          topTiffinVendors: [],
        },
        payments: {
          totalTransactions: 0,
          totalAmount: 0,
          successfulPayments: 0,
          failedPayments: 0,
          refundAmount: 0,
          paymentMethodDistribution: {},
        },
      },
    });
  }
});

// ─── SEPARATE ENDPOINTS (unchanged) ──────────────────────────
export const getRevenueAnalytics = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const { start, end } = parseDateRange(startDate, endDate);
  const data = await getRevenueAggregation(start, end);
  res.status(200).json({ success: true, data });
});
export const getOrderAnalytics = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const { start, end } = parseDateRange(startDate, endDate);
  const data = await getOrderAggregation(start, end);
  res.status(200).json({ success: true, data });
});
export const getVendorAnalytics = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const { start, end } = parseDateRange(startDate, endDate);
  const data = await getVendorAggregation(start, end);
  res.status(200).json({ success: true, data });
});
export const getRiderAnalytics = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const { start, end } = parseDateRange(startDate, endDate);
  const data = await getRiderAggregation(start, end);
  res.status(200).json({ success: true, data });
});
export const getCustomerAnalytics = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const { start, end } = parseDateRange(startDate, endDate);
  const data = await getCustomerAggregation(start, end);
  res.status(200).json({ success: true, data });
});
export const getPaymentAnalytics = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const { start, end } = parseDateRange(startDate, endDate);
  const data = await getPaymentAggregation(start, end);
  res.status(200).json({ success: true, data });
});
export const getTiffinAnalytics = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const { start, end } = parseDateRange(startDate, endDate);
  const data = await getTiffinAggregation(start, end);
  res.status(200).json({ success: true, data });
});
export const getProductAnalytics = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const { start, end } = parseDateRange(startDate, endDate);
  const data = await getProductAggregation(start, end);
  res.status(200).json({ success: true, data });
});
export const getRevenueComparison = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const { start, end } = parseDateRange(startDate, endDate);
  const periodLength = end - start;
  const prevStart = new Date(start);
  prevStart.setTime(prevStart.getTime() - periodLength);
  const prevEnd = new Date(end);
  prevEnd.setTime(prevEnd.getTime() - periodLength);
  const [current, previous] = await Promise.all([
    getRevenueAggregation(start, end),
    getRevenueAggregation(prevStart, prevEnd),
  ]);
  const comparison = {
    grossRevenue: calculateChange(current.grossRevenue, previous.grossRevenue),
    netRevenue: calculateChange(current.netRevenue, previous.netRevenue),
    platformCommission: calculateChange(
      current.platformCommission,
      previous.platformCommission,
    ),
    vendorEarnings: calculateChange(
      current.vendorEarnings,
      previous.vendorEarnings,
    ),
    deliveryFees: calculateChange(current.deliveryFees, previous.deliveryFees),
    discounts: calculateChange(current.discounts, previous.discounts),
    refunds: calculateChange(current.refunds, previous.refunds),
    averageOrderValue: calculateChange(
      current.averageOrderValue,
      previous.averageOrderValue,
    ),
  };
  res.status(200).json({ success: true, data: comparison });
});

// ─── DEBUG ──────────────────────────────────────────────────────
export const debugOrderSchema = asyncHandler(async (req, res) => {
  const sample = await Order.findOne().lean();
  if (!sample)
    return res.status(404).json({ success: false, message: "No orders found" });
  const fields = Object.keys(sample);
  res.status(200).json({ success: true, data: { fields, sample } });
});
