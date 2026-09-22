import express from "express";
import {
  getDashboardStats,
  getOrdersOverview,
  getRevenueBreakdown,
  getActiveOrders,
  getRiderStatus,
  getRecentOrders,
  getTopVendors,
  getPendingVendors,
  getPendingRiders,
  getSupportTickets,
  getServiceAreas,
} from "../controllers/adminDashboardController.js";
import { protectAdmin } from "../middleware/adminAuth.js";

const router = express.Router();

// All routes require admin authentication
router.use(protectAdmin);

router.get("/stats", getDashboardStats);
router.get("/orders/overview", getOrdersOverview);
router.get("/revenue/breakdown", getRevenueBreakdown);
router.get("/active/orders", getActiveOrders);
router.get("/rider/status", getRiderStatus);
router.get("/recent/orders", getRecentOrders);
router.get("/top/vendors", getTopVendors);
router.get("/pending/vendors", getPendingVendors);
router.get("/pending/riders", getPendingRiders);
router.get("/support/tickets", getSupportTickets);
router.get("/service/areas", getServiceAreas);

export default router;
