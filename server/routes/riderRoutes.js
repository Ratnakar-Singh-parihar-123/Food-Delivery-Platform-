// // import express from "express";
// // import { protectUser, protectAdmin } from "../middleware/auth.js";
// // import { upload } from "../middleware/upload.js";
// // import {
// //   riderSendOtp,
// //   riderVerifyOtp,
// //   riderCompleteProfile,
// //   riderUploadDocument,
// //   riderSubmitDocuments,
// //   adminUpdateRiderStatus,
// //   riderRegister,
// //   riderLogin,
// //   getRiderProfile,
// //   updateRiderLocation,
// //   toggleRiderOnline,
// //   getRiderOrders,
// //   getNearbyOrders,
// //   getRiderDocuments,
// // } from "../controllers/riderController.js";
// // import {
// //   getNearbyOrders as getRiderNearbyOrders,
// //   riderAcceptOrder,
// //   riderUpdateOrder,
// // } from "../controllers/orderController.js";

// // const router = express.Router();

// // // ─── Public ──────────────────────────────────────────────
// // router.post("/send/otp", riderSendOtp);
// // router.post("/verify/otp", riderVerifyOtp);
// // router.post("/register", riderRegister); // legacy, keep if needed
// // router.post("/login", riderLogin);

// // // ─── Rider Protected ──────────────────────────────────
// // router.use(protectUser);

// // router.get("/profile", getRiderProfile);
// // router.post("/profile/complete", riderCompleteProfile);

// // router.post(
// //   "/documents/upload",
// //   upload.single("document"),
// //   riderUploadDocument,
// // );
// // router.post("/documents/submit", riderSubmitDocuments);
// // router.get("/documents", getRiderDocuments);

// // router.put("/location", updateRiderLocation);
// // router.put("/online", toggleRiderOnline);

// // router.get("/orders", getRiderOrders);
// // router.get("/orders/nearby", getRiderNearbyOrders);
// // router.get("/nearby/orders", getNearbyOrders);
// // router.post("/orders/accept", riderAcceptOrder);
// // router.patch("/orders/:orderId/status", riderUpdateOrder);

// // // ─── Admin Only ────────────────────────────────────────
// // router.put("/admin/status", protectAdmin, adminUpdateRiderStatus);

// // export default router;
// import express from "express";
// import { protectUser, protectAdmin } from "../middleware/auth.js";
// import { upload } from "../middleware/upload.js";
// import {
//   riderSendOtp,
//   riderVerifyOtp,
//   riderCompleteProfile,
//   riderUploadDocument,
//   riderSubmitDocuments,
//   adminUpdateRiderStatus,
//   riderRegister,
//   riderLogin,
//   getRiderProfile,
//   updateRiderLocation,
//   toggleRiderOnline,
//   getRiderOrders,
//   getNearbyOrders,
//   getRiderDocuments,
// } from "../controllers/riderController.js";
// import {
//   getNearbyOrders as getRiderNearbyOrders,
//   riderAcceptOrder,
//   riderUpdateOrder,
// } from "../controllers/orderController.js";

// const router = express.Router();

// // ─── PUBLIC ROUTES (No token required) ─────────────────────
// // All onboarding flows – OTP, profile creation, document upload
// router.post("/send/otp", riderSendOtp);
// router.post("/verify/otp", riderVerifyOtp);
// router.post("/register", riderRegister); // legacy
// router.post("/login", riderLogin);

// // ✅ Moved from protected to public – onboarding steps
// router.post("/profile/complete", riderCompleteProfile);
// router.post(
//   "/documents/upload",
//   upload.single("document"),
//   riderUploadDocument,
// );
// router.post("/documents/submit", riderSubmitDocuments);
// router.get("/documents", getRiderDocuments); // optional – can also keep protected

// // ─── RIDER PROTECTED ROUTES (Token required) ──────────────
// router.use(protectUser);

// router.get("/profile", getRiderProfile);

// router.put("/location", updateRiderLocation);
// router.put("/online", toggleRiderOnline);

// router.get("/orders", getRiderOrders);
// router.get("/orders/nearby", getRiderNearbyOrders);
// router.get("/nearby/orders", getNearbyOrders);
// router.post("/orders/accept", riderAcceptOrder);
// router.patch("/orders/:orderId/status", riderUpdateOrder);

// // ─── ADMIN ONLY ────────────────────────────────────────────
// router.put("/admin/status", protectAdmin, adminUpdateRiderStatus);

// export default router;
import express from "express";
import { protectUser, protectAdmin } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import {
  riderSendOtp,
  riderVerifyOtp,
  riderCompleteProfile,
  riderUploadDocument,
  riderSubmitDocuments,
  adminUpdateRiderStatus,
  riderRegister,
  riderLogin,
  getRiderProfile,
  updateRiderLocation,
  toggleRiderOnline,
  getRiderOrders,
  getNearbyOrders,
  getRiderDocuments,
  getRiderOrder,
  getRiderEarnings,
  updateRiderProfile,
} from "../controllers/riderController.js";
import {
  getNearbyOrders as getRiderNearbyOrders,
  riderAcceptOrder,
  riderUpdateOrder,
  riderCompleteOrderWithOTP,
} from "../controllers/orderController.js";

const router = express.Router();

// ─── PUBLIC ROUTES (No Token Required) ────────────────────
router.post("/send/otp", riderSendOtp);
router.post("/verify/otp", riderVerifyOtp);
router.post("/register", riderRegister);
router.post("/login", riderLogin);

// ─── RIDER PROTECTED ROUTES (Requires Authorization Token)
router.use(protectUser); // ✅ Applied to all routes below

router.get("/profile", getRiderProfile);
router.post("/profile/complete", riderCompleteProfile);
router.get("/earnings", protectUser, getRiderEarnings);
router.patch("/profile", protectUser, updateRiderProfile);
// ✅ Document upload strictly requires protectUser middleware to inject req.user
router.post(
  "/documents/upload",
  upload.single("document"),
  riderUploadDocument,
);
router.post("/documents/submit", riderSubmitDocuments);
router.get("/documents", getRiderDocuments);

router.put("/location", updateRiderLocation);
router.put("/online", toggleRiderOnline);

router.get("/orders", getRiderOrders);
router.get("/orderDetails/:orderId", getRiderOrder);
router.get("/orders/nearby", getRiderNearbyOrders);
router.get("/nearby/orders", getNearbyOrders);
router.post("/orders/accept", riderAcceptOrder);
router.patch("/orders/:orderId/status", riderUpdateOrder);
router.post("/orders/complete", protectUser, riderCompleteOrderWithOTP);
// ─── ADMIN ONLY ──────────────────────────────────────────
router.put("/admin/status", protectAdmin, adminUpdateRiderStatus);

export default router;
