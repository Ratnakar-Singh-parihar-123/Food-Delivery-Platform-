import crypto from "crypto";
import Order from "../models/order.js";
import Vendor from "../models/vendor.js";
import Rider from "../models/rider.js";
import Delivery from "../models/Delivery.js";
import ServiceArea from "../models/serviceArea.js";
import DeliveryCharge from "../models/DeliveryCharge.js";
import MenuItem from "../models/MenuItem.js";
import { ApiError } from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  calculateDistance,
  findNearbyRiders,
  generateOrderNumber,
} from "../utils/geoUtils.js";

// ─── Helper: Emit order update via socket to all parties ──
// const emitOrderUpdate = (req, order) => {
//   const io = req.app?.get("io");
//   if (!io) return;

//   io.to(`order:${order._id.toString()}`).emit("order:updated", order);
//   io.to(`vendor:${order.vendor}`).emit("order:updated", order);
//   io.to(`customer:${order.customer}`).emit("order:updated", order);

//   if (order.rider) {
//     io.to(`rider:${order.rider}`).emit("order:updated", order);
//   }
// };
const emitOrderUpdate = (req, order) => {
  const io = req.app?.get("io");
  if (io) {
    io.to(order._id.toString()).emit("order:updated", order);
    io.to(`vendor:${order.vendor}`).emit("order:updated", order);
    io.to(`customer:${order.customer}`).emit("order:updated", order);
    if (order.rider) {
      io.to(`rider:${order.rider}`).emit("order:updated", order);
    }
  }
};
// ─── 1. PLACE ORDER ────────────────────────────────────────
export const placeOrder = asyncHandler(async (req, res) => {
  const customerId = req.user.id;
  const {
    vendorId,
    items,
    deliveryAddress,
    paymentMethod,
    customerNote,
    couponCode,
  } = req.body;

  // Validate vendor
  const vendor = await Vendor.findById(vendorId);
  if (
    !vendor ||
    !vendor.isActive ||
    !vendor.isOnline ||
    !vendor.acceptingOrders
  ) {
    throw new ApiError(400, "Vendor is not available");
  }
  if (!vendor.address?.location?.coordinates) {
    throw new ApiError(400, "Vendor location not set");
  }

  // Validate delivery address
  if (!deliveryAddress.location?.coordinates) {
    throw new ApiError(400, "Delivery address location required");
  }

  // Check service area coverage
  const serviceArea = await ServiceArea.findOne({
    location: {
      $near: {
        $geometry: deliveryAddress.location,
        $maxDistance: 50000,
      },
    },
    isActive: true,
  });
  if (!serviceArea) {
    throw new ApiError(
      400,
      "Delivery address is not covered by any service area.",
    );
  }

  // Calculate distance
  const distance = calculateDistance(
    vendor.address.location.coordinates[1],
    vendor.address.location.coordinates[0],
    deliveryAddress.location.coordinates[1],
    deliveryAddress.location.coordinates[0],
  );

  // Determine delivery charge
  let deliveryCharge = 0;
  if (serviceArea.deliveryCharge) {
    deliveryCharge = serviceArea.deliveryCharge;
  } else {
    const chargeRule = await DeliveryCharge.findOne({
      distanceFrom: { $lte: distance },
      distanceTo: { $gte: distance },
      isActive: true,
    });
    deliveryCharge = chargeRule
      ? chargeRule.charge
      : Math.max(20, Math.round(distance * 5));
  }

  // Validate items & calculate totals
  let itemTotal = 0;
  const orderItems = [];
  for (const item of items) {
    const menuItem = await MenuItem.findById(item.productId);
    if (!menuItem || !menuItem.isAvailable) {
      throw new ApiError(
        400,
        `Item ${item.name || "unknown"} is not available`,
      );
    }
    const qty = item.quantity || 1;
    const price = menuItem.price;
    const subtotal = price * qty;
    itemTotal += subtotal;
    orderItems.push({
      product: menuItem._id,
      name: menuItem.name,
      image: menuItem.image || "",
      quantity: qty,
      unitPrice: price,
      totalPrice: subtotal,
      variant: item.variant || {},
      addons: item.addons || [],
    });
  }

  // Check minimum order amount
  if (serviceArea.minOrderAmount && itemTotal < serviceArea.minOrderAmount) {
    throw new ApiError(
      400,
      `Minimum order amount for this area is ₹${serviceArea.minOrderAmount}`,
    );
  }

  // Calculate fees
  const packagingCharge = 10;
  const platformFee = 15;
  const tax = 0;
  const discount = 0;
  const tip = 0;
  const grandTotal =
    itemTotal +
    packagingCharge +
    deliveryCharge +
    platformFee +
    tax +
    tip -
    discount;

  // Generate order number & pickup code
  const orderNumber = await generateOrderNumber();
  const pickupCode = String(Math.floor(1000 + Math.random() * 9000));

  // Create order
  const order = new Order({
    customer: customerId,
    vendor: vendorId,
    orderNumber,
    pickupCode,
    items: orderItems,
    pricing: {
      itemTotal,
      packagingCharge,
      deliveryCharge,
      platformFee,
      tax,
      discount,
      tip,
      grandTotal,
    },
    payment: {
      method: paymentMethod || "cash",
      status: "pending",
    },
    deliveryAddress,
    customerNote: customerNote || "",
    coupon: couponCode ? { code: couponCode } : undefined,
    status: "placed",
    estimatedDeliveryAt: new Date(Date.now() + 45 * 60000),
  });

  await order.save();

  emitOrderUpdate(req, order);

  res.status(201).json({
    success: true,
    message: "Order placed successfully",
    data: { order },
  });
});

// ─── 2. CUSTOMER CANCEL ORDER ─────────────────────────────
export const cancelOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { reason } = req.body;
  const customerId = req.user.id;

  const order = await Order.findOne({ _id: orderId, customer: customerId });
  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  if (!["placed", "confirmed"].includes(order.status)) {
    throw new ApiError(400, "Order cannot be cancelled at this stage");
  }

  order.status = "cancelled";
  order.cancellation = {
    cancelledBy: "customer",
    reason: reason || "Customer cancelled",
    cancelledAt: new Date(),
  };
  await order.save();

  const delivery = await Delivery.findOne({ orderId: order._id });
  if (delivery) {
    delivery.status = "cancelled";
    await delivery.save();
  }

  emitOrderUpdate(req, order);

  res.json({
    success: true,
    message: "Order cancelled successfully",
    data: { order },
  });
});

// ─── 3. CUSTOMER REORDER ───────────────────────────────────
export const reorderOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const customerId = req.user.id;

  const originalOrder = await Order.findOne({
    _id: orderId,
    customer: customerId,
  });
  if (!originalOrder) {
    throw new ApiError(404, "Order not found");
  }
  if (originalOrder.status !== "delivered") {
    throw new ApiError(400, "Only delivered orders can be reordered");
  }

  // Re‑use the same items and address
  const vendorId = originalOrder.vendor;
  const items = originalOrder.items.map((item) => ({
    productId: item.product,
    quantity: item.quantity,
    variant: item.variant || {},
    addons: item.addons || [],
  }));
  const deliveryAddress = originalOrder.deliveryAddress;

  // Validate vendor
  const vendor = await Vendor.findById(vendorId);
  if (
    !vendor ||
    !vendor.isActive ||
    !vendor.isOnline ||
    !vendor.acceptingOrders
  ) {
    throw new ApiError(400, "Vendor is not available at the moment");
  }

  // Recalculate pricing (same as placeOrder)
  let itemTotal = 0;
  const orderItems = [];
  for (const item of items) {
    const menuItem = await MenuItem.findById(item.productId);
    if (!menuItem || !menuItem.isAvailable) {
      throw new ApiError(
        400,
        `Item ${menuItem?.name || "unknown"} is not available`,
      );
    }
    const qty = item.quantity || 1;
    const price = menuItem.price;
    const subtotal = price * qty;
    itemTotal += subtotal;
    orderItems.push({
      product: menuItem._id,
      name: menuItem.name,
      image: menuItem.image || "",
      quantity: qty,
      unitPrice: price,
      totalPrice: subtotal,
      variant: item.variant || {},
      addons: item.addons || [],
    });
  }

  const distance = calculateDistance(
    vendor.address.location.coordinates[1],
    vendor.address.location.coordinates[0],
    deliveryAddress.location.coordinates[1],
    deliveryAddress.location.coordinates[0],
  );

  let deliveryCharge = 0;
  const chargeRule = await DeliveryCharge.findOne({
    distanceFrom: { $lte: distance },
    distanceTo: { $gte: distance },
    isActive: true,
  });
  deliveryCharge = chargeRule
    ? chargeRule.charge
    : Math.max(20, Math.round(distance * 5));

  const packagingCharge = 10;
  const platformFee = 15;
  const tax = 0;
  const discount = 0;
  const tip = 0;
  const grandTotal =
    itemTotal +
    packagingCharge +
    deliveryCharge +
    platformFee +
    tax +
    tip -
    discount;

  const orderNumber = await generateOrderNumber();
  const pickupCode = String(Math.floor(1000 + Math.random() * 9000));

  const newOrder = new Order({
    customer: customerId,
    vendor: vendorId,
    orderNumber,
    pickupCode,
    items: orderItems,
    pricing: {
      itemTotal,
      packagingCharge,
      deliveryCharge,
      platformFee,
      tax,
      discount,
      tip,
      grandTotal,
    },
    payment: {
      method: originalOrder.payment.method || "cash",
      status: "pending",
    },
    deliveryAddress,
    customerNote: originalOrder.customerNote || "",
    coupon: originalOrder.coupon
      ? { code: originalOrder.coupon.code }
      : undefined,
    status: "placed",
    estimatedDeliveryAt: new Date(Date.now() + 45 * 60000),
  });

  await newOrder.save();

  emitOrderUpdate(req, newOrder);

  res.status(201).json({
    success: true,
    message: "Order reordered successfully",
    data: { order: newOrder },
  });
});

// ─── 4. VENDOR: GET ORDERS (with filters) ──────────────────
export const getVendorOrders = asyncHandler(async (req, res) => {
  const vendorId = req.user.id;
  const { status, page = 1, limit = 20, type = "all" } = req.query;

  const filter = { vendor: vendorId };
  if (status) filter.status = status;
  if (type === "live") {
    filter.status = { $nin: ["delivered", "cancelled", "rejected"] };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const orders = await Order.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate("customer", "firstName lastName phone email")
    .populate("rider", "firstName lastName phone");

  const total = await Order.countDocuments(filter);

  res.json({
    success: true,
    data: {
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    },
  });
});

// ─── Get live orders ──────────────────────────────────────
export const getVendorLiveOrders = asyncHandler(async (req, res) => {
  const vendorId = req.user.id;

  const orders = await Order.find({
    vendor: vendorId,
    status: {
      $in: [
        "placed",
        "confirmed",
        "preparing",
        "ready_for_pickup",
        "rider_assigned",
        "picked_up",
        "on_the_way",
      ],
    },
  })
    .populate("customer", "firstName lastName phone")
    .populate("rider", "firstName lastName phone")
    .sort({ createdAt: -1 })
    .lean();

  res.json({
    success: true,
    data: { orders },
  });
});

// ─── Get single order ─────────────────────────────────────
export const getVendorOrderById = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const vendorId = req.user.id;

  const order = await Order.findOne({ _id: orderId, vendor: vendorId })
    .populate("customer", "firstName lastName phone email")
    .populate("rider", "firstName lastName phone");

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  res.json({
    success: true,
    data: { order },
  });
});

// ─── Accept order ──────────────────────────────────────────
export const acceptVendorOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const vendorId = req.user.id;

  const order = await Order.findOne({ _id: orderId, vendor: vendorId });
  if (!order) {
    throw new ApiError(404, "Order not found");
  }
  if (order.status !== "placed") {
    throw new ApiError(400, "Order is not in placed state");
  }

  // ✅ FIX: directly update status and save
  order.status = "preparing";
  await order.save();

  emitOrderUpdate(req, order);

  res.json({
    success: true,
    message: "Order accepted and moved to preparing",
    data: { order },
  });
});

// ─── Reject order ──────────────────────────────────────────
export const rejectVendorOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { reason } = req.body;
  const vendorId = req.user.id;

  const order = await Order.findOne({ _id: orderId, vendor: vendorId });
  if (!order) {
    throw new ApiError(404, "Order not found");
  }
  if (order.status !== "placed") {
    throw new ApiError(400, "Order is not in placed state");
  }

  order.status = "rejected";
  order.cancellation = {
    cancelledBy: "vendor",
    reason: reason || "Vendor rejected the order",
    cancelledAt: new Date(),
  };
  await order.save();

  emitOrderUpdate(req, order);

  res.json({
    success: true,
    message: "Order rejected",
    data: { order },
  });
});

// ─── Update order status (vendor) ──────────────────────────
export const updateVendorOrderStatus = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;
  const vendorId = req.user.id;

  const order = await Order.findOne({ _id: orderId, vendor: vendorId });
  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  // Allowed transitions for vendor
  const allowed = {
    confirmed: ["preparing"],
    preparing: ["ready_for_pickup"],
  };
  const transitions = allowed[order.status] || [];
  if (!transitions.includes(status)) {
    throw new ApiError(400, `Cannot move from ${order.status} to ${status}`);
  }

  // ✅ FIX: directly update status and save
  order.status = status;
  await order.save();

  emitOrderUpdate(req, order);

  res.json({
    success: true,
    message: `Order status updated to ${status}`,
    data: { order },
  });
});

// ─── 6. VENDOR: ACCEPT ORDER (dedicated) ──────────────────
export const vendorAcceptOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const vendorId = req.user.id;

  const order = await Order.findOne({ _id: orderId, vendor: vendorId });
  if (!order) {
    throw new ApiError(404, "Order not found for this vendor");
  }

  if (order.status !== "placed") {
    throw new ApiError(400, `Order is in ${order.status} state, cannot accept`);
  }

  // Move directly to "preparing"
  await order.updateOrderStatus("preparing");
  await order.save();

  emitOrderUpdate(req, order);

  res.status(200).json({
    success: true,
    message: "Order accepted and moved to preparing",
    data: { order },
  });
});

// ─── 7. VENDOR: MARK ORDER READY (dedicated) ──────────────
// export const vendorMarkReady = asyncHandler(async (req, res) => {
//   const { orderId } = req.params;
//   const vendorId = req.user.id;

//   const order = await Order.findOne({ _id: orderId, vendor: vendorId });
//   if (!order) {
//     throw new ApiError(404, "Order not found");
//   }

//   if (order.status !== "preparing") {
//     throw new ApiError(400, "Order must be preparing before marking ready");
//   }

//   // Change to "ready_for_pickup"
//   await order.updateOrderStatus("ready_for_pickup");
//   await order.save();

//   // Auto‑assign a nearby rider (optional)
//   const vendor = await Vendor.findById(vendorId);
//   if (vendor?.address?.location?.coordinates) {
//     const rider = await findNearbyRiders(
//       vendor.address.location.coordinates,
//       2,
//       vendorId,
//     );
//     if (rider) {
//       order.rider = rider._id;
//       await order.updateOrderStatus("rider_assigned");

//       const delivery = new Delivery({
//         orderId: order._id,
//         riderId: rider._id,
//         vendorId: vendorId,
//         customerId: order.customer,
//         pickupLocation: vendor.address.location,
//         dropoffLocation: order.deliveryAddress.location,
//         status: "assigned",
//         estimatedDuration: 30,
//         pickupCode: order.pickupCode,
//       });
//       await delivery.save();
//     }
//   }

//   await order.save();
//   emitOrderUpdate(req, order);

//   res.status(200).json({
//     success: true,
//     message: "Order is ready for pickup",
//     data: { order },
//   });
// });
export const vendorMarkReady = asyncHandler(async (req, res) => {
  console.log("🚀 vendorMarkReady called for order:", orderId);
  const { orderId } = req.params;
  const vendorId = req.user.id;

  const order = await Order.findOne({ _id: orderId, vendor: vendorId });
  if (!order) throw new ApiError(404, "Order not found");
  if (order.status !== "preparing") {
    throw new ApiError(400, "Order must be preparing before marking ready");
  }

  // ─── Generate Delivery OTP ──────────────────────────────
  const otp = String(Math.floor(100000 + Math.random() * 900000));
  const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");
  order.deliveryOTP = hashedOtp;
  order.deliveryOTPExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 min

  // 📱 Send OTP to customer (you can integrate SMS here)
  console.log(`📱 Delivery OTP for Order ${order.orderNumber}: ${otp}`);

  // ... बाकी code वैसा ही रहेगा (status update, rider assignment, etc.)
  await order.updateOrderStatus("ready_for_pickup");

  const vendor = await Vendor.findById(vendorId);
  if (vendor?.address?.location?.coordinates) {
    const rider = await findNearbyRiders(
      vendor.address.location.coordinates,
      2,
      vendorId,
    );
    if (rider) {
      order.rider = rider._id;
      await order.updateOrderStatus("rider_assigned");
      const delivery = new Delivery({
        orderId: order._id,
        riderId: rider._id,
        vendorId: vendorId,
        customerId: order.customer,
        pickupLocation: vendor.address.location,
        dropoffLocation: order.deliveryAddress.location,
        status: "assigned",
        estimatedDuration: 30,
        pickupCode: order.pickupCode,
      });
      await delivery.save();
    }
  }

  await order.save();
  emitOrderUpdate(req, order);

  res.status(200).json({
    success: true,
    message: "Order is ready for pickup",
    data: { order },
  });
});
// ─── 8. VENDOR: GET ORDER DETAILS ──────────────────────────
export const getOrderDetails = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const order = await Order.findById(orderId)
    .populate("customer", "firstName lastName phone email")
    .populate("vendor", "businessName address")
    .populate("rider", "firstName lastName phone");

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  res.json({
    success: true,
    data: { order },
  });
});

// ─── 9. RIDER: GET NEARBY ORDERS ───────────────────────────
export const getNearbyOrders = asyncHandler(async (req, res) => {
  const riderId = req.user.id;
  const rider = await Rider.findById(riderId);
  if (!rider || !rider.currentLocation?.coordinates) {
    throw new ApiError(400, "Rider location not available");
  }

  const [lng, lat] = rider.currentLocation.coordinates;
  const radius = 2; // km

  const orders = await Order.find({
    status: "ready_for_pickup",
    rider: null,
  }).populate("vendor", "businessName address location");

  // Filter by distance
  const nearbyOrders = orders.filter((order) => {
    if (!order.vendor?.address?.location?.coordinates) return false;
    const [vLng, vLat] = order.vendor.address.location.coordinates;
    const dist = calculateDistance(lat, lng, vLat, vLng);
    return dist <= radius;
  });

  res.json({
    success: true,
    data: { orders: nearbyOrders },
  });
});

// ─── 10. RIDER: ACCEPT ORDER ───────────────────────────────
export const riderAcceptOrder = asyncHandler(async (req, res) => {
  const riderId = req.user.id;
  const { orderId } = req.body;

  const order = await Order.findById(orderId);
  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  if (order.status !== "ready_for_pickup") {
    throw new ApiError(400, "Order is not ready for pickup");
  }
  if (order.rider) {
    throw new ApiError(400, "Rider already assigned");
  }

  const vendor = await Vendor.findById(order.vendor);
  if (!vendor || !vendor.address?.location?.coordinates) {
    throw new ApiError(400, "Vendor location missing");
  }

  const rider = await Rider.findById(riderId);
  if (!rider || !rider.currentLocation?.coordinates) {
    throw new ApiError(400, "Rider location not available");
  }

  // Check distance to vendor
  const distance = calculateDistance(
    vendor.address.location.coordinates[1],
    vendor.address.location.coordinates[0],
    rider.currentLocation.coordinates[1],
    rider.currentLocation.coordinates[0],
  );

  if (distance > 2) {
    throw new ApiError(400, "You are too far from this vendor");
  }

  // Assign rider
  order.rider = riderId;
  await order.updateOrderStatus("rider_assigned");

  const delivery = new Delivery({
    orderId: order._id,
    riderId: riderId,
    vendorId: order.vendor,
    customerId: order.customer,
    pickupLocation: vendor.address.location,
    dropoffLocation: order.deliveryAddress.location,
    status: "assigned",
    estimatedDuration: 30,
    pickupCode: order.pickupCode,
  });
  await delivery.save();

  await order.save();
  emitOrderUpdate(req, order);

  res.json({
    success: true,
    message: "Order accepted successfully",
    data: { order },
  });
});

// ─── 11. RIDER: UPDATE ORDER STATUS ─────────────────────────
export const riderUpdateOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { status, pickupCode } = req.body;
  const riderId = req.user.id;

  const order = await Order.findOne({ _id: orderId, rider: riderId });
  if (!order) {
    throw new ApiError(404, "Order not found or not assigned to you");
  }

  // Validate pickup code when picking up
  if (status === "picked_up") {
    if (!pickupCode || pickupCode !== order.pickupCode) {
      throw new ApiError(400, "Invalid pickup code");
    }
  }

  // Allowed transitions
  // const transitions = {
  //   ready_for_pickup: ["picked_up"],
  //   rider_assigned: ["picked_up"],
  //   picked_up: ["on_the_way", "delivered"],
  //   on_the_way: ["delivered"],
  // };
  const transitions = {
    ready_for_pickup: ["picked_up"],
    rider_assigned: ["picked_up"],
    picked_up: ["on_the_way"], // ← 'delivered' हटा दिया
    on_the_way: [], // ← अब यहाँ से आगे नहीं बढ़ सकता
  };

  if (!transitions[order.status]?.includes(status)) {
    throw new ApiError(
      400,
      `Invalid transition from ${order.status} to ${status}`,
    );
  }

  // Update order status
  await order.updateOrderStatus(status);

  // Update delivery record
  const delivery = await Delivery.findOne({ orderId: order._id });
  if (delivery) {
    if (status === "picked_up") {
      delivery.status = "picked_up";
      delivery.pickedUpAt = new Date();
    } else if (status === "on_the_way") {
      delivery.status = "in_transit";
    } else if (status === "delivered") {
      delivery.status = "delivered";
      delivery.deliveredAt = new Date();
    }
    await delivery.save();
  }

  await order.save();
  emitOrderUpdate(req, order);

  res.json({
    success: true,
    message: `Order status updated to ${status}`,
    data: { order },
  });
});

// ─── 12. CUSTOMER: GET ORDERS HISTORY ──────────────────────
export const getCustomerOrders = asyncHandler(async (req, res) => {
  const customerId = req.user.id;
  const { status, page = 1, limit = 20 } = req.query;

  const filter = { customer: customerId };
  if (status) filter.status = status;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const orders = await Order.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate("vendor", "businessName profileImage");

  const total = await Order.countDocuments(filter);

  res.json({
    success: true,
    data: {
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    },
  });
});

// ─── 13. ADMIN: GET ALL ORDERS ──────────────────────────────
export const adminGetOrders = asyncHandler(async (req, res) => {
  const { status, vendorId, riderId, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (vendorId) filter.vendor = vendorId;
  if (riderId) filter.rider = riderId;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const orders = await Order.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate("customer", "firstName lastName phone email")
    .populate("vendor", "businessName profileImage")
    .populate("rider", "firstName lastName phone");

  const total = await Order.countDocuments(filter);

  res.json({
    success: true,
    data: {
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    },
  });
});

// ─── 14. ADMIN: GET RECENT ORDERS ───────────────────────────
export const getRecentOrders = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const orders = await Order.find({})
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .populate("customer", "firstName lastName phone email")
    .populate("vendor", "businessName profileImage")
    .populate("rider", "firstName lastName phone");

  res.json({
    success: true,
    data: orders,
  });
});

// ─── 15. ADMIN: GET LIVE ORDERS ─────────────────────────────
export const adminGetLiveOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({
    status: {
      $in: [
        "placed",
        "confirmed",
        "preparing",
        "ready_for_pickup",
        "rider_assigned",
        "picked_up",
        "on_the_way",
      ],
    },
  })
    .populate("vendor", "businessName address location")
    .populate("rider", "firstName lastName phone currentLocation")
    .populate("customer", "firstName lastName phone");

  res.json({
    success: true,
    data: { orders },
  });
});

// ─── 16. ADMIN: UPDATE ORDER STATUS ───────────────────────
export const adminUpdateOrderStatus = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { status, note } = req.body;

  if (!status) {
    throw new ApiError(400, "Status is required");
  }

  const order = await Order.findById(orderId);
  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  const normalizedNote = note?.trim();

  if (status === "cancelled" || status === "rejected") {
    order.cancellation = {
      cancelledBy: "admin",
      reason:
        normalizedNote ||
        (status === "rejected"
          ? "Order rejected by admin"
          : "Order cancelled by admin"),
      cancelledAt: new Date(),
    };
  } else if (normalizedNote) {
    order.vendorNote = normalizedNote;
  }

  await order.updateOrderStatus(status);
  await order.save();

  emitOrderUpdate(req, order);

  res.json({
    success: true,
    message: `Order status updated to ${status}`,
    data: { order },
  });
});

// ─── 17. ADMIN: ASSIGN RIDER TO ORDER ─────────────────────
export const adminAssignOrderRider = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { riderId } = req.body;

  if (!riderId) {
    throw new ApiError(400, "Rider ID is required");
  }

  const order = await Order.findById(orderId);
  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  if (["delivered", "cancelled", "rejected"].includes(order.status)) {
    throw new ApiError(400, "This order cannot be reassigned");
  }

  if (!["ready_for_pickup", "rider_assigned"].includes(order.status)) {
    throw new ApiError(
      400,
      "Order must be ready for pickup before assigning a rider",
    );
  }

  const rider = await Rider.findById(riderId);
  if (!rider) {
    throw new ApiError(404, "Rider not found");
  }

  order.rider = rider._id;

  if (order.status === "ready_for_pickup") {
    await order.updateOrderStatus("rider_assigned");
  }

  const existingDelivery = await Delivery.findOne({ orderId: order._id });
  if (!existingDelivery) {
    const vendor = await Vendor.findById(order.vendor);
    const delivery = new Delivery({
      orderId: order._id,
      riderId: rider._id,
      vendorId: order.vendor,
      customerId: order.customer,
      pickupLocation: vendor?.address?.location || null,
      dropoffLocation: order.deliveryAddress?.location || null,
      status: "assigned",
      estimatedDuration: 30,
      pickupCode: order.pickupCode,
    });
    await delivery.save();
  }

  await order.save();
  emitOrderUpdate(req, order);

  res.json({
    success: true,
    message: "Rider assigned successfully",
    data: { order },
  });
});

// ─── 18. ADMIN: CANCEL ORDER ───────────────────────────────
export const adminCancelOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { reason } = req.body;

  const order = await Order.findById(orderId);
  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  if (["delivered", "cancelled", "rejected"].includes(order.status)) {
    throw new ApiError(400, "This order cannot be cancelled");
  }

  order.cancellation = {
    cancelledBy: "admin",
    reason: reason?.trim() || "Order cancelled by admin",
    cancelledAt: new Date(),
  };

  await order.updateOrderStatus("cancelled");
  await order.save();

  emitOrderUpdate(req, order);

  res.json({
    success: true,
    message: "Order cancelled successfully",
    data: { order },
  });
});

// ─── 16. SERVICE AREA CONTROLLERS ───────────────────────────

// ─── Get all service areas ──────────────────────────────
export const getServiceAreas = asyncHandler(async (req, res) => {
  const { isActive, search } = req.query;
  const filter = {};
  if (isActive !== undefined) filter.isActive = isActive === "true";
  if (search) {
    filter.name = { $regex: search, $options: "i" };
  }

  const areas = await ServiceArea.find(filter)
    .populate("createdBy", "firstName lastName email")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: { areas },
  });
});

// ─── Get single service area ────────────────────────────
export const getServiceAreaById = asyncHandler(async (req, res) => {
  const { areaId } = req.params;
  const area = await ServiceArea.findById(areaId).populate(
    "createdBy",
    "firstName lastName email",
  );
  if (!area) throw new ApiError(404, "Service area not found");

  res.json({
    success: true,
    data: { area },
  });
});

// ─── Create a service area ──────────────────────────────
export const createServiceArea = asyncHandler(async (req, res) => {
  const {
    name,
    latitude,
    longitude,
    radius,
    deliveryCharge,
    minOrderAmount,
    estimatedDeliveryTime,
  } = req.body;

  if (!name) throw new ApiError(400, "Service area name is required");
  if (latitude === undefined || longitude === undefined) {
    throw new ApiError(400, "Latitude and longitude are required");
  }

  const existing = await ServiceArea.findOne({
    name: { $regex: new RegExp(`^${name}$`, "i") },
  });
  if (existing) {
    throw new ApiError(400, "Service area with this name already exists");
  }

  const area = new ServiceArea({
    name,
    location: {
      type: "Point",
      coordinates: [parseFloat(longitude), parseFloat(latitude)],
    },
    radius: radius || 5000,
    deliveryCharge: deliveryCharge || 0,
    minOrderAmount: minOrderAmount || 0,
    estimatedDeliveryTime: estimatedDeliveryTime || 30,
    createdBy: req.admin._id,
  });

  await area.save();

  res.status(201).json({
    success: true,
    message: "Service area created successfully",
    data: { area },
  });
});

// ─── Update a service area ──────────────────────────────
export const updateServiceArea = asyncHandler(async (req, res) => {
  const { areaId } = req.params;
  const updates = req.body;

  const area = await ServiceArea.findById(areaId);
  if (!area) throw new ApiError(404, "Service area not found");

  if (updates.latitude !== undefined && updates.longitude !== undefined) {
    updates.location = {
      type: "Point",
      coordinates: [
        parseFloat(updates.longitude),
        parseFloat(updates.latitude),
      ],
    };
    delete updates.latitude;
    delete updates.longitude;
  }

  if (updates.name && updates.name !== area.name) {
    const existing = await ServiceArea.findOne({
      name: { $regex: new RegExp(`^${updates.name}$`, "i") },
      _id: { $ne: areaId },
    });
    if (existing) {
      throw new ApiError(400, "Service area with this name already exists");
    }
  }

  Object.assign(area, updates);
  await area.save();

  res.json({
    success: true,
    message: "Service area updated successfully",
    data: { area },
  });
});

// ─── Delete a service area ──────────────────────────────
export const deleteServiceArea = asyncHandler(async (req, res) => {
  const { areaId } = req.params;

  const area = await ServiceArea.findById(areaId);
  if (!area) throw new ApiError(404, "Service area not found");

  await area.deleteOne();

  res.json({
    success: true,
    message: "Service area deleted successfully",
  });
});

// ─── Toggle active status ──────────────────────────────
export const toggleServiceAreaStatus = asyncHandler(async (req, res) => {
  const { areaId } = req.params;
  const { isActive } = req.body;

  const area = await ServiceArea.findById(areaId);
  if (!area) throw new ApiError(404, "Service area not found");

  area.isActive = isActive !== undefined ? isActive : !area.isActive;
  await area.save();

  res.json({
    success: true,
    message: `Service area ${area.isActive ? "activated" : "deactivated"}`,
    data: { area },
  });
});

// ─── Check location coverage ────────────────────────────
export const checkServiceAreaCoverage = asyncHandler(async (req, res) => {
  const { latitude, longitude } = req.query;

  if (!latitude || !longitude) {
    throw new ApiError(400, "Latitude and longitude are required");
  }

  const area = await ServiceArea.findOne({
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [parseFloat(longitude), parseFloat(latitude)],
        },
        $maxDistance: 50000,
      },
    },
    isActive: true,
  });

  res.json({
    success: true,
    data: {
      isCovered: !!area,
      area: area || null,
    },
  });
});

// ─── (Legacy) Vendor respond order – kept for backward compatibility ──
// export const vendorRespondOrder = asyncHandler(async (req, res) => {
//   // This is already present in your code; you can keep it or deprecate it.
//   // We'll keep it for now.
//   const { orderId } = req.params;
//   const { action, reason } = req.body;
//   const vendorId = req.user.id;

//   const order = await Order.findOne({ _id: orderId, vendor: vendorId });
//   if (!order) {
//     throw new ApiError(404, "Order not found");
//   }

//   const validActions = ["accept", "reject", "preparing", "ready"];
//   if (!validActions.includes(action)) {
//     throw new ApiError(400, "Invalid action");
//   }

//   const currentStatus = order.status;

//   if (action === "accept") {
//     if (currentStatus !== "placed") {
//       throw new ApiError(400, "Order already processed");
//     }
//     await order.updateOrderStatus("confirmed");
//     emitOrderUpdate(req, order);
//     res.json({ success: true, message: "Order accepted", data: { order } });
//   } else if (action === "reject") {
//     if (currentStatus !== "placed") {
//       throw new ApiError(400, "Order already processed");
//     }
//     order.status = "rejected";
//     order.cancellation = {
//       cancelledBy: "vendor",
//       reason: reason || "Vendor rejected the order",
//       cancelledAt: new Date(),
//     };
//     await order.save();
//     emitOrderUpdate(req, order);
//     res.json({ success: true, message: "Order rejected", data: { order } });
//   } else if (action === "preparing") {
//     if (currentStatus !== "confirmed" && currentStatus !== "placed") {
//       throw new ApiError(400, "Order must be confirmed before preparing");
//     }
//     await order.updateOrderStatus("preparing");
//     emitOrderUpdate(req, order);
//     res.json({
//       success: true,
//       message: "Order is being prepared",
//       data: { order },
//     });
//   } else if (action === "ready") {
//     if (currentStatus !== "preparing") {
//       throw new ApiError(400, "Order must be preparing before marking ready");
//     }
//     await order.updateOrderStatus("ready_for_pickup");

//     const vendor = await Vendor.findById(vendorId);
//     if (vendor?.address?.location?.coordinates) {
//       const rider = await findNearbyRiders(
//         vendor.address.location.coordinates,
//         2,
//         vendorId,
//       );
//       if (rider) {
//         order.rider = rider._id;
//         await order.updateOrderStatus("rider_assigned");
//         const delivery = new Delivery({
//           orderId: order._id,
//           riderId: rider._id,
//           vendorId: vendorId,
//           customerId: order.customer,
//           pickupLocation: vendor.address.location,
//           dropoffLocation: order.deliveryAddress.location,
//           status: "assigned",
//           estimatedDuration: 30,
//           pickupCode: order.pickupCode,
//         });
//         await delivery.save();
//       }
//     }

//     await order.save();
//     emitOrderUpdate(req, order);
//     res.json({
//       success: true,
//       message: "Order ready for pickup",
//       data: { order },
//     });
//   }
// });

export const vendorRespondOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { action, reason } = req.body;
  const vendorId = req.user.id;

  const order = await Order.findOne({ _id: orderId, vendor: vendorId });
  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  const validActions = ["accept", "reject", "preparing", "ready"];
  if (!validActions.includes(action)) {
    throw new ApiError(400, "Invalid action");
  }

  const currentStatus = order.status;

  if (action === "accept") {
    if (currentStatus !== "placed") {
      throw new ApiError(400, "Order already processed");
    }
    await order.updateOrderStatus("confirmed");
    emitOrderUpdate(req, order);
    return res.json({
      success: true,
      message: "Order accepted",
      data: { order },
    });
  }

  if (action === "reject") {
    if (currentStatus !== "placed") {
      throw new ApiError(400, "Order already processed");
    }
    order.status = "rejected";
    order.cancellation = {
      cancelledBy: "vendor",
      reason: reason || "Vendor rejected the order",
      cancelledAt: new Date(),
    };
    await order.save();
    emitOrderUpdate(req, order);
    return res.json({
      success: true,
      message: "Order rejected",
      data: { order },
    });
  }

  if (action === "preparing") {
    if (currentStatus !== "confirmed" && currentStatus !== "placed") {
      throw new ApiError(400, "Order must be confirmed before preparing");
    }
    await order.updateOrderStatus("preparing");
    emitOrderUpdate(req, order);
    return res.json({
      success: true,
      message: "Order is being prepared",
      data: { order },
    });
  }

  if (action === "ready") {
    if (currentStatus !== "preparing") {
      throw new ApiError(400, "Order must be preparing before marking ready");
    }

    // ─── ✅ Generate Delivery OTP ──────────────────────────────
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");
    order.deliveryOTP = hashedOtp;
    order.deliveryOTPExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 min valid

    // 📱 Log or send OTP to customer (SMS/notification integration)
    console.log(`📱 Delivery OTP for Order ${order.orderNumber}: ${otp}`);

    // ─── Mark order as ready ───────────────────────────────────
    await order.updateOrderStatus("ready_for_pickup");

    // Auto‑assign rider (optional)
    const vendor = await Vendor.findById(vendorId);
    if (vendor?.address?.location?.coordinates) {
      const rider = await findNearbyRiders(
        vendor.address.location.coordinates,
        2,
        vendorId,
      );
      if (rider) {
        order.rider = rider._id;
        await order.updateOrderStatus("rider_assigned");
        const delivery = new Delivery({
          orderId: order._id,
          riderId: rider._id,
          vendorId: vendorId,
          customerId: order.customer,
          pickupLocation: vendor.address.location,
          dropoffLocation: order.deliveryAddress.location,
          status: "assigned",
          estimatedDuration: 30,
          pickupCode: order.pickupCode,
        });
        await delivery.save();
      }
    }

    await order.save();
    emitOrderUpdate(req, order);
    return res.json({
      success: true,
      message: "Order ready for pickup",
      data: { order },
    });
  }
});
// ─── RIDER: COMPLETE ORDER WITH OTP ──────────────────────
export const riderCompleteOrderWithOTP = asyncHandler(async (req, res) => {
  const { orderId, otp } = req.body;
  if (!orderId || !otp) {
    throw new ApiError(400, "Order ID and OTP required");
  }

  const riderId = req.user.id;
  const order = await Order.findOne({ _id: orderId, rider: riderId }).select(
    "+deliveryOTP +deliveryOTPExpires",
  );

  if (!order) throw new ApiError(404, "Order not assigned to you");

  if (!["picked_up", "on_the_way"].includes(order.status)) {
    throw new ApiError(400, "Order is not in transit yet");
  }

  if (order.otpVerified) {
    throw new ApiError(400, "OTP already verified for this order");
  }

  const hashedOtp = crypto
    .createHash("sha256")
    .update(String(otp))
    .digest("hex");

  if (
    !order.deliveryOTP ||
    order.deliveryOTP !== hashedOtp ||
    order.deliveryOTPExpires < new Date()
  ) {
    throw new ApiError(400, "Invalid or expired OTP");
  }

  // ✅ OTP verified – complete delivery
  order.otpVerified = true;
  order.status = "delivered";
  order.timeline.deliveredAt = new Date();
  order.deliveryOTP = null;
  order.deliveryOTPExpires = null;
  await order.save();

  // Update Delivery record
  await Delivery.findOneAndUpdate(
    { orderId: order._id },
    { status: "delivered", deliveredAt: new Date() },
  );

  emitOrderUpdate(req, order);

  res.json({
    success: true,
    message: "Order delivered successfully",
    data: { order },
  });
});
