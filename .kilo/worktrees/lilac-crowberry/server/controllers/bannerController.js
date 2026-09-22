// import fs from "fs";
// import path from "path";

// import Banner from "../models/banner.js";

// import asyncHandler from "../utils/asyncHandler.js";
// import { ApiError } from "../utils/ApiError.js";

// /* =====================================================
//    DELETE FILE HELPER
// ===================================================== */

// const deleteBannerFile = (imagePath) => {
//   if (!imagePath) return;

//   const cleanPath = imagePath.replace(/^\/+/, "");

//   const absolutePath = path.resolve(cleanPath);

//   if (fs.existsSync(absolutePath)) {
//     fs.unlinkSync(absolutePath);
//   }
// };

// /* =====================================================
//    CREATE BANNER - ADMIN
// ===================================================== */

// export const createBanner = asyncHandler(async (req, res) => {
//   const {
//     title,
//     subtitle,
//     target,
//     type,
//     actionLabel,
//     actionUrl,
//     vendor,
//     couponCode,
//     sortOrder,
//     isActive,
//     startAt,
//     endAt,
//   } = req.body;

//   if (!title?.trim()) {
//     throw new ApiError(400, "Banner title is required");
//   }

//   if (!["customer", "rider"].includes(target)) {
//     throw new ApiError(400, "Banner target must be customer or rider");
//   }

//   if (!req.file) {
//     throw new ApiError(400, "Banner image is required");
//   }

//   if (startAt && endAt && new Date(endAt) <= new Date(startAt)) {
//     deleteBannerFile(`/uploads/banners/${req.file.filename}`);

//     throw new ApiError(400, "End date must be after start date");
//   }

//   const banner = await Banner.create({
//     title: title.trim(),

//     subtitle: subtitle?.trim() || "",

//     image: `/uploads/banners/${req.file.filename}`,

//     target,

//     type: type || "general",

//     action: {
//       label: actionLabel?.trim() || "",
//       url: actionUrl?.trim() || "",
//     },

//     vendor: vendor || null,

//     couponCode: couponCode?.trim() || "",

//     sortOrder: Number(sortOrder || 0),

//     isActive: isActive === undefined ? true : String(isActive) === "true",

//     startAt: startAt || null,

//     endAt: endAt || null,

//     createdBy: req.admin._id,
//   });

//   return res.status(201).json({
//     success: true,
//     message: "Banner created successfully",

//     data: {
//       banner,
//     },
//   });
// });

// /* =====================================================
//    GET ALL - ADMIN
// ===================================================== */

// export const getAllBanners = asyncHandler(async (req, res) => {
//   const { target, status, search } = req.query;

//   const page = Math.max(Number(req.query.page) || 1, 1);

//   const limit = Math.min(Number(req.query.limit) || 20, 100);

//   const query = {};

//   if (target && ["customer", "rider"].includes(target)) {
//     query.target = target;
//   }

//   if (status === "active") {
//     query.isActive = true;
//   }

//   if (status === "inactive") {
//     query.isActive = false;
//   }

//   if (search?.trim()) {
//     query.$or = [
//       {
//         title: {
//           $regex: search.trim(),
//           $options: "i",
//         },
//       },
//       {
//         subtitle: {
//           $regex: search.trim(),
//           $options: "i",
//         },
//       },
//     ];
//   }

//   const skip = (page - 1) * limit;

//   const [banners, total] = await Promise.all([
//     Banner.find(query)
//       .populate("vendor", "businessName profileImage")
//       .populate("createdBy", "firstName lastName email")
//       .sort({
//         sortOrder: 1,
//         createdAt: -1,
//       })
//       .skip(skip)
//       .limit(limit),

//     Banner.countDocuments(query),
//   ]);

//   return res.status(200).json({
//     success: true,

//     data: {
//       banners,

//       pagination: {
//         page,
//         limit,
//         total,
//         pages: Math.ceil(total / limit),
//       },
//     },
//   });
// });

// /* =====================================================
//    GET SINGLE
// ===================================================== */

// export const getBannerById = asyncHandler(async (req, res) => {
//   const banner = await Banner.findById(req.params.bannerId);

//   if (!banner) {
//     throw new ApiError(404, "Banner not found");
//   }

//   return res.status(200).json({
//     success: true,

//     data: {
//       banner,
//     },
//   });
// });

// /* =====================================================
//    UPDATE
// ===================================================== */

// export const updateBanner = asyncHandler(async (req, res) => {
//   const banner = await Banner.findById(req.params.bannerId);

//   if (!banner) {
//     if (req.file) {
//       deleteBannerFile(`/uploads/banners/${req.file.filename}`);
//     }

//     throw new ApiError(404, "Banner not found");
//   }

//   const {
//     title,
//     subtitle,
//     target,
//     type,
//     actionLabel,
//     actionUrl,
//     vendor,
//     couponCode,
//     sortOrder,
//     isActive,
//     startAt,
//     endAt,
//   } = req.body;

//   if (target !== undefined && !["customer", "rider"].includes(target)) {
//     throw new ApiError(400, "Invalid banner target");
//   }

//   const newStart = startAt !== undefined ? startAt : banner.startAt;

//   const newEnd = endAt !== undefined ? endAt : banner.endAt;

//   if (newStart && newEnd && new Date(newEnd) <= new Date(newStart)) {
//     if (req.file) {
//       deleteBannerFile(`/uploads/banners/${req.file.filename}`);
//     }

//     throw new ApiError(400, "End date must be after start date");
//   }

//   if (title !== undefined) {
//     banner.title = title.trim();
//   }

//   if (subtitle !== undefined) {
//     banner.subtitle = subtitle.trim();
//   }

//   if (target !== undefined) {
//     banner.target = target;
//   }

//   if (type !== undefined) {
//     banner.type = type;
//   }

//   if (actionLabel !== undefined) {
//     banner.action.label = actionLabel.trim();
//   }

//   if (actionUrl !== undefined) {
//     banner.action.url = actionUrl.trim();
//   }

//   if (vendor !== undefined) {
//     banner.vendor = vendor || null;
//   }

//   if (couponCode !== undefined) {
//     banner.couponCode = couponCode.trim();
//   }

//   if (sortOrder !== undefined) {
//     banner.sortOrder = Number(sortOrder);
//   }

//   if (isActive !== undefined) {
//     banner.isActive = String(isActive) === "true";
//   }

//   if (startAt !== undefined) {
//     banner.startAt = startAt || null;
//   }

//   if (endAt !== undefined) {
//     banner.endAt = endAt || null;
//   }

//   if (req.file) {
//     deleteBannerFile(banner.image);

//     banner.image = `/uploads/banners/${req.file.filename}`;
//   }

//   banner.updatedBy = req.admin._id;

//   await banner.save();

//   return res.status(200).json({
//     success: true,
//     message: "Banner updated successfully",

//     data: {
//       banner,
//     },
//   });
// });

// /* =====================================================
//    ACTIVE / INACTIVE
// ===================================================== */

// export const toggleBannerStatus = asyncHandler(async (req, res) => {
//   const banner = await Banner.findById(req.params.bannerId);

//   if (!banner) {
//     throw new ApiError(404, "Banner not found");
//   }

//   banner.isActive = !banner.isActive;

//   banner.updatedBy = req.admin._id;

//   await banner.save();

//   return res.status(200).json({
//     success: true,

//     message: banner.isActive ? "Banner activated" : "Banner deactivated",

//     data: {
//       isActive: banner.isActive,
//     },
//   });
// });

// /* =====================================================
//    DELETE
// ===================================================== */

// export const deleteBanner = asyncHandler(async (req, res) => {
//   const banner = await Banner.findById(req.params.bannerId);

//   if (!banner) {
//     throw new ApiError(404, "Banner not found");
//   }

//   deleteBannerFile(banner.image);

//   await banner.deleteOne();

//   return res.status(200).json({
//     success: true,
//     message: "Banner deleted successfully",
//   });
// });

// /* =====================================================
//    PUBLIC CUSTOMER / RIDER BANNERS
// ===================================================== */

// export const getActiveBanners = asyncHandler(async (req, res) => {
//   const { target } = req.params;

//   if (!["customer", "rider"].includes(target)) {
//     throw new ApiError(400, "Invalid banner target");
//   }

//   const now = new Date();

//   const banners = await Banner.find({
//     target,

//     isActive: true,

//     $and: [
//       {
//         $or: [
//           {
//             startAt: null,
//           },
//           {
//             startAt: {
//               $lte: now,
//             },
//           },
//         ],
//       },

//       {
//         $or: [
//           {
//             endAt: null,
//           },
//           {
//             endAt: {
//               $gte: now,
//             },
//           },
//         ],
//       },
//     ],
//   })
//     .populate("vendor", "businessName profileImage")
//     .sort({
//       sortOrder: 1,
//       createdAt: -1,
//     });

//   return res.status(200).json({
//     success: true,

//     data: {
//       banners,
//     },
//   });
// });

import fs from "fs";
import path from "path";

import Banner from "../models/banner.js";

import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

/* =====================================================
   DELETE FILE HELPER
===================================================== */

const deleteBannerFile = (imagePath) => {
  if (!imagePath) return;

  const cleanPath = imagePath.replace(/^\/+/, "");

  const absolutePath = path.resolve(cleanPath);

  if (fs.existsSync(absolutePath)) {
    fs.unlinkSync(absolutePath);
  }
};

/* =====================================================
   CREATE BANNER - ADMIN
===================================================== */

export const createBanner = asyncHandler(async (req, res) => {
  const {
    title,
    subtitle,
    target,
    type,
    actionLabel,
    actionUrl,
    vendor,
    couponCode,
    sortOrder,
    isActive,
    startAt,
    endAt,
  } = req.body;

  if (!title?.trim()) {
    throw new ApiError(400, "Banner title is required");
  }

  // ✅ Accept "tiffin" as a valid target
  if (!["customer", "rider", "tiffin"].includes(target)) {
    throw new ApiError(400, "Banner target must be customer, rider or tiffin");
  }

  if (!req.file) {
    throw new ApiError(400, "Banner image is required");
  }

  if (startAt && endAt && new Date(endAt) <= new Date(startAt)) {
    deleteBannerFile(`/uploads/banners/${req.file.filename}`);

    throw new ApiError(400, "End date must be after start date");
  }

  const banner = await Banner.create({
    title: title.trim(),

    subtitle: subtitle?.trim() || "",

    image: `/uploads/banners/${req.file.filename}`,

    target,

    type: type || "general",

    action: {
      label: actionLabel?.trim() || "",
      url: actionUrl?.trim() || "",
    },

    vendor: vendor || null,

    couponCode: couponCode?.trim() || "",

    sortOrder: Number(sortOrder || 0),

    isActive: isActive === undefined ? true : String(isActive) === "true",

    startAt: startAt || null,

    endAt: endAt || null,

    createdBy: req.admin._id,
  });

  return res.status(201).json({
    success: true,
    message: "Banner created successfully",

    data: {
      banner,
    },
  });
});

/* =====================================================
   GET ALL - ADMIN
===================================================== */

export const getAllBanners = asyncHandler(async (req, res) => {
  const { target, status, search } = req.query;

  const page = Math.max(Number(req.query.page) || 1, 1);

  const limit = Math.min(Number(req.query.limit) || 20, 100);

  const query = {};

  // ✅ Accept "tiffin" as a valid target filter
  if (target && ["customer", "rider", "tiffin"].includes(target)) {
    query.target = target;
  }

  if (status === "active") {
    query.isActive = true;
  }

  if (status === "inactive") {
    query.isActive = false;
  }

  if (search?.trim()) {
    query.$or = [
      {
        title: {
          $regex: search.trim(),
          $options: "i",
        },
      },
      {
        subtitle: {
          $regex: search.trim(),
          $options: "i",
        },
      },
    ];
  }

  const skip = (page - 1) * limit;

  const [banners, total] = await Promise.all([
    Banner.find(query)
      .populate("vendor", "businessName profileImage")
      .populate("createdBy", "firstName lastName email")
      .sort({
        sortOrder: 1,
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit),

    Banner.countDocuments(query),
  ]);

  return res.status(200).json({
    success: true,

    data: {
      banners,

      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    },
  });
});

/* =====================================================
   GET SINGLE
===================================================== */

export const getBannerById = asyncHandler(async (req, res) => {
  const banner = await Banner.findById(req.params.bannerId);

  if (!banner) {
    throw new ApiError(404, "Banner not found");
  }

  return res.status(200).json({
    success: true,

    data: {
      banner,
    },
  });
});

/* =====================================================
   UPDATE
===================================================== */

export const updateBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findById(req.params.bannerId);

  if (!banner) {
    if (req.file) {
      deleteBannerFile(`/uploads/banners/${req.file.filename}`);
    }

    throw new ApiError(404, "Banner not found");
  }

  const {
    title,
    subtitle,
    target,
    type,
    actionLabel,
    actionUrl,
    vendor,
    couponCode,
    sortOrder,
    isActive,
    startAt,
    endAt,
  } = req.body;

  // ✅ Accept "tiffin" as a valid target
  if (
    target !== undefined &&
    !["customer", "rider", "tiffin"].includes(target)
  ) {
    throw new ApiError(400, "Invalid banner target");
  }

  const newStart = startAt !== undefined ? startAt : banner.startAt;

  const newEnd = endAt !== undefined ? endAt : banner.endAt;

  if (newStart && newEnd && new Date(newEnd) <= new Date(newStart)) {
    if (req.file) {
      deleteBannerFile(`/uploads/banners/${req.file.filename}`);
    }

    throw new ApiError(400, "End date must be after start date");
  }

  if (title !== undefined) {
    banner.title = title.trim();
  }

  if (subtitle !== undefined) {
    banner.subtitle = subtitle.trim();
  }

  if (target !== undefined) {
    banner.target = target;
  }

  if (type !== undefined) {
    banner.type = type;
  }

  if (actionLabel !== undefined) {
    banner.action.label = actionLabel.trim();
  }

  if (actionUrl !== undefined) {
    banner.action.url = actionUrl.trim();
  }

  if (vendor !== undefined) {
    banner.vendor = vendor || null;
  }

  if (couponCode !== undefined) {
    banner.couponCode = couponCode.trim();
  }

  if (sortOrder !== undefined) {
    banner.sortOrder = Number(sortOrder);
  }

  if (isActive !== undefined) {
    banner.isActive = String(isActive) === "true";
  }

  if (startAt !== undefined) {
    banner.startAt = startAt || null;
  }

  if (endAt !== undefined) {
    banner.endAt = endAt || null;
  }

  if (req.file) {
    deleteBannerFile(banner.image);

    banner.image = `/uploads/banners/${req.file.filename}`;
  }

  banner.updatedBy = req.admin._id;

  await banner.save();

  return res.status(200).json({
    success: true,
    message: "Banner updated successfully",

    data: {
      banner,
    },
  });
});

/* =====================================================
   ACTIVE / INACTIVE
===================================================== */

export const toggleBannerStatus = asyncHandler(async (req, res) => {
  const banner = await Banner.findById(req.params.bannerId);

  if (!banner) {
    throw new ApiError(404, "Banner not found");
  }

  banner.isActive = !banner.isActive;

  banner.updatedBy = req.admin._id;

  await banner.save();

  return res.status(200).json({
    success: true,

    message: banner.isActive ? "Banner activated" : "Banner deactivated",

    data: {
      isActive: banner.isActive,
    },
  });
});

/* =====================================================
   DELETE
===================================================== */

export const deleteBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findById(req.params.bannerId);

  if (!banner) {
    throw new ApiError(404, "Banner not found");
  }

  deleteBannerFile(banner.image);

  await banner.deleteOne();

  return res.status(200).json({
    success: true,
    message: "Banner deleted successfully",
  });
});

/* =====================================================
   PUBLIC CUSTOMER / RIDER / TIFFIN BANNERS
===================================================== */

export const getActiveBanners = asyncHandler(async (req, res) => {
  const { target } = req.params;

  // ✅ Accept "tiffin" as a valid target
  if (!["customer", "rider", "tiffin"].includes(target)) {
    throw new ApiError(400, "Invalid banner target");
  }

  const now = new Date();

  const banners = await Banner.find({
    target,

    isActive: true,

    $and: [
      {
        $or: [
          {
            startAt: null,
          },
          {
            startAt: {
              $lte: now,
            },
          },
        ],
      },

      {
        $or: [
          {
            endAt: null,
          },
          {
            endAt: {
              $gte: now,
            },
          },
        ],
      },
    ],
  })
    .populate("vendor", "businessName profileImage")
    .sort({
      sortOrder: 1,
      createdAt: -1,
    });

  return res.status(200).json({
    success: true,

    data: {
      banners,
    },
  });
});
