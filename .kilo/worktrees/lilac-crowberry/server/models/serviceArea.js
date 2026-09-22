// models/ServiceArea.js
import mongoose from "mongoose";

const serviceAreaSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
        index: "2dsphere",
      },
    },
    radius: {
      type: Number, // in meters
      default: 5000,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    deliveryCharge: {
      type: Number,
      default: 0,
    },
    minOrderAmount: {
      type: Number,
      default: 0,
    },
    estimatedDeliveryTime: {
      type: Number,
      default: 30, // minutes
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  { timestamps: true },
);

serviceAreaSchema.index({ location: "2dsphere" });

export default mongoose.model("ServiceArea", serviceAreaSchema);
