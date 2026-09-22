import jwt from "jsonwebtoken";

import Vendor from "../models/vendor.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

/* =====================================================
   PROTECT VENDOR
===================================================== */

export const protectVendor = asyncHandler(async (req, res, next) => {
  let token = null;

  /* =========================
       COOKIE TOKEN
    ========================= */

  if (req.cookies?.vendorToken) {
    token = req.cookies.vendorToken;
  }

  /* =========================
       BEARER TOKEN
    ========================= */

  if (!token && req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    throw new ApiError(401, "Vendor login required");
  }

  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_VENDOR_SECRET, {
      issuer: "food-delivery-platform",
      audience: "vendor-panel",
    });
  } catch (error) {
    throw new ApiError(401, "Invalid or expired vendor token");
  }

  if (decoded.type !== "vendor") {
    throw new ApiError(401, "Invalid vendor authentication token");
  }

  const vendorId = decoded.id || decoded._id || decoded.vendorId;

  if (!vendorId) {
    throw new ApiError(401, "Invalid vendor token payload");
  }

  const vendor = await Vendor.findById(vendorId);

  if (!vendor) {
    throw new ApiError(401, "Vendor account does not exist");
  }

  if (vendor.isActive === false) {
    throw new ApiError(403, "Vendor account is inactive");
  }

  if (vendor.isBlocked === true) {
    throw new ApiError(403, vendor.blockReason || "Vendor account is blocked");
  }

  req.vendor = vendor;

  next();
});

/* =====================================================
   REQUIRE APPROVED VENDOR
===================================================== */

export const requireApprovedVendor = (req, res, next) => {
  if (!req.vendor) {
    return next(new ApiError(401, "Vendor authentication required"));
  }

  /*
    Tumhare Vendor model me:

    approvalStatus:
      pending
      approved
      rejected
  */

  if (req.vendor.approvalStatus !== "approved") {
    return next(
      new ApiError(
        403,
        req.vendor.approvalStatus === "rejected"
          ? req.vendor.rejectionReason || "Vendor application has been rejected"
          : "Your business is waiting for admin approval",
      ),
    );
  }

  next();
};

/* =====================================================
   REQUIRE EMAIL VERIFIED
===================================================== */

export const requireVendorEmailVerified = (req, res, next) => {
  if (!req.vendor) {
    return next(new ApiError(401, "Vendor authentication required"));
  }

  if (!req.vendor.isEmailVerified) {
    return next(new ApiError(403, "Please verify your email first"));
  }

  next();
};
