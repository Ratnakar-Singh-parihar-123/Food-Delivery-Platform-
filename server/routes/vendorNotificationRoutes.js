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

router.use(protectVendor, requireApprovedVendor);

router.post("/", createVendorNotification);

router.get("/", getVendorNotificationHistory);

export default router;
