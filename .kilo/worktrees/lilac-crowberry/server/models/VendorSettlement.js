import mongoose from "mongoose";

const vendorSettlementSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vendor",
    required: true,
    index: true,
  },
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

  grossAmount: { type: Number, required: true }, // total customer paid
  commission: { type: Number, required: true },
  refundAmount: { type: Number, default: 0 },
  netPayable: { type: Number, required: true }, // gross - commission - refund

  // Status: pending | eligible | processing | paid | failed | held | reversed
  status: {
    type: String,
    enum: [
      "pending",
      "eligible",
      "processing",
      "paid",
      "failed",
      "held",
      "reversed",
    ],
    default: "pending",
  },

  // Razorpay transfer details (if using Route)
  transferId: { type: String },
  processedAt: { type: Date },
  failureReason: { type: String },

  // Who processed (admin)
  processedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// To prevent duplicate settlement per order
vendorSettlementSchema.index({ orderId: 1 }, { unique: true });

export default mongoose.model("VendorSettlement", vendorSettlementSchema);
