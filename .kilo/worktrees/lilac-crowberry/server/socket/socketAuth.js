import jwt from "jsonwebtoken";
import * as cookie from "cookie";

import Admin from "../models/admin.js";
import Vendor from "../models/vendor.js";
import Customer from "../models/customer.js";
import Rider from "../models/rider.js";

export const socketAuth = async (socket, next) => {
  try {
    /* ==============================
       GET COOKIES
    ============================== */

    const cookieHeader = socket.handshake.headers.cookie;

    const cookies = cookieHeader ? cookie.parse(cookieHeader) : {};

    /* ==============================
       GET TOKEN
    ============================== */

    const token =
      cookies.adminToken ||
      cookies.vendorToken ||
      cookies.customerToken ||
      cookies.riderToken ||
      socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Authentication required"));
    }

    let decoded;
    let user;

    /* ==============================
       DETECT TOKEN TYPE
    ============================== */

    try {
      // ADMIN
      decoded = jwt.verify(token, process.env.JWT_ADMIN_SECRET, {
        issuer: "food-delivery-platform",
        audience: "admin-panel",
      });

      if (decoded.type === "admin") {
        user = await Admin.findById(decoded.id);

        if (!user) {
          return next(new Error("Admin not found"));
        }

        socket.user = user;
        socket.userId = user._id.toString();
        socket.userType = "admin";

        return next();
      }
    } catch {
      // Continue checking other token types
    }

    try {
      // VENDOR
      decoded = jwt.verify(token, process.env.JWT_VENDOR_SECRET, {
        issuer: "food-delivery-platform",
        audience: "vendor-panel",
      });

      if (decoded.type === "vendor") {
        user = await Vendor.findById(decoded.id);

        if (!user) {
          return next(new Error("Vendor not found"));
        }

        if (user.isBlocked) {
          return next(new Error("Vendor account blocked"));
        }

        socket.user = user;
        socket.userId = user._id.toString();
        socket.userType = "vendor";

        return next();
      }
    } catch {
      // Continue
    }

    try {
      // CUSTOMER
      decoded = jwt.verify(token, process.env.JWT_CUSTOMER_SECRET, {
        issuer: "food-delivery-platform",
        audience: "customer-app",
      });

      if (decoded.type === "customer") {
        user = await Customer.findById(decoded.id);

        if (!user) {
          return next(new Error("Customer not found"));
        }

        socket.user = user;
        socket.userId = user._id.toString();
        socket.userType = "customer";

        return next();
      }
    } catch {
      // Continue
    }

    try {
      // RIDER
      decoded = jwt.verify(token, process.env.JWT_RIDER_SECRET, {
        issuer: "food-delivery-platform",
        audience: "rider-app",
      });

      if (decoded.type === "rider") {
        user = await Rider.findById(decoded.id);

        if (!user) {
          return next(new Error("Rider not found"));
        }

        socket.user = user;
        socket.userId = user._id.toString();
        socket.userType = "rider";

        return next();
      }
    } catch {
      // Continue
    }

    return next(new Error("Invalid or expired authentication token"));
  } catch (error) {
    console.error("Socket authentication error:", error);

    return next(new Error("Socket authentication failed"));
  }
};
