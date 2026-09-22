import Coupon from "../models/coupon.js";
import Order from "../models/order.js";

import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

/* =====================================================
   CREATE COUPON
===================================================== */

export const createCoupon = asyncHandler(async (req, res) => {
  const {
    code,
    title,
    description,

    scope = "platform",
    vendor,

    discountType,
    discountValue,

    maxDiscount,
    minimumOrderAmount,

    totalUsageLimit,
    perCustomerLimit,

    firstOrderOnly,

    startsAt,
    expiresAt,

    isActive,
  } = req.body;

  const exists = await Coupon.findOne({
    code,
  });

  if (exists) {
    throw new ApiError(409, "Coupon code already exists");
  }

  const coupon = await Coupon.create({
    code,

    title: title.trim(),

    description: description?.trim() || "",

    scope,

    vendor: scope === "vendor" ? vendor : null,

    discountType,

    discountValue: Number(discountValue),

    maxDiscount: maxDiscount ? Number(maxDiscount) : null,

    minimumOrderAmount: Number(minimumOrderAmount || 0),

    totalUsageLimit: totalUsageLimit ? Number(totalUsageLimit) : null,

    perCustomerLimit: Number(perCustomerLimit || 1),

    firstOrderOnly:
      firstOrderOnly === true || String(firstOrderOnly) === "true",

    startsAt: startsAt || null,

    expiresAt,

    isActive:
      isActive === undefined
        ? true
        : isActive === true || String(isActive) === "true",

    createdBy: req.admin._id,
  });

  return res.status(201).json({
    success: true,

    message: "Coupon created successfully",

    data: {
      coupon,
    },
  });
});

/* =====================================================
   GET ALL ADMIN
===================================================== */

export const getAllCoupons = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);

  const limit = Math.min(Number(req.query.limit) || 20, 100);

  const { search, status, scope } = req.query;

  const query = {};

  if (search?.trim()) {
    query.$or = [
      {
        code: {
          $regex: search.trim(),
          $options: "i",
        },
      },

      {
        title: {
          $regex: search.trim(),
          $options: "i",
        },
      },
    ];
  }

  if (scope) {
    query.scope = scope;
  }

  if (status === "active") {
    query.isActive = true;
  }

  if (status === "inactive") {
    query.isActive = false;
  }

  if (status === "expired") {
    query.expiresAt = {
      $lt: new Date(),
    };
  }

  const skip = (page - 1) * limit;

  const [coupons, total] = await Promise.all([
    Coupon.find(query)
      .populate("vendor", "businessName profileImage")
      .populate("createdBy", "firstName lastName")
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit),

    Coupon.countDocuments(query),
  ]);

  return res.status(200).json({
    success: true,

    data: {
      coupons,

      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    },
  });
});

/* =====================================================
   GET SINGLE
===================================================== */

export const getCouponById = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.couponId).populate(
    "vendor",
    "businessName",
  );

  if (!coupon) {
    throw new ApiError(404, "Coupon not found");
  }

  return res.status(200).json({
    success: true,

    data: {
      coupon,
    },
  });
});

/* =====================================================
   UPDATE
===================================================== */

export const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.couponId);

  if (!coupon) {
    throw new ApiError(404, "Coupon not found");
  }

  const allowedFields = [
    "title",
    "description",
    "scope",
    "vendor",
    "discountType",
    "discountValue",
    "maxDiscount",
    "minimumOrderAmount",
    "totalUsageLimit",
    "perCustomerLimit",
    "firstOrderOnly",
    "startsAt",
    "expiresAt",
    "isActive",
  ];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      coupon[field] = req.body[field];
    }
  });

  if (coupon.scope === "platform") {
    coupon.vendor = null;
  }

  if (
    coupon.discountType === "percentage" &&
    Number(coupon.discountValue) > 100
  ) {
    throw new ApiError(400, "Percentage discount cannot exceed 100%");
  }

  if (new Date(coupon.expiresAt) <= new Date()) {
    throw new ApiError(400, "Expiry date must be in the future");
  }

  coupon.updatedBy = req.admin._id;

  await coupon.save();

  return res.status(200).json({
    success: true,

    message: "Coupon updated successfully",

    data: {
      coupon,
    },
  });
});

/* =====================================================
   ACTIVE / INACTIVE
===================================================== */

export const toggleCouponStatus = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.couponId);

  if (!coupon) {
    throw new ApiError(404, "Coupon not found");
  }

  coupon.isActive = !coupon.isActive;

  coupon.updatedBy = req.admin._id;

  await coupon.save();

  return res.status(200).json({
    success: true,

    message: coupon.isActive ? "Coupon activated" : "Coupon deactivated",

    data: {
      isActive: coupon.isActive,
    },
  });
});

/* =====================================================
   DELETE
===================================================== */

export const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.couponId);

  if (!coupon) {
    throw new ApiError(404, "Coupon not found");
  }

  await coupon.deleteOne();

  return res.status(200).json({
    success: true,

    message: "Coupon deleted successfully",
  });
});

export const validateCoupon = asyncHandler(async (req, res) => {
  const { code, orderAmount, vendorId } = req.body;

  if (!code) {
    throw new ApiError(400, "Coupon code is required");
  }

  const amount = Number(orderAmount);

  if (Number.isNaN(amount) || amount <= 0) {
    throw new ApiError(400, "Valid order amount required");
  }

  const coupon = await Coupon.findOne({
    code: String(code).trim().toUpperCase(),

    isActive: true,
  });

  if (!coupon) {
    throw new ApiError(404, "Invalid coupon code");
  }

  const now = new Date();

  /* START */

  if (coupon.startsAt && now < new Date(coupon.startsAt)) {
    throw new ApiError(400, "Coupon is not active yet");
  }

  /* EXPIRY */

  if (now > new Date(coupon.expiresAt)) {
    throw new ApiError(400, "Coupon has expired");
  }

  /* VENDOR CHECK */

  if (coupon.scope === "vendor") {
    if (!vendorId) {
      throw new ApiError(400, "Vendor required for this coupon");
    }

    if (coupon.vendor.toString() !== vendorId.toString()) {
      throw new ApiError(400, "Coupon is not valid for this vendor");
    }
  }

  /* MINIMUM ORDER */

  if (amount < coupon.minimumOrderAmount) {
    throw new ApiError(
      400,
      `Minimum order amount is ₹${coupon.minimumOrderAmount}`,
    );
  }

  /* TOTAL USAGE */

  if (coupon.totalUsageLimit && coupon.usedCount >= coupon.totalUsageLimit) {
    throw new ApiError(400, "Coupon usage limit reached");
  }

  /* CUSTOMER USAGE */

  const customerUsage = coupon.usages.filter(
    (usage) => usage.customer.toString() === req.customer._id.toString(),
  ).length;

  if (customerUsage >= coupon.perCustomerLimit) {
    throw new ApiError(400, "You have already used this coupon");
  }

  /* FIRST ORDER */

  if (coupon.firstOrderOnly) {
    const previousOrder = await Order.exists({
      customer: req.customer._id,

      status: {
        $in: [
          "confirmed",
          "preparing",
          "ready_for_pickup",
          "rider_assigned",
          "picked_up",
          "on_the_way",
          "delivered",
        ],
      },
    });

    if (previousOrder) {
      throw new ApiError(400, "This coupon is only for first order");
    }
  }

  /* ========================================
       CALCULATE DISCOUNT
    ======================================== */

  let discount = 0;

  if (coupon.discountType === "percentage") {
    discount = (amount * coupon.discountValue) / 100;

    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }
  }

  if (coupon.discountType === "flat") {
    discount = coupon.discountValue;
  }

  discount = Math.min(discount, amount);

  discount = Number(discount.toFixed(2));

  const finalAmount = Number((amount - discount).toFixed(2));

  return res.status(200).json({
    success: true,

    message: "Coupon applied successfully",

    data: {
      couponId: coupon._id,

      code: coupon.code,

      title: coupon.title,

      discount,

      originalAmount: amount,

      finalAmount,
    },
  });
});
export const markCouponUsed = async ({ couponId, customerId, orderId }) => {
  if (!couponId) {
    return;
  }

  await Coupon.findByIdAndUpdate(
    couponId,

    {
      $inc: {
        usedCount: 1,
      },

      $push: {
        usages: {
          customer: customerId,

          order: orderId,

          usedAt: new Date(),
        },
      },
    },
  );
};
