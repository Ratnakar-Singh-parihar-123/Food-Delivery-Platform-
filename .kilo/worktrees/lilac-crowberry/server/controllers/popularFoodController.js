// controllers/popularFoodController.js
import PopularFood from "../models/PopularFood.js";
import Vendor from "../models/vendor.js";
import MenuItem from "../models/MenuItem.js";
import { ApiError } from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { calculateDistance } from "../utils/geoUtils.js";

// ─── Vendor: Add a popular food ──────────────────────────
export const addPopularFood = asyncHandler(async (req, res) => {
  const vendorId = req.vendor._id;
  const { menuItemId } = req.body;

  if (!menuItemId) {
    throw new ApiError(400, "Menu item ID is required");
  }

  // Verify menu item belongs to this vendor
  const menuItem = await MenuItem.findOne({
    _id: menuItemId,
    $or: [{ vendor: vendorId }, { vendorId: vendorId }],
  });
  if (!menuItem) {
    throw new ApiError(404, "Menu item not found or does not belong to you");
  }

  // Check if already added
  const existing = await PopularFood.findOne({
    menuItem: menuItemId,
    vendor: vendorId,
  });
  if (existing) {
    throw new ApiError(400, "This item is already in the popular list");
  }

  const popularFood = new PopularFood({
    menuItem: menuItemId,
    vendor: vendorId,
    createdBy: vendorId,
    isActive: false, // pending admin approval
  });

  await popularFood.save();

  res.status(201).json({
    success: true,
    message: "Popular food added. Waiting for admin approval.",
    data: { popularFood },
  });
});

// ─── Vendor: Remove a popular food ─────────────────────────
export const removePopularFood = asyncHandler(async (req, res) => {
  const vendorId = req.vendor._id;
  const { popularFoodId } = req.params;

  const popularFood = await PopularFood.findOne({
    _id: popularFoodId,
    vendor: vendorId,
  });
  if (!popularFood) {
    throw new ApiError(404, "Popular food not found");
  }

  await popularFood.deleteOne();

  res.json({
    success: true,
    message: "Popular food removed",
  });
});

// ─── Vendor: Get my popular foods ──────────────────────────
export const getVendorPopularFoods = asyncHandler(async (req, res) => {
  const vendorId = req.vendor._id;

  const popularFoods = await PopularFood.find({ vendor: vendorId })
    .populate("menuItem", "name price image description isAvailable")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: { popularFoods },
  });
});

// ─── Customer: Get popular foods near me ──────────────────
export const getNearbyPopularFoods = asyncHandler(async (req, res) => {
  const { lat, lng, radius = 5, limit = 20 } = req.query;

  if (!lat || !lng) {
    throw new ApiError(400, "Latitude and longitude are required");
  }

  const userLat = parseFloat(lat);
  const userLng = parseFloat(lng);
  if (isNaN(userLat) || isNaN(userLng)) {
    throw new ApiError(400, "Invalid coordinates");
  }

  // 1. Find vendors within radius (using geo query)
  const vendors = await Vendor.find({
    approvalStatus: "approved",
    isActive: true,
    isBlocked: false,
    "address.location": { $exists: true, $ne: null },
    "address.location.coordinates": { $exists: true },
  }).lean();

  // 2. Calculate distance and filter
  const nearbyVendorIds = [];
  const vendorDistances = {};
  vendors.forEach((v) => {
    if (!v.address?.location?.coordinates) return;
    const [vendorLng, vendorLat] = v.address.location.coordinates;
    const distance = calculateDistance(userLat, userLng, vendorLat, vendorLng);
    if (distance <= radius) {
      nearbyVendorIds.push(v._id);
      vendorDistances[v._id.toString()] = distance;
    }
  });

  if (nearbyVendorIds.length === 0) {
    return res.json({
      success: true,
      data: { popularFoods: [] },
    });
  }

  // 3. Find popular foods from these vendors, active & not expired
  const now = new Date();
  const popularFoods = await PopularFood.find({
    vendor: { $in: nearbyVendorIds },
    isActive: true,
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: null },
      { expiresAt: { $gt: now } },
    ],
  })
    .populate({
      path: "menuItem",
      select: "name price image description isAvailable isVeg",
    })
    .populate("vendor", "businessName profileImage rating address")
    .sort({ priority: -1, createdAt: -1 })
    .limit(parseInt(limit));

  // 4. Attach distance to each item
  const itemsWithDistance = popularFoods.map((pf) => {
    const vendorId = pf.vendor._id.toString();
    const distance = vendorDistances[vendorId] || null;
    return {
      ...pf.toObject(),
      distance: distance !== null ? Math.round(distance * 100) / 100 : null,
    };
  });

  // Sort by distance (nearest first) if priority is same
  itemsWithDistance.sort((a, b) => {
    if (a.priority !== b.priority) return b.priority - a.priority;
    if (a.distance !== null && b.distance !== null)
      return a.distance - b.distance;
    return 0;
  });

  res.json({
    success: true,
    data: { popularFoods: itemsWithDistance },
  });
});

// ─── Admin: Get all popular foods ──────────────────────────
export const adminGetPopularFoods = asyncHandler(async (req, res) => {
  const { isActive, vendorId, page = 1, limit = 20 } = req.query;

  const filter = {};
  if (isActive !== undefined) filter.isActive = isActive === "true";
  if (vendorId) filter.vendor = vendorId;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const popularFoods = await PopularFood.find(filter)
    .populate("menuItem", "name price image description isAvailable isVeg")
    .populate("vendor", "businessName profileImage rating address")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await PopularFood.countDocuments(filter);

  res.json({
    success: true,
    data: {
      popularFoods,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    },
  });
});

// ─── Admin: Toggle popular food active status ──────────────
export const adminTogglePopularFood = asyncHandler(async (req, res) => {
  const { popularFoodId } = req.params;
  const { isActive } = req.body;

  const popularFood = await PopularFood.findById(popularFoodId);
  if (!popularFood) {
    throw new ApiError(404, "Popular food not found");
  }

  popularFood.isActive =
    isActive !== undefined ? isActive : !popularFood.isActive;
  await popularFood.save();

  res.json({
    success: true,
    message: `Popular food ${popularFood.isActive ? "activated" : "deactivated"}`,
    data: { popularFood },
  });
});

// ─── Admin: Delete popular food ─────────────────────────────
export const adminDeletePopularFood = asyncHandler(async (req, res) => {
  const { popularFoodId } = req.params;

  const popularFood = await PopularFood.findById(popularFoodId);
  if (!popularFood) {
    throw new ApiError(404, "Popular food not found");
  }

  await popularFood.deleteOne();

  res.json({
    success: true,
    message: "Popular food deleted",
  });
});
