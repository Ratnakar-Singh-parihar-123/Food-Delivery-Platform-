import express from "express";

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

const router = express.Router();

router.use(protectVendor, requireApprovedVendor);

/* Dashboard */

router.get("/dashboard", getVendorDashboard);

/* Orders */

router.get("/orders", getVendorOrders);

router.get("/orders/live", getVendorLiveOrders);

router.get("/orders/:orderId", getVendorOrderById);

router.patch("/orders/:orderId/accept", acceptVendorOrder);

router.patch("/orders/:orderId/reject", rejectVendorOrder);

router.patch("/orders/:orderId/status", updateVendorOrderStatus);

/* Customers */

router.get("/customers", getVendorCustomers);

export default router;
