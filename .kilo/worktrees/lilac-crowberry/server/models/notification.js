// import mongoose from "mongoose";

// const dailyMenuItemSchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true },
//     description: { type: String, default: "" },
//     price: { type: Number, required: true, min: 0 },
//     isVeg: { type: Boolean, default: true },
//   },
//   { _id: false },
// );

// const dailyMenuSchema = new mongoose.Schema(
//   {
//     vendorId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Vendor",
//       required: true,
//       index: true,
//     },
//     date: {
//       type: Date,
//       required: true,
//       index: true,
//     },
//     items: [dailyMenuItemSchema],
//   },
//   { timestamps: true },
// );

// // Ensure one menu per vendor per day
// dailyMenuSchema.index({ vendorId: 1, date: 1 }, { unique: true });

// const DailyMenu = mongoose.model("DailyMenu", dailyMenuSchema);

// export default DailyMenu; // ← must be default export

import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    // Receiving entity – Tiffin House (Vendor)
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor", // या "TiffinHouse" – आपके मॉडल के अनुसार
      required: true,
      index: true,
    },
    // Optional – customer if the notification is about a specific order
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      default: null,
    },
    // Optional – order reference
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["order", "payment", "system", "promotion", "kyc", "payout"],
      default: "system",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    // Extra metadata (e.g., order status, payment link, etc.)
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    // For push notifications (optional)
    pushSent: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

// Indexes for faster queries
notificationSchema.index({ vendor: 1, createdAt: -1 });
notificationSchema.index({ vendor: 1, isRead: 1 });
notificationSchema.index({ order: 1 });

// Method to mark as read
notificationSchema.methods.markAsRead = function () {
  if (!this.isRead) {
    this.isRead = true;
    this.readAt = new Date();
    return this.save();
  }
  return this;
};

// Static method to create notification for an order update
notificationSchema.statics.createOrderNotification = async function ({
  vendorId,
  customerId,
  orderId,
  title,
  message,
  data = {},
}) {
  return this.create({
    vendor: vendorId,
    customer: customerId,
    order: orderId,
    title,
    message,
    type: "order",
    data,
  });
};

const Notification =
  mongoose.models.Notification ||
  mongoose.model("Notification", notificationSchema);

export default Notification;
