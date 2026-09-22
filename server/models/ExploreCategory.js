// models/ExploreCategory.js
import mongoose from "mongoose";

const exploreCategorySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      unique: true,
    },
    icon: {
      type: String,
      required: [true, "Icon is required"],
      trim: true,
      maxlength: 2,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    vendors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vendor",
      },
    ],
    items: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MenuItem",
      },
    ],
    displayOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// Index for performance
exploreCategorySchema.index({ displayOrder: 1 });

export default mongoose.model("ExploreCategory", exploreCategorySchema);
