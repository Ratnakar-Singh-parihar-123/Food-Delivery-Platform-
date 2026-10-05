import Notification from "../models/notification.js";

import { getIO } from "../socket/socket.js";

/* =====================================================
   FORMAT NOTIFICATION
===================================================== */

export const formatNotification = (notification) => ({
  id: notification._id,

  _id: notification._id,

  title: notification.title,

  message: notification.message,

  type: notification.type,

  priority: notification.priority,

  image: notification.image,

  offer: notification.offer,

  action: notification.action,

  sender: notification.sender,

  audience: notification.audience,

  createdAt: notification.createdAt,

  updatedAt: notification.updatedAt,

  expiresAt: notification.expiresAt,
});

/* =====================================================
   EMIT NOTIFICATION
===================================================== */

export const emitNotification = (notification) => {
  const io = getIO();

  const payload = formatNotification(notification);

  const audience = notification.audience;

  if (!audience?.type) {
    return;
  }

  /* =====================================================
     ALL USERS
  ===================================================== */

  if (audience.type === "all") {
    io.emit("notification:new", payload);

    return;
  }

  /* =====================================================
     ROLE BASED
  ===================================================== */

  if (audience.type === "role") {
    const roles = Array.isArray(audience.roles) ? audience.roles : [];

    for (const role of roles) {
      io.to(`role:${role}`).emit("notification:new", payload);
    }

    return;
  }

  /* =====================================================
     SPECIFIC USERS
  ===================================================== */

  if (audience.type === "users") {
    const userIds = Array.isArray(audience.userIds) ? audience.userIds : [];

    for (const userId of userIds) {
      io.to(`user:${userId}`).emit("notification:new", payload);
    }

    return;
  }

  /* =====================================================
     VENDOR CUSTOMERS
  ===================================================== */

  if (audience.type === "vendor_customers" && audience.vendorId) {
    io.to(`vendor-customers:${audience.vendorId}`).emit(
      "notification:new",
      payload,
    );

    return;
  }
};

/* =====================================================
   CREATE + SEND
===================================================== */

export const createAndSendNotification = async (data) => {
  const notification = await Notification.create(data);

  emitNotification(notification);

  return notification;
};
