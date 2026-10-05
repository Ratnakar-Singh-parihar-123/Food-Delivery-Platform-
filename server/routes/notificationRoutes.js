import express from "express";

import {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../controllers/notificationController.js";

import { protectUser } from "../middleware/auth.js";

const router = express.Router();

// All notification routes require authentication
router.use(protectUser);

// Get logged-in user's notifications
router.get("/", getMyNotifications);

// Mark all notifications as read
router.patch("/read-all", markAllNotificationsRead);

// Mark single notification as read
router.patch("/:notificationId/read", markNotificationRead);

export default router;
