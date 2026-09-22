import Order from "../models/order.js";
import Customer from "../models/customer.js";

import asyncHandler from "../utils/asyncHandler.js";

/* =====================================================
   VENDOR CUSTOMERS
===================================================== */

export const getVendorCustomers = asyncHandler(async (req, res) => {
  const vendorId = req.vendor._id;

  const customerStats = await Order.aggregate([
    {
      $match: {
        vendor: vendorId,
      },
    },

    {
      $group: {
        _id: "$customer",

        totalOrders: {
          $sum: 1,
        },

        totalSpent: {
          $sum: "$pricing.grandTotal",
        },

        lastOrderAt: {
          $max: "$createdAt",
        },

        deliveredOrders: {
          $sum: {
            $cond: [
              {
                $eq: ["$status", "delivered"],
              },
              1,
              0,
            ],
          },
        },
      },
    },

    {
      $sort: {
        lastOrderAt: -1,
      },
    },
  ]);

  const customerIds = customerStats.map((item) => item._id);

  const customers = await Customer.find({
    _id: {
      $in: customerIds,
    },
  })
    .select("firstName lastName phone profileImage createdAt")
    .lean();

  const map = new Map(
    customers.map((customer) => [customer._id.toString(), customer]),
  );

  const result = customerStats.map((stat) => ({
    customer: map.get(stat._id.toString()),

    totalOrders: stat.totalOrders,

    deliveredOrders: stat.deliveredOrders,

    totalSpent: Number(stat.totalSpent.toFixed(2)),

    lastOrderAt: stat.lastOrderAt,
  }));

  res.status(200).json({
    success: true,

    data: {
      customers: result,
    },
  });
});
