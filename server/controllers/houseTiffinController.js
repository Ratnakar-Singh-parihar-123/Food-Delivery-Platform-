// controllers/houseTiffinController.js

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import TiffinHouse from "../models/TiffinHouse.js";
import Tiffin from "../models/Tiffin.js";
import Order from "../models/order.js";
import DailyMenu from "../models/DailyMenu.js";
import SubscriptionPlan from "../models/SubscriptionPlan.js";
import Transaction from "../models/Transaction.js";
import Payout from "../models/Payout.js";
import Review from "../models/Review.js";
import Notification from "../models/notification.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import Vendor from "../models/vendor.js";

// ─── Helper: Send OTP (mock) ──────────────────────────────
// In production, integrate with SMS/email gateway.
const sendOtpService = (identifier, otp) => {
  console.log(`📱 Sending OTP ${otp} to ${identifier}`);
  // Simulate success
  return true;
};

// Temporary OTP store (use Redis in production)
const otpStore = new Map(); // key: phone/email, value: { otp, expires }

// ─── AUTH CONTROLLERS ──────────────────────────────────────

// sendOtp
export const sendOtp = async (req, res) => {
  try {
    const { phone, email } = req.body;
    const identifier = phone || email;
    if (!identifier) {
      return res
        .status(400)
        .json({ success: false, message: "Phone or email required" });
    }

    // Check if user exists (optional – we send OTP for both login and registration)
    const existing = await TiffinHouse.findOne({ $or: [{ phone }, { email }] });
    // We'll still send OTP regardless

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 5 * 60 * 1000; // 5 min
    otpStore.set(identifier, { otp, expires });

    const sent = sendOtpService(identifier, otp);
    if (!sent) {
      return res
        .status(500)
        .json({ success: false, message: "Failed to send OTP" });
    }

    res.status(200).json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// verifyOtp
export const verifyOtp = async (req, res) => {
  try {
    const { phone, email, otp } = req.body;
    const identifier = phone || email;
    if (!identifier || !otp) {
      return res
        .status(400)
        .json({ success: false, message: "Identifier and OTP required" });
    }

    const stored = otpStore.get(identifier);
    if (!stored || stored.otp !== otp || Date.now() > stored.expires) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP" });
    }

    // Find or create user
    let tiffinHouse = await TiffinHouse.findOne({
      $or: [{ phone }, { email }],
    });
    if (!tiffinHouse) {
      // Create a minimal user – they will complete profile later
      tiffinHouse = new TiffinHouse({
        phone: phone || "",
        email: email || "",
        ownerFirstName: "",
        ownerLastName: "",
        businessName: "",
      });
      await tiffinHouse.save();
    }

    // Generate JWT
    const token = jwt.sign(
      { id: tiffinHouse._id, role: "tiffinHouse" },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "30d" },
    );

    // Clear OTP
    otpStore.delete(identifier);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: tiffinHouse._id,
        email: tiffinHouse.email,
        phone: tiffinHouse.phone,
        name:
          `${tiffinHouse.ownerFirstName} ${tiffinHouse.ownerLastName}`.trim() ||
          "",
        hasProfile: !!(tiffinHouse.ownerFirstName && tiffinHouse.businessName),
      },
      message: "Login successful",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// resendOtp
export const resendOtp = async (req, res) => {
  try {
    const { phone, email } = req.body;
    const identifier = phone || email;
    if (!identifier) {
      return res
        .status(400)
        .json({ success: false, message: "Phone or email required" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 5 * 60 * 1000;
    otpStore.set(identifier, { otp, expires });

    const sent = sendOtpService(identifier, otp);
    if (!sent) {
      return res
        .status(500)
        .json({ success: false, message: "Failed to send OTP" });
    }

    res.status(200).json({ success: true, message: "OTP resent successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// logout
export const logout = async (req, res) => {
  // JWT is stateless; client discards token.
  res.status(200).json({ success: true, message: "Logged out successfully" });
};

// ─── PROFILE CONTROLLERS ────────────────────────────────────

// createProfile (complete profile after OTP login)
export const createProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      ownerFirstName,
      ownerLastName,
      businessName,
      email,
      phone,
      address,
      location,
    } = req.body;

    const tiffinHouse = await TiffinHouse.findById(userId);
    if (!tiffinHouse) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (ownerFirstName) tiffinHouse.ownerFirstName = ownerFirstName;
    if (ownerLastName) tiffinHouse.ownerLastName = ownerLastName;
    if (businessName) tiffinHouse.businessName = businessName;
    if (email) tiffinHouse.email = email;
    if (phone) tiffinHouse.phone = phone;
    if (address) tiffinHouse.address = address;
    if (location) {
      tiffinHouse.location = {
        type: "Point",
        coordinates: [location.lng, location.lat],
      };
    }

    await tiffinHouse.save();

    res
      .status(201)
      .json({ success: true, message: "Profile created", data: tiffinHouse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// getProfile
export const getProfile = async (req, res) => {
  try {
    const tiffinHouse = await TiffinHouse.findById(req.user._id).select(
      "-password",
    );
    if (!tiffinHouse) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, data: tiffinHouse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// updateProfile
export const updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    delete updates.password;
    delete updates._id;

    const tiffinHouse = await TiffinHouse.findByIdAndUpdate(
      req.user._id,
      { $set: updates, updatedAt: Date.now() },
      { new: true, runValidators: true },
    ).select("-password");

    if (!tiffinHouse) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Profile updated", data: tiffinHouse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// uploadProfileImage (assumes multer has uploaded file to req.file)
export const uploadProfileImage = async (req, res) => {
  try {
    const imageUrl = req.file?.path || req.body.imageUrl;
    if (!imageUrl) {
      return res
        .status(400)
        .json({ success: false, message: "No image provided" });
    }

    const tiffinHouse = await TiffinHouse.findByIdAndUpdate(
      req.user._id,
      { profileImage: imageUrl, updatedAt: Date.now() },
      { new: true },
    );

    res.status(200).json({
      success: true,
      message: "Profile image uploaded",
      data: tiffinHouse,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// deleteProfileImage
export const deleteProfileImage = async (req, res) => {
  try {
    const tiffinHouse = await TiffinHouse.findByIdAndUpdate(
      req.user._id,
      { $unset: { profileImage: "" }, updatedAt: Date.now() },
      { new: true },
    );
    res.status(200).json({
      success: true,
      message: "Profile image removed",
      data: tiffinHouse,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── LOCATION & ADDRESS ─────────────────────────────────────

// updateLocation (coordinates)
export const updateLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;
    if (!lat || !lng) {
      return res
        .status(400)
        .json({ success: false, message: "Latitude and longitude required" });
    }

    const tiffinHouse = await TiffinHouse.findByIdAndUpdate(
      req.user._id,
      {
        location: { type: "Point", coordinates: [lng, lat] },
        updatedAt: Date.now(),
      },
      { new: true },
    );

    res
      .status(200)
      .json({ success: true, message: "Location updated", data: tiffinHouse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// getLocation
export const getLocation = async (req, res) => {
  try {
    const tiffinHouse = await TiffinHouse.findById(req.user._id).select(
      "location",
    );
    res.status(200).json({ success: true, data: tiffinHouse.location });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// updateAddress
export const updateAddress = async (req, res) => {
  try {
    const address = req.body;
    const tiffinHouse = await TiffinHouse.findByIdAndUpdate(
      req.user._id,
      { address, updatedAt: Date.now() },
      { new: true },
    );
    res
      .status(200)
      .json({ success: true, message: "Address updated", data: tiffinHouse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// getAddress
export const getAddress = async (req, res) => {
  try {
    const tiffinHouse = await TiffinHouse.findById(req.user._id).select(
      "address",
    );
    res.status(200).json({ success: true, data: tiffinHouse.address });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── KITCHEN CONTROLLERS ────────────────────────────────────
// (We'll treat kitchen as part of TiffinHouse – simple wrappers)

export const createKitchen = async (req, res) => {
  // Update business details – reuse updateProfile
  res
    .status(200)
    .json({ success: true, message: "Kitchen setup done via profile" });
};

export const updateKitchen = async (req, res) => {
  // Similar to updateProfile – maybe update businessName, description, etc.
  res.status(200).json({ success: true, message: "Kitchen updated" });
};

export const getKitchen = async (req, res) => {
  const tiffinHouse = await TiffinHouse.findById(req.user._id).select(
    "businessName description address",
  );
  res.status(200).json({ success: true, data: tiffinHouse });
};

// ─── TIFFIN (MENU) CONTROLLERS ─────────────────────────────

// createTiffin
export const createTiffin = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      image,
      category,
      isAvailable,
      mealType,
      isSubscriptionItem,
      calories,
      preparationTime,
    } = req.body;
    if (!name || !price) {
      return res
        .status(400)
        .json({ success: false, message: "Name and price are required" });
    }

    const tiffin = new Tiffin({
      tiffinHouse: req.user._id,
      name,
      description,
      price,
      image,
      category,
      isAvailable,
      mealType,
      isSubscriptionItem,
      calories,
      preparationTime,
    });

    await tiffin.save();
    res
      .status(201)
      .json({ success: true, message: "Tiffin created", data: tiffin });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// getMyTiffins
export const getMyTiffins = async (req, res) => {
  try {
    const tiffins = await Tiffin.find({ tiffinHouse: req.user._id });
    res.status(200).json({ success: true, data: tiffins });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// getTiffinById
export const getTiffinById = async (req, res) => {
  try {
    const { id } = req.params;
    const tiffin = await Tiffin.findOne({ _id: id, tiffinHouse: req.user._id });
    if (!tiffin) {
      return res
        .status(404)
        .json({ success: false, message: "Tiffin not found" });
    }
    res.status(200).json({ success: true, data: tiffin });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// updateTiffin
export const updateTiffin = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const tiffin = await Tiffin.findOneAndUpdate(
      { _id: id, tiffinHouse: req.user._id },
      { $set: updates, updatedAt: Date.now() },
      { new: true, runValidators: true },
    );
    if (!tiffin) {
      return res
        .status(404)
        .json({ success: false, message: "Tiffin not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Tiffin updated", data: tiffin });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// deleteTiffin
export const deleteTiffin = async (req, res) => {
  try {
    const { id } = req.params;
    const tiffin = await Tiffin.findOneAndDelete({
      _id: id,
      tiffinHouse: req.user._id,
    });
    if (!tiffin) {
      return res
        .status(404)
        .json({ success: false, message: "Tiffin not found" });
    }
    res.status(200).json({ success: true, message: "Tiffin deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// toggleTiffinAvailability
export const toggleTiffinAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const tiffin = await Tiffin.findOne({ _id: id, tiffinHouse: req.user._id });
    if (!tiffin) {
      return res
        .status(404)
        .json({ success: false, message: "Tiffin not found" });
    }
    tiffin.isAvailable = !tiffin.isAvailable;
    await tiffin.save();
    res.status(200).json({
      success: true,
      message: `Tiffin ${tiffin.isAvailable ? "enabled" : "disabled"}`,
      data: tiffin,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── DAILY MENU ─────────────────────────────────────────────

// setDailyMenu – create or update menu for a specific date
export const setDailyMenu = async (req, res) => {
  try {
    const { date, items } = req.body;
    if (!date) {
      return res
        .status(400)
        .json({ success: false, message: "Date is required" });
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "At least one menu item required" });
    }

    const dateObj = new Date(date);
    dateObj.setHours(0, 0, 0, 0);

    const updatedMenu = await DailyMenu.findOneAndUpdate(
      { vendorId: req.user._id, date: dateObj },
      { items, updatedAt: Date.now() },
      { new: true, upsert: true, runValidators: true },
    );

    res
      .status(200)
      .json({ success: true, message: "Daily menu saved", data: updatedMenu });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// getDailyMenu – get menu for a specific date (or today)
export const getDailyMenu = async (req, res) => {
  try {
    const { date } = req.query;
    let targetDate = new Date();
    if (date) {
      targetDate = new Date(date);
    }
    targetDate.setHours(0, 0, 0, 0);

    const menu = await DailyMenu.findOne({
      vendorId: req.user._id,
      date: targetDate,
    });
    if (!menu) {
      return res
        .status(404)
        .json({ success: false, message: "No menu for this date" });
    }
    res.status(200).json({ success: true, data: menu });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── MEAL TIMINGS & WEEKLY AVAILABILITY ────────────────────

export const updateMealTimings = async (req, res) => {
  try {
    const { breakfast, lunch, dinner } = req.body;
    const tiffinHouse = await TiffinHouse.findByIdAndUpdate(
      req.user._id,
      { mealTimings: { breakfast, lunch, dinner }, updatedAt: Date.now() },
      { new: true },
    );
    res.status(200).json({
      success: true,
      message: "Meal timings updated",
      data: tiffinHouse,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateWeeklyAvailability = async (req, res) => {
  try {
    const { monday, tuesday, wednesday, thursday, friday, saturday, sunday } =
      req.body;
    const tiffinHouse = await TiffinHouse.findByIdAndUpdate(
      req.user._id,
      {
        weeklyAvailability: {
          monday,
          tuesday,
          wednesday,
          thursday,
          friday,
          saturday,
          sunday,
        },
        updatedAt: Date.now(),
      },
      { new: true },
    );
    res.status(200).json({
      success: true,
      message: "Weekly availability updated",
      data: tiffinHouse,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── KYC ─────────────────────────────────────────────────────

export const uploadKyc = async (req, res) => {
  try {
    const {
      panNumber,
      panImage,
      aadhaarNumber,
      aadhaarImage,
      gstNumber,
      businessLicense,
    } = req.body;
    const tiffinHouse = await TiffinHouse.findById(req.user._id);
    if (!tiffinHouse) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    tiffinHouse.kyc = {
      panNumber,
      panImage,
      aadhaarNumber,
      aadhaarImage,
      gstNumber,
      businessLicense,
      status: "pending",
      submittedAt: new Date(),
    };
    await tiffinHouse.save();

    res.status(200).json({
      success: true,
      message: "KYC submitted for verification",
      data: tiffinHouse.kyc,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getKycStatus = async (req, res) => {
  try {
    const tiffinHouse = await TiffinHouse.findById(req.user._id).select("kyc");
    res.status(200).json({ success: true, data: tiffinHouse.kyc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateKyc = async (req, res) => {
  try {
    const updates = req.body;
    const tiffinHouse = await TiffinHouse.findByIdAndUpdate(
      req.user._id,
      { $set: { kyc: updates }, updatedAt: Date.now() },
      { new: true },
    );
    res
      .status(200)
      .json({ success: true, message: "KYC updated", data: tiffinHouse.kyc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── BANK DETAILS ──────────────────────────────────────────

export const addBankDetails = async (req, res) => {
  try {
    const { accountHolderName, bankName, accountNumber, ifscCode, upiId } =
      req.body;
    if (!accountNumber || !ifscCode) {
      return res
        .status(400)
        .json({ success: false, message: "Account number and IFSC required" });
    }
    const tiffinHouse = await TiffinHouse.findByIdAndUpdate(
      req.user._id,
      {
        bankDetails: {
          accountHolderName,
          bankName,
          accountNumber,
          ifscCode,
          upiId,
        },
        updatedAt: Date.now(),
      },
      { new: true },
    );
    res.status(200).json({
      success: true,
      message: "Bank details added",
      data: tiffinHouse.bankDetails,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateBankDetails = async (req, res) => {
  try {
    const updates = req.body;
    const tiffinHouse = await TiffinHouse.findByIdAndUpdate(
      req.user._id,
      { $set: { bankDetails: updates }, updatedAt: Date.now() },
      { new: true },
    );
    res.status(200).json({
      success: true,
      message: "Bank details updated",
      data: tiffinHouse.bankDetails,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getBankDetails = async (req, res) => {
  try {
    const tiffinHouse = await TiffinHouse.findById(req.user._id).select(
      "bankDetails",
    );
    res.status(200).json({ success: true, data: tiffinHouse.bankDetails });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── ONLINE STATUS ─────────────────────────────────────────

export const updateOnlineStatus = async (req, res) => {
  try {
    const { isOnline } = req.body;
    const tiffinHouse = await TiffinHouse.findByIdAndUpdate(
      req.user._id,
      { isOnline, updatedAt: Date.now() },
      { new: true },
    );
    res.status(200).json({
      success: true,
      message: `Online status set to ${isOnline}`,
      data: tiffinHouse,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOnlineStatus = async (req, res) => {
  try {
    const tiffinHouse = await TiffinHouse.findById(req.user._id).select(
      "isOnline",
    );
    res.status(200).json({ success: true, data: tiffinHouse.isOnline });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── ORDERS ──────────────────────────────────────────────────

// getNewOrders (pending)
export const getNewOrders = async (req, res) => {
  try {
    const orders = await Order.find({ vendor: req.user._id, status: "placed" })
      .populate("customer", "name phone")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// getMyOrders (all orders)
export const getMyOrders = async (req, res) => {
  try {
    const { status, limit = 50, page = 1 } = req.query;
    const filter = { vendor: req.user._id };
    if (status) filter.status = status;

    const orders = await Order.find(filter)
      .populate("customer", "name phone")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    const total = await Order.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: orders,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// getOrderById
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findOne({ _id: id, vendor: req.user._id })
      .populate("customer", "name phone email")
      .populate("items.product", "name price image");
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// acceptOrder
export const acceptOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findOne({
      _id: id,
      vendor: req.user._id,
      status: "placed",
    });
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found or not pending" });
    }

    await order.updateOrderStatus("confirmed");
    await order.calculateCommission(10); // example commission

    // Create notification for customer
    await Notification.create({
      vendor: req.user._id,
      customer: order.customer,
      order: order._id,
      title: "Order Accepted",
      message: `Your order #${order.orderNumber} has been accepted and is being prepared.`,
      type: "order",
      data: { status: "confirmed" },
    });

    res
      .status(200)
      .json({ success: true, message: "Order accepted", data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// rejectOrder
export const rejectOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const order = await Order.findOne({
      _id: id,
      vendor: req.user._id,
      status: "placed",
    });
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found or not pending" });
    }

    await order.updateOrderStatus("rejected");
    order.cancellation = {
      cancelledBy: "vendor",
      reason: reason || "Rejected by vendor",
      cancelledAt: new Date(),
    };
    await order.save();

    // Notify customer
    await Notification.create({
      vendor: req.user._id,
      customer: order.customer,
      order: order._id,
      title: "Order Rejected",
      message: `Your order #${order.orderNumber} has been rejected. Reason: ${reason || "No reason provided"}`,
      type: "order",
      data: { status: "rejected" },
    });

    res
      .status(200)
      .json({ success: true, message: "Order rejected", data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// updateOrderStatus
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowed = [
      "preparing",
      "ready_for_pickup",
      "rider_assigned",
      "picked_up",
      "on_the_way",
      "delivered",
    ];
    if (!allowed.includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status" });
    }

    const order = await Order.findOne({ _id: id, vendor: req.user._id });
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // Use the model's method
    await order.updateOrderStatus(status);

    // If delivered, create transaction
    if (status === "delivered") {
      const transaction = new Transaction({
        tiffinHouse: req.user._id,
        order: order._id,
        amount: order.pricing.grandTotal,
        type: "credit",
        description: `Order #${order.orderNumber} delivered`,
        status: "completed",
      });
      await transaction.save();

      // Update tiffinHouse stats
      await TiffinHouse.findByIdAndUpdate(req.user._id, {
        $inc: { totalOrders: 1, totalEarnings: order.pricing.grandTotal },
      });
    }

    // Create notification
    await Notification.create({
      vendor: req.user._id,
      customer: order.customer,
      order: order._id,
      title: `Order ${status.replace(/_/g, " ")}`,
      message: `Your order #${order.orderNumber} is now ${status.replace(/_/g, " ")}.`,
      type: "order",
      data: { status },
    });

    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      data: order,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// cancelOrder (by tiffin house)
export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const order = await Order.findOne({ _id: id, vendor: req.user._id });
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    if (["delivered", "cancelled"].includes(order.status)) {
      return res
        .status(400)
        .json({ success: false, message: "Order cannot be cancelled" });
    }

    await order.updateOrderStatus("cancelled");
    order.cancellation = {
      cancelledBy: "vendor",
      reason: reason || "Cancelled by vendor",
      cancelledAt: new Date(),
    };
    await order.save();

    await Notification.create({
      vendor: req.user._id,
      customer: order.customer,
      order: order._id,
      title: "Order Cancelled",
      message: `Your order #${order.orderNumber} has been cancelled by the vendor.`,
      type: "order",
      data: { status: "cancelled" },
    });

    res
      .status(200)
      .json({ success: true, message: "Order cancelled", data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── SUBSCRIPTION PLANS ────────────────────────────────────

export const createSubscriptionPlan = async (req, res) => {
  try {
    const { name, description, price, duration, mealsPerDay, includes } =
      req.body;
    if (!name || !price || !duration) {
      return res.status(400).json({
        success: false,
        message: "Name, price, and duration required",
      });
    }
    const plan = new SubscriptionPlan({
      tiffinHouse: req.user._id,
      name,
      description,
      price,
      duration,
      mealsPerDay: mealsPerDay || 1,
      includes: includes || [],
    });
    await plan.save();
    res.status(201).json({
      success: true,
      message: "Subscription plan created",
      data: plan,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSubscriptionPlans = async (req, res) => {
  try {
    const plans = await SubscriptionPlan.find({
      tiffinHouse: req.user._id,
      isActive: true,
    });
    res.status(200).json({ success: true, data: plans });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSubscriptionPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const plan = await SubscriptionPlan.findOneAndUpdate(
      { _id: id, tiffinHouse: req.user._id },
      { $set: updates, updatedAt: Date.now() },
      { new: true },
    );
    if (!plan) {
      return res
        .status(404)
        .json({ success: false, message: "Plan not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Plan updated", data: plan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteSubscriptionPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await SubscriptionPlan.findOneAndDelete({
      _id: id,
      tiffinHouse: req.user._id,
    });
    if (!plan) {
      return res
        .status(404)
        .json({ success: false, message: "Plan not found" });
    }
    res.status(200).json({ success: true, message: "Plan deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const pauseSubscription = async (req, res) => {
  try {
    const { pauseUntil } = req.body;
    if (!pauseUntil) {
      return res
        .status(400)
        .json({ success: false, message: "Pause until date required" });
    }
    const tiffinHouse = await TiffinHouse.findById(req.user._id);
    if (!tiffinHouse) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    if (tiffinHouse.subscriptionStatus !== "active") {
      return res
        .status(400)
        .json({ success: false, message: "Subscription is not active" });
    }
    tiffinHouse.subscriptionStatus = "paused";
    tiffinHouse.subscriptionPausedUntil = new Date(pauseUntil);
    tiffinHouse.updatedAt = Date.now();
    await tiffinHouse.save();
    res.status(200).json({
      success: true,
      message: "Subscription paused",
      data: tiffinHouse,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const resumeSubscription = async (req, res) => {
  try {
    const tiffinHouse = await TiffinHouse.findById(req.user._id);
    if (!tiffinHouse) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    if (tiffinHouse.subscriptionStatus !== "paused") {
      return res
        .status(400)
        .json({ success: false, message: "Subscription is not paused" });
    }
    tiffinHouse.subscriptionStatus = "active";
    tiffinHouse.subscriptionPausedUntil = undefined;
    tiffinHouse.updatedAt = Date.now();
    await tiffinHouse.save();
    res.status(200).json({
      success: true,
      message: "Subscription resumed",
      data: tiffinHouse,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const cancelSubscription = async (req, res) => {
  try {
    const tiffinHouse = await TiffinHouse.findById(req.user._id);
    if (!tiffinHouse) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    tiffinHouse.subscriptionStatus = "cancelled";
    tiffinHouse.updatedAt = Date.now();
    await tiffinHouse.save();
    res.status(200).json({
      success: true,
      message: "Subscription cancelled",
      data: tiffinHouse,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── EARNINGS & TRANSACTIONS ──────────────────────────────

export const getTodayEarnings = async (req, res) => {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const result = await Transaction.aggregate([
      {
        $match: {
          tiffinHouse: req.user._id,
          type: "credit",
          status: "completed",
          createdAt: { $gte: start, $lte: end },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const todayEarnings = result.length ? result[0].total : 0;
    res.status(200).json({ success: true, data: { todayEarnings } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getWeeklyEarnings = async (req, res) => {
  try {
    const start = new Date();
    start.setDate(start.getDate() - 7);
    const result = await Transaction.aggregate([
      {
        $match: {
          tiffinHouse: req.user._id,
          type: "credit",
          status: "completed",
          createdAt: { $gte: start },
        },
      },
      {
        $group: {
          _id: { $dayOfWeek: "$createdAt" },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const weeklyEarnings = result.reduce((acc, cur) => acc + cur.total, 0);
    res
      .status(200)
      .json({ success: true, data: { weeklyEarnings, breakdown: result } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMonthlyEarnings = async (req, res) => {
  try {
    const start = new Date();
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    const result = await Transaction.aggregate([
      {
        $match: {
          tiffinHouse: req.user._id,
          type: "credit",
          status: "completed",
          createdAt: { $gte: start },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const monthlyEarnings = result.length ? result[0].total : 0;
    res.status(200).json({ success: true, data: { monthlyEarnings } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTotalEarnings = async (req, res) => {
  try {
    const result = await Transaction.aggregate([
      {
        $match: {
          tiffinHouse: req.user._id,
          type: "credit",
          status: "completed",
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalEarnings = result.length ? result[0].total : 0;
    res.status(200).json({ success: true, data: { totalEarnings } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTransactions = async (req, res) => {
  try {
    const { limit = 50, page = 1 } = req.query;
    const transactions = await Transaction.find({ tiffinHouse: req.user._id })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    const total = await Transaction.countDocuments({
      tiffinHouse: req.user._id,
    });
    res.status(200).json({
      success: true,
      data: transactions,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── PAYOUTS ─────────────────────────────────────────────────

export const getPayoutHistory = async (req, res) => {
  try {
    const payouts = await Payout.find({ tiffinHouse: req.user._id }).sort({
      requestDate: -1,
    });
    res.status(200).json({ success: true, data: payouts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPendingPayout = async (req, res) => {
  try {
    const payout = await Payout.findOne({
      tiffinHouse: req.user._id,
      status: "pending",
    });
    res.status(200).json({ success: true, data: payout || null });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const requestPayout = async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Valid amount required" });
    }

    // Check if pending payout exists
    const existing = await Payout.findOne({
      tiffinHouse: req.user._id,
      status: "pending",
    });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "You already have a pending payout request",
      });
    }

    // Check bank details
    const tiffinHouse = await TiffinHouse.findById(req.user._id).select(
      "bankDetails",
    );
    if (!tiffinHouse.bankDetails || !tiffinHouse.bankDetails.accountNumber) {
      return res
        .status(400)
        .json({ success: false, message: "Please add bank details first" });
    }

    const payout = new Payout({
      tiffinHouse: req.user._id,
      amount,
      bankDetails: tiffinHouse.bankDetails,
      status: "pending",
      requestDate: new Date(),
    });
    await payout.save();

    res
      .status(201)
      .json({ success: true, message: "Payout requested", data: payout });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── REVIEWS & RATINGS ──────────────────────────────────────

export const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ tiffinHouse: req.user._id })
      .populate("customer", "name")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyRating = async (req, res) => {
  try {
    const result = await Review.aggregate([
      { $match: { tiffinHouse: req.user._id } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          total: { $sum: 1 },
        },
      },
    ]);
    const rating = result.length
      ? { average: result[0].averageRating, total: result[0].total }
      : { average: 0, total: 0 };
    res.status(200).json({ success: true, data: rating });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── NOTIFICATIONS ──────────────────────────────────────────

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ vendor: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOneAndUpdate(
      { _id: id, vendor: req.user._id },
      { isRead: true, readAt: new Date() },
      { new: true },
    );
    if (!notification) {
      return res
        .status(404)
        .json({ success: false, message: "Notification not found" });
    }
    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markAllNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { vendor: req.user._id, isRead: false },
      { isRead: true, readAt: new Date() },
    );
    res
      .status(200)
      .json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── DASHBOARD ──────────────────────────────────────────────

export const getDashboard = async (req, res) => {
  try {
    const tiffinHouse = await TiffinHouse.findById(req.user._id).select(
      "totalOrders totalEarnings rating isOnline",
    );

    // Today's orders
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const todayOrders = await Order.countDocuments({
      vendor: req.user._id,
      createdAt: { $gte: start, $lte: end },
    });
    const pendingOrders = await Order.countDocuments({
      vendor: req.user._id,
      status: "placed",
    });
    const totalTiffins = await Tiffin.countDocuments({
      tiffinHouse: req.user._id,
    });

    // Recent orders
    const recentOrders = await Order.find({ vendor: req.user._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("customer", "name");

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalOrders: tiffinHouse.totalOrders || 0,
          totalEarnings: tiffinHouse.totalEarnings || 0,
          rating: tiffinHouse.rating || 0,
          isOnline: tiffinHouse.isOnline || false,
          todayOrders,
          pendingOrders,
          totalTiffins,
        },
        recentOrders,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET NEARBY TIFFIN HOUSES (Public) ──────────────────────

export const getNearbyTiffinHouses = asyncHandler(async (req, res) => {
  const { lat, lng, radius = 10, limit = 20, sortBy = "distance" } = req.query;

  // ─── Validate coordinates ──────────────────────────────────
  if (lat === undefined || lng === undefined) {
    throw new ApiError(400, "Latitude and longitude are required");
  }

  const latitude = Number(lat);
  const longitude = Number(lng);
  const parsedRadiusKm = Number(radius);
  const parsedLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    throw new ApiError(400, "Invalid latitude or longitude");
  }

  if (!Number.isFinite(parsedRadiusKm) || parsedRadiusKm <= 0) {
    throw new ApiError(400, "Invalid radius");
  }

  // ─── Aggregation Pipeline ──────────────────────────────────
  const pipeline = [
    {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [longitude, latitude],
        },
        key: "location",
        distanceField: "distance",
        distanceMultiplier: 0.001,
        maxDistance: parsedRadiusKm * 1000,
        spherical: true,
        // ✅ Remove `isOnline` filter for testing – comment out to see all tiffin houses
        query: {
          // isOnline: true,  // <-- temporarily removed
          // businessType: { $in: ["tiffin", "tiffin_center", "tiffin house", "tiffinHouse"] },
          // Use a more flexible filter: just check if businessType contains "tiffin"
          businessType: { $regex: /tiffin/i }, // case‑insensitive match
        },
      },
    },
    {
      $project: {
        ownerFirstName: 1,
        ownerLastName: 1,
        businessName: 1,
        businessType: 1,
        description: 1,
        profileImage: 1,
        rating: 1,
        totalOrders: 1,
        address: 1,
        location: 1,
        isOnline: 1,
        mealTimings: 1,
        weeklyAvailability: 1,
        distance: 1,
      },
    },
    {
      $sort:
        sortBy === "rating" ? { rating: -1, distance: 1 } : { distance: 1 },
    },
    {
      $limit: parsedLimit,
    },
  ];

  const vendors = await TiffinHouse.aggregate(pipeline);

  // ─── Debug log ─────────────────────────────────────────────
  console.log(
    `🔍 Found ${vendors.length} tiffin houses within ${parsedRadiusKm} km`,
  );

  res.status(200).json({
    success: true,
    data: {
      vendors,
      pagination: {
        total: vendors.length,
        limit: parsedLimit,
        radius: parsedRadiusKm,
      },
    },
  });
});
