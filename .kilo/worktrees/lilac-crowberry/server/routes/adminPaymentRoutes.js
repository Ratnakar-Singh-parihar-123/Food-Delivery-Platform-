import express from "express";
import { protectAdmin } from "../middleware/adminAuth.js";
import {
  getPaymentOverview,
  getVendorSettlements,
  processVendorSettlement,
  getRiderEarnings,
  getRiderPayouts,
  processRiderPayout,
  getRefunds,
  getReconciliation,
  getPaymentAnalytics,
} from "../controllers/adminPaymentController.js";

const router = express.Router();
router.use(protectAdmin);

router.get("/overview", getPaymentOverview);
router.get("/vendor-settlements", getVendorSettlements);
router.post(
  "/vendor-settlements/:settlementId/process",
  processVendorSettlement,
);
router.get("/rider-earnings", getRiderEarnings);
router.get("/rider-payouts", getRiderPayouts);
router.post("/rider-payouts/:payoutId/process", processRiderPayout);
router.get("/refunds", getRefunds);
router.get("/reconciliation", getReconciliation);
router.get("/analytics", getPaymentAnalytics);

export default router;
