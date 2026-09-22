import mongoose from "mongoose";
import bcrypt from "bcrypt";
import crypto from "crypto";

/* =====================================================
   ADDRESS
===================================================== */

const addressSchema = new mongoose.Schema(
  {
    addressLine: { type: String, trim: true, default: "" },
    landmark: { type: String, trim: true, default: "" },
    city: { type: String, trim: true, default: "" },
    state: { type: String, trim: true, default: "" },
    pincode: { type: String, trim: true, default: "" },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: undefined },
    },
  },
  { _id: false },
);

/* =====================================================
   BUSINESS TIMING
===================================================== */

const timingSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ],
      required: true,
    },
    openTime: { type: String, default: "09:00" },
    closeTime: { type: String, default: "22:00" },
    isClosed: { type: Boolean, default: false },
  },
  { _id: false },
);

/* =====================================================
   DOCUMENT
===================================================== */

const documentSchema = new mongoose.Schema(
  {
    fssaiCertificate: { type: String, default: "" },
    panCard: { type: String, default: "" },
    ownerIdProof: { type: String, default: "" },
    gstCertificate: { type: String, default: "" },
    cancelledCheque: { type: String, default: "" },
  },
  { _id: false },
);

/* =====================================================
   BANK
===================================================== */

const bankSchema = new mongoose.Schema(
  {
    accountHolderName: { type: String, trim: true, default: "" },
    accountNumber: { type: String, trim: true, default: "", select: false },
    ifscCode: { type: String, uppercase: true, trim: true, default: "" },
    bankName: { type: String, trim: true, default: "" },
    upiId: { type: String, trim: true, default: "" },
    isVerified: { type: Boolean, default: false },
  },
  { _id: false },
);

/* =====================================================
   VENDOR SCHEMA
===================================================== */

const vendorSchema = new mongoose.Schema(
  {
    // ─── Owner ──────────────────────────────────────────
    ownerFirstName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    ownerLastName: { type: String, trim: true, default: "" },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: { type: String, required: true, trim: true },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },

    // ─── Business ──────────────────────────────────────
    businessName: { type: String, required: true, trim: true, index: true },
    averagePreparationTime: {
      type: Number, // in minutes
      default: 30,
    },
    isVeg: {
      type: Boolean,
      default: false, // true if vendor only serves vegetarian
    },
    businessType: {
      type: String,
      enum: [
        "restaurant",
        "dhaba",
        "bakery",
        "cafe",
        "tiffin_center",
        "sweet_shop",
        "cloud_kitchen",
        "fast_food",
        "other",
      ],
      required: true,
      index: true,
    },
    isTop: {
      type: Boolean,
      default: false,
      index: true,
    },
    foodType: {
      type: String,
      enum: ["pure_veg", "non_veg", "veg_non_veg"],
      default: "veg_non_veg",
    },
    description: { type: String, maxlength: 1000, default: "" },
    fssaiNumber: { type: String, trim: true, default: "" },
    gstNumber: { type: String, uppercase: true, trim: true, default: "" },
    panNumber: { type: String, uppercase: true, trim: true, default: "" },

    // ─── Media ──────────────────────────────────────────
    profileImage: { type: String, default: "" },
    coverImage: { type: String, default: "" },

    // ─── Address ────────────────────────────────────────
    address: { type: addressSchema, default: () => ({}) },

    // ─── Timings ────────────────────────────────────────
    timings: {
      type: [timingSchema],
      default: () => [
        { day: "monday" },
        { day: "tuesday" },
        { day: "wednesday" },
        { day: "thursday" },
        { day: "friday" },
        { day: "saturday" },
        { day: "sunday" },
      ],
    },

    // ─── Documents ──────────────────────────────────────
    documents: { type: documentSchema, default: () => ({}) },

    // ─── Bank ───────────────────────────────────────────
    bankDetails: { type: bankSchema, default: () => ({}) },

    // ─── Email OTP ──────────────────────────────────────
    isEmailVerified: { type: Boolean, default: false },
    emailOtp: { type: String, select: false },
    emailOtpExpires: { type: Date, select: false },
    otpAttempts: { type: Number, default: 0, select: false },
    lastOtpSentAt: { type: Date, default: null, select: false },

    // ─── Password Reset ─────────────────────────────────
    passwordResetOtp: { type: String, select: false },
    passwordResetOtpExpires: { type: Date, select: false },
    passwordResetVerified: { type: Boolean, default: false, select: false },

    // ─── Admin Approval ─────────────────────────────────
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    rejectionReason: { type: String, default: "" },
    approvedAt: { type: Date, default: null },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },

    // ─── Account ────────────────────────────────────────
    isActive: { type: Boolean, default: true },
    isBlocked: { type: Boolean, default: false },
    blockReason: { type: String, default: "" },
    blockedAt: { type: Date, default: null },
    blockedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },

    // ─── Business Online Status ────────────────────────
    isOnline: { type: Boolean, default: false, index: true },
    acceptingOrders: { type: Boolean, default: false },

    // ─── Finance ─────────────────────────────────────────
    commissionPercentage: { type: Number, min: 0, max: 100, default: 15 },
    minimumOrderAmount: { type: Number, min: 0, default: 0 },
    averagePreparationTime: { type: Number, min: 5, default: 30 },

    // ─── Stats ───────────────────────────────────────────
    rating: { type: Number, min: 0, max: 5, default: 0 },
    totalRatings: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 },
    completedOrders: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },

    // ─── Login Security ──────────────────────────────────
    lastLoginAt: { type: Date, default: null },
    lastLoginIp: { type: String, default: "" },
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null },
    passwordChangedAt: { type: Date, default: null },
  },
  { timestamps: true, versionKey: false },
);

/* =====================================================
   PRE-SAVE HOOK
===================================================== */

vendorSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordChangedAt = new Date();
});

/* =====================================================
   INSTANCE METHODS
===================================================== */

vendorSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

vendorSchema.methods.createEmailOtp = function () {
  const otp = crypto.randomInt(100000, 1000000).toString();
  this.emailOtp = crypto.createHash("sha256").update(otp).digest("hex");
  this.emailOtpExpires = Date.now() + 10 * 60 * 1000;
  this.otpAttempts = 0;
  this.lastOtpSentAt = new Date();
  return otp;
};

vendorSchema.methods.verifyEmailOtp = function (otp) {
  const hash = crypto.createHash("sha256").update(String(otp)).digest("hex");
  return (
    this.emailOtp === hash &&
    this.emailOtpExpires &&
    this.emailOtpExpires > Date.now()
  );
};

vendorSchema.methods.createPasswordResetOtp = function () {
  const otp = crypto.randomInt(100000, 1000000).toString();
  this.passwordResetOtp = crypto.createHash("sha256").update(otp).digest("hex");
  this.passwordResetOtpExpires = Date.now() + 10 * 60 * 1000;
  this.passwordResetVerified = false;
  return otp;
};

vendorSchema.methods.verifyPasswordResetOtp = function (otp) {
  const hash = crypto.createHash("sha256").update(String(otp)).digest("hex");
  return (
    this.passwordResetOtp === hash &&
    this.passwordResetOtpExpires &&
    this.passwordResetOtpExpires > Date.now()
  );
};

/* =====================================================
   INDEXES
===================================================== */

vendorSchema.index({ approvalStatus: 1, createdAt: -1 });
vendorSchema.index({ businessType: 1, approvalStatus: 1 });
vendorSchema.index({ isOnline: 1, approvalStatus: 1 });
vendorSchema.index({ "address.city": 1, approvalStatus: 1 });
vendorSchema.index({ "address.location": "2dsphere" });

/* =====================================================
   ✅ SAFE MODEL CREATION
===================================================== */

// Prevent OverwriteModelError by checking if model already exists
const Vendor = mongoose.models.Vendor || mongoose.model("Vendor", vendorSchema);
export default Vendor;
