// models/FoodCategory.js
import mongoose from "mongoose";

const foodCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    icon: {
      type: String, // emoji or image URL
      default: "🍽️",
    },
    image: {
      type: String, // optional banner/thumbnail
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);
// models/Category.js
const categorySchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    icon: { type: String, default: null },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    // ✅ NEW: reference to global FoodCategory
    globalCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FoodCategory",
      index: true,
    },
  },
  { timestamps: true, versionKey: false },
);

categorySchema.index({ vendorId: 1, name: 1 }, { unique: true });

export default mongoose.model("FoodCategory", foodCategorySchema);
