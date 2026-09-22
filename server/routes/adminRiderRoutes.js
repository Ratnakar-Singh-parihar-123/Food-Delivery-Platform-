import express from "express";

import {
  createRiderByAdmin,
  getAllRiders,
  getPendingRiders,
  getRiderById,
  approveRider,
  rejectRider,
  blockRider,
  unblockRider,
  updateRiderStatus,
  getRiderStats,
} from "../controllers/adminRiderController.js";

import { protectAdmin } from "../middleware/adminAuth.js";

import { uploadRiderRegistration } from "../middleware/riderUpload.js";

const router = express.Router();

router.use(protectAdmin);

router.get("/stats", getRiderStats);

router.get("/pending", getPendingRiders);

router.get("/", getAllRiders);

router.post("/", uploadRiderRegistration, createRiderByAdmin);

router.get("/:riderId", getRiderById);

router.patch("/:riderId/approve", approveRider);

router.patch("/:riderId/reject", rejectRider);

router.patch("/:riderId/block", blockRider);

router.patch("/:riderId/unblock", unblockRider);

router.patch("/:riderId/status", updateRiderStatus);

export default router;
