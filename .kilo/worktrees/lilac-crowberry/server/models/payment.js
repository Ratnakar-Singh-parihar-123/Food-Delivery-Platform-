// models/payment.js
import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
    razorpayOrderId: { type: String, required: true, index: true },
    razorpayPaymentId: { type: String, index: true, sparse: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    paymentMethod: { type: String },
    status: {
      type: String,
      enum: [
        "created",
        "pending",
        "authorized",
        "captured",
        "failed",
        "refunded",
        "partially_refunded",
      ],
      default: "created",
      index: true,
    },
    capturedAt: { type: Date },
    failureReason: { type: String },
    refunds: [
      {
        razorpayRefundId: { type: String },
        amount: { type: Number },
        status: { type: String, enum: ["processing", "completed", "failed"] },
        processedAt: { type: Date },
      },
    ],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Unique index on razorpayPaymentId (only when present)
paymentSchema.index({ razorpayPaymentId: 1 }, { unique: true, sparse: true });

export default mongoose.model("Payment", paymentSchema);
