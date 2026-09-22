import mongoose from "mongoose";

const categoryIconSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    label: {
      type: String,
      required: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    image: { type: String, default: "" },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const CategoryIcon = mongoose.model("CategoryIcon", categoryIconSchema);
export default CategoryIcon;
