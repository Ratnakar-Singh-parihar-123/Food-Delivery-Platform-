import mongoose from "mongoose";

const deliverySchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true,
    },
    riderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Rider",
      required: true,
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    status: {
      type: String,
      enum: ["assigned", "picked_up", "in_transit", "delivered", "failed"],
      default: "assigned",
    },
    pickupLocation: {
      type: { type: String, enum: ["Point"] },
      coordinates: [Number],
    },
    dropoffLocation: {
      type: { type: String, enum: ["Point"] },
      coordinates: [Number],
    },
    currentLocation: {
      type: { type: String, enum: ["Point"] },
      coordinates: [Number],
    },
    assignedAt: { type: Date, default: Date.now },
    pickedUpAt: Date,
    deliveredAt: Date,
    totalDistance: { type: Number, default: 0 },
    estimatedDuration: { type: Number, default: 0 },
    locationHistory: [
      {
        location: {
          type: { type: String, enum: ["Point"] },
          coordinates: [Number],
        },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },
);

deliverySchema.index({ riderId: 1, status: 1 });
deliverySchema.index({ orderId: 1 });
deliverySchema.index({ currentLocation: "2dsphere" });

const Delivery =
  mongoose.models.Delivery || mongoose.model("Delivery", deliverySchema);
export default Delivery;
