import mongoose from "mongoose";

const tiffinPlanSchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    durationDays: {
      type: Number,
      required: true,
      min: 1,
      max: 365,
    },
    mealsPerDay: {
      type: Number,
      default: 2,
      min: 1,
      max: 4,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

tiffinPlanSchema.index({ vendorId: 1, isActive: 1 });

export default mongoose.model("TiffinPlan", tiffinPlanSchema);
