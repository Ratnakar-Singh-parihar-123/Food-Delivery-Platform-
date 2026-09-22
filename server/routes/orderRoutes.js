// import express from "express";
// import { protectUser } from "../middleware/auth.js";
// import {
//   placeOrder,
//   getVendorOrders,
//   vendorRespondOrder,
//   riderUpdateOrder,
//   getOrderDetails,
//   getCustomerOrders,
//   adminGetOrders,
//   adminGetLiveOrders,
//   riderAcceptOrder,
//   cancelOrder,
//   reorderOrder, // ✅ new
//   vendorAcceptOrder,
// } from "../controllers/orderController.js";

// const router = express.Router();

// // ─── Customer ──────────────────────────────────────────
// router.post("/", protectUser, placeOrder);
// router.get("/customer", protectUser, getCustomerOrders);
// router.put("/:orderId/cancel", protectUser, cancelOrder);
// router.post("/:orderId/reorder", protectUser, reorderOrder); // ✅ new

// // ─── Vendor ────────────────────────────────────────────
// router.get("/vendor", protectUser, getVendorOrders);
// router.put("/vendor/:orderId", protectUser, vendorRespondOrder);
// router.patch("/orders/:orderId/accept", vendorAcceptOrder);
// // ─── Rider ─────────────────────────────────────────────
// router.put("/rider/:orderId", protectUser, riderUpdateOrder);
// router.post("/rider/accept", protectUser, riderAcceptOrder);

// // ─── Common ────────────────────────────────────────────
// router.get("/:orderId", protectUser, getOrderDetails);

// // ─── Admin ─────────────────────────────────────────────
// router.get("/admin", protectUser, adminGetOrders);
// router.get("/admin/live", protectUser, adminGetLiveOrders);

// export default router;
import express from "express";
import { protectUser } from "../middleware/auth.js";
import {
  placeOrder,
  getCustomerOrders,
  cancelOrder,
  reorderOrder,
  getOrderDetails,
} from "../controllers/orderController.js";

const router = express.Router();

// ─── All routes require authentication ─────────────
router.use(protectUser);

// ─── Customer order actions ────────────────────────
router.post("/", placeOrder); // Place order
router.get("/customer", getCustomerOrders); // My orders history
router.patch("/:orderId/cancel", cancelOrder); // Cancel order (PATCH recommended)
router.post("/:orderId/reorder", reorderOrder); // Reorder

// ─── Common: Get order details (for any authenticated user) ──
router.get("/:orderId", getOrderDetails);

export default router;
