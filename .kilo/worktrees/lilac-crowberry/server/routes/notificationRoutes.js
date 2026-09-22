import express from "express";

import {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../controllers/notificationController.js";

import { protectUser } from "../middleware/auth.js";

const router = express.Router();

router.use(protectUser);

router.get("/", getMyNotifications);

router.patch("/:notificationId/read", markNotificationRead);

router.patch("/read-all", markAllNotificationsRead);

export default router;
