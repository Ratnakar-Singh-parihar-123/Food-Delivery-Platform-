import express from "express";
import {
  createPaymentOrder,
  verifyPayment,
  getPayment,
} from "../controllers/paymentController.js";
import { handleRazorpayWebhook } from "../controllers/webhookController.js";
import { protect } from "../middleware/auth.js"; // your customer auth

const router = express.Router();

// Webhook (no auth)
router.post(
  "/webhook/razorpay",
  express.raw({ type: "application/json" }),
  handleRazorpayWebhook,
);

// Customer routes
router.use(protect); // all below require customer auth
router.post("/create-order", createPaymentOrder);
router.post("/verify", verifyPayment);
router.get("/:paymentId", getPayment);

export default router;
