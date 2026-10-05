import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    /* =====================================================
       SENDER
    ===================================================== */

    sender: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },

      type: {
        type: String,
        enum: ["admin", "customer", "vendor", "rider", "system"],
        default: "system",
      },

      name: {
        type: String,
        default: "",
        trim: true,
      },
    },

    /* =====================================================
       BASIC
    ===================================================== */

    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: [
        "general",
        "promotion",
        "offer",
        "order",
        "payment",
        "vendor",
        "rider",
        "system",
        "warning",
      ],
      default: "general",
    },

    priority: {
      type: String,
      enum: ["low", "normal", "high", "urgent"],
      default: "normal",
    },

    /* =====================================================
       AUDIENCE
    ===================================================== */

    audience: {
      type: {
        type: String,
        enum: ["all", "role", "users", "vendor_customers"],
        required: true,
      },

      roles: {
        type: [String],
        default: [],
      },

      userIds: [
        {
          type: mongoose.Schema.Types.ObjectId,
        },
      ],

      vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
      },
    },

    /* =====================================================
       IMAGE
    ===================================================== */

    image: {
      type: String,
      default: "",
      trim: true,
    },

    /* =====================================================
       ACTION
    ===================================================== */

    action: {
      label: {
        type: String,
        default: "",
        trim: true,
      },

      url: {
        type: String,
        default: "",
        trim: true,
      },
    },

    /* =====================================================
       OFFER
    ===================================================== */

    offer: {
      discountType: {
        type: String,
        enum: ["none", "percentage", "flat"],
        default: "none",
      },

      discountValue: {
        type: Number,
        default: 0,
        min: 0,
      },

      couponCode: {
        type: String,
        default: "",
        trim: true,
        uppercase: true,
      },
    },

    /* =====================================================
       EXPIRY
    ===================================================== */

    expiresAt: {
      type: Date,
      default: null,
    },

    /* =====================================================
       STATUS
    ===================================================== */

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

/* =====================================================
   INDEXES
===================================================== */

notificationSchema.index({
  "audience.type": 1,
  createdAt: -1,
});

notificationSchema.index({
  "audience.roles": 1,
  createdAt: -1,
});

notificationSchema.index({
  "audience.userIds": 1,
  createdAt: -1,
});

notificationSchema.index({
  isActive: 1,
  expiresAt: 1,
});

const Notification =
  mongoose.models.Notification ||
  mongoose.model("Notification", notificationSchema);

export default Notification;
