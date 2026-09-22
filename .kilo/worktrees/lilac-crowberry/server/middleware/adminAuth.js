import jwt from "jsonwebtoken";
import Admin from "../models/admin.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

export const protectAdmin = asyncHandler(async (req, res, next) => {
  let token;
  console.log("Authorization:", req.headers.authorization);
  console.log("Cookie:", req.cookies);

  /* Authorization header */

  const authorization = req.headers.authorization;

  if (authorization && authorization.startsWith("Bearer ")) {
    token = authorization.split(" ")[1];
  }

  /* Cookie */

  if (!token && req.cookies?.adminToken) {
    token = req.cookies.adminToken;
  }
  console.log("TOKEN:", token);

  if (!token) {
    throw new ApiError(401, "Admin login required");
  }

  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_ADMIN_SECRET, {
      issuer: "food-delivery-platform",

      audience: "admin-panel",
    });
  } catch {
    throw new ApiError(401, "Invalid or expired token");
  }

  if (decoded.type !== "admin") {
    throw new ApiError(401, "Invalid admin token");
  }

  const admin = await Admin.findById(decoded.id);

  if (!admin) {
    throw new ApiError(401, "Admin does not exist");
  }

  if (!admin.isActive) {
    throw new ApiError(403, "Admin account is disabled");
  }

  req.admin = admin;

  next();
});
