// controllers/riderController.js

import Rider from "../models/rider.js";
import RiderDocument from "../models/RiderDocument.js";
import Order from "../models/order.js";
import Delivery from "../models/Delivery.js";
import { ApiError } from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { generateToken } from "../utils/generateToken.js";
import { calculateDistance } from "../utils/geoUtils.js";
import crypto from "crypto";

// ─── Helper: Get Socket.IO instance ─────────────────────
const getIO = (req) => {
  return req.app?.get("io");
};

// ─── 1. SEND OTP ──────────────────────────────────────────
export const riderSendOtp = asyncHandler(async (req, res) => {
  const { phone } = req.body;
  if (!phone) throw new ApiError(400, "Phone number is required");

  const existing = await Rider.findOne({ phone });
  const otp = String(Math.floor(100000 + Math.random() * 900000));
  const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

  let rider = await Rider.findOne({ phone });
  if (rider) {
    rider.phoneOtp = hashedOtp;
    rider.phoneOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await rider.save();
  } else {
    rider = new Rider({
      phone,
      phoneOtp: hashedOtp,
      phoneOtpExpires: new Date(Date.now() + 10 * 60 * 1000),
      isPhoneVerified: false,
    });
    await rider.save();
  }

  console.log(`📱 OTP for ${phone}: ${otp}`);

  res.json({
    success: true,
    message: "OTP sent successfully",
    data: { riderId: rider._id },
  });
});

// ─── 2. VERIFY OTP ────────────────────────────────────────
export const riderVerifyOtp = asyncHandler(async (req, res) => {
  const { riderId, otp } = req.body;
  if (!riderId || !otp) throw new ApiError(400, "Rider ID and OTP required");

  const rider = await Rider.findById(riderId).select(
    "+phoneOtp +phoneOtpExpires",
  );
  if (!rider) throw new ApiError(404, "Rider not found");

  const hashedOtp = crypto
    .createHash("sha256")
    .update(String(otp))
    .digest("hex");
  if (
    !rider.phoneOtp ||
    rider.phoneOtp !== hashedOtp ||
    rider.phoneOtpExpires < new Date()
  ) {
    throw new ApiError(400, "Invalid or expired OTP");
  }

  // Clear OTP fields
  rider.phoneOtp = null;
  rider.phoneOtpExpires = null;
  rider.isPhoneVerified = true;
  rider.lastLoginAt = new Date();
  await rider.save();

  // Generate token
  const token = generateToken(rider._id, "rider");

  // Check profile completeness
  const isProfileComplete = rider.firstName && rider.lastName && rider.email;

  // Check documents
  const requiredDocs = [
    "aadhaar_front",
    "aadhaar_back",
    "license",
    "vehicle_rc",
    // "profile_photo",
  ];
  const uploadedDocs = await RiderDocument.find({
    riderId: rider._id,
    status: { $in: ["pending", "approved"] },
  });
  const uploadedTypes = uploadedDocs.map((d) => d.type);
  const allDocsSubmitted = requiredDocs.every((type) =>
    uploadedTypes.includes(type),
  );

  // ─── Status-based routing ──────────────────────────────
  if (isProfileComplete && allDocsSubmitted) {
    // Profile and documents complete
    if (rider.approvalStatus === "approved") {
      return res.json({
        success: true,
        action: "home",
        data: { token, rider: rider.toSafeObject() },
      });
    } else if (rider.approvalStatus === "pending") {
      return res.json({
        success: true,
        action: "pending",
        message: "Your application is under review",
        estimatedHours: rider.estimatedApprovalTime || 24,
        data: { token, rider: rider.toSafeObject() },
      });
    } else if (rider.approvalStatus === "rejected") {
      return res.json({
        success: false,
        action: "rejected",
        message: "Your application has been rejected",
        rejectionReason: rider.rejectionReason || "Not specified",
        data: { token, rider: rider.toSafeObject() },
      });
    }
  }

  // ─── Profile incomplete ────────────────────────────────
  if (!isProfileComplete) {
    return res.json({
      success: true,
      action: "create_profile",
      data: { token, riderId: rider._id, phone: rider.phone },
    });
  }

  // ─── Profile complete, but documents not submitted ──────
  if (isProfileComplete && !allDocsSubmitted) {
    return res.json({
      success: true,
      action: "upload_documents",
      data: { token, riderId: rider._id },
    });
  }

  throw new ApiError(500, "Unexpected state");
});

// ─── 3. COMPLETE PROFILE ──────────────────────────────────
export const riderCompleteProfile = asyncHandler(async (req, res) => {
  const {
    riderId,
    firstName,
    lastName,
    email,
    vehicleType,
    vehicleNumber,
    profileImage,
  } = req.body;
  if (!riderId || !firstName || !lastName || !email) {
    throw new ApiError(
      400,
      "Rider ID, first name, last name and email required",
    );
  }

  const rider = await Rider.findById(riderId);
  if (!rider) throw new ApiError(404, "Rider not found");
  if (!rider.isPhoneVerified) {
    throw new ApiError(403, "Phone not verified. Please verify OTP first.");
  }

  const existingEmail = await Rider.findOne({ email, _id: { $ne: riderId } });
  if (existingEmail) throw new ApiError(409, "Email already registered");

  rider.firstName = firstName.trim();
  rider.lastName = lastName.trim();
  rider.email = email.trim().toLowerCase();
  rider.isEmailVerified = true;

  if (vehicleType) rider.vehicle.type = vehicleType;
  if (vehicleNumber) rider.vehicle.number = vehicleNumber.toUpperCase();

  // ✅ Save profile picture URL if provided
  if (profileImage) {
    rider.profilePicture = profileImage; // Make sure your Rider schema has this field
  }

  // Generate default password (user can change later)
  const defaultPassword = Math.random().toString(36).slice(-8);
  rider.password = defaultPassword;

  await rider.save();

  res.json({
    success: true,
    message: "Profile completed. Please upload your documents.",
    data: { riderId: rider._id },
  });
});

// ─── 4. UPLOAD DOCUMENT (individual) ──────────────────────
// ─── 4. UPLOAD DOCUMENT (individual) ──────────────────────
export const riderUploadDocument = asyncHandler(async (req, res) => {
  console.log("📥 Upload request received");
  const riderId = req.body.riderId || req.user?.id;
  if (!riderId) throw new ApiError(400, "Rider ID is required");

  const { type } = req.body;
  if (!req.file) throw new ApiError(400, "File is required");
  if (!type) throw new ApiError(400, "Document type is required");

  const validTypes = [
    "aadhaar_front",
    "aadhaar_back",
    "pan",
    "license",
    "vehicle_rc",
    "insurance",
    "profile_photo", // ✅ now valid
  ];
  if (!validTypes.includes(type)) {
    throw new ApiError(400, "Invalid document type");
  }

  // ✅ Choose folder based on type
  let folder = "riders"; // default for documents
  if (type === "profile_photo") {
    folder = "riders/profiles";
  }
  const fileUrl = `/uploads/${folder}/${req.file.filename}`;

  // ... rest of code (find or create RiderDocument, save)
  let doc = await RiderDocument.findOne({ riderId, type });
  if (doc) {
    doc.fileUrl = fileUrl;
    doc.status = "pending";
    doc.rejectionReason = "";
    doc.verifiedBy = null;
    doc.verifiedAt = null;
  } else {
    doc = new RiderDocument({
      riderId,
      type,
      fileUrl,
      status: "pending",
    });
  }
  await doc.save();

  res.json({
    success: true,
    message: "Document uploaded successfully",
    data: { document: doc },
  });
});

export const riderSubmitDocuments = asyncHandler(async (req, res) => {
  const riderId = req.body.riderId || req.user?.id;
  if (!riderId) {
    throw new ApiError(400, "Rider ID is required");
  }

  const rider = await Rider.findById(riderId);
  if (!rider) throw new ApiError(404, "Rider not found");

  const requiredDocs = [
    "aadhaar_front",
    "aadhaar_back",
    "license",
    "vehicle_rc",
  ];
  const uploadedDocs = await RiderDocument.find({
    riderId,
    status: { $in: ["pending", "approved"] },
  });
  const uploadedTypes = uploadedDocs.map((d) => d.type);
  const allSubmitted = requiredDocs.every((type) =>
    uploadedTypes.includes(type),
  );

  if (!allSubmitted) {
    throw new ApiError(400, "Please upload all required documents");
  }

  rider.documentsSubmitted = true;
  rider.approvalStatus = "pending";
  rider.estimatedApprovalTime = 24;
  await rider.save();

  res.json({
    success: true,
    message: "Documents submitted for verification",
    data: { riderId: rider._id, status: "pending" },
  });
});

// ─── 6. ADMIN: APPROVE / REJECT RIDER ─────────────────────
export const adminUpdateRiderStatus = asyncHandler(async (req, res) => {
  const { riderId, status, rejectionReason } = req.body;
  if (!riderId || !status)
    throw new ApiError(400, "Rider ID and status required");
  if (!["approved", "rejected"].includes(status)) {
    throw new ApiError(400, "Invalid status");
  }

  const rider = await Rider.findById(riderId);
  if (!rider) throw new ApiError(404, "Rider not found");

  rider.approvalStatus = status;
  if (status === "rejected") {
    rider.rejectionReason = rejectionReason || "No reason provided";
  } else {
    rider.rejectionReason = null;
    rider.approvedAt = new Date();
  }
  await rider.save();

  // Update RiderDocument statuses
  await RiderDocument.updateMany(
    { riderId },
    { status: status === "approved" ? "approved" : "rejected" },
  );

  res.json({
    success: true,
    message: `Rider ${status}`,
    data: { rider: rider.toSafeObject() },
  });
});

// ─── 7. RIDER LOGIN (with status check) ────────────────────
export const riderLogin = asyncHandler(async (req, res) => {
  const { phone, password } = req.body;

  const rider = await Rider.findOne({ phone }).select("+password");
  if (!rider) throw new ApiError(401, "Invalid credentials");

  if (!rider.isPhoneVerified) throw new ApiError(403, "Phone not verified");
  if (rider.approvalStatus !== "approved") {
    throw new ApiError(403, `Your account is ${rider.approvalStatus}`);
  }

  const isMatch = await rider.comparePassword(password);
  if (!isMatch) throw new ApiError(401, "Invalid credentials");

  rider.lastLoginAt = new Date();
  await rider.save();

  const token = generateToken(rider._id, "rider");

  res.json({
    success: true,
    data: { token, rider: rider.toSafeObject() },
  });
});

// ─── 8. GET RIDER PROFILE ──────────────────────────────────
export const getRiderProfile = asyncHandler(async (req, res) => {
  const rider = await Rider.findById(req.user.id);
  if (!rider) throw new ApiError(404, "Rider not found");
  res.json({ success: true, data: { rider: rider.toSafeObject() } });
});

// ─── 9. UPDATE LOCATION (with Socket.IO) ──────────────────
export const updateRiderLocation = asyncHandler(async (req, res) => {
  const { latitude, longitude } = req.body;
  if (!latitude || !longitude) {
    throw new ApiError(400, "Latitude and longitude required");
  }

  const rider = await Rider.findById(req.user.id);
  if (!rider) throw new ApiError(404, "Rider not found");

  rider.currentLocation = {
    type: "Point",
    coordinates: [longitude, latitude],
  };
  rider.currentLocation.updatedAt = new Date();
  await rider.save();

  const activeDelivery = await Delivery.findOne({
    riderId: rider._id,
    status: { $in: ["assigned", "picked_up", "in_transit"] },
  }).populate("orderId");

  if (activeDelivery) {
    activeDelivery.currentLocation = {
      type: "Point",
      coordinates: [longitude, latitude],
    };
    await activeDelivery.save();

    const io = getIO(req);
    if (io) {
      const orderId = activeDelivery.orderId?._id || activeDelivery.orderId;
      if (orderId) {
        io.to(orderId.toString()).emit("rider:location", {
          latitude,
          longitude,
          riderId: rider._id,
          riderName: `${rider.firstName} ${rider.lastName}`,
          timestamp: new Date().toISOString(),
        });
      }
    }
  }

  res.json({ success: true, message: "Location updated" });
});

// ─── 10. TOGGLE ONLINE/OFFLINE ──────────────────────────────
export const toggleRiderOnline = asyncHandler(async (req, res) => {
  const { isOnline } = req.body;
  const rider = await Rider.findById(req.user.id);
  rider.isOnline = isOnline;
  rider.isAvailable = isOnline;
  await rider.save();

  res.json({
    success: true,
    message: `Rider is now ${isOnline ? "online" : "offline"}`,
  });
});

// ─── 11. GET RIDER ORDERS ──────────────────────────────────
export const getRiderOrders = asyncHandler(async (req, res) => {
  const riderId = req.user.id;
  const { status } = req.query;

  const filter = { rider: riderId };
  if (status) filter.status = status;

  const orders = await Order.find(filter)
    .sort({ createdAt: -1 })
    .populate("vendor", "businessName address logo") // ← `logo` add किया
    .populate("customer", "firstName lastName phone");

  res.json({ success: true, data: { orders } });
});

// ─── 12. GET NEARBY ORDERS ──────────────────────────────────

export const getNearbyOrders = asyncHandler(async (req, res) => {
  const riderId = req.user.id;
  const rider = await Rider.findById(riderId);
  if (!rider || !rider.currentLocation?.coordinates) {
    throw new ApiError(400, "Rider location not available");
  }

  const [lng, lat] = rider.currentLocation.coordinates;
  console.log(`🗺️ Rider location: [${lng}, ${lat}]`);

  const radius = 10;

  const orders = await Order.find({
    status: "ready_for_pickup",
    // rider: { $exists: false },
    rider: null,
  }).populate("vendor", "businessName address location");

  console.log(`📦 Total ready orders: ${orders.length}`);
  if (orders.length > 0) {
    console.log("Order IDs:", orders.map((o) => o._id.toString()).join(", "));
  } else {
    console.log(
      "⚠️ No orders found with status ready_for_pickup and no rider.",
    );
  }
  const nearbyOrders = orders.filter((order) => {
    const vendorLoc = order.vendor?.address?.location?.coordinates;
    if (!vendorLoc) {
      console.log(`❌ Order ${order._id} has no vendor location`);
      return false;
    }
    const [vLng, vLat] = vendorLoc;
    const dist = calculateDistance(lat, lng, vLat, vLng);
    console.log(`📏 Order ${order._id} distance: ${dist.toFixed(2)} km`);
    return dist <= radius;
  });

  console.log(`✅ Nearby orders: ${nearbyOrders.length}`);

  res.json({
    success: true,
    data: { orders: nearbyOrders },
  });
});
// ─── 13. GET RIDER DOCUMENTS ──────────────────────────────
export const getRiderDocuments = asyncHandler(async (req, res) => {
  const riderId = req.user.id;
  const docs = await RiderDocument.find({ riderId });
  res.json({ success: true, data: { documents: docs } });
});

// ─── 14. LEGACY: RIDER REGISTER (keep for backward compatibility) ──
export const riderRegister = asyncHandler(async (req, res) => {
  const { phone, firstName, lastName } = req.body;

  const existing = await Rider.findOne({ phone });
  if (existing) {
    throw new ApiError(400, "Rider already registered");
  }

  const otp = String(Math.floor(100000 + Math.random() * 900000));
  const rider = new Rider({
    firstName,
    lastName,
    phone,
    isPhoneVerified: false,
    phoneOtp: crypto.createHash("sha256").update(otp).digest("hex"),
    phoneOtpExpires: new Date(Date.now() + 10 * 60 * 1000),
  });
  await rider.save();

  console.log(`OTP for ${phone}: ${otp}`);

  res.json({
    success: true,
    message: "OTP sent to your phone",
    data: { riderId: rider._id },
  });
});

// ─── GET SINGLE ORDER DETAILS FOR RIDER ────────────────
export const getRiderOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const riderId = req.user.id; // comes from protectUser middleware

  if (!orderId) {
    throw new ApiError(400, "Order ID is required");
  }

  // Find the order – you can decide whether to restrict to orders assigned to this rider
  const order = await Order.findOne({ _id: orderId, rider: riderId })
    .populate("vendor", "businessName address location")
    .populate("customer", "firstName lastName phone");

  if (!order) {
    throw new ApiError(404, "Order not found or you are not assigned to it");
  }

  res.json({
    success: true,
    data: { order },
  });
});
// ─── 15. GET RIDER EARNINGS ─────────────────────────────────
// ─── 15. GET RIDER EARNINGS (LIVE) ─────────────────────────
export const getRiderEarnings = asyncHandler(async (req, res) => {
  const riderId = req.user.id;

  // ─── सभी completed deliveries ──────────────────────
  const deliveries = await Delivery.find({
    riderId,
    status: "delivered",
  });

  // ─── Total earnings ────────────────────────────────
  const totalEarnings = deliveries.reduce(
    (sum, d) => sum + (d.deliveryFee || 0) + (d.tip || 0),
    0,
  );

  // ─── Today's earnings ──────────────────────────────
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayDeliveries = deliveries.filter(
    (d) => new Date(d.updatedAt) >= todayStart,
  );
  const todayEarnings = todayDeliveries.reduce(
    (sum, d) => sum + (d.deliveryFee || 0) + (d.tip || 0),
    0,
  );

  // ─── This week's earnings ──────────────────────────
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const weekDeliveries = deliveries.filter(
    (d) => new Date(d.updatedAt) >= weekStart,
  );
  const weekEarnings = weekDeliveries.reduce(
    (sum, d) => sum + (d.deliveryFee || 0) + (d.tip || 0),
    0,
  );

  // ─── Total orders count ─────────────────────────────
  const totalOrders = await Order.countDocuments({ rider: riderId });

  // ─── Average rating ─────────────────────────────────
  const ratings = deliveries.map((d) => d.riderRating || 0);
  const avgRating =
    ratings.length > 0
      ? ratings.reduce((a, b) => a + b, 0) / ratings.length
      : 0;

  res.json({
    success: true,
    data: {
      total: Math.round(totalEarnings * 100) / 100,
      today: Math.round(todayEarnings * 100) / 100,
      week: Math.round(weekEarnings * 100) / 100,
      orders: totalOrders,
      deliveries: deliveries.length,
      rating: Math.round(avgRating * 10) / 10,
    },
  });
});
// ─── UPDATE RIDER PROFILE ──────────────────────────────
export const updateRiderProfile = asyncHandler(async (req, res) => {
  const riderId = req.user.id;
  const { firstName, lastName, phone, email, profileImage } = req.body;

  const rider = await Rider.findById(riderId);
  if (!rider) throw new ApiError(404, "Rider not found");

  if (firstName) rider.firstName = firstName.trim();
  if (lastName) rider.lastName = lastName.trim();
  if (phone) rider.phone = phone.trim();
  if (email) rider.email = email.trim().toLowerCase();
  if (profileImage) rider.profileImage = profileImage; // ✅ important

  await rider.save();

  res.json({
    success: true,
    message: "Profile updated successfully",
    data: { rider: rider.toSafeObject() },
  });
});
