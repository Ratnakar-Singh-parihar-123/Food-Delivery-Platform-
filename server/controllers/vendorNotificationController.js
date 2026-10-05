import Order from "../models/order.js";

import Notification from "../models/notification.js";

import asyncHandler from "../utils/asyncHandler.js";

import { ApiError } from "../utils/ApiError.js";

import { createAndSendNotification } from "../services/notificationService.js";

/* =====================================================
   CREATE VENDOR NOTIFICATION
===================================================== */

export const createVendorNotification = asyncHandler(async (req, res) => {
  const {
    title,
    message,

    audience = "all_customers",

    customerIds = [],

    discountType = "none",

    discountValue = 0,

    couponCode = "",

    expiresAt,
  } = req.body;

  const vendor = req.vendor;

  /* =====================================================
       VENDOR AUTH CHECK
    ===================================================== */

  if (!vendor) {
    throw new ApiError(401, "Vendor authentication required");
  }

  /* =====================================================
       APPROVAL CHECK
    ===================================================== */

  if (vendor.approvalStatus !== "approved") {
    throw new ApiError(
      403,
      "Vendor must be approved before sending notifications",
    );
  }

  /* =====================================================
       TITLE / MESSAGE VALIDATION
    ===================================================== */

  if (!title?.trim()) {
    throw new ApiError(400, "Title is required");
  }

  if (!message?.trim()) {
    throw new ApiError(400, "Message is required");
  }

  /* =====================================================
       VALID AUDIENCES
    ===================================================== */

  const validAudiences = ["all_customers", "selected_customers", "all_riders"];

  if (!validAudiences.includes(audience)) {
    throw new ApiError(400, "Invalid audience");
  }

  let notificationAudience;

  /* =====================================================
       VENDOR → ALL CUSTOMERS
    ===================================================== */

  if (audience === "all_customers") {
    notificationAudience = {
      type: "vendor_customers",

      vendorId: vendor._id,
    };
  }

  /* =====================================================
       VENDOR → SELECTED CUSTOMERS
    ===================================================== */

  if (audience === "selected_customers") {
    if (!Array.isArray(customerIds) || customerIds.length === 0) {
      throw new ApiError(400, "Select at least one customer");
    }

    /*
        Only customers who have completed
        a delivered order from this vendor
        are allowed.
      */

    const validCustomerIds = await Order.distinct("customer", {
      vendor: vendor._id,

      customer: {
        $in: customerIds,
      },

      status: "delivered",
    });

    const validIdsAsString = validCustomerIds.map((id) => id.toString());

    const invalidCustomerExists = customerIds.some(
      (id) => !validIdsAsString.includes(id.toString()),
    );

    if (invalidCustomerExists) {
      throw new ApiError(
        403,
        "One or more selected customers are not customers of this vendor",
      );
    }

    notificationAudience = {
      type: "users",

      userIds: validCustomerIds,
    };
  }

  /* =====================================================
       VENDOR → ALL RIDERS
    ===================================================== */

  if (audience === "all_riders") {
    notificationAudience = {
      type: "role",

      roles: ["rider"],
    };
  }

  /* =====================================================
       DISCOUNT VALIDATION
    ===================================================== */

  const allowedDiscountTypes = ["none", "percentage", "fixed"];

  if (!allowedDiscountTypes.includes(discountType)) {
    throw new ApiError(400, "Invalid discount type");
  }

  const parsedDiscount = Number(discountValue || 0);

  if (
    discountType === "percentage" &&
    (parsedDiscount < 1 || parsedDiscount > 100)
  ) {
    throw new ApiError(400, "Percentage discount must be between 1 and 100");
  }

  if (discountType === "fixed" && parsedDiscount < 0) {
    throw new ApiError(400, "Fixed discount cannot be negative");
  }

  /* =====================================================
       VENDOR NAME
    ===================================================== */

  const vendorName = vendor.businessName || vendor.name || "Vendor";

  /* =====================================================
       CREATE NOTIFICATION
    ===================================================== */

  const notification = await createAndSendNotification({
    sender: {
      id: vendor._id,

      type: "vendor",

      name: vendorName,
    },

    title: title.trim(),

    message: message.trim(),

    /*
          Vendor notifications are currently
          promotion based.
        */
    type: "promotion",

    priority: "normal",

    audience: notificationAudience,

    offer: {
      discountType,

      discountValue: parsedDiscount,

      couponCode: couponCode.trim().toUpperCase(),
    },

    action: {
      label: "Order Now",

      url: `/vendor/${vendor._id}`,
    },

    expiresAt: expiresAt || null,
  });

  /* =====================================================
       RESPONSE
    ===================================================== */

  res.status(201).json({
    success: true,

    message: "Notification sent successfully",

    data: {
      notification,
    },
  });
});

/* =====================================================
   VENDOR NOTIFICATION HISTORY
===================================================== */

export const getVendorNotificationHistory = asyncHandler(async (req, res) => {
  const vendor = req.vendor;

  /* =====================================================
       AUTH CHECK
    ===================================================== */

  if (!vendor) {
    throw new ApiError(401, "Vendor authentication required");
  }

  const vendorId = vendor._id;

  /* =====================================================
       ADMIN → VENDOR
       ADMIN → EVERYONE
       VENDOR → CUSTOMER
       VENDOR → RIDER
       VENDOR OWN NOTIFICATIONS
    ===================================================== */

  const notifications = await Notification.find({
    $or: [
      /* ============================================
             VENDOR'S OWN NOTIFICATIONS
          ============================================ */

      {
        "sender.type": "vendor",

        "sender.id": vendorId,
      },

      /* ============================================
             ADMIN → ALL
          ============================================ */

      {
        "sender.type": "admin",

        "audience.type": "all",
      },

      /* ============================================
             ADMIN → VENDOR ROLE
          ============================================ */

      {
        "sender.type": "admin",

        "audience.type": "role",

        "audience.roles": "vendor",
      },

      /* ============================================
             ADMIN → SPECIFIC VENDOR
          ============================================ */

      {
        "sender.type": "admin",

        "audience.type": "users",

        "audience.userIds": vendorId,
      },
    ],
  })
    .sort({
      createdAt: -1,
    })
    .limit(100);

  /* =====================================================
       RESPONSE
    ===================================================== */

  res.status(200).json({
    success: true,

    count: notifications.length,

    data: {
      notifications,
    },
  });
});
