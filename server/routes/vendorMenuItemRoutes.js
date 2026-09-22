import express from "express";
import {
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getMenuItems,
  getMenuItemById,
} from "../controllers/vendorMenuController.js";

import {
  protectVendor,
  requireApprovedVendor,
} from "../middleware/vendorAuth.js";

import { uploadVendorMenu } from "../middleware/vendorUpload.js";

const router = express.Router({ mergeParams: true });

// ==============================
// Public Routes
// ==============================

// Get all menu items
router.get("/", getMenuItems);

// Get single menu item
router.get("/:itemId", getMenuItemById);

// ==============================
// Protected Routes
// ==============================

router.use(protectVendor);
router.use(requireApprovedVendor);

// Add menu item
router.post("/", uploadVendorMenu, addMenuItem);

// Update menu item
router.put("/:itemId", uploadVendorMenu, updateMenuItem);

// Delete menu item
router.delete("/:itemId", deleteMenuItem);

export default router;
