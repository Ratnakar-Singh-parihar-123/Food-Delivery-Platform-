import mongoose from "mongoose";

const refundSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true,
    index: true,
  },
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Payment",
    required: true,
  },

  amount: { type: Number, required: true },
  reason: { type: String, required: true },

  // Status: requested | processing | completed | failed
  status: {
    type: String,
    enum: ["requested", "processing", "completed", "failed"],
    default: "requested",
  },

  razorpayRefundId: { type: String },
  processedAt: { type: Date },
  failureReason: { type: String },

  // Who initiated (admin/customer)
  initiatedBy: { type: String, enum: ["customer", "admin", "system"] },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model("Refund", refundSchema);
