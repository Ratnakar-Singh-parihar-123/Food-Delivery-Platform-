import mongoose from "mongoose";

const riderEarningSchema = new mongoose.Schema({
  riderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Rider",
    required: true,
    index: true,
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true,
    index: true,
  },
  amount: { type: Number, required: true },

  // Status: pending | eligible | paid | reversed
  status: {
    type: String,
    enum: ["pending", "eligible", "paid", "reversed"],
    default: "pending",
  },

  earningType: {
    type: String,
    enum: ["delivery", "bonus", "adjustment"],
    default: "delivery",
  },
  earnedAt: { type: Date, default: Date.now },

  // If paid via weekly payout
  payoutId: { type: mongoose.Schema.Types.ObjectId, ref: "RiderPayout" },

  // For reversal/cancellation
  reversalReason: { type: String },
  reversedAt: { type: Date },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Unique per order to avoid duplication
riderEarningSchema.index({ orderId: 1, riderId: 1 }, { unique: true });

export default mongoose.model("RiderEarning", riderEarningSchema);
