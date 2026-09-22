import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  tiffinHouse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TiffinHouse",
    required: true,
  },

  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
  },

  amount: {
    type: Number,
    required: true,
  },

  type: {
    type: String,
    enum: ["credit", "debit", "payout"],
    required: true,
  },

  description: {
    type: String,
  },

  status: {
    type: String,
    enum: ["pending", "completed", "failed"],
    default: "pending",
  },

  reference: {
    type: String,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;
