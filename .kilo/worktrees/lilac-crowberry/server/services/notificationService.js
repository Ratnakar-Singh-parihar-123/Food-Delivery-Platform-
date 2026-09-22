import Notification from "../models/notificationRead.js";

import { getIO } from "../socket/socket.js";

/* =====================================================
   FORMAT NOTIFICATION
===================================================== */

export const formatNotification = (notification) => ({
  id: notification._id,

  title: notification.title,

  message: notification.message,

  type: notification.type,

  priority: notification.priority,

  image: notification.image,

  offer: notification.offer,

  action: notification.action,

  sender: notification.sender,

  createdAt: notification.createdAt,

  expiresAt: notification.expiresAt,
});

/* =====================================================
   EMIT
===================================================== */

export const emitNotification = (notification) => {
  const io = getIO();

  const payload = formatNotification(notification);

  const audience = notification.audience;

  /* ALL USERS */

  if (audience.type === "all") {
    io.emit("notification:new", payload);

    return;
  }

  /* ROLE */

  if (audience.type === "role") {
    for (const role of audience.roles) {
      io.to(`role:${role}`).emit("notification:new", payload);
    }

    return;
  }

  /* SPECIFIC USERS */

  if (audience.type === "users") {
    for (const userId of audience.userIds) {
      io.to(`user:${userId}`).emit("notification:new", payload);
    }

    return;
  }

  /* VENDOR CUSTOMERS */

  if (audience.type === "vendor_customers" && audience.vendorId) {
    io.to(`vendor-customers:${audience.vendorId}`).emit(
      "notification:new",
      payload,
    );
  }
};

/* =====================================================
   CREATE + EMIT
===================================================== */

export const createAndSendNotification = async (data) => {
  const notification = await Notification.create(data);

  emitNotification(notification);

  return notification;
};
