import express from "express";
import {
  getOverviewAnalytics,
  getRevenueAnalytics,
  getOrderAnalytics,
  getVendorAnalytics,
  getRiderAnalytics,
  getCustomerAnalytics,
  getPaymentAnalytics,
  getTiffinAnalytics,
  getProductAnalytics,
  getRevenueComparison,
  debugOrderSchema,
} from "../controllers/adminAnalyticsController.js";
import { protectAdmin } from "../middleware/adminAuth.js";

const router = express.Router();

// Protect all routes with admin authentication
router.use(protectAdmin);

router.get("/overview", getOverviewAnalytics);
router.get("/revenue", getRevenueAnalytics);
router.get("/orders", getOrderAnalytics);
router.get("/vendors", getVendorAnalytics);
router.get("/riders", getRiderAnalytics);
router.get("/customers", getCustomerAnalytics);
router.get("/payments", getPaymentAnalytics);
router.get("/tiffin", getTiffinAnalytics);
router.get("/products", getProductAnalytics);
router.get("/revenue/comparison", getRevenueComparison);
router.get("/debug/order-schema", debugOrderSchema);
export default router;
