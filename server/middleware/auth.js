// middleware/auth.js
import jwt from "jsonwebtoken";
import Customer from "../models/customer.js";
import Rider from "../models/rider.js";
import Vendor from "../models/vendor.js";
import Admin from "../models/admin.js";
import HouseTiffin from "../models/TiffinHouse.js"; // ✅ Add this
import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

const getBearerToken = (req) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }
  return null;
};

const verifyToken = (token, secret) => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    console.error("JWT verify error:", error.message);
    return null;
  }
};

export const protectUser = asyncHandler(async (req, res, next) => {
  const bearerToken = getBearerToken(req);
  const token = req.cookies?.token || bearerToken;

  if (!token) {
    console.warn("⚠️ No token provided");
    throw new ApiError(401, "Authentication required");
  }

  console.log(`🔑 Token received: ${token.substring(0, 15)}...`);

  // ✅ Added "houseTiffin" role
  const roles = [
    {
      type: "customer",
      secret: process.env.JWT_CUSTOMER_SECRET,
      Model: Customer,
    },
    { type: "rider", secret: process.env.JWT_RIDER_SECRET, Model: Rider },
    { type: "vendor", secret: process.env.JWT_VENDOR_SECRET, Model: Vendor },
    { type: "admin", secret: process.env.JWT_ADMIN_SECRET, Model: Admin },
    {
      type: "houseTiffin",
      secret: process.env.JWT_HOUSE_TIFFIN_SECRET,
      Model: HouseTiffin,
    }, // ✅ New
  ];

  let authenticatedUser = null;

  for (const role of roles) {
    if (!role.secret) {
      console.warn(`⚠️ Secret missing for role: ${role.type}`);
      continue;
    }

    const decoded = verifyToken(token, role.secret);
    if (!decoded) continue;

    // ✅ Enforce token type matching
    if (decoded.type && decoded.type !== role.type) {
      console.warn(
        `⚠️ Token type "${decoded.type}" does not match role "${role.type}"`,
      );
      continue;
    }

    const id = decoded.id || decoded._id || decoded.userId;
    if (!id) continue;

    const userDoc = await role.Model.findById(id);
    if (!userDoc) {
      console.warn(`⚠️ User not found for role ${role.type} with ID ${id}`);
      continue;
    }

    authenticatedUser = {
      id: userDoc._id,
      type: role.type,
      document: userDoc,
    };
    break;
  }

  if (!authenticatedUser) {
    console.error("❌ Authentication failed: No valid user found for token");
    throw new ApiError(401, "Invalid or expired token");
  }

  if (authenticatedUser.document.isActive === false) {
    throw new ApiError(403, "Your account has been disabled");
  }

  // ✅ Attach the full document to req.user (so req.user._id works)
  req.user = authenticatedUser.document;
  req.userType = authenticatedUser.type; // store role separately

  console.log(
    `✅ Authenticated as ${authenticatedUser.type} (ID: ${authenticatedUser.id})`,
  );
  next();
});

// Admin-only middleware (updated to use req.userType)
export const protectAdmin = asyncHandler(async (req, res, next) => {
  await protectUser(req, res, () => {});
  if (req.userType !== "admin") {
    // ✅ use req.userType
    throw new ApiError(403, "Admin access required");
  }
  next();
});

export const protect = protectUser;
