import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      enum: ["home", "work", "other"],
      default: "home",
    },
    name: {
      type: String,
      trim: true,
      default: "",
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    addressLine: {
      type: String,
      trim: true,
      default: "",
    },
    landmark: {
      type: String,
      trim: true,
      default: "",
    },
    city: {
      type: String,
      trim: true,
      default: "",
    },
    state: {
      type: String,
      trim: true,
      default: "",
    },
    pincode: {
      type: String,
      trim: true,
      default: "",
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: undefined,
      },
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true },
);

export default addressSchema;
