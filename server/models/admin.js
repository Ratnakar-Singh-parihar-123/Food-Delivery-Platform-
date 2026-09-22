import mongoose from "mongoose";
import bcrypt from "bcrypt";
import crypto from "crypto";

const adminSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      minlength: [2, "First name is too short"],
      maxlength: [50, "First name is too long"],
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
    },

    phone: {
      type: String,
      trim: true,
      default: "",
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },

    profileImage: {
      type: String,
      default: "",
    },

    role: {
      type: String,

      enum: [
        "super_admin",
        "operations_admin",
        "finance_admin",
        "support_admin",
      ],

      default: "super_admin",
    },

    permissions: {
      type: [String],
      default: [],
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
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

    passwordResetToken: {
      type: String,
      select: false,
    },

    passwordResetExpires: {
      type: Date,
      select: false,
    },

    failedLoginAttempts: {
      type: Number,
      default: 0,
    },

    lockUntil: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

/* ====================================================
   HASH PASSWORD
==================================================== */

adminSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 12);

  this.passwordChangedAt = new Date();
});

/* ====================================================
   COMPARE PASSWORD
==================================================== */

adminSchema.methods.comparePassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

/* ====================================================
   CREATE PASSWORD RESET TOKEN
==================================================== */

adminSchema.methods.createPasswordResetToken = function () {
  const rawToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 15 * 60 * 1000;

  return rawToken;
};

const Admin = mongoose.models.Admin || mongoose.model("Admin", adminSchema);
export default Admin;
