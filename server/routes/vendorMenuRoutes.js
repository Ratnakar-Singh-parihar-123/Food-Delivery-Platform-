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
import { uploadVendorMenu } from "../middleware/vendorUpload.js"; // ✅ fixed

const router = express.Router({ mergeParams: true });

// ─── Public routes ──────────────────────────────────────────
router.get("/", getMenuItems);
router.get("/:itemId", getMenuItemById);

// ─── Protected routes ──────────────────────────────────────
router.use(protectVendor);
router.use(requireApprovedVendor);

// Add item (image upload handled by multer)
router.post("/", uploadVendorMenu, addMenuItem);

// Update item
router.put("/:itemId", uploadVendorMenu, updateMenuItem);

// Delete item
router.delete("/:itemId", deleteMenuItem);

export default router;
