// routes/houseTiffinRoutes.js

import express from "express";
import * as houseTiffinController from "../controllers/houseTiffinController.js";
import { protect } from "../middleware/auth.js"; // your authentication middleware
import { upload } from "../middleware/upload.js"; // multer config for single image

const router = express.Router();
// ─── PUBLIC ──────────────────────────────────────────────────
router.get("/nearby", houseTiffinController.getNearbyTiffinHouses);
// ─── AUTH (no authentication required) ──────────────────────
router.post("/send-otp", houseTiffinController.sendOtp);
router.post("/verify-otp", houseTiffinController.verifyOtp);
router.post("/resend-otp", houseTiffinController.resendOtp);
router.post("/logout", protect, houseTiffinController.logout);

// ─── PROFILE ──────────────────────────────────────────────────
router.post("/profile", protect, houseTiffinController.createProfile);
router.get("/profile", protect, houseTiffinController.getProfile);
router.put("/profile", protect, houseTiffinController.updateProfile);
router.post(
  "/profile/image",
  protect,
  upload.single("profileImage"),
  houseTiffinController.uploadProfileImage,
);
router.delete(
  "/profile/image",
  protect,
  houseTiffinController.deleteProfileImage,
);

// ─── LOCATION & ADDRESS ──────────────────────────────────────
router.put("/location", protect, houseTiffinController.updateLocation);
router.get("/location", protect, houseTiffinController.getLocation);
router.put("/address", protect, houseTiffinController.updateAddress);
router.get("/address", protect, houseTiffinController.getAddress);

// ─── KITCHEN ──────────────────────────────────────────────────
router.post("/kitchen", protect, houseTiffinController.createKitchen);
router.put("/kitchen", protect, houseTiffinController.updateKitchen);
router.get("/kitchen", protect, houseTiffinController.getKitchen);

// ─── TIFFIN (MENU) ──────────────────────────────────────────
router.post("/tiffins", protect, houseTiffinController.createTiffin);
router.get("/tiffins", protect, houseTiffinController.getMyTiffins);
router.get("/tiffins/:id", protect, houseTiffinController.getTiffinById);
router.put("/tiffins/:id", protect, houseTiffinController.updateTiffin);
router.delete("/tiffins/:id", protect, houseTiffinController.deleteTiffin);
router.patch(
  "/tiffins/:id/toggle",
  protect,
  houseTiffinController.toggleTiffinAvailability,
);

// ─── DAILY MENU ──────────────────────────────────────────────
router.post("/daily-menu", protect, houseTiffinController.setDailyMenu);
router.get("/daily-menu", protect, houseTiffinController.getDailyMenu);

// ─── MEAL TIMINGS & WEEKLY AVAILABILITY ────────────────────
router.put("/meal-timings", protect, houseTiffinController.updateMealTimings);
router.put(
  "/weekly-availability",
  protect,
  houseTiffinController.updateWeeklyAvailability,
);

// ─── KYC ──────────────────────────────────────────────────────
router.post("/kyc", protect, houseTiffinController.uploadKyc);
router.get("/kyc", protect, houseTiffinController.getKycStatus);
router.put("/kyc", protect, houseTiffinController.updateKyc);

// ─── BANK DETAILS ────────────────────────────────────────────
router.post("/bank-details", protect, houseTiffinController.addBankDetails);
router.put("/bank-details", protect, houseTiffinController.updateBankDetails);
router.get("/bank-details", protect, houseTiffinController.getBankDetails);

// ─── ONLINE STATUS ──────────────────────────────────────────
router.patch(
  "/online-status",
  protect,
  houseTiffinController.updateOnlineStatus,
);
router.get("/online-status", protect, houseTiffinController.getOnlineStatus);

// ─── ORDERS ──────────────────────────────────────────────────
router.get("/orders/new", protect, houseTiffinController.getNewOrders);
router.get("/orders", protect, houseTiffinController.getMyOrders);
router.get("/orders/:id", protect, houseTiffinController.getOrderById);
router.patch("/orders/:id/accept", protect, houseTiffinController.acceptOrder);
router.patch("/orders/:id/reject", protect, houseTiffinController.rejectOrder);
router.patch(
  "/orders/:id/status",
  protect,
  houseTiffinController.updateOrderStatus,
);
router.patch("/orders/:id/cancel", protect, houseTiffinController.cancelOrder);

// ─── SUBSCRIPTION PLANS ──────────────────────────────────────
router.post(
  "/subscription-plans",
  protect,
  houseTiffinController.createSubscriptionPlan,
);
router.get(
  "/subscription-plans",
  protect,
  houseTiffinController.getSubscriptionPlans,
);
router.put(
  "/subscription-plans/:id",
  protect,
  houseTiffinController.updateSubscriptionPlan,
);
router.delete(
  "/subscription-plans/:id",
  protect,
  houseTiffinController.deleteSubscriptionPlan,
);
router.patch(
  "/subscription/pause",
  protect,
  houseTiffinController.pauseSubscription,
);
router.patch(
  "/subscription/resume",
  protect,
  houseTiffinController.resumeSubscription,
);
router.patch(
  "/subscription/cancel",
  protect,
  houseTiffinController.cancelSubscription,
);

// ─── EARNINGS & TRANSACTIONS ────────────────────────────────
router.get("/earnings/today", protect, houseTiffinController.getTodayEarnings);
router.get(
  "/earnings/weekly",
  protect,
  houseTiffinController.getWeeklyEarnings,
);
router.get(
  "/earnings/monthly",
  protect,
  houseTiffinController.getMonthlyEarnings,
);
router.get("/earnings/total", protect, houseTiffinController.getTotalEarnings);
router.get("/transactions", protect, houseTiffinController.getTransactions);

// ─── PAYOUTS ──────────────────────────────────────────────────
router.get("/payouts", protect, houseTiffinController.getPayoutHistory);
router.get("/payouts/pending", protect, houseTiffinController.getPendingPayout);
router.post("/payouts", protect, houseTiffinController.requestPayout);

// ─── REVIEWS & RATINGS ──────────────────────────────────────
router.get("/reviews", protect, houseTiffinController.getMyReviews);
router.get("/rating", protect, houseTiffinController.getMyRating);

// ─── NOTIFICATIONS ──────────────────────────────────────────
router.get("/notifications", protect, houseTiffinController.getNotifications);
router.patch(
  "/notifications/:id/read",
  protect,
  houseTiffinController.markNotificationRead,
);
router.patch(
  "/notifications/read-all",
  protect,
  houseTiffinController.markAllNotificationsRead,
);

// ─── DASHBOARD ──────────────────────────────────────────────
router.get("/dashboard", protect, houseTiffinController.getDashboard);

export default router;
