import express from "express";

import { validateCoupon } from "../controllers/couponController.js";

import { protectCustomer } from "../middleware/customerAuth.js";

const router = express.Router();

router.post("/validate", protectCustomer, validateCoupon);

export default router;
