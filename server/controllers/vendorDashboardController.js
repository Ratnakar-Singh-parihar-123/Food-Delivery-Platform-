import Order from "../models/order.js";
import asyncHandler from "../utils/asyncHandler.js";

const startOfToday = () => {
  const date = new Date();

  date.setHours(0, 0, 0, 0);

  return date;
};

export const getVendorDashboard = asyncHandler(async (req, res) => {
  const vendorId = req.vendor._id;

  const today = startOfToday();

  const [
    todayOrders,
    pendingOrders,
    activeOrders,
    completedToday,
    recentOrders,
    revenueResult,
  ] = await Promise.all([
    Order.countDocuments({
      vendor: vendorId,
      createdAt: { $gte: today },
    }),

    Order.countDocuments({
      vendor: vendorId,
      status: "placed",
    }),

    Order.countDocuments({
      vendor: vendorId,

      status: {
        $in: [
          "confirmed",
          "preparing",
          "ready_for_pickup",
          "rider_assigned",
          "picked_up",
          "on_the_way",
        ],
      },
    }),

    Order.countDocuments({
      vendor: vendorId,
      status: "delivered",
      "timeline.deliveredAt": {
        $gte: today,
      },
    }),

    Order.find({
      vendor: vendorId,
    })
      .populate("customer", "firstName lastName phone profileImage")
      .populate("rider", "firstName lastName phone profileImage")
      .sort({
        createdAt: -1,
      })
      .limit(8)
      .lean(),

    Order.aggregate([
      {
        $match: {
          vendor: vendorId,
          status: "delivered",
          "timeline.deliveredAt": {
            $gte: today,
          },
        },
      },

      {
        $group: {
          _id: null,

          revenue: {
            $sum: "$pricing.grandTotal",
          },

          vendorEarning: {
            $sum: "$commission.vendorEarning",
          },

          platformCommission: {
            $sum: "$commission.amount",
          },

          avgOrderValue: {
            $avg: "$pricing.grandTotal",
          },
        },
      },
    ]),
  ]);

  const finance = revenueResult[0] || {};

  res.status(200).json({
    success: true,

    data: {
      vendor: {
        id: req.vendor._id,
        businessName: req.vendor.businessName,

        profileImage: req.vendor.profileImage,

        isOnline: req.vendor.isOnline,

        acceptingOrders: req.vendor.acceptingOrders,

        rating: req.vendor.rating,

        commissionPercentage: req.vendor.commissionPercentage,
      },

      stats: {
        todayOrders,
        pendingOrders,
        activeOrders,
        completedToday,

        todayRevenue: finance.revenue || 0,

        vendorEarning: finance.vendorEarning || 0,

        platformCommission: finance.platformCommission || 0,

        averageOrderValue: Number((finance.avgOrderValue || 0).toFixed(2)),
      },

      recentOrders,
    },
  });
});
