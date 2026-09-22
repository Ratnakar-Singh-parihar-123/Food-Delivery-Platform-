import jwt from "jsonwebtoken";

import Customer from "../models/customer.js";

import asyncHandler from "../utils/asyncHandler.js";

import { ApiError } from "../utils/ApiError.js";

export const protectCustomer = asyncHandler(async (req, res, next) => {
  let token;

  if (req.cookies?.customerToken) {
    token = req.cookies.customerToken;
  }

  if (!token && req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    throw new ApiError(401, "Customer login required");
  }

  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_CUSTOMER_SECRET, {
      issuer: "food-delivery-platform",

      audience: "customer-app",
    });
  } catch {
    throw new ApiError(401, "Invalid or expired customer token");
  }

  if (decoded.type !== "customer") {
    throw new ApiError(401, "Invalid authentication token");
  }

  const customer = await Customer.findById(decoded.id);

  if (!customer) {
    throw new ApiError(401, "Customer account does not exist");
  }

  if (customer.isBlocked) {
    throw new ApiError(
      403,
      customer.blockReason || "Your account has been blocked",
    );
  }

  if (!customer.isActive) {
    throw new ApiError(403, "Customer account is inactive");
  }

  req.customer = customer;

  next();
});
