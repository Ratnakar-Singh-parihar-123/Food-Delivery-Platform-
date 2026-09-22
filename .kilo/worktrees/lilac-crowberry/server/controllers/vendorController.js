// controllers/vendorAuthController.js

import fs from "fs";
import path from "path";
import axios from "axios";

import Vendor from "../models/vendor.js";
import MenuItem from "../models/MenuItem.js";
import Category from "../models/VendorCategory.js"; // vendor‑specific categories
import FoodCategory from "../models/FoodCategory.js"; // global categories
import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { generateVendorToken } from "../utils/generateToken.js";
import { sendEmailOtp } from "../services/email.js";

// ─── Cookie options ──────────────────────────────────────
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

// ─── Format vendor object for response ──────────────────
const formatVendor = (vendor) => {
  const address = vendor.address || {};
  const bankDetails = vendor.bankDetails || {};
  return {
    id: vendor._id,
    ownerFirstName: vendor.ownerFirstName || "",
    ownerLastName: vendor.ownerLastName || "",
    email: vendor.email || "",
    phone: vendor.phone || "",
    businessName: vendor.businessName || "",
    businessType: vendor.businessType || "",
    foodType: vendor.foodType || "veg_non_veg",
    description: vendor.description || "",
    profileImage: vendor.profileImage || "",
    coverImage: vendor.coverImage || "",
    address: {
      addressLine: address.addressLine || "",
      landmark: address.landmark || "",
      city: address.city || "",
      state: address.state || "",
      pincode: address.pincode || "",
      location: address.location || null,
    },
    timings: vendor.timings || [],
    approvalStatus: vendor.approvalStatus || "pending",
    rejectionReason: vendor.rejectionReason || "",
    isEmailVerified: vendor.isEmailVerified || false,
    isActive: vendor.isActive !== undefined ? vendor.isActive : true,
    isBlocked: vendor.isBlocked || false,
    isOnline: vendor.isOnline || false,
    acceptingOrders: vendor.acceptingOrders || false,
    commissionPercentage: vendor.commissionPercentage || 15,
    minimumOrderAmount: vendor.minimumOrderAmount || 0,
    averagePreparationTime: vendor.averagePreparationTime || 30,
    rating: vendor.rating || 0,
    totalRatings: vendor.totalRatings || 0,
    totalOrders: vendor.totalOrders || 0,
    completedOrders: vendor.completedOrders || 0,
    totalRevenue: vendor.totalRevenue || 0,
    lastLoginAt: vendor.lastLoginAt || null,
    createdAt: vendor.createdAt || null,
    updatedAt: vendor.updatedAt || null,
    bankDetails: {
      accountHolderName: bankDetails.accountHolderName || "",
      accountNumber: bankDetails.accountNumber || "",
      ifscCode: bankDetails.ifscCode || "",
      bankName: bankDetails.bankName || "",
      upiId: bankDetails.upiId || "",
      isVerified: bankDetails.isVerified || false,
    },
  };
};

// ─── Helper – Fetch address from coordinates ────────────
const fetchAddressFromCoords = async (latitude, longitude) => {
  const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
  if (GOOGLE_API_KEY) {
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_API_KEY}`;
      const response = await axios.get(url);
      if (response.data.status === "OK" && response.data.results.length > 0) {
        const result = response.data.results[0];
        const components = result.address_components;
        let city = "",
          state = "",
          pincode = "",
          addressLine = "",
          landmark = "";
        components.forEach((comp) => {
          const types = comp.types;
          if (types.includes("locality")) city = comp.long_name;
          if (types.includes("administrative_area_level_1"))
            state = comp.long_name;
          if (types.includes("postal_code")) pincode = comp.long_name;
          if (types.includes("route")) addressLine = comp.long_name;
          if (types.includes("point_of_interest")) landmark = comp.long_name;
        });
        return {
          city,
          state,
          pincode,
          addressLine: addressLine || result.formatted_address || "",
          landmark,
        };
      }
    } catch (error) {
      console.warn("Google Geocoding failed:", error.message);
    }
  }
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;
    const response = await axios.get(url, {
      headers: { "User-Agent": "KhaoJiApp/1.0 (https://khaoji.in)" },
      timeout: 10000,
    });
    const data = response.data;
    if (data && data.address) {
      const addr = data.address;
      return {
        city: addr.city || addr.town || addr.village || "",
        state: addr.state || "",
        pincode: addr.postcode || "",
        addressLine: addr.road || addr.pedestrian || "",
        landmark: addr.suburb || addr.neighbourhood || "",
      };
    }
  } catch (error) {
    console.warn("Nominatim fallback failed:", error.message);
  }
  return null;
};

/* ============================================================
   AUTH & PROFILE
============================================================ */

// ─── REGISTER ──────────────────────────────────────────────
export const registerVendor = asyncHandler(async (req, res) => {
  const {
    ownerFirstName,
    ownerLastName,
    email,
    phone,
    password,
    confirmPassword,
    businessName,
    businessType,
    foodType,
    fssaiNumber,
    panNumber,
    addressLine,
    landmark,
    city,
    state,
    pincode,
    latitude,
    longitude,
    timings, // this will be a JSON string from FormData
    accountHolderName,
    accountNumber,
    ifscCode,
    bankName,
    upiId,
  } = req.body;

  // ─── Validation ──────────────────────────────────────────
  if (
    !ownerFirstName ||
    !email ||
    !password ||
    !businessName ||
    !businessType
  ) {
    throw new ApiError(400, "Required fields missing");
  }
  if (password.length < 8) {
    throw new ApiError(400, "Password must be at least 8 characters");
  }
  if (password !== confirmPassword) {
    throw new ApiError(400, "Passwords do not match");
  }

  const normalizedEmail = email.trim().toLowerCase();

  // ─── Check existing vendor ──────────────────────────────
  const existing = await Vendor.findOne({
    $or: [{ email: normalizedEmail }, { phone }],
  });
  if (existing) {
    throw new ApiError(
      409,
      "Vendor already registered with this email or phone",
    );
  }

  // ─── Parse Timings (from JSON string) ────────────────────
  let parsedTimings = [];
  if (timings) {
    try {
      const parsed =
        typeof timings === "string" ? JSON.parse(timings) : timings;
      if (!Array.isArray(parsed)) {
        throw new ApiError(400, "Timings must be an array");
      }
      for (const t of parsed) {
        if (!t.day || !t.openTime || !t.closeTime) {
          throw new ApiError(
            400,
            "Each timing object must have day, openTime, and closeTime",
          );
        }
      }
      parsedTimings = parsed.map((t) => ({
        day: t.day.toLowerCase(),
        openTime: t.openTime,
        closeTime: t.closeTime,
        isClosed: t.isClosed || false,
      }));
    } catch (error) {
      throw new ApiError(400, "Invalid timings format");
    }
  } else {
    // Default timings for all days
    parsedTimings = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ].map((day) => ({
      day,
      openTime: "09:00",
      closeTime: "22:00",
      isClosed: false,
    }));
  }

  // ─── Build vendorData ─────────────────────────────────────
  const vendorData = {
    ownerFirstName: ownerFirstName.trim(),
    ownerLastName: ownerLastName?.trim() || "",
    email: normalizedEmail,
    phone: phone?.trim() || "",
    password,
    businessName: businessName.trim(),
    businessType,
    foodType: foodType || "veg_non_veg",
    fssaiNumber: fssaiNumber?.trim() || "",
    panNumber: panNumber?.trim().toUpperCase() || "",
    description: req.body.description?.trim() || "",
    address: {
      addressLine: addressLine?.trim() || "",
      landmark: landmark?.trim() || "",
      city: city?.trim() || "",
      state: state?.trim() || "",
      pincode: pincode?.trim() || "",
    },
    bankDetails: {
      accountHolderName: accountHolderName?.trim() || "",
      accountNumber: accountNumber?.trim() || "",
      ifscCode: ifscCode?.trim().toUpperCase() || "",
      bankName: bankName?.trim() || "",
      upiId: upiId?.trim() || "",
      isVerified: false,
    },
    timings: parsedTimings,
    approvalStatus: "pending",
    isEmailVerified: false,
    isActive: true,
  };

  // ─── Location ──────────────────────────────────────────────
  if (latitude && longitude) {
    vendorData.address.location = {
      type: "Point",
      coordinates: [parseFloat(longitude), parseFloat(latitude)],
    };
    const addressData = await fetchAddressFromCoords(
      parseFloat(latitude),
      parseFloat(longitude),
    );
    if (addressData) {
      vendorData.address.addressLine =
        addressData.addressLine || vendorData.address.addressLine;
      vendorData.address.city = addressData.city || vendorData.address.city;
      vendorData.address.state = addressData.state || vendorData.address.state;
      vendorData.address.pincode =
        addressData.pincode || vendorData.address.pincode;
    }
  }

  const vendor = new Vendor(vendorData);

  // ─── Create and send OTP ──────────────────────────────────
  const otp = vendor.createEmailOtp();
  await vendor.save({ validateBeforeSave: false });

  await sendEmailOtp({
    email: vendor.email,
    otp,
    purpose: "vendor_email_verification",
  });

  const response = {
    success: true,
    message: "Vendor registered. Please verify your email.",
    data: {
      vendorId: vendor._id,
      email: vendor.email,
    },
  };

  if (process.env.NODE_ENV !== "production") {
    response.debugOtp = otp;
  }

  res.status(201).json(response);
});

// ─── VERIFY EMAIL OTP ─────────────────────────────────────
export const verifyVendorEmail = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) throw new ApiError(400, "Email and OTP required");

  const vendor = await Vendor.findOne({
    email: email.trim().toLowerCase(),
  }).select("+emailOtp +emailOtpExpires +emailOtpAttempts");

  if (!vendor) throw new ApiError(400, "Invalid email or OTP");

  if (vendor.isEmailVerified) {
    throw new ApiError(400, "Email already verified");
  }

  if (vendor.emailOtpAttempts >= 5) {
    throw new ApiError(
      429,
      "Too many incorrect OTP attempts. Request a new OTP.",
    );
  }

  const valid = vendor.verifyEmailOtp(otp);
  if (!valid) {
    vendor.emailOtpAttempts += 1;
    await vendor.save({ validateBeforeSave: false });
    throw new ApiError(400, "Invalid or expired OTP");
  }

  vendor.isEmailVerified = true;
  vendor.emailOtp = undefined;
  vendor.emailOtpExpires = undefined;
  vendor.emailOtpAttempts = 0;
  await vendor.save({ validateBeforeSave: false });

  const token = generateVendorToken(vendor);
  res.cookie("vendorToken", token, cookieOptions);

  res.status(200).json({
    success: true,
    message: "Email verified successfully",
    data: {
      vendor: formatVendor(vendor),
      token,
    },
  });
});

// ─── LOGIN ──────────────────────────────────────────────────
export const loginVendor = asyncHandler(async (req, res) => {
  console.log("BODY =>", req.body);
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ApiError(400, "Email and password required");
  }

  const vendor = await Vendor.findOne({
    email: email.trim().toLowerCase(),
  }).select("+password");

  if (!vendor) {
    throw new ApiError(401, "Invalid credentials");
  }

  if (vendor.isBlocked) {
    throw new ApiError(
      403,
      vendor.blockReason || "Your account has been blocked",
    );
  }

  if (!vendor.isActive) {
    throw new ApiError(403, "Your account is inactive");
  }

  // ─── Email must be verified ──────────────────────────
  if (!vendor.isEmailVerified) {
    return res.status(403).json({
      success: false,
      code: "EMAIL_NOT_VERIFIED",
      message: "Please verify your email before login",
      data: { email: vendor.email },
    });
  }

  // ─── Check approval status ───────────────────────────
  if (vendor.approvalStatus === "pending") {
    return res.status(403).json({
      success: false,
      code: "PENDING_APPROVAL",
      message: "Your application is under review",
      data: { approvalStatus: "pending" },
    });
  }

  if (vendor.approvalStatus === "rejected") {
    return res.status(403).json({
      success: false,
      code: "REJECTED",
      message: "Your application has been rejected",
      data: { rejectionReason: vendor.rejectionReason },
    });
  }

  // ─── Check lock ───────────────────────────────────────
  if (vendor.lockUntil && vendor.lockUntil > Date.now()) {
    throw new ApiError(423, "Account temporarily locked. Try again later.");
  }

  // ─── Password match ──────────────────────────────────
  const matched = await vendor.comparePassword(password);
  if (!matched) {
    vendor.failedLoginAttempts += 1;
    if (vendor.failedLoginAttempts >= 5) {
      vendor.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
      vendor.failedLoginAttempts = 0;
    }
    await vendor.save({ validateBeforeSave: false });
    throw new ApiError(401, "Invalid credentials");
  }

  // ─── Reset login attempts ────────────────────────────
  vendor.failedLoginAttempts = 0;
  vendor.lockUntil = null;
  vendor.lastLoginAt = new Date();
  vendor.lastLoginIp = req.ip || req.headers["x-forwarded-for"] || "";
  await vendor.save({ validateBeforeSave: false });

  const token = generateVendorToken(vendor);
  res.cookie("vendorToken", token, cookieOptions);

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      vendor: formatVendor(vendor),
      token,
    },
  });
});

// ─── LOGOUT ──────────────────────────────────────────────────
export const logoutVendor = asyncHandler(async (req, res) => {
  res.clearCookie("vendorToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });
  res.status(200).json({ success: true, message: "Logged out" });
});

// ─── GET PROFILE ────────────────────────────────────────────
export const getVendorProfile = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findById(req.vendor._id);
  if (!vendor) throw new ApiError(404, "Vendor not found");
  res.status(200).json({
    success: true,
    data: {
      vendor: formatVendor(vendor),
      approvalStatus: vendor.approvalStatus,
    },
  });
});

// ─── UPDATE PROFILE ─────────────────────────────────────────
export const updateVendorProfile = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findById(req.vendor._id);
  const { ownerFirstName, ownerLastName, phone } = req.body;
  if (ownerFirstName !== undefined)
    vendor.ownerFirstName = ownerFirstName.trim();
  if (ownerLastName !== undefined) vendor.ownerLastName = ownerLastName.trim();
  if (phone !== undefined) vendor.phone = phone.trim();
  await vendor.save();
  res.status(200).json({
    success: true,
    message: "Profile updated",
    data: { vendor: formatVendor(vendor) },
  });
});

// ─── UPDATE BUSINESS ────────────────────────────────────────
export const updateVendorBusiness = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findById(req.vendor._id);
  const allowed = [
    "businessName",
    "businessType",
    "foodType",
    "description",
    "fssaiNumber",
    "gstNumber",
    "panNumber",
    "minimumOrderAmount",
    "averagePreparationTime",
  ];
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) vendor[field] = req.body[field];
  });
  await vendor.save();
  res.status(200).json({
    success: true,
    message: "Business details updated",
    data: { vendor: formatVendor(vendor) },
  });
});

// ─── UPDATE ADDRESS ─────────────────────────────────────────
// export const updateVendorAddress = asyncHandler(async (req, res) => {
//   const vendor = await Vendor.findById(req.vendor._id);
//   const { addressLine, landmark, city, state, pincode, latitude, longitude } =
//     req.body;
//   vendor.address.addressLine = addressLine || vendor.address.addressLine || "";
//   vendor.address.landmark = landmark || vendor.address.landmark || "";
//   vendor.address.city = city || vendor.address.city || "";
//   vendor.address.state = state || vendor.address.state || "";
//   vendor.address.pincode = pincode || vendor.address.pincode || "";
//   if (latitude !== undefined && longitude !== undefined) {
//     vendor.address.location = {
//       type: "Point",
//       coordinates: [Number(longitude), Number(latitude)],
//     };
//   }
//   await vendor.save();
//   res.status(200).json({
//     success: true,
//     message: "Address updated",
//     data: { address: vendor.address },
//   });
// });
export const updateVendorAddress = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findById(req.vendor._id);
  if (!vendor) throw new ApiError(404, "Vendor not found");

  // Ensure address sub‑document exists
  if (!vendor.address) vendor.address = {};

  const { addressLine, landmark, city, state, pincode, latitude, longitude } =
    req.body;

  // Update only provided fields
  if (addressLine !== undefined)
    vendor.address.addressLine = addressLine.trim();
  if (landmark !== undefined) vendor.address.landmark = landmark.trim();
  if (city !== undefined) vendor.address.city = city.trim();
  if (state !== undefined) vendor.address.state = state.trim();
  if (pincode !== undefined) vendor.address.pincode = pincode.trim();

  if (latitude !== undefined && longitude !== undefined) {
    vendor.address.location = {
      type: "Point",
      coordinates: [Number(longitude), Number(latitude)],
    };
  }

  await vendor.save();

  res.status(200).json({
    success: true,
    message: "Address updated",
    data: { address: vendor.address },
  });
});
// ─── UPDATE TIMINGS ──────────────────────────────────────────
export const updateVendorTimings = asyncHandler(async (req, res) => {
  const { timings } = req.body;
  if (!Array.isArray(timings))
    throw new ApiError(400, "Timings must be an array");
  const vendor = await Vendor.findById(req.vendor._id);
  vendor.timings = timings;
  await vendor.save();
  res.status(200).json({ success: true, data: { timings } });
});

// ─── TOGGLE ONLINE ──────────────────────────────────────────
export const updateVendorOnlineStatus = asyncHandler(async (req, res) => {
  const { isOnline } = req.body;
  if (typeof isOnline !== "boolean")
    throw new ApiError(400, "isOnline must be boolean");
  const vendor = await Vendor.findById(req.vendor._id);
  vendor.isOnline = isOnline;
  vendor.acceptingOrders = isOnline;
  await vendor.save();
  res.status(200).json({
    success: true,
    message: isOnline ? "Online" : "Offline",
    data: { isOnline, acceptingOrders: vendor.acceptingOrders },
  });
});

// ─── UPDATE PROFILE IMAGE ───────────────────────────────────
export const updateVendorProfileImage = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, "Please select an image");
  const vendor = await Vendor.findById(req.vendor._id);
  if (vendor.profileImage) {
    const oldPath = path.resolve(vendor.profileImage.replace(/^\/+/, ""));
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
  }
  vendor.profileImage = `/uploads/vendors/profiles/${req.file.filename}`;
  await vendor.save();
  res.status(200).json({
    success: true,
    message: "Image updated",
    data: { profileImage: vendor.profileImage },
  });
});

// ─── DELETE PROFILE IMAGE ───────────────────────────────────
export const deleteVendorProfileImage = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findById(req.vendor._id);
  if (vendor.profileImage) {
    const oldPath = path.resolve(vendor.profileImage.replace(/^\/+/, ""));
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    vendor.profileImage = "";
    await vendor.save();
  }
  res.status(200).json({ success: true, message: "Image removed" });
});

// ─── UPDATE BANK DETAILS ────────────────────────────────────
export const updateVendorBank = asyncHandler(async (req, res) => {
  const { accountHolderName, accountNumber, ifscCode, bankName, upiId } =
    req.body;
  if (!accountHolderName || !accountNumber || !ifscCode)
    throw new ApiError(400, "Required bank details missing");
  const vendor = await Vendor.findById(req.vendor._id);
  vendor.bankDetails = {
    accountHolderName,
    accountNumber,
    ifscCode,
    bankName: bankName || "",
    upiId: upiId || "",
    isVerified: false,
  };
  await vendor.save();
  res.status(200).json({ success: true, message: "Bank details updated" });
});

// ─── CHANGE PASSWORD ────────────────────────────────────────
export const changeVendorPassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  if (!currentPassword || !newPassword || !confirmPassword)
    throw new ApiError(400, "All fields required");
  if (newPassword !== confirmPassword)
    throw new ApiError(400, "Passwords do not match");
  if (newPassword.length < 8) throw new ApiError(400, "Minimum 8 characters");
  const vendor = await Vendor.findById(req.vendor._id).select("+password");
  const correct = await vendor.comparePassword(currentPassword);
  if (!correct) throw new ApiError(401, "Current password incorrect");
  const same = await vendor.comparePassword(newPassword);
  if (same) throw new ApiError(400, "New password must be different");
  vendor.password = newPassword;
  await vendor.save();
  const token = generateVendorToken(vendor);
  res.cookie("vendorToken", token, cookieOptions);
  res.status(200).json({ success: true, message: "Password changed" });
});

// ─── FORGOT PASSWORD – SEND OTP ────────────────────────────
export const forgotVendorPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new ApiError(400, "Email required");
  const vendor = await Vendor.findOne({
    email: email.trim().toLowerCase(),
  }).select("+passwordResetOtp +passwordResetOtpExpires");
  if (!vendor) {
    return res
      .status(200)
      .json({ success: true, message: "If vendor exists, reset OTP sent." });
  }
  const otp = vendor.createPasswordResetOtp();
  await vendor.save({ validateBeforeSave: false });
  await sendEmailOtp({
    email: vendor.email,
    otp,
    purpose: "vendor_password_reset",
  });
  const response = {
    success: true,
    message: "If vendor exists, reset OTP sent.",
  };
  if (process.env.NODE_ENV !== "production") response.debugOtp = otp;
  res.status(200).json(response);
});

// ─── VERIFY RESET OTP ──────────────────────────────────────
export const verifyVendorResetOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const vendor = await Vendor.findOne({
    email: email?.trim().toLowerCase(),
  }).select(
    "+passwordResetOtp +passwordResetOtpExpires +passwordResetVerified",
  );
  if (!vendor || !vendor.verifyPasswordResetOtp(otp))
    throw new ApiError(400, "Invalid or expired OTP");
  vendor.passwordResetVerified = true;
  await vendor.save({ validateBeforeSave: false });
  res.status(200).json({ success: true, message: "OTP verified" });
});

// ─── RESET PASSWORD ─────────────────────────────────────────
export const resetVendorPassword = asyncHandler(async (req, res) => {
  const { email, password, confirmPassword } = req.body;
  if (!email || !password || !confirmPassword)
    throw new ApiError(400, "Missing fields");
  if (password !== confirmPassword)
    throw new ApiError(400, "Passwords do not match");
  const vendor = await Vendor.findOne({
    email: email.trim().toLowerCase(),
  }).select(
    "+passwordResetOtp +passwordResetOtpExpires +passwordResetVerified",
  );
  if (!vendor || !vendor.passwordResetVerified)
    throw new ApiError(403, "Verify reset OTP first");
  vendor.password = password;
  vendor.passwordResetOtp = undefined;
  vendor.passwordResetOtpExpires = undefined;
  vendor.passwordResetVerified = false;
  vendor.failedLoginAttempts = 0;
  vendor.lockUntil = null;
  await vendor.save();
  res
    .status(200)
    .json({ success: true, message: "Password reset successfully" });
});

// ─── RESEND EMAIL OTP ──────────────────────────────────────
export const resendVendorEmailOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email?.trim()) throw new ApiError(400, "Email required");
  const vendor = await Vendor.findOne({
    email: email.trim().toLowerCase(),
  }).select("+emailOtp +emailOtpExpires +otpAttempts +lastOtpSentAt");
  if (!vendor) throw new ApiError(404, "Vendor not found");
  if (vendor.isEmailVerified) throw new ApiError(400, "Email already verified");
  if (
    vendor.lastOtpSentAt &&
    Date.now() - new Date(vendor.lastOtpSentAt).getTime() < 60 * 1000
  ) {
    const remaining = Math.ceil(
      (60 * 1000 - (Date.now() - new Date(vendor.lastOtpSentAt).getTime())) /
        1000,
    );
    throw new ApiError(429, `Wait ${remaining} seconds`);
  }
  const otp = vendor.createEmailOtp();
  await vendor.save({ validateBeforeSave: false });
  await sendEmailOtp({
    email: vendor.email,
    otp,
    purpose: "vendor_email_verification",
  });
  const response = { success: true, message: "OTP sent" };
  if (process.env.NODE_ENV !== "production") response.debugOtp = otp;
  res.status(200).json(response);
});

// ─── REVERSE GEOCODE ──────────────────────────────────────
export const reverseGeocodeVendor = asyncHandler(async (req, res) => {
  const { lat, lng } = req.body;
  if (!lat || !lng) throw new ApiError(400, "Latitude and longitude required");
  const vendor = await Vendor.findById(req.vendor._id);
  if (!vendor) throw new ApiError(404, "Vendor not found");
  const addressData = await fetchAddressFromCoords(Number(lat), Number(lng));
  if (!addressData) throw new ApiError(404, "Could not resolve address");
  vendor.address.addressLine =
    addressData.addressLine || vendor.address.addressLine || "";
  vendor.address.landmark =
    addressData.landmark || vendor.address.landmark || "";
  vendor.address.city = addressData.city || vendor.address.city || "";
  vendor.address.state = addressData.state || vendor.address.state || "";
  vendor.address.pincode = addressData.pincode || vendor.address.pincode || "";
  vendor.address.location = {
    type: "Point",
    coordinates: [Number(lng), Number(lat)],
  };
  await vendor.save();
  res.status(200).json({
    success: true,
    message: "Address auto-fetched",
    data: { address: vendor.address },
  });
});
export const getNearbyVendors = asyncHandler(async (req, res) => {
  const {
    lat,
    lng,
    radius = 5,
    businessType,
    sortBy = "distance",
    onlyTop = false, // new: if true, return only top vendors
    page = 1,
    limit = 10,
  } = req.query;

  if (!lat || !lng) throw new ApiError(400, "Latitude and longitude required");
  const latitude = parseFloat(lat),
    longitude = parseFloat(lng);
  if (isNaN(latitude) || isNaN(longitude))
    throw new ApiError(400, "Invalid coordinates");

  const parsedRadius = parseFloat(radius) * 1000; // km → meters
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const parsedLimit = parseInt(limit);

  const match = {
    approvalStatus: "approved",
    isActive: true,
    isBlocked: false,
    "address.location": { $exists: true, $ne: null },
  };
  if (businessType) match.businessType = businessType;
  if (onlyTop === "true" || onlyTop === true) match.isTop = true; // filter only top

  const pipeline = [
    {
      $geoNear: {
        near: { type: "Point", coordinates: [longitude, latitude] },
        distanceField: "distance",
        distanceMultiplier: 0.001,
        maxDistance: parsedRadius,
        spherical: true,
        query: match,
      },
    },
    {
      $project: {
        ownerFirstName: 1,
        ownerLastName: 1,
        businessName: 1,
        businessType: 1,
        foodType: 1,
        description: 1,
        profileImage: 1,
        coverImage: 1,
        address: 1,
        timings: 1,
        isOnline: 1,
        acceptingOrders: 1,
        rating: 1,
        totalRatings: 1,
        totalOrders: 1,
        completedOrders: 1,
        minimumOrderAmount: 1,
        averagePreparationTime: 1,
        distance: 1,
        isTop: 1,
      },
    },
  ];

  // Sorting: top first, then user choice
  if (sortBy === "rating") {
    pipeline.push({ $sort: { isTop: -1, rating: -1, distance: 1 } });
  } else {
    pipeline.push({ $sort: { isTop: -1, distance: 1 } });
  }

  pipeline.push({
    $facet: {
      metadata: [{ $count: "total" }],
      data: [{ $skip: skip }, { $limit: parsedLimit }],
    },
  });

  const result = await Vendor.aggregate(pipeline);
  const vendors = result[0]?.data || [];
  const total = result[0]?.metadata[0]?.total || 0;

  res.status(200).json({
    success: true,
    data: {
      vendors,
      pagination: {
        page: parseInt(page),
        limit: parsedLimit,
        total,
        pages: Math.ceil(total / parsedLimit),
      },
    },
  });
});

// ─── GET NEARBY VENDORS (public) ──────────────────────────
// export const getNearbyVendors = asyncHandler(async (req, res) => {
//   const {
//     lat,
//     lng,
//     radius = 5,
//     businessType,
//     sortBy = "distance",
//     page = 1,
//     limit = 20,
//   } = req.query;
//   if (!lat || !lng) throw new ApiError(400, "Latitude and longitude required");
//   const latitude = parseFloat(lat),
//     longitude = parseFloat(lng);
//   if (isNaN(latitude) || isNaN(longitude))
//     throw new ApiError(400, "Invalid coordinates");
//   const parsedRadius = parseFloat(radius) * 1000;
//   const skip = (parseInt(page) - 1) * parseInt(limit);
//   const parsedLimit = parseInt(limit);
//   const match = {
//     approvalStatus: "approved",
//     isActive: true,
//     isBlocked: false,
//     "address.location": { $exists: true, $ne: null },
//   };
//   if (businessType) match.businessType = businessType;
//   console.log(JSON.stringify(result[0].data, null, 2));
//   const pipeline = [
//     {
//       $geoNear: {
//         near: {
//           type: "Point",
//           coordinates: [longitude, latitude],
//         },
//         distanceField: "distance",
//         distanceMultiplier: 0.001, // Meter → Kilometer
//         maxDistance: parsedRadius,
//         spherical: true,
//         query: match,
//       },
//     },
//     {
//       $project: {
//         ownerFirstName: 1,
//         ownerLastName: 1,
//         businessName: 1,
//         businessType: 1,
//         foodType: 1,
//         description: 1,
//         profileImage: 1,
//         coverImage: 1,
//         address: 1,
//         timings: 1,
//         isOnline: 1,
//         acceptingOrders: 1,
//         rating: 1,
//         totalRatings: 1,
//         totalOrders: 1,
//         completedOrders: 1,
//         minimumOrderAmount: 1,
//         averagePreparationTime: 1,
//         distance: 1,
//       },
//     },
//   ];
//   if (sortBy === "rating")
//     pipeline.push({ $sort: { rating: -1, distance: 1 } });
//   pipeline.push({
//     $facet: {
//       metadata: [{ $count: "total" }],
//       data: [{ $skip: skip }, { $limit: parsedLimit }],
//     },
//   });
//   const result = await Vendor.aggregate(pipeline);
//   const vendors = result[0]?.data || [];
//   const total = result[0]?.metadata[0]?.total || 0;
//   res.status(200).json({
//     success: true,
//     data: {
//       vendors,
//       pagination: {
//         page: parseInt(page),
//         limit: parsedLimit,
//         total,
//         pages: Math.ceil(total / parsedLimit),
//       },
//     },
//   });
// });
// export const getNearbyVendors = asyncHandler(async (req, res) => {
//   const {
//     lat,
//     lng,
//     radius = 5,
//     businessType,
//     sortBy = "distance",
//     page = 1,
//     limit = 10,
//   } = req.query;

//   if (!lat || !lng) throw new ApiError(400, "Latitude and longitude required");
//   const latitude = parseFloat(lat),
//     longitude = parseFloat(lng);
//   if (isNaN(latitude) || isNaN(longitude))
//     throw new ApiError(400, "Invalid coordinates");

//   const parsedRadius = parseFloat(radius) * 1000; // km → meters
//   const skip = (parseInt(page) - 1) * parseInt(limit);
//   const parsedLimit = parseInt(limit);

//   const match = {
//     approvalStatus: "approved",
//     isActive: true,
//     isBlocked: false,
//     "address.location": { $exists: true, $ne: null },
//   };
//   if (businessType) match.businessType = businessType;

//   const pipeline = [
//     {
//       $geoNear: {
//         near: {
//           type: "Point",
//           coordinates: [longitude, latitude],
//         },
//         distanceField: "distance",
//         distanceMultiplier: 0.001, // meters → km
//         maxDistance: parsedRadius,
//         spherical: true,
//         query: match,
//       },
//     },
//     {
//       $project: {
//         ownerFirstName: 1,
//         ownerLastName: 1,
//         businessName: 1,
//         businessType: 1,
//         foodType: 1,
//         description: 1,
//         profileImage: 1,
//         coverImage: 1,
//         address: 1,
//         timings: 1,
//         isOnline: 1,
//         acceptingOrders: 1,
//         rating: 1,
//         totalRatings: 1,
//         totalOrders: 1,
//         completedOrders: 1,
//         minimumOrderAmount: 1,
//         averagePreparationTime: 1,
//         distance: 1,
//       },
//     },
//   ];

//   // Sorting: default is distance (ascending) from $geoNear, but we can override
//   if (sortBy === "rating") {
//     pipeline.push({ $sort: { rating: -1, distance: 1 } });
//   }
//   // If sortBy is "distance" (or any other), we keep the default geoNear sorting.

//   pipeline.push({
//     $facet: {
//       metadata: [{ $count: "total" }],
//       data: [{ $skip: skip }, { $limit: parsedLimit }],
//     },
//   });

//   const result = await Vendor.aggregate(pipeline);

//   // ✅ Log safely after result is available (optional)
//   if (result && result[0]?.data) {
//     console.log(JSON.stringify(result[0].data, null, 2));
//   }

//   const vendors = result[0]?.data || [];
//   const total = result[0]?.metadata[0]?.total || 0;

//   res.status(200).json({
//     success: true,
//     data: {
//       vendors,
//       pagination: {
//         page: parseInt(page),
//         limit: parsedLimit,
//         total,
//         pages: Math.ceil(total / parsedLimit),
//       },
//     },
//   });
// });

// ─── GET VENDOR BY ID (public) ────────────────────────────
export const getVendorById = asyncHandler(async (req, res) => {
  const { vendorId } = req.params;
  const vendor = await Vendor.findById(vendorId).select("-password");
  if (!vendor) throw new ApiError(404, "Vendor not found");
  const categories = await Category.find({ vendorId, isActive: true }).sort(
    "sortOrder",
  );
  const categoriesWithItems = await Promise.all(
    categories.map(async (cat) => {
      const items = await MenuItem.find({
        categoryId: cat._id,
        isAvailable: true,
      }).sort("sortOrder");
      return { ...cat.toObject(), items };
    }),
  );
  const vendorData = vendor.toObject();
  vendorData.categories = categoriesWithItems;
  res.status(200).json({ success: true, data: { vendor: vendorData } });
});

/* ============================================================
   VENDOR CATEGORY MANAGEMENT (WITH GLOBAL CATEGORY LINK)
============================================================ */

export const getVendorCategories = asyncHandler(async (req, res) => {
  const { vendorId } = req.params;
  const categories = await Category.find({ vendorId, isActive: true })
    .populate("globalCategory", "name icon image")
    .sort({ sortOrder: 1, name: 1 });
  res.json({ success: true, data: { categories } });
});

export const addVendorCategory = asyncHandler(async (req, res) => {
  const { vendorId } = req.params;
  const { name, description, sortOrder, globalCategory } = req.body;

  if (!name?.trim()) throw new ApiError(400, "Category name is required");
  if (!globalCategory)
    throw new ApiError(400, "Please select a global category");

  const globalCat = await FoodCategory.findById(globalCategory);
  if (!globalCat) throw new ApiError(404, "Selected global category not found");

  const categoryData = {
    vendorId,
    name: name.trim(),
    description: description || "",
    sortOrder: Number(sortOrder) || 0,
    isActive: true,
    globalCategory,
  };
  if (req.file) {
    categoryData.icon = `/uploads/categories/${req.file.filename}`;
  }
  const category = new Category(categoryData);
  await category.save();
  res.status(201).json({ success: true, data: category });
});

export const updateVendorCategory = asyncHandler(async (req, res) => {
  const { vendorId, categoryId } = req.params;
  const { name, description, sortOrder, isActive, globalCategory } = req.body;

  const category = await Category.findOne({ _id: categoryId, vendorId });
  if (!category) throw new ApiError(404, "Category not found");

  if (name !== undefined) category.name = name.trim();
  if (description !== undefined) category.description = description;
  if (sortOrder !== undefined) category.sortOrder = Number(sortOrder);
  if (isActive !== undefined) category.isActive = isActive;
  if (globalCategory !== undefined) {
    if (globalCategory && !(await FoodCategory.findById(globalCategory))) {
      throw new ApiError(404, "Global category not found");
    }
    category.globalCategory = globalCategory || null;
  }
  if (req.file) {
    category.icon = `/uploads/categories/${req.file.filename}`;
  }
  await category.save();
  res.json({ success: true, data: category });
});

export const deleteVendorCategory = asyncHandler(async (req, res) => {
  const { vendorId, categoryId } = req.params;
  const category = await Category.findOneAndDelete({
    _id: categoryId,
    vendorId,
  });
  if (!category) throw new ApiError(404, "Category not found");
  res.json({ success: true, message: "Category deleted" });
});

export const getGlobalCategories = asyncHandler(async (req, res) => {
  const categories = await FoodCategory.find({ isActive: true })
    .sort({ displayOrder: 1, name: 1 })
    .select("name icon image");
  res.json({ success: true, data: categories });
});

/* ============================================================
   VENDOR MENU ITEM MANAGEMENT
============================================================ */

export const getVendorMenuItems = asyncHandler(async (req, res) => {
  const { vendorId } = req.params;
  const items = await MenuItem.find({
    $or: [{ vendor: vendorId }, { vendorId: vendorId }],
  })
    .populate("categoryId", "name")
    .populate("foodCategory", "name icon")
    .sort({ createdAt: -1 });
  res.json({ success: true, data: { items } });
});

export const addVendorMenuItem = asyncHandler(async (req, res) => {
  const { vendorId } = req.params;
  const {
    name,
    description,
    price,
    categoryId,
    preparationTime,
    isAvailable,
    foodCategory,
  } = req.body;

  if (!name?.trim()) {
    throw new ApiError(400, "Item name is required");
  }
  if (!price || isNaN(parseFloat(price)) || parseFloat(price) < 0) {
    throw new ApiError(400, "Valid price is required");
  }
  if (!categoryId) {
    throw new ApiError(400, "Please select a vendor category");
  }
  if (!foodCategory) {
    throw new ApiError(400, "Please select a global category");
  }

  const menuItemData = {
    vendorId,
    name: name.trim(),
    description: description?.trim() || "",
    price: parseFloat(price),
    categoryId: categoryId || null,
    preparationTime: parseInt(preparationTime) || 15,
    isAvailable: isAvailable === "true" || isAvailable === true,
    foodCategory: foodCategory || null,
  };

  if (req.file) {
    menuItemData.image = `/uploads/vendors/menu/${req.file.filename}`;
  }

  const item = new MenuItem(menuItemData);
  await item.save();

  res.status(201).json({
    success: true,
    message: "Menu item added successfully",
    data: { item },
  });
});

export const updateVendorMenuItem = asyncHandler(async (req, res) => {
  const { vendorId, itemId } = req.params;
  const {
    name,
    description,
    price,
    categoryId,
    preparationTime,
    isAvailable,
    foodCategory,
  } = req.body;

  const item = await MenuItem.findOne({
    _id: itemId,
    $or: [{ vendor: vendorId }, { vendorId: vendorId }],
  });
  if (!item) throw new ApiError(404, "Item not found");

  if (name !== undefined) item.name = name.trim();
  if (description !== undefined) item.description = description.trim();
  if (price !== undefined) {
    if (isNaN(parseFloat(price)) || parseFloat(price) < 0) {
      throw new ApiError(400, "Valid price is required");
    }
    item.price = parseFloat(price);
  }
  if (categoryId !== undefined) item.categoryId = categoryId || null;
  if (preparationTime !== undefined)
    item.preparationTime = parseInt(preparationTime) || 15;
  if (isAvailable !== undefined)
    item.isAvailable = isAvailable === "true" || isAvailable === true;
  if (foodCategory !== undefined) item.foodCategory = foodCategory || null;
  if (req.file) item.image = `/uploads/vendors/menu/${req.file.filename}`;

  await item.save();

  res.json({
    success: true,
    message: "Menu item updated successfully",
    data: { item },
  });
});

export const deleteVendorMenuItem = asyncHandler(async (req, res) => {
  const { vendorId, itemId } = req.params;
  const item = await MenuItem.findOneAndDelete({
    _id: itemId,
    $or: [{ vendor: vendorId }, { vendorId: vendorId }],
  });
  if (!item) throw new ApiError(404, "Item not found");
  res.json({ success: true, message: "Item deleted" });
});
// ─── TOGGLE VENDOR TOP STATUS (Admin) ─────────────────────────
export const toggleVendorTop = asyncHandler(async (req, res) => {
  const { vendorId } = req.params;
  const { isTop } = req.body; // boolean

  if (typeof isTop !== "boolean") {
    throw new ApiError(400, "isTop must be a boolean");
  }

  const vendor = await Vendor.findById(vendorId);
  if (!vendor) throw new ApiError(404, "Vendor not found");

  vendor.isTop = isTop;
  await vendor.save();

  res.status(200).json({
    success: true,
    message: `Vendor ${isTop ? "marked as top" : "removed from top"}`,
    data: { isTop: vendor.isTop },
  });
});

// ─── GET TOP VENDORS (Public) ──────────────────────────────────
export const getTopVendors = asyncHandler(async (req, res) => {
  const { limit = 10, businessType } = req.query;
  const query = {
    approvalStatus: "approved",
    isActive: true,
    isBlocked: false,
    isTop: true,
  };
  if (businessType) query.businessType = businessType;

  const vendors = await Vendor.find(query)
    .select(
      "ownerFirstName ownerLastName businessName businessType foodType profileImage coverImage address isOnline rating totalRatings minimumOrderAmount averagePreparationTime",
    )
    .sort({ rating: -1, sortOrder: 1, createdAt: -1 })
    .limit(parseInt(limit));

  res.status(200).json({ success: true, data: { vendors } });
});
