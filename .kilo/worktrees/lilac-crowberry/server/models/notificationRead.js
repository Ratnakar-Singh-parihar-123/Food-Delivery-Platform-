import mongoose from "mongoose";

const notificationReadSchema = new mongoose.Schema(
  {
    notification: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Notification",
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    userType: {
      type: String,
      enum: ["customer", "rider", "vendor", "admin"],
      required: true,
    },

    readAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

notificationReadSchema.index(
  {
    notification: 1,
    userId: 1,
    userType: 1,
  },
  {
    unique: true,
  },
);

const NotificationRead = mongoose.model(
  "NotificationRead",
  notificationReadSchema,
);

export default NotificationRead;
