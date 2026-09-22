import express from "express";
import {
  addCategory,
  updateCategory,
  deleteCategory,
  getCategories,
  getCategoryById,
} from "../controllers/vendorCategoryController.js";
import {
  protectVendor,
  requireApprovedVendor,
} from "../middleware/vendorAuth.js";
import { uploadCategoryIcon } from "../middleware/upload.js";

const router = express.Router({ mergeParams: true });

// ─── Public routes ──────────────────────────────────────────
router.get("/", getCategories);
router.get("/:categoryId", getCategoryById);

// ─── Protected routes ──────────────────────────────────────
router.use(protectVendor);
router.use(requireApprovedVendor);

// ✅ Use uploadCategoryIcon for category icon uploads
router.post("/", uploadCategoryIcon, addCategory);
router.put("/:categoryId", uploadCategoryIcon, updateCategory);
router.delete("/:categoryId", deleteCategory);

export default router;
