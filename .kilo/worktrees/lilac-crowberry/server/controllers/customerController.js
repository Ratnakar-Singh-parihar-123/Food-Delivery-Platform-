import fs from "fs";
import path from "path";

import Customer from "../models/customer.js";
import admin from "../config/firebaseAdmin.js";

import asyncHandler from "../utils/asyncHandler.js";
import Category from "../models/VendorCategory.js";
import Vendor from "../models/vendor.js";
import MenuItem from "../models/MenuItem.js";
import FoodCategory from "../models/FoodCategory.js"; // ✅ import the correct model

import { ApiError } from "../utils/ApiError.js";

import { generateCustomerToken } from "../utils/generateToken.js";

import { sendEmailOtp } from "../services/email.js";

const customerCookieOptions = {
  httpOnly: true,

  secure: process.env.NODE_ENV === "production",

  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",

  maxAge: 30 * 24 * 60 * 60 * 1000,
};

/* =====================================================
   SAFE RESPONSE
===================================================== */

const formatCustomer = (customer) => ({
  id: customer._id,
  firstName: customer.firstName,
  lastName: customer.lastName,
  fullName: `${customer.firstName} ${customer.lastName || ""}`.trim(),
  email: customer.email,
  phone: customer.phone,
  profileImage: customer.profileImage,
  gender: customer.gender,
  dateOfBirth: customer.dateOfBirth,
  addresses: customer.addresses,
  isEmailVerified: customer.isEmailVerified,
  isActive: customer.isActive,
  totalOrders: customer.totalOrders,
  totalSpent: customer.totalSpent,
  lastLoginAt: customer.lastLoginAt,
  createdAt: customer.createdAt,
  updatedAt: customer.updatedAt,
  profileCompleted: customer.profileCompleted, // ✅ MUST ADD
});

// export const phoneLogin = asyncHandler(async (req, res) => {

//   const { idToken } = req.body;
//   if (!idToken) throw new ApiError(400, "Firebase Token Required");

//   const decoded = await admin.auth().verifyIdToken(idToken);
//   const phone = decoded.phone_number;

//   let customer = await Customer.findOne({ phone });

//   if (!customer) {
//     customer = await Customer.create({
//       firstName: "Customer",
//       phone,
//       email: "Enter your email..",
//       password: Math.random().toString(36),
//       isEmailVerified: true,
//       profileCompleted: false, // ✅ explicit
//     });
//   }

//   customer.lastLoginAt = new Date();
//   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//   const hasValidEmail =
//     customer.email &&
//     !customer.email.endsWith("@temp.com") &&
//     customer.email !== "enter your email.." &&
//     emailRegex.test(customer.email);

//   let profileCompleted = hasValidEmail; // true if email is valid

//   // If already saved as true, keep it
//   if (customer.profileCompleted) profileCompleted = true;

//   // Save if needed
//   if (profileCompleted && !customer.profileCompleted) {
//     customer.profileCompleted = true;
//     await customer.save({ validateBeforeSave: false });
//   }

//   const token = generateCustomerToken(customer);
//   res.cookie("customerToken", token, customerCookieOptions);

//   console.log("📡 phoneLogin -> profileCompleted:", profileCompleted);

//   return res.status(200).json({
//     success: true,
//     data: {
//       customer: formatCustomer(customer),
//       token,
//       profileCompleted,
//     },
//   });
// });

export const phoneLogin = asyncHandler(async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) throw new ApiError(400, "Firebase Token Required");

  const decoded = await admin.auth().verifyIdToken(idToken);
  let rawPhone = decoded.phone_number;

  // ── Normalize phone: remove spaces, dashes, ensure +91 ──
  const normalizedPhone = rawPhone.replace(/[\s\-()]/g, "");
  // If phone doesn't start with '+', add '+91' (India) – adjust as needed
  const finalPhone = normalizedPhone.startsWith("+")
    ? normalizedPhone
    : `+91${normalizedPhone}`;

  // ── Find customer with normalized phone ──
  let customer = await Customer.findOne({ phone: finalPhone });

  // If not found, try without country code (for old data)
  if (!customer) {
    const phoneWithoutCountry = finalPhone.replace(/^\+91/, "");
    customer = await Customer.findOne({
      phone: { $regex: `${phoneWithoutCountry}$` },
    });
  }

  // ── If still not found, create new customer ──
  if (!customer) {
    customer = await Customer.create({
      firstName: "Customer",
      phone: finalPhone, // store normalized
      email: "enter your email..",
      password: Math.random().toString(36),
      isEmailVerified: true,
      profileCompleted: false,
    });
    console.log("🆕 New customer created with phone:", finalPhone);
  } else {
    // ── Update phone to normalized format if different ──
    if (customer.phone !== finalPhone) {
      customer.phone = finalPhone;
      await customer.save({ validateBeforeSave: false });
      console.log("📞 Phone number updated to:", finalPhone);
    }
    console.log("✅ Existing customer found:", customer._id);
  }

  // ── Always update last login ──
  customer.lastLoginAt = new Date();

  // ── Check if email is valid ──
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const hasValidEmail =
    customer.email &&
    !customer.email.endsWith("@temp.com") &&
    customer.email.toLowerCase() !== "enter your email.." &&
    emailRegex.test(customer.email);

  // ── Determine profileCompleted ──
  let profileCompleted = hasValidEmail;
  // If DB already says true, keep it true
  if (customer.profileCompleted) profileCompleted = true;
  // If email becomes valid and DB says false, update DB
  if (profileCompleted && !customer.profileCompleted) {
    customer.profileCompleted = true;
  }

  // ── Save all changes ──
  await customer.save({ validateBeforeSave: false });

  const token = generateCustomerToken(customer);
  res.cookie("customerToken", token, customerCookieOptions);

  console.log("📡 phoneLogin -> profileCompleted:", customer.profileCompleted);
  console.log("📡 phoneLogin -> phone used:", finalPhone);

  return res.status(200).json({
    success: true,
    data: {
      customer: formatCustomer(customer),
      token,
      profileCompleted: customer.profileCompleted,
    },
  });
});
/* =====================================================
   REGISTER
===================================================== */

export const registerCustomer = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, phone, password, confirmPassword } =
    req.body;

  if (!firstName || !email || !password) {
    throw new ApiError(400, "First name, email and password are required");
  }

  if (password.length < 8) {
    throw new ApiError(400, "Password must contain at least 8 characters");
  }

  if (confirmPassword && password !== confirmPassword) {
    throw new ApiError(400, "Passwords do not match");
  }

  const normalizedEmail = email.trim().toLowerCase();

  const exists = await Customer.findOne({
    email: normalizedEmail,
  });

  if (exists) {
    throw new ApiError(409, "Customer already registered with this email");
  }

  const customer = await Customer.create({
    firstName: firstName.trim(),

    lastName: lastName?.trim() || "",

    email: normalizedEmail,

    phone: phone?.trim() || "",

    password,
  });

  /* Create OTP */

  const otp = customer.createEmailOtp();

  await customer.save({
    validateBeforeSave: false,
  });

  await sendEmailOtp({
    email: customer.email,

    otp,

    purpose: "verify_email",
  });

  const response = {
    success: true,

    message: "Customer registered. OTP sent to email.",

    data: {
      email: customer.email,
    },
  };

  /*
        Only development
      */

  if (process.env.NODE_ENV !== "production") {
    response.debugOtp = otp;
  }

  res.status(201).json(response);
});

/* =====================================================
   VERIFY EMAIL OTP
===================================================== */

export const verifyCustomerEmailOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    throw new ApiError(400, "Email and OTP are required");
  }

  const customer = await Customer.findOne({
    email: email.trim().toLowerCase(),
  }).select("+emailOtp +emailOtpExpires +emailOtpAttempts");

  if (!customer) {
    throw new ApiError(400, "Invalid email or OTP");
  }

  if (customer.isEmailVerified) {
    throw new ApiError(400, "Email is already verified");
  }

  if (customer.emailOtpAttempts >= 5) {
    throw new ApiError(
      429,
      "Too many incorrect OTP attempts. Request a new OTP.",
    );
  }

  const valid = customer.verifyEmailOtp(otp);

  if (!valid) {
    customer.emailOtpAttempts += 1;

    await customer.save({
      validateBeforeSave: false,
    });

    throw new ApiError(400, "Invalid or expired OTP");
  }

  customer.isEmailVerified = true;

  customer.emailOtp = undefined;

  customer.emailOtpExpires = undefined;

  customer.emailOtpAttempts = 0;

  await customer.save({
    validateBeforeSave: false,
  });

  const token = generateCustomerToken(customer);

  res.cookie("customerToken", token, customerCookieOptions);

  res.status(200).json({
    success: true,

    message: "Email verified successfully",

    data: {
      customer: formatCustomer(customer),
    },
  });
});

/* =====================================================
   RESEND EMAIL OTP
===================================================== */

export const resendCustomerOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  const customer = await Customer.findOne({
    email: email.trim().toLowerCase(),
  }).select("+emailOtp +emailOtpExpires +lastOtpSentAt");

  if (!customer) {
    throw new ApiError(404, "Customer not found");
  }

  if (customer.isEmailVerified) {
    throw new ApiError(400, "Email already verified");
  }

  /*
        60 second cooldown
      */

  if (
    customer.lastOtpSentAt &&
    Date.now() - new Date(customer.lastOtpSentAt).getTime() < 60 * 1000
  ) {
    throw new ApiError(429, "Please wait before requesting another OTP");
  }

  const otp = customer.createEmailOtp();

  await customer.save({
    validateBeforeSave: false,
  });

  await sendEmailOtp({
    email: customer.email,

    otp,

    purpose: "verify_email",
  });

  const response = {
    success: true,

    message: "New OTP sent successfully",
  };

  if (process.env.NODE_ENV !== "production") {
    response.debugOtp = otp;
  }

  res.status(200).json(response);
});

/* =====================================================
   LOGIN
===================================================== */

export const loginCustomer = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const customer = await Customer.findOne({
    email: email.trim().toLowerCase(),
  }).select("+password");

  if (!customer) {
    throw new ApiError(401, "Invalid email or password");
  }

  if (customer.isBlocked) {
    throw new ApiError(
      403,
      customer.blockReason || "Your account has been blocked",
    );
  }

  if (!customer.isActive) {
    throw new ApiError(403, "Your account is inactive");
  }

  if (customer.lockUntil && customer.lockUntil > Date.now()) {
    throw new ApiError(423, "Account temporarily locked. Try again later.");
  }

  const matched = await customer.comparePassword(password);

  if (!matched) {
    customer.failedLoginAttempts += 1;

    if (customer.failedLoginAttempts >= 5) {
      customer.lockUntil = new Date(Date.now() + 15 * 60 * 1000);

      customer.failedLoginAttempts = 0;
    }

    await customer.save({
      validateBeforeSave: false,
    });

    throw new ApiError(401, "Invalid email or password");
  }

  /*
        Email must be verified.
      */

  if (!customer.isEmailVerified) {
    return res.status(403).json({
      success: false,

      code: "EMAIL_NOT_VERIFIED",

      message: "Please verify your email before login",

      data: {
        email: customer.email,
      },
    });
  }

  customer.failedLoginAttempts = 0;

  customer.lockUntil = null;

  customer.lastLoginAt = new Date();

  customer.lastLoginIp = req.ip || req.headers["x-forwarded-for"] || "";

  await customer.save({
    validateBeforeSave: false,
  });

  const token = generateCustomerToken(customer);

  res.cookie("customerToken", token, customerCookieOptions);

  res.status(200).json({
    success: true,

    message: "Customer logged in successfully",

    data: {
      customer: formatCustomer(customer),
    },
  });
});

/* =====================================================
   LOGOUT
===================================================== */

export const logoutCustomer = asyncHandler(async (req, res) => {
  res.clearCookie("customerToken", {
    httpOnly: true,

    secure: process.env.NODE_ENV === "production",

    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });

  res.status(200).json({
    success: true,

    message: "Customer logged out successfully",
  });
});

/* =====================================================
   GET PROFILE
===================================================== */

export const getCustomerProfile = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,

    data: {
      customer: formatCustomer(req.customer),
    },
  });
});

/* =====================================================
   UPDATE PROFILE
===================================================== */

export const updateCustomerProfile = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, phone, gender, dateOfBirth } = req.body;
  const customer = await Customer.findById(req.customer._id);
  if (!customer) throw new ApiError(404, "Customer not found");

  if (firstName !== undefined) customer.firstName = String(firstName).trim();
  if (lastName !== undefined) customer.lastName = String(lastName).trim();
  if (phone !== undefined) customer.phone = String(phone).trim();
  if (gender !== undefined) customer.gender = gender;
  if (dateOfBirth !== undefined) customer.dateOfBirth = dateOfBirth || null;

  if (email !== undefined) {
    const normalizedEmail = String(email).trim().toLowerCase();
    const existing = await Customer.findOne({
      email: normalizedEmail,
      _id: { $ne: customer._id },
    });
    if (existing) {
      throw new ApiError(409, "Email already used by another account");
    }
    customer.email = normalizedEmail;
  }

  // ✅ Always mark complete
  customer.profileCompleted = true;
  await customer.save();
  console.log("🟢 profileCompleted saved as:", customer.profileCompleted);

  res.status(200).json({
    success: true,
    message: "Customer profile updated",
    data: { customer: formatCustomer(customer) },
  });
});

/* =====================================================
   CHANGE PASSWORD
===================================================== */

export const changeCustomerPassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmPassword) {
    throw new ApiError(400, "All password fields are required");
  }

  if (newPassword !== confirmPassword) {
    throw new ApiError(400, "New passwords do not match");
  }

  if (newPassword.length < 8) {
    throw new ApiError(400, "Password must contain at least 8 characters");
  }

  const customer = await Customer.findById(req.customer._id).select(
    "+password",
  );

  const matched = await customer.comparePassword(currentPassword);

  if (!matched) {
    throw new ApiError(401, "Current password is incorrect");
  }

  const same = await customer.comparePassword(newPassword);

  if (same) {
    throw new ApiError(400, "New password must be different");
  }

  customer.password = newPassword;

  await customer.save();

  const token = generateCustomerToken(customer);

  res.cookie("customerToken", token, customerCookieOptions);

  res.status(200).json({
    success: true,

    message: "Password changed successfully",
  });
});

export const forgotCustomerPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  const customer = await Customer.findOne({
    email: email.trim().toLowerCase(),
  }).select("+passwordResetOtp +passwordResetOtpExpires");

  /*
        Do not reveal account existence.
      */

  if (!customer) {
    return res.status(200).json({
      success: true,

      message: "If an account exists, an OTP has been sent.",
    });
  }

  const otp = customer.createPasswordResetOtp();

  await customer.save({
    validateBeforeSave: false,
  });

  await sendEmailOtp({
    email: customer.email,

    otp,

    purpose: "reset_password",
  });

  const response = {
    success: true,

    message: "If an account exists, an OTP has been sent.",
  };

  if (process.env.NODE_ENV !== "production") {
    response.debugOtp = otp;
  }

  res.status(200).json(response);
});

export const verifyCustomerResetOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    throw new ApiError(400, "Email and OTP are required");
  }

  const customer = await Customer.findOne({
    email: email.trim().toLowerCase(),
  }).select(
    "+passwordResetOtp +passwordResetOtpExpires +passwordResetVerified",
  );

  if (!customer) {
    throw new ApiError(400, "Invalid or expired OTP");
  }

  const valid = customer.verifyPasswordResetOtp(otp);

  if (!valid) {
    throw new ApiError(400, "Invalid or expired OTP");
  }

  customer.passwordResetVerified = true;

  await customer.save({
    validateBeforeSave: false,
  });

  res.status(200).json({
    success: true,

    message: "OTP verified successfully",
  });
});

export const resetCustomerPassword = asyncHandler(async (req, res) => {
  const { email, password, confirmPassword } = req.body;

  if (!email || !password || !confirmPassword) {
    throw new ApiError(400, "Email and password fields are required");
  }

  if (password !== confirmPassword) {
    throw new ApiError(400, "Passwords do not match");
  }

  if (password.length < 8) {
    throw new ApiError(400, "Password must contain at least 8 characters");
  }

  const customer = await Customer.findOne({
    email: email.trim().toLowerCase(),
  }).select(
    "+passwordResetOtp +passwordResetOtpExpires +passwordResetVerified",
  );

  if (!customer || !customer.passwordResetVerified) {
    throw new ApiError(403, "Please verify password reset OTP first");
  }

  customer.password = password;

  customer.passwordResetOtp = undefined;

  customer.passwordResetOtpExpires = undefined;

  customer.passwordResetVerified = false;

  customer.failedLoginAttempts = 0;

  customer.lockUntil = null;

  await customer.save();

  res.status(200).json({
    success: true,

    message: "Password reset successfully",
  });
});

export const updateCustomerProfileImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "Please select a profile image");
  }

  const customer = await Customer.findById(req.customer._id);

  if (!customer) {
    // Delete uploaded file if customer not found
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    throw new ApiError(404, "Customer not found");
  }

  // ── Delete old photo ──
  if (customer.profileImage) {
    const relative = customer.profileImage.replace(/^\/+/, "");
    const oldPath = path.resolve(relative);
    if (fs.existsSync(oldPath)) {
      fs.unlinkSync(oldPath);
    }
  }

  // ── Set new photo ──
  customer.profileImage = `/uploads/customers/${req.file.filename}`;
  await customer.save();

  res.status(200).json({
    success: true,
    message: "Profile image updated successfully",
    data: {
      profileImage: customer.profileImage,
    },
  });
});
export const deleteCustomerProfileImage = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.customer._id);

  if (!customer) {
    throw new ApiError(404, "Customer not found");
  }

  if (customer.profileImage) {
    const filePath = path.resolve(customer.profileImage.replace(/^\/+/, ""));

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    customer.profileImage = "";

    await customer.save();
  }

  res.status(200).json({
    success: true,

    message: "Profile image removed successfully",
  });
});

export const skipCustomerProfile = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.customer._id);
  customer.profileCompleted = true;
  await customer.save();
  console.log("📡 Profile skipped, profileCompleted = true");
  res.json({ success: true, message: "Profile skipped temporarily" });
});

// ─── GET ALL ADDRESSES ────────────────────────────────────
export const getAddresses = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.customer._id).select(
    "addresses",
  );
  res.status(200).json({ success: true, data: customer.addresses });
});

// ─── ADD NEW ADDRESS ──────────────────────────────────────
export const addAddress = asyncHandler(async (req, res) => {
  const {
    label,
    name,
    phone,
    addressLine,
    landmark,
    city,
    state,
    pincode,
    location,
    isDefault,
  } = req.body;

  if (!name || !phone || !addressLine || !city || !state || !pincode) {
    throw new ApiError(
      400,
      "Please fill all required fields (name, phone, addressLine, city, state, pincode)",
    );
  }

  const customer = await Customer.findById(req.customer._id);

  // If this is the first address, make it default
  const makeDefault = customer.addresses.length === 0 || isDefault === true;

  const newAddress = {
    label: label || "home",
    name: name.trim(),
    phone: phone.trim(),
    addressLine: addressLine.trim(),
    landmark: landmark?.trim() || "",
    city: city.trim(),
    state: state.trim(),
    pincode: pincode.trim(),
    location: location || undefined,
    isDefault: makeDefault,
  };

  // If the new address is default, unset others
  if (makeDefault) {
    customer.addresses.forEach((addr) => (addr.isDefault = false));
  }

  customer.addresses.push(newAddress);
  await customer.save();

  // Return the newly added address (last element)
  const added = customer.addresses[customer.addresses.length - 1];
  res.status(201).json({ success: true, data: added });
});

// ─── UPDATE ADDRESS ───────────────────────────────────────
export const updateAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;
  const {
    label,
    name,
    phone,
    addressLine,
    landmark,
    city,
    state,
    pincode,
    location,
  } = req.body;

  const customer = await Customer.findById(req.customer._id);
  const address = customer.addresses.id(addressId);

  if (!address) {
    throw new ApiError(404, "Address not found");
  }

  if (name !== undefined) address.name = name.trim();
  if (phone !== undefined) address.phone = phone.trim();
  if (addressLine !== undefined) address.addressLine = addressLine.trim();
  if (landmark !== undefined) address.landmark = landmark.trim();
  if (city !== undefined) address.city = city.trim();
  if (state !== undefined) address.state = state.trim();
  if (pincode !== undefined) address.pincode = pincode.trim();
  if (location !== undefined) address.location = location;
  if (label !== undefined) address.label = label;

  await customer.save();

  res.status(200).json({ success: true, data: address });
});

// ─── DELETE ADDRESS ───────────────────────────────────────
export const deleteAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;

  const customer = await Customer.findById(req.customer._id);
  const address = customer.addresses.id(addressId);

  if (!address) {
    throw new ApiError(404, "Address not found");
  }

  // If deleting the default address, make another one default if exists
  const wasDefault = address.isDefault;

  customer.addresses.pull(addressId);

  if (wasDefault && customer.addresses.length > 0) {
    customer.addresses[0].isDefault = true;
  }

  await customer.save();

  res.status(200).json({ success: true, message: "Address deleted" });
});

// ─── SET DEFAULT ADDRESS ─────────────────────────────────
export const setDefaultAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;

  const customer = await Customer.findById(req.customer._id);
  const address = customer.addresses.id(addressId);

  if (!address) {
    throw new ApiError(404, "Address not found");
  }

  // Unset all others, set this one
  customer.addresses.forEach((addr) => (addr.isDefault = false));
  address.isDefault = true;

  await customer.save();

  res.status(200).json({ success: true, message: "Default address updated" });
});
// ─── Get food categories (What's on your mind?) ──
// controllers/customerController.js

export const getCategories = async (req, res) => {
  try {
    const categories = await FoodCategory.find({ isActive: true }) // ✅ use FoodCategory
      .sort({ displayOrder: 1, name: 1 })
      .select("name icon image displayOrder");
    res.json({ success: true, data: categories });
  } catch (error) {
    console.error("❌ getCategories error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get fast delivery vendors ──
export const getFastDeliveryVendors = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const vendors = await Vendor.find({ isActive: true, isOnline: true })
      .sort({ averagePreparationTime: 1 })
      .limit(Number(limit))
      .select(
        "businessName businessType profileImage rating averagePreparationTime minimumOrderAmount",
      );
    res.json({ success: true, data: vendors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get vendors with filters ──
export const getVendorsWithFilters = async (req, res) => {
  try {
    const {
      maxTime,
      minRating,
      isVeg,
      search,
      sortBy = "rating",
      order = "desc",
      limit = 20,
    } = req.query;

    let query = { isActive: true, isOnline: true };
    if (maxTime) query.averagePreparationTime = { $lte: Number(maxTime) };
    if (minRating) query.rating = { $gte: Number(minRating) };
    if (isVeg === "true") query.isVeg = true;
    if (search) {
      query.$or = [
        { businessName: { $regex: search, $options: "i" } },
        { businessType: { $regex: search, $options: "i" } },
      ];
    }

    const sort = {};
    sort[sortBy] = order === "asc" ? 1 : -1;

    const vendors = await Vendor.find(query)
      .sort(sort)
      .limit(Number(limit))
      .select(
        "businessName businessType profileImage rating averagePreparationTime minimumOrderAmount isVeg",
      );

    res.json({ success: true, data: vendors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
export const getFoodCategories = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const query = search ? { name: { $regex: search, $options: "i" } } : {};
    const total = await FoodCategory.countDocuments(query);
    const data = await FoodCategory.find(query)
      .sort({ displayOrder: 1, name: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    res.json({
      success: true,
      data,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createFoodCategory = async (req, res) => {
  try {
    const { name, icon, image, displayOrder, isActive } = req.body;
    const existing = await FoodCategory.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });
    if (existing)
      return res
        .status(409)
        .json({ success: false, message: "Category already exists" });
    const category = new FoodCategory({
      name,
      icon,
      image,
      displayOrder,
      isActive,
    });
    await category.save();
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateFoodCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await FoodCategory.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!category)
      return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteFoodCategory = async (req, res) => {
  try {
    const { id } = req.params;
    await FoodCategory.findByIdAndDelete(id);
    res.json({ success: true, message: "Deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// controllers/customerController.js
export const getDishesByCategory = async (req, res) => {
  const { category } = req.query;
  const filter = { isAvailable: true };
  if (category) filter.foodCategory = category;
  const dishes = await MenuItem.find(filter)
    .populate("vendorId", "businessName profileImage")
    .select("name price image description rating vendorId");
  res.json({ success: true, data: dishes });
};
