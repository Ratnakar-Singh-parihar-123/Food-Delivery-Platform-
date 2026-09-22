import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  tiffinHouse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TiffinHouse",
    required: true,
  },

  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },

  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
  },

  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true,
  },

  comment: {
    type: String,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Review = mongoose.model("Review", reviewSchema);

export default Review;
