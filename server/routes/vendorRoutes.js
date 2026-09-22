import express from "express";

import {
  registerVendor,
  verifyVendorEmail,
  loginVendor,
  getVendorProfile,
  updateVendorProfile,
  updateVendorBusiness,
  updateVendorAddress,
  updateVendorTimings,
  updateVendorOnlineStatus,
  updateVendorProfileImage,
  deleteVendorProfileImage,
  updateVendorBank,
  changeVendorPassword,
  forgotVendorPassword,
  verifyVendorResetOtp,
  resetVendorPassword,
  logoutVendor,
  resendVendorEmailOtp,
  reverseGeocodeVendor,
  getNearbyVendors,
  getVendorById,
  getGlobalCategories,
  getVendorCategories,
  addVendorCategory,
  updateVendorCategory,
  deleteVendorCategory,
  getVendorMenuItems,
  addVendorMenuItem,
  updateVendorMenuItem,
  deleteVendorMenuItem,
  getTopVendors,
} from "../controllers/vendorController.js";

import {
  addPopularFood,
  removePopularFood,
  getVendorPopularFoods,
} from "../controllers/popularFoodController.js";

import {
  protectVendor,
  requireApprovedVendor,
} from "../middleware/vendorAuth.js";
import { getVendorDashboard } from "../controllers/vendorDashboardController.js";
import {
  getVendorOrders,
  getVendorLiveOrders,
  getVendorOrderById,
  acceptVendorOrder,
  rejectVendorOrder,
  updateVendorOrderStatus,
} from "../controllers/vendorOrderController.js";
import { getVendorCustomers } from "../controllers/vendorCustomerController.js";
import {
  uploadVendorProfile,
  uploadVendorRegistration,
  uploadVendorMenu,
  uploadVendorCategoryIcon,
} from "../middleware/vendorUpload.js";

const router = express.Router();

/* =====================================================
   🟢 PUBLIC ROUTES (no authentication)
===================================================== */

// ─── Registration & Auth ────────────────────────────────────
router.post("/register", uploadVendorRegistration, registerVendor);
router.post("/verify/email", verifyVendorEmail);
router.post("/resend/otp", resendVendorEmailOtp);
router.post("/login", loginVendor);
router.post("/forgot/password", forgotVendorPassword);
router.post("/verify/reset-otp", verifyVendorResetOtp);
router.patch("/reset/password", resetVendorPassword);

// ─── Global categories (for dropdown) ──────────────────────
router.get("/global/categories", getGlobalCategories);

// ─── Nearby vendors ────────────────────────────────────────
router.get("/nearby", getNearbyVendors);
router.get("/vendors/top", getTopVendors);

/* =====================================================
   🔒 PROTECTED ROUTES (authentication required)
   All these routes are defined BEFORE the wildcard routes
===================================================== */

// ─── Auth ──────────────────────────────────────────────────
router.post("/logout", protectVendor, logoutVendor);

// ─── Profile (vendor's own) ──────────────────────────────
router.get("/profile", protectVendor, getVendorProfile);
router.patch("/profile", protectVendor, updateVendorProfile);
router.patch("/business", protectVendor, updateVendorBusiness);
router.patch("/address", protectVendor, updateVendorAddress);
router.patch("/timings", protectVendor, updateVendorTimings);
router.patch("/bank", protectVendor, updateVendorBank);
router.patch(
  "/profile/image",
  protectVendor,
  uploadVendorProfile,
  updateVendorProfileImage,
);
router.delete("/profile/image", protectVendor, deleteVendorProfileImage);
router.patch("/change/password", protectVendor, changeVendorPassword);

// ─── Popular foods ──────────────────────────────────────────
router.post("/popular/foods", protectVendor, addPopularFood);
router.delete(
  "/popular/foods/:popularFoodId",
  protectVendor,
  removePopularFood,
);
router.get("/popular/foods", protectVendor, getVendorPopularFoods);

// ─── Reverse geocode ──────────────────────────────────────
router.post("/reverse/geocode", protectVendor, reverseGeocodeVendor);

// ─── Online status (requires approval) ────────────────────
router.patch(
  "/online/status",
  protectVendor,
  requireApprovedVendor,
  updateVendorOnlineStatus,
);

// ─── Dashboard & Orders (require approval) ──────────────
router.get(
  "/dashboard",
  protectVendor,
  requireApprovedVendor,
  getVendorDashboard,
);
router.get("/orders", protectVendor, requireApprovedVendor, getVendorOrders);
router.get(
  "/orders/live",
  protectVendor,
  requireApprovedVendor,
  getVendorLiveOrders,
);
router.get(
  "/orders/:orderId",
  protectVendor,
  requireApprovedVendor,
  getVendorOrderById,
);
router.patch(
  "/orders/:orderId/accept",
  protectVendor,
  requireApprovedVendor,
  acceptVendorOrder,
);
router.patch(
  "/orders/:orderId/reject",
  protectVendor,
  requireApprovedVendor,
  rejectVendorOrder,
);
router.patch(
  "/orders/:orderId/status",
  protectVendor,
  requireApprovedVendor,
  updateVendorOrderStatus,
);

// ─── Customers ──────────────────────────────────────────────
router.get(
  "/customers",
  protectVendor,
  requireApprovedVendor,
  getVendorCustomers,
);

/* =====================================================
   CATEGORY & MENU (protected, vendor-specific)
   These are for the vendor's own management
===================================================== */

// ─── Vendor categories ──────────────────────────────────
router.get("/:vendorId/categories", protectVendor, getVendorCategories);
router.post(
  "/:vendorId/categories",
  protectVendor,
  uploadVendorCategoryIcon,
  addVendorCategory,
);
router.put(
  "/:vendorId/categories/:categoryId",
  protectVendor,
  uploadVendorCategoryIcon,
  updateVendorCategory,
);
router.delete(
  "/:vendorId/categories/:categoryId",
  protectVendor,
  deleteVendorCategory,
);

// ─── Menu items ──────────────────────────────────────────
router.post(
  "/:vendorId/menu/items",
  protectVendor,
  uploadVendorMenu,
  addVendorMenuItem,
);
router.put(
  "/:vendorId/menu/items/:itemId",
  protectVendor,
  uploadVendorMenu,
  updateVendorMenuItem,
);
router.delete(
  "/:vendorId/menu/items/:itemId",
  protectVendor,
  deleteVendorMenuItem,
);
// Legacy
router.put(
  "/:vendorId/items/:itemId",
  protectVendor,
  uploadVendorMenu,
  updateVendorMenuItem,
);

/* =====================================================
   🟢 PUBLIC WILDCARD ROUTES (MUST BE LAST)
   These are for public viewing of vendor profiles & menus
===================================================== */
router.get("/:vendorId", getVendorById);
router.get("/:vendorId/menu/items", getVendorMenuItems);

export default router;
