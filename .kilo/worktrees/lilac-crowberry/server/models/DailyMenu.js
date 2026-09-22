import mongoose from "mongoose";

const dailyMenuItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    isVeg: { type: Boolean, default: true },
  },
  { _id: false },
);

const dailyMenuSchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    items: [dailyMenuItemSchema],
  },
  { timestamps: true },
);

// Ensure one menu per vendor per day
dailyMenuSchema.index({ vendorId: 1, date: 1 }, { unique: true });

// ✅ Prevent overwriting
const DailyMenu =
  mongoose.models.DailyMenu || mongoose.model("DailyMenu", dailyMenuSchema);

export default DailyMenu;
