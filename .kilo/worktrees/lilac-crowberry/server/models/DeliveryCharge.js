import mongoose from "mongoose";

const deliveryChargeSchema = new mongoose.Schema(
  {
    distanceFrom: { type: Number, required: true },
    distanceTo: { type: Number, required: true },
    charge: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const DeliveryCharge =
  mongoose.models.DeliveryCharge ||
  mongoose.model("DeliveryCharge", deliveryChargeSchema);
export default DeliveryCharge;
