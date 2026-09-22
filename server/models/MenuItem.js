import mongoose from "mongoose";

const menuItemSchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
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
    image: {
      type: String,
      default: "",
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    preparationTime: {
      type: Number,
      default: 10, // minutes
      min: 1,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    foodCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FoodCategory",
      index: true,
    },
    isPopular: { type: Boolean, default: false },
    // Optional: customisations, add‑ons etc.
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

menuItemSchema.index({ vendorId: 1, categoryId: 1, sortOrder: 1 });

const MenuItem =
  mongoose.models.MenuItem || mongoose.model("MenuItem", menuItemSchema);
export default MenuItem;
