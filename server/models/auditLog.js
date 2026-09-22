import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    /* ==========================================
       WHO PERFORMED ACTION
    ========================================== */

    actor: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        index: true,
      },

      type: {
        type: String,

        enum: ["admin", "vendor", "customer", "rider", "system"],

        required: true,
      },

      name: {
        type: String,
        trim: true,
        default: "",
      },

      email: {
        type: String,
        trim: true,
        default: "",
      },
    },

    /* ==========================================
       ACTION
    ========================================== */

    action: {
      type: String,

      enum: [
        "create",
        "update",
        "delete",
        "login",
        "logout",

        "approve",
        "reject",

        "block",
        "unblock",

        "activate",
        "deactivate",

        "password_change",
        "email_change",

        "profile_update",

        "payment",
        "refund",

        "notification_send",

        "coupon_create",
        "coupon_update",
        "coupon_delete",

        "banner_create",
        "banner_update",
        "banner_delete",

        "vendor_approve",
        "vendor_reject",

        "customer_block",
        "customer_unblock",

        "other",
      ],

      required: true,
      index: true,
    },

    /* ==========================================
       MODULE
    ========================================== */

    module: {
      type: String,

      enum: [
        "auth",
        "admin",
        "vendor",
        "customer",
        "rider",
        "order",
        "coupon",
        "banner",
        "notification",
        "payment",
        "refund",
        "settings",
        "profile",
        "system",
      ],

      required: true,
      index: true,
    },

    /* ==========================================
       TARGET RESOURCE
    ========================================== */

    target: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
      },

      type: {
        type: String,
        default: "",
      },

      name: {
        type: String,
        default: "",
      },
    },

    /* ==========================================
       MESSAGE
    ========================================== */

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    /* ==========================================
       BEFORE / AFTER DATA
    ========================================== */

    changes: {
      before: {
        type: mongoose.Schema.Types.Mixed,
        default: null,
      },

      after: {
        type: mongoose.Schema.Types.Mixed,
        default: null,
      },
    },

    /* ==========================================
       REQUEST INFO
    ========================================== */

    request: {
      method: {
        type: String,
        default: "",
      },

      path: {
        type: String,
        default: "",
      },

      ip: {
        type: String,
        default: "",
      },

      userAgent: {
        type: String,
        default: "",
      },
    },

    /* ==========================================
       STATUS
    ========================================== */

    status: {
      type: String,

      enum: ["success", "failed"],

      default: "success",

      index: true,
    },

    errorMessage: {
      type: String,
      default: "",
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

/* ==========================================
   INDEXES
========================================== */

auditLogSchema.index({
  createdAt: -1,
});

auditLogSchema.index({
  module: 1,
  createdAt: -1,
});

auditLogSchema.index({
  action: 1,
  createdAt: -1,
});

auditLogSchema.index({
  "actor.id": 1,
  createdAt: -1,
});

auditLogSchema.index({
  "target.id": 1,
  createdAt: -1,
});

const AuditLog = mongoose.model("AuditLog", auditLogSchema);

export default AuditLog;
