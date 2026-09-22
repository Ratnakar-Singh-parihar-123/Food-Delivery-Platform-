import jwt from "jsonwebtoken";

import Rider from "../models/rider.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

export const protectRider = asyncHandler(async (req, res, next) => {
  let token = req.cookies?.riderToken || null;

  if (!token && req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    throw new ApiError(401, "Rider login required");
  }

  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_RIDER_SECRET, {
      issuer: "food-delivery-platform",
      audience: "rider-app",
    });
  } catch {
    throw new ApiError(401, "Invalid or expired rider token");
  }

  if (decoded.type !== "rider" || !decoded.id) {
    throw new ApiError(401, "Invalid rider authentication token");
  }

  const rider = await Rider.findById(decoded.id);

  if (!rider) {
    throw new ApiError(401, "Rider account does not exist");
  }

  if (rider.isBlocked) {
    throw new ApiError(403, rider.blockReason || "Rider account is blocked");
  }

  if (!rider.isActive) {
    throw new ApiError(403, "Rider account is inactive");
  }

  req.rider = rider;

  next();
});

export const requireApprovedRider = (req, res, next) => {
  if (!req.rider) {
    return next(new ApiError(401, "Rider authentication required"));
  }

  if (req.rider.approvalStatus !== "approved") {
    return next(
      new ApiError(
        403,
        req.rider.approvalStatus === "rejected"
          ? req.rider.rejectionReason || "Rider application has been rejected"
          : "Your rider application is awaiting admin approval",
      ),
    );
  }

  next();
};

export const requireRiderEmailVerified = (req, res, next) => {
  if (!req.rider?.isEmailVerified) {
    return next(new ApiError(403, "Please verify your email first"));
  }

  next();
};
