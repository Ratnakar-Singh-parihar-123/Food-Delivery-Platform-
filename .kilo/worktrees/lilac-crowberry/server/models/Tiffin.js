import mongoose from "mongoose";

const tiffinSchema = new mongoose.Schema({
  tiffinHouse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TiffinHouse",
    required: true,
  },

  name: {
    type: String,
    required: true,
  },

  description: {
    type: String,
  },

  price: {
    type: Number,
    required: true,
  },

  image: {
    type: String,
  },

  category: {
    type: String,
    enum: ["veg", "non-veg", "both"],
    default: "veg",
  },

  isAvailable: {
    type: Boolean,
    default: true,
  },

  // Meal type: breakfast, lunch, dinner, all
  mealType: {
    type: String,
    enum: ["breakfast", "lunch", "dinner", "all"],
    default: "all",
  },

  // For subscription plans
  isSubscriptionItem: {
    type: Boolean,
    default: false,
  },

  // Additional attributes
  calories: {
    type: Number,
  },

  preparationTime: {
    type: Number, // in minutes
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Tiffin = mongoose.model("Tiffin", tiffinSchema);

export default Tiffin;
