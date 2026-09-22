// models/TiffinHouse.js
import mongoose from "mongoose";

// ─── Location Schema ──────────────────────────────────────────
const locationSchema = new mongoose.Schema({
  type: { type: String, enum: ["Point"], default: "Point" },
  coordinates: { type: [Number], index: "2dsphere" }, // [longitude, latitude]
});

// ─── Address Schema ──────────────────────────────────────────
const addressSchema = new mongoose.Schema({
  addressLine: { type: String, required: true },
  landmark: String,
  city: String,
  state: String,
  pincode: String,
  country: { type: String, default: "India" },
});

// ─── KYC Schema ──────────────────────────────────────────────
const kycSchema = new mongoose.Schema({
  panNumber: String,
  panImage: String,
  aadhaarNumber: String,
  aadhaarImage: String,
  gstNumber: String,
  businessLicense: String,
  status: {
    type: String,
    enum: ["pending", "verified", "rejected"],
    default: "pending",
  },
  rejectionReason: String,
  submittedAt: Date,
  verifiedAt: Date,
});

// ─── Bank Details Schema ─────────────────────────────────────
const bankSchema = new mongoose.Schema({
  accountHolderName: String,
  bankName: String,
  accountNumber: String,
  ifscCode: String,
  upiId: String,
  isVerified: { type: Boolean, default: false },
});

// ─── TiffinHouse Main Schema ────────────────────────────────
const tiffinHouseSchema = new mongoose.Schema({
  // Basic info
  ownerFirstName: { type: String, required: true },
  ownerLastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // hashed
  role: { type: String, default: "tiffinHouse" },
  profileImage: String,

  // Business
  businessName: { type: String, required: true },
  businessType: { type: String, default: "tiffin" },
  description: String,
  isOnline: { type: Boolean, default: false },

  // Location & Address
  location: locationSchema,
  address: addressSchema,

  // KYC
  kyc: kycSchema,

  // Bank details
  bankDetails: bankSchema,

  // Settings
  mealTimings: {
    breakfast: { start: String, end: String },
    lunch: { start: String, end: String },
    dinner: { start: String, end: String },
  },
  weeklyAvailability: {
    monday: { type: Boolean, default: true },
    tuesday: { type: Boolean, default: true },
    wednesday: { type: Boolean, default: true },
    thursday: { type: Boolean, default: true },
    friday: { type: Boolean, default: true },
    saturday: { type: Boolean, default: true },
    sunday: { type: Boolean, default: false },
  },

  // Stats (derived)
  rating: { type: Number, default: 0 },
  totalOrders: { type: Number, default: 0 },
  totalEarnings: { type: Number, default: 0 },

  // Subscription
  subscriptionPlan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubscriptionPlan",
  },
  subscriptionStatus: {
    type: String,
    enum: ["active", "paused", "cancelled", "expired"],
    default: "active",
  },
  subscriptionPausedUntil: Date,

  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Index for location queries
tiffinHouseSchema.index({ location: "2dsphere" });

// ─── Model ────────────────────────────────────────────────────
const TiffinHouse = mongoose.model("TiffinHouse", tiffinHouseSchema);
export default TiffinHouse;
