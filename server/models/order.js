import mongoose from "mongoose";

/* =====================================================
   ORDER ITEM SCHEMA
===================================================== */
const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    image: { type: String, default: "" },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    totalPrice: { type: Number, required: true, min: 0 },
    variant: { name: String, value: String },
    addons: [{ name: String, price: { type: Number, min: 0, default: 0 } }],
  },
  { _id: false },
);

/* =====================================================
   DELIVERY ADDRESS SCHEMA
===================================================== */
const deliveryAddressSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    addressLine: { type: String, required: true, trim: true },
    landmark: { type: String, default: "", trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: undefined },
    },
  },
  { _id: false },
);

/* =====================================================
   ORDER SCHEMA
===================================================== */
const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true, index: true, trim: true },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true,
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
      index: true,
    },
    rider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Rider",
      default: null,
      index: true,
    },
    pickupCode: {
      type: String,
      default: "",
      trim: true,
    },
    items: {
      type: [orderItemSchema],
      validate: {
        validator: (items) => Array.isArray(items) && items.length > 0,
        message: "Order must contain at least one item",
      },
    },
    pricing: {
      itemTotal: { type: Number, required: true, min: 0 },
      packagingCharge: { type: Number, default: 0, min: 0 },
      deliveryCharge: { type: Number, default: 0, min: 0 },
      platformFee: { type: Number, default: 0, min: 0 },
      tax: { type: Number, default: 0, min: 0 },
      discount: { type: Number, default: 0, min: 0 },
      tip: { type: Number, default: 0, min: 0 },
      grandTotal: { type: Number, required: true, min: 0 },
    },
    commission: {
      percentage: { type: Number, min: 0, max: 100, default: 0 },
      amount: { type: Number, min: 0, default: 0 },
      vendorEarning: { type: Number, min: 0, default: 0 },
    },
    payment: {
      method: {
        type: String,
        enum: ["cash", "upi", "card", "netbanking", "wallet"],
        required: true,
      },
      status: {
        type: String,
        enum: ["pending", "paid", "failed", "refunded", "partially_refunded"],
        default: "pending",
      },
      transactionId: { type: String, default: "", trim: true },
      paymentGateway: { type: String, default: "", trim: true },
      paidAt: { type: Date, default: null },
    },
    status: {
      type: String,
      enum: [
        "placed",
        "confirmed",
        "preparing",
        "ready_for_pickup",
        "rider_assigned",
        "picked_up",
        "on_the_way",
        "delivered",
        "cancelled",
        "rejected",
      ],
      default: "placed",
      index: true,
    },
    deliveryAddress: { type: deliveryAddressSchema, required: true },
    customerNote: { type: String, maxlength: 500, default: "", trim: true },
    vendorNote: { type: String, maxlength: 500, default: "", trim: true },
    coupon: {
      code: { type: String, uppercase: true, trim: true, default: "" },
      discountType: {
        type: String,
        enum: ["percentage", "flat", "none"],
        default: "none",
      },
      discountValue: { type: Number, min: 0, default: 0 },
    },
    cancellation: {
      cancelledBy: {
        type: String,
        enum: ["customer", "vendor", "rider", "admin", "system", null],
        default: null,
      },
      reason: { type: String, default: "", trim: true },
      cancelledAt: { type: Date, default: null },
    },
    timeline: {
      confirmedAt: { type: Date, default: null },
      preparationStartedAt: { type: Date, default: null },
      readyAt: { type: Date, default: null },
      riderAssignedAt: { type: Date, default: null },
      pickedUpAt: { type: Date, default: null },
      onTheWayAt: { type: Date, default: null },
      deliveredAt: { type: Date, default: null },
    },
    // ─── ✅ NEW: Delivery OTP fields ────────────────────
    deliveryOTP: {
      type: String,
      select: false, // default queries से hidden
    },
    deliveryOTPExpires: {
      type: Date,
      select: false,
    },
    otpVerified: {
      type: Boolean,
      default: false,
    },
    // ─────────────────────────────────────────────────────
    estimatedDeliveryAt: { type: Date, default: null },
    rating: {
      vendor: {
        value: { type: Number, min: 1, max: 5, default: null },
        review: { type: String, maxlength: 1000, default: "" },
      },
      rider: {
        value: { type: Number, min: 1, max: 5, default: null },
        review: { type: String, maxlength: 1000, default: "" },
      },
    },
  },
  { timestamps: true, versionKey: false },
);

/* =====================================================
   ORDER NUMBER GENERATOR (unchanged)
===================================================== */
const generateOrderNumber = () => {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `FD${timestamp}${random}`;
};

orderSchema.pre("validate", async function () {
  if (this.orderNumber) return;
  let unique = false;
  let attempts = 0;
  while (!unique && attempts < 5) {
    const orderNumber = generateOrderNumber();
    const exists = await mongoose.models.Order?.exists({ orderNumber });
    if (!exists) {
      this.orderNumber = orderNumber;
      unique = true;
    }
    attempts++;
  }
  if (!this.orderNumber) {
    this.orderNumber = `FD${Date.now()}${Math.floor(Math.random() * 100000)}`;
  }
});

/* =====================================================
   METHODS (unchanged)
===================================================== */
orderSchema.methods.updateOrderStatus = async function (newStatus) {
  const allowedStatuses = [
    "placed",
    "confirmed",
    "preparing",
    "ready_for_pickup",
    "rider_assigned",
    "picked_up",
    "on_the_way",
    "delivered",
    "cancelled",
    "rejected",
  ];
  if (!allowedStatuses.includes(newStatus)) {
    throw new Error("Invalid order status");
  }

  const allowedTransitions = {
    placed: ["confirmed", "rejected", "cancelled"],
    confirmed: ["preparing", "cancelled"],
    preparing: ["ready_for_pickup", "cancelled"],
    ready_for_pickup: ["rider_assigned", "cancelled"],
    rider_assigned: ["picked_up", "cancelled"],
    picked_up: ["on_the_way", "delivered"],
    on_the_way: ["delivered"],
  };

  const currentStatus = this.status;
  if (
    allowedTransitions[currentStatus] &&
    !allowedTransitions[currentStatus].includes(newStatus)
  ) {
    throw new Error(`Invalid transition from ${currentStatus} to ${newStatus}`);
  }

  this.status = newStatus;
  const now = new Date();
  const map = {
    confirmed: "confirmedAt",
    preparing: "preparationStartedAt",
    ready_for_pickup: "readyAt",
    rider_assigned: "riderAssignedAt",
    picked_up: "pickedUpAt",
    on_the_way: "onTheWayAt",
    delivered: "deliveredAt",
  };
  if (map[newStatus]) this.timeline[map[newStatus]] = now;
  return this.save();
};

orderSchema.methods.calculateCommission = function (commissionPercentage) {
  const percentage = Number(commissionPercentage) || 0;
  const itemTotal = Number(this.pricing.itemTotal) || 0;
  const commissionAmount = Number((itemTotal * (percentage / 100)).toFixed(2));
  const vendorEarning = Number((itemTotal - commissionAmount).toFixed(2));
  this.commission.percentage = percentage;
  this.commission.amount = commissionAmount;
  this.commission.vendorEarning = vendorEarning;
  return { percentage, commissionAmount, vendorEarning };
};

/* =====================================================
   INDEXES (unchanged)
===================================================== */
orderSchema.index({ vendor: 1, status: 1, createdAt: -1 });
orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ customer: 1, vendor: 1, status: 1 });
orderSchema.index({ rider: 1, status: 1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ "payment.status": 1, createdAt: -1 });
orderSchema.index({ vendor: 1, customer: 1, status: 1 });

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);
export default Order;
