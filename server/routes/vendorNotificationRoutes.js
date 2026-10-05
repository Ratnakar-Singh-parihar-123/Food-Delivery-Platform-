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
   🔔 VENDOR NOTIFICATIONS
===================================================== */

router.use(protectVendor, requireApprovedVendor);

/*
|--------------------------------------------------------------------------
| GET
| Vendor receives:
| - Admin → Vendor
| - Admin → All
| - Vendor's own sent notifications
|--------------------------------------------------------------------------
*/

router.get("/", getVendorNotificationHistory);

/*
|--------------------------------------------------------------------------
| POST
| Vendor sends:
| - Vendor → All Customers
| - Vendor → Selected Customers
| - Vendor → All Riders
|--------------------------------------------------------------------------
*/

router.post("/", createVendorNotification);

export default router;
