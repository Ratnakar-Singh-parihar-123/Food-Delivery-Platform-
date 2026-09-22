import mongoose from "mongoose";
import bcrypt from "bcrypt";
import crypto from "crypto";
import addressSchema from "./custumerAddress.js";

const customerSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    lastName: {
      type: String,
      trim: true,
      maxlength: 50,
      default: "",
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },
    profileImage: {
      type: String,
      default: "",
    },
    gender: {
      type: String,
      enum: ["male", "female", "other", ""],
      default: "",
    },
    dateOfBirth: {
      type: Date,
      default: null,
    },
    addresses: {
      type: [addressSchema],
      default: [],
    },
    profileCompleted: {
      type: Boolean,
      default: false,
    },

    // ─── EMAIL VERIFICATION ────────────────────────────────
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailOtp: {
      type: String,
      select: false,
    },
    emailOtpExpires: {
      type: Date,
      select: false,
    },
    emailOtpAttempts: {
      type: Number,
      default: 0,
      select: false,
    },
    lastOtpSentAt: {
      type: Date,
      default: null,
      select: false,
    },

    // ─── PASSWORD RESET ────────────────────────────────────
    passwordResetOtp: {
      type: String,
      select: false,
    },
    passwordResetOtpExpires: {
      type: Date,
      select: false,
    },
    passwordResetVerified: {
      type: Boolean,
      default: false,
      select: false,
    },

    // ─── ACCOUNT MANAGEMENT ──────────────────────────────
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isBlocked: {
      type: Boolean,
      default: false,
      index: true,
    },
    blockReason: {
      type: String,
      default: "",
    },
    blockedAt: {
      type: Date,
      default: null,
    },
    blockedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },

    // ─── LOGIN SECURITY ────────────────────────────────────
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
      default: null,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
    lastLoginIp: {
      type: String,
      default: "",
    },
    passwordChangedAt: {
      type: Date,
      default: null,
    },

    // ─── CUSTOMER STATS ───────────────────────────────────
    totalOrders: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalSpent: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastOrderAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// ─── MIDDLEWARE ──────────────────────────────────────────
customerSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordChangedAt = new Date();
});

// ─── METHODS ─────────────────────────────────────────────
customerSchema.methods.comparePassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

customerSchema.methods.createEmailOtp = function () {
  const otp = crypto.randomInt(100000, 1000000).toString();
  this.emailOtp = crypto.createHash("sha256").update(otp).digest("hex");
  this.emailOtpExpires = Date.now() + 10 * 60 * 1000;
  this.emailOtpAttempts = 0;
  this.lastOtpSentAt = new Date();
  return otp;
};

customerSchema.methods.verifyEmailOtp = function (enteredOtp) {
  const hashedOtp = crypto
    .createHash("sha256")
    .update(String(enteredOtp))
    .digest("hex");
  return (
    this.emailOtp === hashedOtp &&
    this.emailOtpExpires &&
    this.emailOtpExpires > Date.now()
  );
};

customerSchema.methods.createPasswordResetOtp = function () {
  const otp = crypto.randomInt(100000, 1000000).toString();
  this.passwordResetOtp = crypto.createHash("sha256").update(otp).digest("hex");
  this.passwordResetOtpExpires = Date.now() + 10 * 60 * 1000;
  this.passwordResetVerified = false;
  return otp;
};

customerSchema.methods.verifyPasswordResetOtp = function (enteredOtp) {
  const hashedOtp = crypto
    .createHash("sha256")
    .update(String(enteredOtp))
    .digest("hex");
  return (
    this.passwordResetOtp === hashedOtp &&
    this.passwordResetOtpExpires &&
    this.passwordResetOtpExpires > Date.now()
  );
};

customerSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName || ""}`.trim();
});

// ─── INDEXES ─────────────────────────────────────────────
customerSchema.index({ createdAt: -1 });
customerSchema.index({ isActive: 1, isBlocked: 1 });
customerSchema.index({
  firstName: "text",
  lastName: "text",
  email: "text",
  phone: "text",
});

const Customer =
  mongoose.models.Customer || mongoose.model("Customer", customerSchema);
export default Customer;
