import express from "express";

import {
  createVendorNotification,
  getVendorNotificationHistory,
} from "../controllers/vendorNotificationController.js";

import {
  protectVendor,
  requireApprovedVendor,
} from "../middleware/vendorAuth.js";

const router = express.Router();

/* =====================================================
   ALL VENDOR NOTIFICATION ROUTES
===================================================== */

router.use(protectVendor, requireApprovedVendor);

/* =====================================================
   CREATE
   POST /vendor-notifications
===================================================== */

router.post("/", createVendorNotification);

/* =====================================================
   HISTORY
   GET /vendor-notifications
===================================================== */

router.get("/", getVendorNotificationHistory);

export default router;
