import mongoose from "mongoose";

const couponUsageSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },

    usedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: false,
  },
);

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
      minlength: 3,
      maxlength: 30,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    /* ==========================================
       COUPON OWNERSHIP
    ========================================== */

    scope: {
      type: String,

      enum: ["platform", "vendor"],

      default: "platform",
      index: true,
    },

    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      default: null,
      index: true,
    },

    /* ==========================================
       DISCOUNT
    ========================================== */

    discountType: {
      type: String,

      enum: ["percentage", "flat"],

      required: true,
    },

    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },

    maxDiscount: {
      type: Number,
      min: 0,
      default: null,
    },

    minimumOrderAmount: {
      type: Number,
      min: 0,
      default: 0,
    },

    /* ==========================================
       USAGE RULES
    ========================================== */

    totalUsageLimit: {
      type: Number,
      min: 1,
      default: null,
    },

    perCustomerLimit: {
      type: Number,
      min: 1,
      default: 1,
    },

    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    usages: {
      type: [couponUsageSchema],
      default: [],
    },

    firstOrderOnly: {
      type: Boolean,
      default: false,
    },

    /* ==========================================
       VALIDITY
    ========================================== */

    startsAt: {
      type: Date,
      default: null,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    /* ==========================================
       ADMIN
    ========================================== */

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

/* =====================================================
   INDEXES
===================================================== */

couponSchema.index({
  isActive: 1,
  expiresAt: 1,
});

couponSchema.index({
  vendor: 1,
  isActive: 1,
});

couponSchema.index({
  scope: 1,
  createdAt: -1,
});

/* =====================================================
   MODEL
===================================================== */

const Coupon = mongoose.model("Coupon", couponSchema);

export default Coupon;
