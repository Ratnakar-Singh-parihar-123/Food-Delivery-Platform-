import mongoose from "mongoose";
import bcrypt from "bcrypt";
import crypto from "crypto";

const riderSchema = new mongoose.Schema(
  {
    /* =================================================
       PERSONAL DETAILS
    ================================================= */

    firstName: {
      type: String,
      trim: true,
      maxlength: 60,
      default: "", // ✅ not required
    },

    lastName: {
      type: String,
      trim: true,
      maxlength: 60,
      default: "",
    },

    email: {
      type: String,
      lowercase: true,
      trim: true,
      index: true,
      sparse: true, // ✅ allows nulls without unique conflict
      unique: true,
      default: null, // ✅ default null instead of ''
    },

    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },

    password: {
      type: String,

      select: false,
      default: "", // ✅ not required
    },

    profileImage: {
      type: String,
      default: "",
    },

    dateOfBirth: {
      type: Date,
      default: null,
    },

    gender: {
      type: String,
      enum: ["male", "female", "other", ""],
      default: "",
    },
    documentsSubmitted: {
      type: Boolean,
      default: false,
    },
    estimatedApprovalTime: {
      type: Number,
      default: 24,
    },

    /* =================================================
       ADDRESS
    ================================================= */

    address: {
      addressLine: { type: String, trim: true, default: "" },
      landmark: { type: String, trim: true, default: "" },
      city: { type: String, trim: true, default: "" },
      state: { type: String, trim: true, default: "" },
      pincode: { type: String, trim: true, default: "" },
    },

    /* =================================================
       VEHICLE
    ================================================= */

    vehicle: {
      type: {
        type: String,
        enum: ["bike", "scooter", "bicycle", "ev_bike", "other", ""],
        default: "",
      },
      number: { type: String, trim: true, uppercase: true, default: "" },
      model: { type: String, trim: true, default: "" },
      color: { type: String, trim: true, default: "" },
    },

    drivingLicenseNumber: {
      type: String,
      trim: true,
      uppercase: true,
      default: "",
    },

    /* =================================================
       DOCUMENTS / KYC
    ================================================= */

    documents: {
      aadhaarFront: { type: String, default: "" },
      aadhaarBack: { type: String, default: "" },
      panCard: { type: String, default: "" },
      drivingLicense: { type: String, default: "" },
      vehicleRc: { type: String, default: "" },
      vehicleInsurance: { type: String, default: "" },
    },

    panNumber: {
      type: String,
      trim: true,
      uppercase: true,
      default: "",
    },

    aadhaarLast4: {
      type: String,
      trim: true,
      maxlength: 4,
      default: "",
    },

    /* =================================================
       BANK DETAILS
    ================================================= */

    bankDetails: {
      accountHolderName: { type: String, trim: true, default: "" },
      accountNumber: { type: String, trim: true, default: "", select: false },
      ifscCode: { type: String, trim: true, uppercase: true, default: "" },
      bankName: { type: String, trim: true, default: "" },
      upiId: { type: String, trim: true, lowercase: true, default: "" },
      isVerified: { type: Boolean, default: false },
    },

    /* =================================================
       APPROVAL / KYC STATUS
    ================================================= */

    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },

    kycStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
      index: true,
    },

    rejectionReason: { type: String, trim: true, default: "" },
    approvedAt: { type: Date, default: null },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },

    /* =================================================
       WORK STATUS
    ================================================= */

    isActive: { type: Boolean, default: true, index: true },
    isOnline: { type: Boolean, default: false, index: true },
    isAvailable: { type: Boolean, default: false, index: true },
    currentOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },

    /* =================================================
       CURRENT LOCATION
    ================================================= */

    currentLocation: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] },
      updatedAt: { type: Date, default: null },
    },

    /* =================================================
       BLOCK / SECURITY
    ================================================= */

    isBlocked: { type: Boolean, default: false, index: true },
    blockReason: { type: String, trim: true, default: "" },
    blockedAt: { type: Date, default: null },
    blockedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null },
    lastLoginAt: { type: Date, default: null },
    lastLoginIp: { type: String, default: "" },

    /* =================================================
       EMAIL VERIFICATION
    ================================================= */

    isEmailVerified: { type: Boolean, default: false },
    emailOtp: { type: String, select: false, default: null },
    emailOtpExpires: { type: Date, select: false, default: null },
    emailOtpAttempts: { type: Number, select: false, default: 0 },
    lastOtpSentAt: { type: Date, select: false, default: null },

    /* =================================================
       PHONE VERIFICATION
    ================================================= */

    isPhoneVerified: { type: Boolean, default: false },
    phoneOtp: { type: String, select: false, default: null },
    phoneOtpExpires: { type: Date, select: false, default: null },

    /* =================================================
       PASSWORD RESET
    ================================================= */

    resetPasswordOtp: { type: String, select: false, default: null },
    resetPasswordOtpExpires: { type: Date, select: false, default: null },
    resetPasswordVerified: { type: Boolean, select: false, default: false },
    passwordChangedAt: { type: Date, default: null },

    /* =================================================
       EARNINGS
    ================================================= */

    earnings: {
      total: { type: Number, default: 0, min: 0 },
      today: { type: Number, default: 0, min: 0 },
      thisWeek: { type: Number, default: 0, min: 0 },
      thisMonth: { type: Number, default: 0, min: 0 },
      pendingPayout: { type: Number, default: 0, min: 0 },
      paidOut: { type: Number, default: 0, min: 0 },
    },

    /* =================================================
       DELIVERY STATS
    ================================================= */

    stats: {
      totalDeliveries: { type: Number, default: 0, min: 0 },
      completedDeliveries: { type: Number, default: 0, min: 0 },
      cancelledDeliveries: { type: Number, default: 0, min: 0 },
      totalDistanceKm: { type: Number, default: 0, min: 0 },
    },

    /* =================================================
       RATING
    ================================================= */

    rating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0, min: 0 },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// ─── Indexes ──────────────────────────────────────────────────
riderSchema.index({ currentLocation: "2dsphere" });
riderSchema.index({ approvalStatus: 1, createdAt: -1 });
riderSchema.index({ isOnline: 1, isAvailable: 1, isActive: 1 });
riderSchema.index({ city: 1, approvalStatus: 1 });

// ─── Password hashing ───────────────────────────────────────
riderSchema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) return;
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordChangedAt = new Date();
});

// ─── Methods ────────────────────────────────────────────────
riderSchema.methods.comparePassword = async function (candidate) {
  if (!this.password) return false;
  return bcrypt.compare(candidate, this.password);
};

riderSchema.methods.createEmailOtp = function () {
  const otp = String(Math.floor(100000 + Math.random() * 900000));
  this.emailOtp = crypto.createHash("sha256").update(otp).digest("hex");
  this.emailOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
  this.emailOtpAttempts = 0;
  this.lastOtpSentAt = new Date();
  return otp;
};

riderSchema.methods.verifyEmailOtp = function (otp) {
  if (!this.emailOtp || !this.emailOtpExpires) return false;
  if (this.emailOtpExpires < new Date()) return false;
  const hashed = crypto.createHash("sha256").update(String(otp)).digest("hex");
  return hashed === this.emailOtp;
};

riderSchema.methods.createResetPasswordOtp = function () {
  const otp = String(Math.floor(100000 + Math.random() * 900000));
  this.resetPasswordOtp = crypto.createHash("sha256").update(otp).digest("hex");
  this.resetPasswordOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
  this.resetPasswordVerified = false;
  return otp;
};

riderSchema.methods.verifyResetPasswordOtp = function (otp) {
  if (!this.resetPasswordOtp || !this.resetPasswordOtpExpires) return false;
  if (this.resetPasswordOtpExpires < new Date()) return false;
  const hashed = crypto.createHash("sha256").update(String(otp)).digest("hex");
  return hashed === this.resetPasswordOtp;
};

riderSchema.methods.clearEmailOtp = function () {
  this.emailOtp = null;
  this.emailOtpExpires = null;
  this.emailOtpAttempts = 0;
};

riderSchema.methods.clearResetPasswordOtp = function () {
  this.resetPasswordOtp = null;
  this.resetPasswordOtpExpires = null;
  this.resetPasswordVerified = false;
};

riderSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.emailOtp;
  delete obj.phoneOtp;
  delete obj.resetPasswordOtp;
  if (obj.bankDetails) delete obj.bankDetails.accountNumber;
  return obj;
};

// ─── Model ──────────────────────────────────────────────────
const Rider = mongoose.models.Rider || mongoose.model("Rider", riderSchema);
export default Rider;
