import express from "express";

import {
  getAllVendors,
  getPendingVendors,
  getVendorById,
  approveVendor,
  rejectVendor,
  blockVendor,
  unblockVendor,
  updateVendorStatus,
  updateVendorCommission,
  getVendorStats,
  toggleVendorTop, // ✅ new import
} from "../controllers/adminVendorController.js";

import { protectAdmin } from "../middleware/adminAuth.js";

const router = express.Router();

router.use(protectAdmin);

router.get("/stats", getVendorStats);
router.get("/pending", getPendingVendors);
router.get("/", getAllVendors);
router.get("/:vendorId", getVendorById);

router.patch("/:vendorId/approve", approveVendor);
router.patch("/:vendorId/reject", rejectVendor);
router.patch("/:vendorId/block", blockVendor);
router.patch("/:vendorId/unblock", unblockVendor);
router.patch("/:vendorId/status", updateVendorStatus);
router.patch("/:vendorId/commission", updateVendorCommission);
router.patch("/:vendorId/top", toggleVendorTop); // ✅ new route

export default router;
