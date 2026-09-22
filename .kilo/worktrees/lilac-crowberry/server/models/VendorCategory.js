// models/Category.js (or VendorCategory.js)
import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
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
    icon: {
      type: String,
      default: null,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // ✅ NEW: Link to global FoodCategory
    globalCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FoodCategory",
      index: true,
    },
  },
  { timestamps: true, versionKey: false },
);

// Compound unique index: vendorId + name
categorySchema.index({ vendorId: 1, name: 1 }, { unique: true });

// Optional: index for globalCategory if you frequently query by it
categorySchema.index({ globalCategory: 1 });

const Category =
  mongoose.models.Category || mongoose.model("Category", categorySchema);
export default Category;
