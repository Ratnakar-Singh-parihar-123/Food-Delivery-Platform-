import Notification from "../models/notification.js";

import NotificationRead from "../models/notificationRead.js";

import Order from "../models/order.js";

import asyncHandler from "../utils/asyncHandler.js";

import { ApiError } from "../utils/ApiError.js";

/* =====================================================
   GET MY NOTIFICATIONS
===================================================== */

export const getMyNotifications = asyncHandler(async (req, res) => {
  /*
        Your generic auth middleware
        should populate:

        req.user.id
        req.user.type

        customer / rider / vendor
      */

  const { id: userId, type: userType } = req.user;

  const conditions = [
    {
      "audience.type": "all",
    },

    {
      "audience.type": "role",

      "audience.roles": userType,
    },

    {
      "audience.type": "users",

      "audience.userIds": userId,
    },
  ];

  /* Vendor promotions */

  if (userType === "customer") {
    const vendorIds = await Order.distinct("vendor", {
      customer: userId,

      status: "delivered",
    });

    if (vendorIds.length) {
      conditions.push({
        "audience.type": "vendor_customers",

        "audience.vendorId": {
          $in: vendorIds,
        },
      });
    }
  }

  const now = new Date();

  const notifications = await Notification.find({
    isActive: true,

    $and: [
      {
        $or: conditions,
      },

      {
        $or: [
          {
            expiresAt: null,
          },

          {
            expiresAt: {
              $gt: now,
            },
          },
        ],
      },
    ],
  })
    .sort({
      createdAt: -1,
    })
    .limit(100)
    .lean();

  const ids = notifications.map((item) => item._id);

  const reads = await NotificationRead.find({
    userId,

    userType,

    notification: {
      $in: ids,
    },
  }).select("notification");

  const readSet = new Set(reads.map((item) => item.notification.toString()));

  const result = notifications.map((notification) => ({
    ...notification,

    isRead: readSet.has(notification._id.toString()),
  }));

  res.status(200).json({
    success: true,

    data: {
      notifications: result,
    },
  });
});

/* =====================================================
   MARK READ
===================================================== */

export const markNotificationRead = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;

  const notification = await Notification.findById(notificationId);

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  await NotificationRead.findOneAndUpdate(
    {
      notification: notificationId,

      userId: req.user.id,

      userType: req.user.type,
    },

    {
      $setOnInsert: {
        readAt: new Date(),
      },
    },

    {
      upsert: true,
      new: true,
    },
  );

  res.status(200).json({
    success: true,

    message: "Notification marked as read",
  });
});

/* =====================================================
   MARK ALL READ
===================================================== */

export const markAllNotificationsRead = asyncHandler(async (req, res) => {
  /*
        Simplest implementation:
        frontend current IDs send kare.
      */

  const { notificationIds } = req.body;

  if (!Array.isArray(notificationIds)) {
    throw new ApiError(400, "notificationIds must be an array");
  }

  const operations = notificationIds.map((notification) => ({
    updateOne: {
      filter: {
        notification,

        userId: req.user.id,

        userType: req.user.type,
      },

      update: {
        $setOnInsert: {
          readAt: new Date(),
        },
      },

      upsert: true,
    },
  }));

  if (operations.length) {
    await NotificationRead.bulkWrite(operations);
  }

  res.status(200).json({
    success: true,

    message: "Notifications marked as read",
  });
});
