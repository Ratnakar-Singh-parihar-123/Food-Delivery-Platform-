import Notification from "../models/notificationRead.js";

import asyncHandler from "../utils/asyncHandler.js";

import { ApiError } from "../utils/ApiError.js";

import { createAndSendNotification } from "../services/notificationService.js";

/* =====================================================
   CREATE ADMIN NOTIFICATION
===================================================== */

export const createAdminNotification = asyncHandler(async (req, res) => {
  console.log("NOTIFICATION BODY:", req.body);

  const {
    title,
    message,
    type = "general",
    audience,
    userIds = [],
    priority = "normal",
    image = "",
    action = {},
    offer = {},
    expiresAt = null,
  } = req.body;

  /* ================================
       BASIC VALIDATION
    ================================ */

  if (!title || !String(title).trim()) {
    throw new ApiError(400, "Notification title is required");
  }

  if (!message || !String(message).trim()) {
    throw new ApiError(400, "Notification message is required");
  }

  /* ================================
       NOTIFICATION TYPE
    ================================ */

  const allowedTypes = [
    "general",
    "promotion",
    "offer",
    "order",
    "payment",
    "vendor",
    "rider",
    "system",
    "warning",
  ];

  if (!allowedTypes.includes(type)) {
    throw new ApiError(400, `Invalid notification type: ${type}`);
  }

  /* ================================
       PRIORITY
    ================================ */

  const allowedPriorities = ["low", "normal", "high", "urgent"];

  if (!allowedPriorities.includes(priority)) {
    throw new ApiError(400, `Invalid priority: ${priority}`);
  }

  /* ================================
       AUDIENCE
    ================================ */

  const allowedAudience = ["all", "customers", "riders", "vendors", "specific"];

  if (!allowedAudience.includes(audience)) {
    throw new ApiError(400, `Invalid notification audience: ${audience}`);
  }

  let notificationAudience;

  switch (audience) {
    case "all":
      notificationAudience = {
        type: "all",
        roles: [],
        userIds: [],
        vendorId: null,
      };
      break;

    case "customers":
      notificationAudience = {
        type: "role",
        roles: ["customer"],
        userIds: [],
        vendorId: null,
      };
      break;

    case "riders":
      notificationAudience = {
        type: "role",
        roles: ["rider"],
        userIds: [],
        vendorId: null,
      };
      break;

    case "vendors":
      notificationAudience = {
        type: "role",
        roles: ["vendor"],
        userIds: [],
        vendorId: null,
      };
      break;

    case "specific":
      if (!Array.isArray(userIds) || userIds.length === 0) {
        throw new ApiError(400, "Select at least one user");
      }

      notificationAudience = {
        type: "users",
        roles: [],
        userIds,
        vendorId: null,
      };
      break;

    default:
      throw new ApiError(400, "Invalid audience");
  }

  /* ================================
       OFFER
    ================================ */

  const allowedDiscountTypes = ["none", "percentage", "flat"];

  const discountType = offer?.discountType || "none";

  if (!allowedDiscountTypes.includes(discountType)) {
    throw new ApiError(400, "Invalid discount type");
  }

  const discountValue = Number(offer?.discountValue || 0);

  if (
    discountType === "percentage" &&
    (discountValue < 0 || discountValue > 100)
  ) {
    throw new ApiError(400, "Percentage discount must be between 0 and 100");
  }

  if (discountType === "flat" && discountValue < 0) {
    throw new ApiError(400, "Flat discount cannot be negative");
  }

  /* ================================
       ADMIN
    ================================ */

  if (!req.admin?._id) {
    throw new ApiError(401, "Admin authentication required");
  }

  const adminName =
    `${req.admin.firstName || ""} ${req.admin.lastName || ""}`.trim() ||
    "Administrator";

  /* ================================
       CREATE + SOCKET SEND
    ================================ */

  const notification = await createAndSendNotification({
    sender: {
      id: req.admin._id,
      type: "admin",
      name: adminName,
    },

    title: String(title).trim(),

    message: String(message).trim(),

    type,

    priority,

    audience: notificationAudience,

    image: image || "",

    action: {
      label: action?.label?.trim?.() || "",

      url: action?.url?.trim?.() || "",
    },

    offer: {
      discountType,

      discountValue,

      couponCode: offer?.couponCode?.trim?.().toUpperCase() || "",
    },

    expiresAt: expiresAt || null,

    isActive: true,
  });

  return res.status(201).json({
    success: true,

    message: "Notification sent successfully",

    data: {
      notification,
    },
  });
});

/* =====================================================
   ADMIN HISTORY
===================================================== */

export const getAdminNotifications = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);

  const limit = Math.min(Number(req.query.limit) || 20, 100);

  const skip = (page - 1) * limit;

  const query = {
    "sender.type": "admin",
  };

  const [notifications, total] = await Promise.all([
    Notification.find(query)
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit),

    Notification.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,

    data: {
      notifications,

      pagination: {
        page,
        limit,
        total,

        pages: Math.ceil(total / limit),
      },
    },
  });
});
