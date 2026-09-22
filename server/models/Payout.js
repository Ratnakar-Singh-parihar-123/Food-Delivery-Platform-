import mongoose from "mongoose";

const payoutSchema = new mongoose.Schema({
  tiffinHouse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TiffinHouse",
    required: true,
  },

  amount: {
    type: Number,
    required: true,
  },

  bankDetails: {
    accountHolderName: String,
    bankName: String,
    accountNumber: String,
    ifscCode: String,
  },

  status: {
    type: String,
    enum: ["pending", "processed", "failed"],
    default: "pending",
  },

  requestDate: {
    type: Date,
    default: Date.now,
  },

  processedDate: Date,

  failureReason: String,
});

const Payout = mongoose.model("Payout", payoutSchema);

export default Payout;
