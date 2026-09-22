import mongoose from "mongoose";

const menuItemSchema = new mongoose.Schema(
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
      maxlength: 100,
    },
    description: {
      type: String,
      default: "",
      maxlength: 500,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      enum: [
        "starter",
        "main",
        "dessert",
        "beverage",
        "soup",
        "bread",
        "other",
      ],
      default: "main",
    },
    isVeg: {
      type: Boolean,
      default: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    image: {
      type: String,
      default: "",
    },
    preparationTime: {
      type: Number, // in minutes
      default: 15,
      min: 5,
    },
  },
  { timestamps: true },
);

// Composite index for quick vendor menu queries
menuItemSchema.index({ vendorId: 1, category: 1 });
menuItemSchema.index({ vendorId: 1, isAvailable: 1 });

export default mongoose.model("RestaurantMenuItem", menuItemSchema);
