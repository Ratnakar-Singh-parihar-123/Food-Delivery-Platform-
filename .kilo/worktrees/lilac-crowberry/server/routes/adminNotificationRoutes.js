import express from "express";

import {
  createAdminNotification,
  getAdminNotifications,
} from "../controllers/adminNotificationController.js";

import { protectAdmin } from "../middleware/adminAuth.js";

const router = express.Router();

router.use(protectAdmin);

router.post("/", createAdminNotification);

router.get("/", getAdminNotifications);

export default router;
