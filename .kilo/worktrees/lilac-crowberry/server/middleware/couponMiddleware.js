import { ApiError } from "../utils/ApiError.js";

/* =====================================================
   NORMALIZE COUPON CODE
===================================================== */

export const normalizeCouponCode = (req, res, next) => {
  if (req.body.code) {
    req.body.code = String(req.body.code).trim().toUpperCase();
  }

  next();
};

/* =====================================================
   CREATE VALIDATION
===================================================== */

export const validateCouponInput = (req, res, next) => {
  const { code, title, discountType, discountValue, expiresAt, scope, vendor } =
    req.body;

  if (!code) {
    return next(new ApiError(400, "Coupon code is required"));
  }

  if (!title?.trim()) {
    return next(new ApiError(400, "Coupon title is required"));
  }

  if (!["percentage", "flat"].includes(discountType)) {
    return next(new ApiError(400, "Invalid discount type"));
  }

  const discount = Number(discountValue);

  if (Number.isNaN(discount) || discount <= 0) {
    return next(new ApiError(400, "Discount value must be greater than 0"));
  }

  if (discountType === "percentage" && discount > 100) {
    return next(new ApiError(400, "Percentage discount cannot exceed 100%"));
  }

  if (!expiresAt) {
    return next(new ApiError(400, "Coupon expiry date is required"));
  }

  if (new Date(expiresAt) <= new Date()) {
    return next(new ApiError(400, "Coupon expiry must be in the future"));
  }

  if (scope === "vendor" && !vendor) {
    return next(new ApiError(400, "Vendor is required for vendor coupon"));
  }

  next();
};
