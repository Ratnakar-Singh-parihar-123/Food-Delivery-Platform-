import mongoose from "mongoose";

const riderPayoutSchema = new mongoose.Schema({
  riderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Rider",
    required: true,
    index: true,
  },

  // Period: weekly (Monday–Sunday)
  periodStart: { type: Date, required: true },
  periodEnd: { type: Date, required: true },

  grossEarnings: { type: Number, required: true }, // sum of eligible earnings
  adjustments: { type: Number, default: 0 }, // refunds, cancellations
  netPayable: { type: Number, required: true }, // gross + adjustments

  // Status: pending | approved | processing | paid | failed | cancelled
  status: {
    type: String,
    enum: ["pending", "approved", "processing", "paid", "failed", "cancelled"],
    default: "pending",
  },

  // Razorpay payout ID (if using route)
  payoutId: { type: String },
  processedAt: { type: Date },
  failureReason: { type: String },

  // Admin who processed
  processedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model("RiderPayout", riderPayoutSchema);
