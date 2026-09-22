import express from "express";

import {
  registerAdmin,
  loginAdmin,
  logoutAdmin,
  getAdminProfile,
  updateAdminProfile,
  updateAdminEmail,
  changeAdminPassword,
  forgotAdminPassword,
  resetAdminPassword,
  updateAdminProfileImage,
  deleteAdminProfileImage,
  getAllVendorsForAdmin,
  getAllMenuItemsForAdmin,
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getFoodCategories,
  createFoodCategory,
  updateFoodCategory,
  deleteFoodCategory,
  getRiderLocations,
  getRiderLocation,
  getVendorLocation,
  getOrderTracking,
  getVendorDetails,
  approveVendor,
  rejectVendor,
  blockVendor,
  getPendingVendors,
  unblockVendor,
} from "../controllers/adminController.js";

import {
  adminGetOrders,
  adminGetLiveOrders,
  getServiceAreas,
  getServiceAreaById,
  createServiceArea,
  updateServiceArea,
  deleteServiceArea,
  toggleServiceAreaStatus,
  checkServiceAreaCoverage,
  getOrderDetails,
  getRecentOrders,
  adminUpdateOrderStatus,
  adminAssignOrderRider,
  adminCancelOrder,
} from "../controllers/orderController.js";

import {
  createExploreCategory,
  updateExploreCategory,
  deleteExploreCategory,
  getExploreCategories,
  getExploreCategoryById,
  getSuggestions,
  adminGetExploreCategories,
} from "../controllers/exploreController.js";

import {
  adminGetPopularFoods,
  adminTogglePopularFood,
  adminDeletePopularFood,
} from "../controllers/popularFoodController.js";

import { protectAdmin } from "../middleware/adminAuth.js";
import {
  uploadAdminProfile,
  uploadCategoryImage,
} from "../middleware/upload.js";

const router = express.Router();

router.get("/locations", protectAdmin, getRiderLocations);
router.get("/:riderId/location", protectAdmin, getRiderLocation);
router.get("/vendors/:vendorId/location", protectAdmin, getVendorLocation);
router.get("/orders/:orderId/tracking", protectAdmin, getOrderTracking);
router.get("/vendors/pending", getPendingVendors);
/* =================================================
   PUBLIC ROUTES (no authentication required)
================================================= */
router.post("/register", registerAdmin);
router.post("/login", loginAdmin);
router.post("/forgot/password", forgotAdminPassword);
router.patch("/reset/password/:token", resetAdminPassword);

/* =================================================
   PROTECTED ROUTES (all require admin login)
================================================= */
router.use(protectAdmin);

// ─── Auth ──────────────────────────────────────────
router.post("/logout", logoutAdmin);

// ─── Profile ───────────────────────────────────────
router.get("/profile", getAdminProfile);
router.patch("/profile", updateAdminProfile);
router.patch("/email", updateAdminEmail);
router.patch("/change/password", changeAdminPassword);
router.patch("/profile/image", uploadAdminProfile, updateAdminProfileImage);
router.delete("/profile/image", deleteAdminProfileImage);

// ─── Explore Categories ──────────────────────────
router.get("/explore", adminGetExploreCategories);
router.post("/explore", createExploreCategory);
router.put("/explore/:id", updateExploreCategory);
router.delete("/explore/:id", deleteExploreCategory);
router.get("/explore/suggestions", getSuggestions);

// ─── Vendors & Menu Items (for dropdowns) ────────
router.get("/vendors", getAllVendorsForAdmin);
router.get("/menu/items", getAllMenuItemsForAdmin);

// ─── Popular Foods ────────────────────────────────
router.get("/popular/foods", adminGetPopularFoods);
router.patch("/popular/foods/:popularFoodId/toggle", adminTogglePopularFood);
router.delete("/popular/foods/:popularFoodId", adminDeletePopularFood);

// ─── Service Areas ────────────────────────────────
router.get("/service/areas", getServiceAreas);
router.get("/service/areas/:areaId", getServiceAreaById);
router.post("/service/areas", createServiceArea);
router.put("/service/areas/:areaId", updateServiceArea);
router.delete("/service/areas/:areaId", deleteServiceArea);
router.patch("/service/areas/:areaId/toggle", toggleServiceAreaStatus);
router.get("/service/areas/check/coverage", checkServiceAreaCoverage);

// ─── Orders ────────────────────────────────────────
router.get("/orders", adminGetOrders);
router.get("/orders/live", adminGetLiveOrders);
router.get("/orders/recent", getRecentOrders);
router.get("/orders/:orderId", getOrderDetails);
router.put("/orders/:orderId/status", adminUpdateOrderStatus);
router.put("/orders/:orderId/assign-rider", adminAssignOrderRider);
router.put("/orders/:orderId/cancel", adminCancelOrder);

// ─── Food Categories (Global) ─────────────────────
router.get("/food/categories", getFoodCategories);
router.post("/food/categories", uploadCategoryImage, createFoodCategory);
router.put("/food/categories/:id", uploadCategoryImage, updateFoodCategory);
router.delete("/food/categories/:id", deleteFoodCategory);

// ─── Categories (Vendor‑specific – if needed) ────
router.get("/categories", getAllCategories);
router.post("/categories", createCategory);
router.put("/categories/:id", updateCategory);
router.delete("/categories/:id", deleteCategory);

// ─── Vendor / Tiffin House Management ──────────────
router.get("/vendors/:vendorId", protectAdmin, getVendorDetails);
router.put("/vendors/:vendorId/approve", protectAdmin, approveVendor);
router.put("/vendors/:vendorId/reject", protectAdmin, rejectVendor);
router.put("/vendors/:vendorId/block", protectAdmin, blockVendor);
router.put("/vendors/:vendorId/unblock", protectAdmin, unblockVendor);

export default router;
