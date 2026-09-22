import express from "express";

import {
  createCoupon,
  getAllCoupons,
  getCouponById,
  updateCoupon,
  toggleCouponStatus,
  deleteCoupon,
} from "../controllers/couponController.js";

import { protectAdmin } from "../middleware/adminAuth.js";

import {
  normalizeCouponCode,
  validateCouponInput,
} from "../middleware/couponMiddleware.js";

const router = express.Router();

router.use(protectAdmin);

router.get("/", getAllCoupons);

router.post("/", normalizeCouponCode, validateCouponInput, createCoupon);

router.get("/:couponId", getCouponById);

router.patch("/:couponId", updateCoupon);

router.patch("/:couponId/toggle", toggleCouponStatus);

router.delete("/:couponId", deleteCoupon);

export default router;
