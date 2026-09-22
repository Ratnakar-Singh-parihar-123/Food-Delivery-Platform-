// models/PopularFood.js
import mongoose from "mongoose";

const popularFoodSchema = new mongoose.Schema(
  {
    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MenuItem",
      required: true,
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: false, // admin must approve
    },
    priority: {
      type: Number,
      default: 0, // higher = more prominent
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
    },
  },
  { timestamps: true },
);

// Ensure a menu item is added only once per vendor
popularFoodSchema.index({ menuItem: 1, vendor: 1 }, { unique: true });

export default mongoose.model("PopularFood", popularFoodSchema);
