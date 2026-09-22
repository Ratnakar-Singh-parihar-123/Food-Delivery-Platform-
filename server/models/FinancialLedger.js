import mongoose from "mongoose";

const financialLedgerSchema = new mongoose.Schema({
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
  riderId: { type: mongoose.Schema.Types.ObjectId, ref: "Rider" }, // optional if no rider

  // Breakdowns
  customerPaid: { type: Number, required: true },
  vendorAmount: { type: Number, required: true },
  platformCommission: { type: Number, required: true },
  riderEarning: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  refund: { type: Number, default: 0 },
  adjustment: { type: Number, default: 0 },

  // Status: 'active' | 'refunded' | 'adjusted'
  status: {
    type: String,
    enum: ["active", "refunded", "adjusted"],
    default: "active",
  },

  // Reference to refund if any
  refundId: { type: mongoose.Schema.Types.ObjectId, ref: "Refund" },

  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Unique index to prevent duplicate ledger entries per order
financialLedgerSchema.index({ orderId: 1, paymentId: 1 }, { unique: true });

export default mongoose.model("FinancialLedger", financialLedgerSchema);
