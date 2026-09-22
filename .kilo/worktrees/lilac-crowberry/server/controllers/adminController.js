import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import Admin from "../models/admin.js";
import FoodCategory from "../models/FoodCategory.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { generateAdminToken } from "../utils/generateToken.js";
import Vendor from "../models/vendor.js";
import MenuItem from "../models/MenuItem.js";
import Rider from "../models/rider.js";
import Order from "../models/order.js";

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const getLocalImagePath = (imagePath) => {
  const relativePath = imagePath.replace(/^\/+/, "");

  return path.join(__dirname, "../..", relativePath);
};
/* ====================================================
   COOKIE OPTIONS
==================================================== */

const cookieOptions = {
  httpOnly: true,

  secure: process.env.NODE_ENV === "production",

  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",

  maxAge: 7 * 24 * 60 * 60 * 1000,
};

/* ====================================================
   SAFE ADMIN RESPONSE
==================================================== */

const formatAdmin = (admin) => {
  return {
    id: admin._id,

    firstName: admin.firstName,

    lastName: admin.lastName,

    fullName: `${admin.firstName} ${admin.lastName || ""}`.trim(),

    email: admin.email,

    phone: admin.phone,

    profileImage: admin.profileImage || "",

    role: admin.role,

    permissions: admin.permissions || [],

    isActive: admin.isActive,

    isEmailVerified: admin.isEmailVerified,

    lastLoginAt: admin.lastLoginAt,

    createdAt: admin.createdAt,

    updatedAt: admin.updatedAt,
  };
};

/* ====================================================
   REGISTER FIRST ADMIN ONLY
==================================================== */

export const registerAdmin = asyncHandler(async (req, res) => {
  const adminCount = await Admin.countDocuments();

  if (adminCount > 0) {
    throw new ApiError(403, "Admin registration is closed");
  }

  const { firstName, lastName, email, phone, password, confirmPassword } =
    req.body;

  if (!firstName || !email || !password) {
    throw new ApiError(400, "First name, email and password are required");
  }

  if (confirmPassword && password !== confirmPassword) {
    throw new ApiError(400, "Passwords do not match");
  }

  if (password.length < 8) {
    throw new ApiError(400, "Password must contain at least 8 characters");
  }

  const normalizedEmail = email.trim().toLowerCase();

  const existingAdmin = await Admin.exists({
    email: normalizedEmail,
  });

  if (existingAdmin) {
    throw new ApiError(409, "Email already registered");
  }

  const admin = await Admin.create({
    firstName: firstName.trim(),

    lastName: lastName?.trim() || "",

    email: normalizedEmail,

    phone: phone?.trim() || "",

    password,

    role: "super_admin",

    isActive: true,
  });

  const token = generateAdminToken(admin);

  res.cookie("adminToken", token, cookieOptions);

  res.status(201).json({
    success: true,

    message: "Super admin created successfully",

    data: {
      admin: formatAdmin(admin),
      token,
    },
  });
});

/* ====================================================
   LOGIN
==================================================== */

export const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const normalizedEmail = email.trim().toLowerCase();

  const admin = await Admin.findOne({
    email: normalizedEmail,
  }).select("+password");

  if (!admin) {
    throw new ApiError(401, "Invalid email or password");
  }

  if (!admin.isActive) {
    throw new ApiError(403, "Admin account is disabled");
  }

  /* Check lock */

  if (admin.lockUntil && admin.lockUntil > Date.now()) {
    throw new ApiError(423, "Account temporarily locked. Try again later.");
  }

  const passwordMatched = await admin.comparePassword(password);

  if (!passwordMatched) {
    admin.failedLoginAttempts += 1;

    if (admin.failedLoginAttempts >= 5) {
      admin.lockUntil = new Date(Date.now() + 15 * 60 * 1000);

      admin.failedLoginAttempts = 0;
    }

    await admin.save({
      validateBeforeSave: false,
    });

    throw new ApiError(401, "Invalid email or password");
  }

  /* Reset failed login */

  admin.failedLoginAttempts = 0;

  admin.lockUntil = null;

  admin.lastLoginAt = new Date();

  admin.lastLoginIp =
    req.headers["x-forwarded-for"] || req.socket.remoteAddress || req.ip || "";

  await admin.save({
    validateBeforeSave: false,
  });

  const token = generateAdminToken(admin);

  res.cookie("adminToken", token, cookieOptions);

  res.status(200).json({
    success: true,

    message: "Admin logged in successfully",

    data: {
      admin: formatAdmin(admin),
      token,
    },
  });
});

/* ====================================================
   LOGOUT
==================================================== */

export const logoutAdmin = asyncHandler(async (req, res) => {
  res.clearCookie("adminToken", {
    httpOnly: true,

    secure: process.env.NODE_ENV === "production",

    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });

  res.status(200).json({
    success: true,

    message: "Admin logged out successfully",
  });
});

/* ====================================================
   GET PROFILE
==================================================== */

export const getAdminProfile = asyncHandler(async (req, res) => {
  // Check if admin is attached to request
  const admin = req.admin || req.user;
  if (!admin) throw new ApiError(401, "Unauthorized");

  // Fetch fresh data from DB
  const adminData = await Admin.findById(admin._id).select("-password");
  if (!adminData) throw new ApiError(404, "Admin not found");

  res.status(200).json({
    success: true,
    data: { admin: adminData },
  });
});

/* ====================================================
   UPDATE PROFILE
==================================================== */

export const updateAdminProfile = asyncHandler(async (req, res) => {
  const { firstName, lastName, phone } = req.body;

  const admin = await Admin.findById(req.admin._id);

  if (!admin) {
    throw new ApiError(404, "Admin not found");
  }

  if (firstName !== undefined) {
    const value = String(firstName).trim();

    if (value.length < 2) {
      throw new ApiError(400, "First name is too short");
    }

    admin.firstName = value;
  }

  if (lastName !== undefined) {
    admin.lastName = String(lastName).trim();
  }

  if (phone !== undefined) {
    admin.phone = String(phone).trim();
  }

  await admin.save();

  res.status(200).json({
    success: true,

    message: "Profile updated successfully",

    data: {
      admin: formatAdmin(admin),
      token,
    },
  });
});

/* ====================================================
   UPDATE EMAIL
==================================================== */

export const updateAdminEmail = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "New email and password are required");
  }

  const admin = await Admin.findById(req.admin._id).select("+password");

  const passwordMatched = await admin.comparePassword(password);

  if (!passwordMatched) {
    throw new ApiError(401, "Current password is incorrect");
  }

  const normalizedEmail = email.trim().toLowerCase();

  const exists = await Admin.exists({
    email: normalizedEmail,

    _id: {
      $ne: admin._id,
    },
  });

  if (exists) {
    throw new ApiError(409, "Email is already being used");
  }

  admin.email = normalizedEmail;

  admin.isEmailVerified = false;

  await admin.save();

  res.status(200).json({
    success: true,

    message: "Email updated successfully",

    data: {
      admin: formatAdmin(admin),
      token,
    },
  });
});

/* ====================================================
   CHANGE PASSWORD
==================================================== */

export const changeAdminPassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmPassword) {
    throw new ApiError(400, "All password fields are required");
  }

  if (newPassword !== confirmPassword) {
    throw new ApiError(400, "New passwords do not match");
  }

  if (newPassword.length < 8) {
    throw new ApiError(400, "Password must be at least 8 characters");
  }

  const admin = await Admin.findById(req.admin._id).select("+password");

  const correct = await admin.comparePassword(currentPassword);

  if (!correct) {
    throw new ApiError(401, "Current password is incorrect");
  }

  const samePassword = await admin.comparePassword(newPassword);

  if (samePassword) {
    throw new ApiError(400, "New password must be different");
  }

  admin.password = newPassword;

  await admin.save();

  const token = generateAdminToken(admin);

  res.cookie("adminToken", token, cookieOptions);

  res.status(200).json({
    success: true,

    message: "Password changed successfully",
  });
});

/* ====================================================
   FORGOT PASSWORD
==================================================== */

export const forgotAdminPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  const admin = await Admin.findOne({
    email: email.trim().toLowerCase(),
  });

  /*
        Same response even if email
        does not exist.
      */

  if (!admin) {
    return res.status(200).json({
      success: true,

      message:
        "If the admin account exists, reset instructions have been generated.",
    });
  }

  const rawToken = admin.createPasswordResetToken();

  await admin.save({
    validateBeforeSave: false,
  });

  /*
        Development only.
        Production me token email
        ke through send karna.
      */

  const response = {
    success: true,

    message: "Password reset token generated successfully",
  };

  if (process.env.NODE_ENV !== "production") {
    response.resetToken = rawToken;

    response.resetUrl = `${process.env.CLIENT_URL}/admin/reset-password/${rawToken}`;
  }

  res.status(200).json(response);
});

/* ====================================================
   RESET PASSWORD
==================================================== */

export const resetAdminPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;

  const { password, confirmPassword } = req.body;

  if (!password || !confirmPassword) {
    throw new ApiError(400, "Password and confirm password are required");
  }

  if (password !== confirmPassword) {
    throw new ApiError(400, "Passwords do not match");
  }

  if (password.length < 8) {
    throw new ApiError(400, "Password must contain at least 8 characters");
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const admin = await Admin.findOne({
    passwordResetToken: hashedToken,

    passwordResetExpires: {
      $gt: Date.now(),
    },
  }).select("+passwordResetToken +passwordResetExpires");

  if (!admin) {
    throw new ApiError(400, "Reset token is invalid or expired");
  }

  admin.password = password;

  admin.passwordResetToken = undefined;

  admin.passwordResetExpires = undefined;

  admin.failedLoginAttempts = 0;

  admin.lockUntil = null;

  await admin.save();

  const authToken = generateAdminToken(admin);

  res.cookie("adminToken", authToken, cookieOptions);

  res.status(200).json({
    success: true,

    message: "Password reset successfully",
  });
});

/* ====================================================
   UPLOAD PROFILE IMAGE
==================================================== */
export const updateAdminProfileImage = asyncHandler(async (req, res) => {
  console.log("BODY:", req.body);
  console.log("FILE:", req.file);

  if (!req.file) {
    throw new ApiError(400, "Please select an image");
  }

  const admin = await Admin.findById(req.admin._id);

  if (!admin) {
    throw new ApiError(404, "Admin not found");
  }

  /* ===============================
     DELETE OLD PROFILE IMAGE
  =============================== */

  if (admin.profileImage) {
    const relativeOldPath = admin.profileImage.replace(/^\/+/, "");

    const oldImagePath = path.join(__dirname, "../..", relativeOldPath);

    if (fs.existsSync(oldImagePath)) {
      fs.unlinkSync(oldImagePath);
    }
  }

  /* ===============================
     SAVE NEW PUBLIC IMAGE PATH
  =============================== */

  admin.profileImage = `/uploads/admin/${req.file.filename}`;

  await admin.save();

  return res.status(200).json({
    success: true,
    message: "Profile image updated successfully",

    data: {
      profileImage: admin.profileImage,
    },
  });
});

/* ====================================================
   DELETE PROFILE IMAGE
==================================================== */

export const deleteAdminProfileImage = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.admin._id);

  if (!admin) {
    throw new ApiError(404, "Admin not found");
  }

  if (admin.profileImage) {
    const imagePath = path.join(__dirname, "../..", admin.profileImage);

    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    admin.profileImage = "";

    await admin.save();
  }

  res.status(200).json({
    success: true,

    message: "Profile image removed successfully",
  });
});
// controllers/adminController.js
// export const getAllVendorsForAdmin = async (req, res) => {
//   try {
//     const vendors = await Vendor.find({}).select(
//       "_id businessName name profileImage isActive",
//     );
//     // Transform to ensure a label field exists
//     const formatted = vendors.map((v) => ({
//       _id: v._id,
//       businessName: v.businessName || v.name || "Unnamed",
//       profileImage: v.profileImage || "",
//     }));
//     res.json({ success: true, data: formatted });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };
// controllers/adminController.js

export const getAllVendorsForAdmin = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = "",
      status = "",
      businessType = "",
      approvalStatus = "", // ← yeh naya parameter add karo
    } = req.query;

    // ─── Build query filter ──────────────────────────────
    const filter = {};

    if (search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      filter.$or = [
        { businessName: regex },
        { ownerFirstName: regex },
        { ownerLastName: regex },
        { email: regex },
        { phone: regex },
      ];
    }

    if (status) {
      filter.approvalStatus = status; // purana 'status' parameter (ho sakta hai approvalStatus ke liye use ho raha ho)
    }

    if (businessType) {
      filter.businessType = businessType;
    }

    // ✅ YAHAN LAGAO – approvalStatus query param ko filter mein daalo
    if (approvalStatus) {
      filter.approvalStatus = approvalStatus;
    }

    // ─── Pagination ──────────────────────────────────────
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    // ─── Fetch vendors ──────────────────────────────────
    const [vendors, total] = await Promise.all([
      Vendor.find(filter)
        .select(
          "_id businessName email businessType foodType address approvalStatus isOnline isBlocked isActive commissionPercentage createdAt profileImage coverImage isActive ownerFirstName ownerLastName phone isEmailVerified fssaiNumber panNumber",
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),

      Vendor.countDocuments(filter),
    ]);

    // ─── Format response ─────────────────────────────────
    const formatted = vendors.map((v) => ({
      _id: v._id,
      businessName: v.businessName || "Unnamed",
      email: v.email || "",
      phone: v.phone || "",
      businessType: v.businessType || "",
      foodType: v.foodType || "",
      address: v.address || {},
      approvalStatus: v.approvalStatus || "pending",
      isOnline: v.isOnline || false,
      isBlocked: v.isBlocked || false,
      isActive: v.isActive !== undefined ? v.isActive : true,
      commissionPercentage: v.commissionPercentage || 0,
      createdAt: v.createdAt,
      profileImage: v.profileImage || "",
      coverImage: v.coverImage || "",
      ownerFirstName: v.ownerFirstName || "",
      ownerLastName: v.ownerLastName || "",
      isEmailVerified: v.isEmailVerified || false,
      fssaiNumber: v.fssaiNumber || "",
      panNumber: v.panNumber || "",
    }));

    res.json({
      success: true,
      data: {
        vendors: formatted,
        pagination: {
          page: parseInt(page),
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    console.error("❌ Error fetching vendors:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch vendors",
    });
  }
};

// export const getAllMenuItemsForAdmin = async (req, res) => {
//   try {
//     const items = await MenuItem.find({})
//       .select("_id name vendorId price isActive")
//       .populate("vendorId", "businessName");
//     res.json({ success: true, data: items });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };
export const getAllMenuItemsForAdmin = async (req, res) => {
  try {
    const items = await MenuItem.find({})
      .populate("vendorId", "businessName")
      .select("name price image description vendorId categoryId isAvailable")
      .lean();

    res.json({
      success: true,
      data: { items },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
export const createCategory = async (req, res) => {
  try {
    const { name, icon, image, displayOrder } = req.body;
    const existing = await Category.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });
    if (existing)
      return res
        .status(409)
        .json({ success: false, message: "Category exists" });
    const category = new Category({ name, icon, image, displayOrder });
    await category.save();
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!category)
      return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    await Category.findByIdAndDelete(id);
    res.json({ success: true, message: "Deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ displayOrder: 1 });
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// ─── Helper to delete image file ──────────────────────────
const deleteImageFile = (imagePath) => {
  if (!imagePath) return;
  const fullPath = path.join(process.cwd(), imagePath);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
    console.log(`🗑️ Deleted image: ${fullPath}`);
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
    console.error("❌ getFoodCategories error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createFoodCategory = async (req, res) => {
  try {
    const { name, icon, displayOrder, isActive } = req.body;

    // Validate required fields
    if (!name || !name.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Name is required" });
    }

    // Check duplicate (case-insensitive)
    const existing = await FoodCategory.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
    });
    if (existing) {
      return res
        .status(409)
        .json({ success: false, message: "Category already exists" });
    }

    // Build category data
    const categoryData = {
      name: name.trim(),
      icon: icon || "🍽️",
      displayOrder: Number(displayOrder) || 0,
      isActive: isActive === "true" || isActive === true,
    };

    // If file uploaded, save path
    if (req.file) {
      categoryData.image = `/uploads/categories/${req.file.filename}`;
    }

    const category = new FoodCategory(categoryData);
    await category.save();

    res.status(201).json({ success: true, data: category });
  } catch (error) {
    console.error("❌ createFoodCategory error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateFoodCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, icon, displayOrder, isActive } = req.body;

    const category = await FoodCategory.findById(id);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    // Update fields
    if (name !== undefined) category.name = name.trim();
    if (icon !== undefined) category.icon = icon;
    if (displayOrder !== undefined)
      category.displayOrder = Number(displayOrder);
    if (isActive !== undefined)
      category.isActive = isActive === "true" || isActive === true;

    // If new image uploaded, delete old one and set new path
    if (req.file) {
      if (category.image) {
        deleteImageFile(category.image); // delete old image from disk
      }
      category.image = `/uploads/categories/${req.file.filename}`;
    }

    await category.save();
    res.json({ success: true, data: category });
  } catch (error) {
    console.error("❌ updateFoodCategory error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteFoodCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await FoodCategory.findById(id);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    // Delete associated image file if exists
    if (category.image) {
      deleteImageFile(category.image);
    }

    await category.deleteOne();
    res.json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    console.error("❌ deleteFoodCategory error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
/* ====================================================
   RIDER LOCATIONS
==================================================== */

/* ====================================================
   RIDER LOCATIONS (for admin map)
==================================================== */
export const getRiderLocations = asyncHandler(async (req, res) => {
  const riders = await Rider.find(
    { isOnline: true, currentLocation: { $exists: true, $ne: null } },
    "firstName lastName phone currentLocation isOnline",
  ).lean();

  const formatted = riders.map((r) => ({
    id: r._id,
    name: `${r.firstName || ""} ${r.lastName || ""}`.trim(),
    phone: r.phone,
    lat: r.currentLocation?.coordinates?.[1] || null,
    lng: r.currentLocation?.coordinates?.[0] || null,
    isOnline: r.isOnline,
  }));

  res.status(200).json({
    success: true,
    data: { riders: formatted },
  });
});

/**
 * Get a single rider's current location
 */
export const getRiderLocation = asyncHandler(async (req, res) => {
  const { riderId } = req.params;
  const rider = await Rider.findById(riderId).select(
    "firstName lastName phone currentLocation isOnline",
  );

  if (!rider) {
    throw new ApiError(404, "Rider not found");
  }

  const location = rider.currentLocation
    ? {
        lat: rider.currentLocation.coordinates[1],
        lng: rider.currentLocation.coordinates[0],
      }
    : null;

  res.status(200).json({
    success: true,
    data: {
      rider: {
        id: rider._id,
        name: `${rider.firstName || ""} ${rider.lastName || ""}`.trim(),
        phone: rider.phone,
        isOnline: rider.isOnline,
        location,
      },
    },
  });
});

/* ====================================================
   VENDOR LOCATION
==================================================== */

/**
 * Get a vendor's location
 */
export const getVendorLocation = asyncHandler(async (req, res) => {
  const { vendorId } = req.params;
  const vendor = await Vendor.findById(vendorId).select(
    "businessName location address",
  );

  if (!vendor) {
    throw new ApiError(404, "Vendor not found");
  }

  // Prefer location field (GeoJSON) else fallback to address coordinates
  let location = null;
  if (vendor.location?.coordinates) {
    location = {
      lat: vendor.location.coordinates[1],
      lng: vendor.location.coordinates[0],
    };
  } else if (vendor.address?.coordinates) {
    // If address has coordinates array [lng, lat]
    const coords = vendor.address.coordinates;
    if (Array.isArray(coords) && coords.length === 2) {
      location = {
        lat: coords[1],
        lng: coords[0],
      };
    }
  }

  res.status(200).json({
    success: true,
    data: {
      vendor: {
        id: vendor._id,
        name: vendor.businessName,
        location,
      },
    },
  });
});

/* ====================================================
   ORDER TRACKING (Vendor → Rider → Delivery)
==================================================== */

export const getOrderTracking = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  // Fetch order with populated vendor, rider, and customer
  const order = await Order.findById(orderId)
    .populate({
      path: "vendorId",
      select: "businessName location address",
    })
    .populate({
      path: "riderId",
      select: "firstName lastName phone currentLocation isOnline",
    })
    .populate({
      path: "customerId",
      select: "firstName lastName addresses",
    })
    .lean();

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  // ─── Vendor location ──────────────────────────────────
  let vendorLocation = null;
  if (order.vendorId) {
    const v = order.vendorId;
    if (v.location?.coordinates) {
      vendorLocation = {
        lat: v.location.coordinates[1],
        lng: v.location.coordinates[0],
      };
    } else if (v.address?.coordinates) {
      const coords = v.address.coordinates;
      if (Array.isArray(coords) && coords.length === 2) {
        vendorLocation = {
          lat: coords[1],
          lng: coords[0],
        };
      }
    }
  }

  // ─── Rider location ──────────────────────────────────
  let riderLocation = null;
  if (order.riderId) {
    const r = order.riderId;
    if (r.currentLocation?.coordinates) {
      riderLocation = {
        lat: r.currentLocation.coordinates[1],
        lng: r.currentLocation.coordinates[0],
      };
    }
  }

  // ─── Delivery address location ──────────────────────
  let deliveryLocation = null;
  if (order.deliveryAddress?.coordinates) {
    const coords = order.deliveryAddress.coordinates;
    if (Array.isArray(coords) && coords.length === 2) {
      deliveryLocation = {
        lat: coords[1],
        lng: coords[0],
      };
    }
  } else if (order.customerId?.addresses?.length) {
    // fallback: use first address of customer (if any)
    const customer = order.customerId;
    const defaultAddr =
      customer.addresses.find((a) => a.isDefault) || customer.addresses[0];
    if (defaultAddr?.coordinates) {
      const coords = defaultAddr.coordinates;
      if (Array.isArray(coords) && coords.length === 2) {
        deliveryLocation = {
          lat: coords[1],
          lng: coords[0],
        };
      }
    }
  }

  res.status(200).json({
    success: true,
    data: {
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
      },
      vendor: {
        id: order.vendorId?._id,
        name: order.vendorId?.businessName || "Vendor",
        location: vendorLocation,
      },
      rider: order.riderId
        ? {
            id: order.riderId._id,
            name: `${order.riderId.firstName || ""} ${order.riderId.lastName || ""}`.trim(),
            phone: order.riderId.phone,
            isOnline: order.riderId.isOnline,
            location: riderLocation,
          }
        : null,
      delivery: {
        address: order.deliveryAddress?.addressLine || "",
        location: deliveryLocation,
      },
    },
  });
});

/* ====================================================
   UPDATE RIDER LOCATION (for rider app)
==================================================== */

/**
 * Endpoint for rider app to update current location
 * (This should be in rider controller, but adding here for completeness)
 */
// controllers/riderController.js
export const updateRiderLocation = asyncHandler(async (req, res) => {
  const { lat, lng } = req.body;
  const riderId = req.user._id;

  if (lat === undefined || lng === undefined) {
    throw new ApiError(400, "Latitude and longitude are required");
  }

  const rider = await Rider.findById(riderId);
  if (!rider) {
    throw new ApiError(404, "Rider not found");
  }

  rider.currentLocation = {
    type: "Point",
    coordinates: [parseFloat(lng), parseFloat(lat)],
  };
  rider.lastLocationUpdate = new Date();
  await rider.save();

  res.status(200).json({
    success: true,
    message: "Location updated",
    data: { lat, lng },
  });
});
// ============================================================
//   VENDOR APPROVAL & MANAGEMENT (Admin)
// ============================================================

/**
 * Get single vendor details (for admin panel)
 * GET /admin/vendors/:vendorId
 */
export const getVendorDetails = asyncHandler(async (req, res) => {
  const { vendorId } = req.params;

  const vendor = await Vendor.findById(vendorId)
    .select(
      "-password -passwordResetOtp -passwordResetOtpExpires -passwordResetVerified -emailOtp -emailOtpExpires -otpAttempts -lastOtpSentAt -failedLoginAttempts -lockUntil",
    )
    .lean();

  if (!vendor) {
    throw new ApiError(404, "Vendor not found");
  }

  res.status(200).json({
    success: true,
    data: { vendor },
  });
});

/**
 * Approve a vendor
 * PUT /admin/vendors/:vendorId/approve
 */
export const approveVendor = asyncHandler(async (req, res) => {
  const { vendorId } = req.params;

  const vendor = await Vendor.findById(vendorId);
  if (!vendor) {
    throw new ApiError(404, "Vendor not found");
  }

  if (vendor.approvalStatus === "approved") {
    throw new ApiError(400, "Vendor is already approved");
  }

  vendor.approvalStatus = "approved";
  vendor.isActive = true;
  vendor.approvedAt = new Date();
  vendor.approvedBy = req.user._id; // req.user is the admin (from protectAdmin)

  await vendor.save();

  // 🔔 (Optional) Send notification to vendor
  // await sendVendorApprovalNotification(vendor);

  res.status(200).json({
    success: true,
    message: "Vendor approved successfully",
    data: { vendor: vendor.toObject() },
  });
});

/**
 * Reject a vendor with reason
 * PUT /admin/vendors/:vendorId/reject
 */
export const rejectVendor = asyncHandler(async (req, res) => {
  const { vendorId } = req.params;
  const { reason } = req.body;

  if (!reason || !reason.trim()) {
    throw new ApiError(400, "Rejection reason is required");
  }

  const vendor = await Vendor.findById(vendorId);
  if (!vendor) {
    throw new ApiError(404, "Vendor not found");
  }

  if (vendor.approvalStatus === "rejected") {
    throw new ApiError(400, "Vendor is already rejected");
  }

  vendor.approvalStatus = "rejected";
  vendor.rejectionReason = reason.trim();
  vendor.isActive = false;
  vendor.rejectedAt = new Date();
  vendor.rejectedBy = req.user._id;

  await vendor.save();

  // 🔔 (Optional) Send notification to vendor
  // await sendVendorRejectionNotification(vendor, reason);

  res.status(200).json({
    success: true,
    message: "Vendor rejected",
    data: { vendor: vendor.toObject() },
  });
});

/**
 * Block a vendor (set isBlocked = true)
 * PUT /admin/vendors/:vendorId/block
 */
export const blockVendor = asyncHandler(async (req, res) => {
  const { vendorId } = req.params;
  const { reason } = req.body;

  const vendor = await Vendor.findById(vendorId);
  if (!vendor) {
    throw new ApiError(404, "Vendor not found");
  }

  if (vendor.isBlocked) {
    throw new ApiError(400, "Vendor is already blocked");
  }

  vendor.isBlocked = true;
  vendor.isActive = false;
  vendor.blockedAt = new Date();
  vendor.blockedBy = req.user._id;
  vendor.blockReason = reason || "Blocked by admin";

  await vendor.save();

  // 🔔 (Optional) Notify vendor

  res.status(200).json({
    success: true,
    message: "Vendor blocked",
    data: { vendor: vendor.toObject() },
  });
});

/**
 * Unblock a vendor (set isBlocked = false)
 * PUT /admin/vendors/:vendorId/unblock
 */
export const unblockVendor = asyncHandler(async (req, res) => {
  const { vendorId } = req.params;

  const vendor = await Vendor.findById(vendorId);
  if (!vendor) {
    throw new ApiError(404, "Vendor not found");
  }

  if (!vendor.isBlocked) {
    throw new ApiError(400, "Vendor is not blocked");
  }

  vendor.isBlocked = false;
  vendor.isActive = true;
  vendor.unblockedAt = new Date();
  vendor.unblockedBy = req.user._id;
  vendor.blockReason = ""; // clear reason

  await vendor.save();

  // 🔔 (Optional) Notify vendor

  res.status(200).json({
    success: true,
    message: "Vendor unblocked",
    data: { vendor: vendor.toObject() },
  });
});
export const getPendingVendors = asyncHandler(async (req, res) => {
  const vendors = await Vendor.find({
    approvalStatus: "pending",
  })
    .select(
      "_id businessName email businessType foodType address approvalStatus isOnline isBlocked isActive commissionPercentage createdAt profileImage coverImage ownerFirstName ownerLastName phone isEmailVerified fssaiNumber panNumber timings",
    )
    .sort({ createdAt: -1 })
    .lean();

  res.status(200).json({
    success: true,
    data: {
      vendors,
      total: vendors.length,
    },
  });
});
