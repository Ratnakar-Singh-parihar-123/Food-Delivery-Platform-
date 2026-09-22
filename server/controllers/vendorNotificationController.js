import Order from "../models/order.js";

import Notification from "../models/notification.js";

import asyncHandler from "../utils/asyncHandler.js";

import { ApiError } from "../utils/ApiError.js";

import { createAndSendNotification } from "../services/notificationService.js";

/* =====================================================
   VENDOR PROMOTION
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

  if (!vendor) {
    throw new ApiError(401, "Vendor authentication required");
  }

  if (!title?.trim() || !message?.trim()) {
    throw new ApiError(400, "Title and message are required");
  }

  /*
        Optional:
        vendor active/approved checks
      */

  if (vendor.approvalStatus !== "approved") {
    throw new ApiError(
      403,
      "Vendor must be approved before sending notifications",
    );
  }

  const validAudiences = ["all_customers", "selected_customers"];

  if (!validAudiences.includes(audience)) {
    throw new ApiError(400, "Invalid audience");
  }

  let notificationAudience;

  /* ===================================
         ALL PAST CUSTOMERS
      =================================== */

  if (audience === "all_customers") {
    /*
          Customers are already joined to:

          vendor-customers:VENDOR_ID

          based on delivered orders.
        */

    notificationAudience = {
      type: "vendor_customers",

      vendorId: vendor._id,
    };
  }

  /* ===================================
         SELECTED CUSTOMERS
      =================================== */

  if (audience === "selected_customers") {
    if (!Array.isArray(customerIds) || customerIds.length === 0) {
      throw new ApiError(400, "Select at least one customer");
    }

    /*
          SECURITY CHECK:

          Only customers who have
          completed an order from
          THIS vendor are allowed.
        */

    const validCustomerIds = await Order.distinct("customer", {
      vendor: vendor._id,

      customer: {
        $in: customerIds,
      },

      status: "delivered",
    });

    if (validCustomerIds.length !== customerIds.length) {
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

  /* ===================================
         OFFER VALIDATION
      =================================== */

  const parsedDiscount = Number(discountValue || 0);

  if (
    discountType === "percentage" &&
    (parsedDiscount < 1 || parsedDiscount > 100)
  ) {
    throw new ApiError(400, "Percentage discount must be between 1 and 100");
  }

  const vendorName = vendor.businessName || vendor.name || "Vendor";

  const notification = await createAndSendNotification({
    sender: {
      id: vendor._id,

      type: "vendor",

      name: vendorName,
    },

    title: title.trim(),

    message: message.trim(),

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

  res.status(201).json({
    success: true,

    message: "Promotion notification sent successfully",

    data: {
      notification,
    },
  });
});

/* =====================================================
   VENDOR NOTIFICATION HISTORY
===================================================== */

export const getVendorNotificationHistory = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({
    "sender.type": "vendor",

    "sender.id": req.vendor._id,
  })
    .sort({
      createdAt: -1,
    })
    .limit(50);

  res.status(200).json({
    success: true,

    data: {
      notifications,
    },
  });
});
