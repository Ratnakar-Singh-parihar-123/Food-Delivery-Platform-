import mongoose from "mongoose";

const subscriptionPlanSchema = new mongoose.Schema({
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

  duration: {
    type: Number,
    required: true, // in days
  },

  mealsPerDay: {
    type: Number,
    default: 1,
  },

  isActive: {
    type: Boolean,
    default: true,
  },

  includes: [String],

  createdAt: {
    type: Date,
    default: Date.now,
  },

  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const SubscriptionPlan = mongoose.model(
  "SubscriptionPlan",
  subscriptionPlanSchema,
);

export default SubscriptionPlan;
