// controllers/searchController.js
import Vendor from "../models/vendor.js";
import MenuItem from "../models/MenuItem.js";
import VendorCategory from "../models/VendorCategory.js";
import { ApiError } from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { calculateDistance } from "../utils/geoUtils.js";

// ─── Helper: build vendor filter with foodType ──────────
const buildVendorFilter = (foodType) => {
  const filter = {
    isActive: true,
    approvalStatus: "approved",
  };
  if (foodType === "veg") filter.foodType = "veg";
  else if (foodType === "non-veg") filter.foodType = "non-veg";
  return filter;
};

// ─── Search ──────────────────────────────────────────────
export const search = asyncHandler(async (req, res) => {
  const { q = "", foodType = "both", lat, lng, limit = 20 } = req.query;

  if (!q.trim()) {
    throw new ApiError(400, "Search query is required");
  }

  const searchTerm = q.trim();
  const parsedLimit = parseInt(limit);
  const hasLocation =
    lat && lng && !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lng));
  const userLat = hasLocation ? parseFloat(lat) : null;
  const userLng = hasLocation ? parseFloat(lng) : null;

  console.log(
    `🔍 Search: "${searchTerm}" | foodType: ${foodType} | location: ${hasLocation}`,
  );

  // ─── 1. Build vendor filter ────────────────────────────
  const vendorFilter = {
    ...buildVendorFilter(foodType),
    $or: [
      { businessName: { $regex: searchTerm, $options: "i" } },
      { description: { $regex: searchTerm, $options: "i" } },
      { cuisine: { $regex: searchTerm, $options: "i" } },
    ],
  };

  // ─── 2. Fetch vendors ──────────────────────────────────
  let vendors = await Vendor.find(vendorFilter)
    .limit(parsedLimit)
    .select(
      "businessName description cuisine foodType address profileImage rating",
    )
    .lean();

  // ─── 3. Fetch menu items with aggregation ─────────────
  // Build the vendor match stage for items (filter by vendor foodType)
  const vendorMatch = buildVendorFilter(foodType);

  const itemPipeline = [
    {
      $match: {
        $or: [
          { name: { $regex: searchTerm, $options: "i" } },
          { description: { $regex: searchTerm, $options: "i" } },
        ],
        isAvailable: true,
      },
    },
    {
      $lookup: {
        from: "vendors",
        localField: "vendorId", // adjust if your field is 'vendor' or 'vendorId'
        foreignField: "_id",
        as: "vendor",
      },
    },
    { $unwind: { path: "$vendor", preserveNullAndEmptyArrays: false } },
    {
      $match: {
        "vendor.isActive": true,
        "vendor.approvalStatus": "approved",
        ...(foodType === "veg" ? { "vendor.foodType": "veg" } : {}),
        ...(foodType === "non-veg" ? { "vendor.foodType": "non-veg" } : {}),
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        description: 1,
        price: 1,
        image: 1,
        rating: 1,
        vendor: {
          _id: 1,
          businessName: 1,
          businessType: 1,
          profileImage: 1,
          address: 1,
        },
      },
    },
    { $limit: parsedLimit * 2 }, // fetch extra for sorting later
  ];

  let menuItems = await MenuItem.aggregate(itemPipeline);

  // ─── 4. Add distance to vendors ────────────────────────
  if (hasLocation) {
    vendors = vendors.map((v) => {
      if (v.address?.location?.coordinates) {
        const [lng, lat] = v.address.location.coordinates;
        const distance = calculateDistance(userLat, userLng, lat, lng);
        return { ...v, distance: Math.round(distance * 100) / 100 };
      }
      return { ...v, distance: null };
    });

    menuItems = menuItems.map((item) => {
      if (item.vendor?.address?.location?.coordinates) {
        const [lng, lat] = item.vendor.address.location.coordinates;
        const distance = calculateDistance(userLat, userLng, lat, lng);
        return { ...item, distance: Math.round(distance * 100) / 100 };
      }
      return { ...item, distance: null };
    });

    // Sort by distance (nearest first)
    vendors.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
    menuItems.sort(
      (a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity),
    );
  }

  // Trim to requested limit
  menuItems = menuItems.slice(0, parsedLimit);

  // ─── 5. Search categories ──────────────────────────────
  const categories = await VendorCategory.find({
    name: { $regex: searchTerm, $options: "i" },
  })
    .limit(parsedLimit)
    .select("name image")
    .lean();

  console.log(
    `✅ Vendors: ${vendors.length}, Items: ${menuItems.length}, Categories: ${categories.length}`,
  );

  // ─── Response ──────────────────────────────────────────
  res.json({
    success: true,
    data: {
      query: searchTerm,
      foodType,
      vendors,
      items: menuItems,
      categories,
    },
  });
});
