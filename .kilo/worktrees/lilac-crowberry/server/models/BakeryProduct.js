import mongoose from "mongoose";

const bakeryProductSchema = new mongoose.Schema(
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
      maxlength: 120,
    },

    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    weight: {
      type: String,
      default: "",
      trim: true,
    },

    category: {
      type: String,
      enum: ["bread", "cake", "pastry", "cookie", "custom", "other"],
      default: "cake",
    },

    image: {
      type: String,
      default: "",
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },

    customOrder: {
      type: Boolean,
      default: false,
    },

    preparationTime: {
      type: Number,
      default: 30,
      min: 0,
    },

    stock: {
      type: Number,
      default: 0,
      min: 0,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

bakeryProductSchema.index({
  vendorId: 1,
  category: 1,
});

const BakeryProduct =
  mongoose.models.BakeryProduct ||
  mongoose.model("BakeryProduct", bakeryProductSchema);

export default BakeryProduct;
