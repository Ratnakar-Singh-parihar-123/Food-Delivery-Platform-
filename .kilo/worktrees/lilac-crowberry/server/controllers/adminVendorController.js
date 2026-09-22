import Vendor from "../models/vendor.js";

import asyncHandler from "../utils/asyncHandler.js";

import { ApiError } from "../utils/ApiError.js";
// ... (existing imports and code remain unchanged)

export const getAllVendors = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 20, 100);
  const { search, status, businessType, onlyTop } = req.query; // ✅ added onlyTop

  const query = {};

  if (search?.trim()) {
    const regex = new RegExp(search.trim(), "i");
    query.$or = [
      { businessName: regex },
      { ownerFirstName: regex },
      { ownerLastName: regex },
      { email: regex },
      { phone: regex },
    ];
  }

  if (status) {
    query.approvalStatus = status;
  }

  if (businessType) {
    query.businessType = businessType;
  }

  // ✅ Only top vendors
  if (onlyTop === "true") {
    query.isTop = true;
  }

  const skip = (page - 1) * limit;

  const [vendors, total] = await Promise.all([
    Vendor.find(query)
      .sort({ isTop: -1, createdAt: -1 }) // ✅ top first
      .skip(skip)
      .limit(limit),
    Vendor.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    data: {
      vendors,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    },
  });
});

// ... existing functions ...

// ✅ New: Toggle vendor top status
export const toggleVendorTop = asyncHandler(async (req, res) => {
  const { vendorId } = req.params;
  const { isTop } = req.body;

  if (typeof isTop !== "boolean") {
    throw new ApiError(400, "isTop must be a boolean");
  }

  const vendor = await Vendor.findById(vendorId);
  if (!vendor) {
    throw new ApiError(404, "Vendor not found");
  }

  vendor.isTop = isTop;
  await vendor.save();

  res.status(200).json({
    success: true,
    message: `Vendor ${isTop ? "marked as top" : "removed from top"}`,
    data: { isTop: vendor.isTop },
  });
});

// export const getAllVendors = asyncHandler(async (req, res) => {
//   const page = Math.max(Number(req.query.page) || 1, 1);

//   const limit = Math.min(Number(req.query.limit) || 20, 100);

//   const { search, status, businessType } = req.query;

//   const query = {};

//   if (search?.trim()) {
//     const regex = new RegExp(search.trim(), "i");

//     query.$or = [
//       {
//         businessName: regex,
//       },

//       {
//         ownerFirstName: regex,
//       },

//       {
//         ownerLastName: regex,
//       },

//       {
//         email: regex,
//       },

//       {
//         phone: regex,
//       },
//     ];
//   }

//   if (status) {
//     query.approvalStatus = status;
//   }

//   if (businessType) {
//     query.businessType = businessType;
//   }

//   const skip = (page - 1) * limit;

//   const [vendors, total] = await Promise.all([
//     Vendor.find(query)
//       .sort({
//         createdAt: -1,
//       })
//       .skip(skip)
//       .limit(limit),

//     Vendor.countDocuments(query),
//   ]);

//   res.status(200).json({
//     success: true,

//     data: {
//       vendors,

//       pagination: {
//         page,
//         limit,
//         total,

//         pages: Math.ceil(total / limit),
//       },
//     },
//   });
// });
export const getPendingVendors = asyncHandler(async (req, res) => {
  const vendors = await Vendor.find({
    approvalStatus: "pending",
  }).sort({
    createdAt: 1,
  });

  res.status(200).json({
    success: true,

    data: {
      vendors,
    },
  });
});
export const getVendorById = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findById(req.params.vendorId).select(
    "+bankDetails.accountNumber",
  );

  if (!vendor) {
    throw new ApiError(404, "Vendor not found");
  }

  res.status(200).json({
    success: true,

    data: {
      vendor,
    },
  });
});
// export const approveVendor = asyncHandler(async (req, res) => {
//   const vendor = await Vendor.findById(req.params.vendorId);

//   if (!vendor) {
//     throw new ApiError(404, "Vendor not found");
//   }

//   if (!vendor.isEmailVerified) {
//     throw new ApiError(400, "Vendor email is not verified");
//   }

//   vendor.approvalStatus = "approved";

//   vendor.approvedAt = new Date();

//   vendor.approvedBy = req.admin._id;

//   vendor.rejectionReason = "";

//   vendor.isActive = true;

//   await vendor.save();

//   res.status(200).json({
//     success: true,

//     message: "Vendor approved successfully",

//     data: {
//       vendor,
//     },
//   });
// });
export const approveVendor = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findById(req.params.vendorId);

  if (!vendor) {
    throw new ApiError(404, "Vendor not found");
  }

  // Admin approval
  vendor.approvalStatus = "approved";
  vendor.approvedAt = new Date();
  vendor.approvedBy = req.admin._id;
  vendor.rejectionReason = "";

  // Automatically verify email
  vendor.isEmailVerified = true;
  vendor.emailOtp = undefined;
  vendor.emailOtpExpire = undefined;

  // Activate account
  vendor.isActive = true;
  vendor.isBlocked = false;
  vendor.blockReason = "";

  await vendor.save();

  res.status(200).json({
    success: true,
    message: "Vendor approved successfully",
    data: {
      vendor,
    },
  });
});
export const rejectVendor = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  if (!reason?.trim()) {
    throw new ApiError(400, "Rejection reason required");
  }

  const vendor = await Vendor.findById(req.params.vendorId);

  if (!vendor) {
    throw new ApiError(404, "Vendor not found");
  }

  vendor.approvalStatus = "rejected";

  vendor.rejectionReason = reason.trim();

  vendor.isOnline = false;

  vendor.acceptingOrders = false;

  await vendor.save();

  res.status(200).json({
    success: true,

    message: "Vendor rejected",
  });
});
export const blockVendor = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  if (!reason?.trim()) {
    throw new ApiError(400, "Block reason required");
  }

  const vendor = await Vendor.findById(req.params.vendorId);

  if (!vendor) {
    throw new ApiError(404, "Vendor not found");
  }

  vendor.isBlocked = true;

  vendor.blockReason = reason.trim();

  vendor.blockedAt = new Date();

  vendor.blockedBy = req.admin._id;

  vendor.isOnline = false;

  vendor.acceptingOrders = false;

  await vendor.save();

  res.status(200).json({
    success: true,

    message: "Vendor blocked successfully",
  });
});
export const unblockVendor = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findById(req.params.vendorId);

  if (!vendor) {
    throw new ApiError(404, "Vendor not found");
  }

  vendor.isBlocked = false;

  vendor.blockReason = "";

  vendor.blockedAt = null;

  vendor.blockedBy = null;

  vendor.failedLoginAttempts = 0;

  vendor.lockUntil = null;

  await vendor.save();

  res.status(200).json({
    success: true,

    message: "Vendor unblocked successfully",
  });
});
export const updateVendorCommission = asyncHandler(async (req, res) => {
  const { commissionPercentage } = req.body;

  const commission = Number(commissionPercentage);

  if (Number.isNaN(commission) || commission < 0 || commission > 100) {
    throw new ApiError(400, "Commission must be between 0 and 100");
  }

  const vendor = await Vendor.findByIdAndUpdate(
    req.params.vendorId,

    {
      commissionPercentage: commission,
    },

    {
      new: true,
      runValidators: true,
    },
  );

  if (!vendor) {
    throw new ApiError(404, "Vendor not found");
  }

  res.status(200).json({
    success: true,

    message: "Vendor commission updated",

    data: {
      commissionPercentage: vendor.commissionPercentage,
    },
  });
});
export const updateVendorStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body;

  if (typeof isActive !== "boolean") {
    throw new ApiError(400, "isActive must be boolean");
  }

  const vendor = await Vendor.findById(req.params.vendorId);

  if (!vendor) {
    throw new ApiError(404, "Vendor not found");
  }

  vendor.isActive = isActive;

  if (!isActive) {
    vendor.isOnline = false;

    vendor.acceptingOrders = false;
  }

  await vendor.save();

  res.status(200).json({
    success: true,

    message: isActive ? "Vendor activated" : "Vendor deactivated",
  });
});
export const getVendorStats = asyncHandler(async (req, res) => {
  const [total, approved, pending, rejected, blocked, online] =
    await Promise.all([
      Vendor.countDocuments(),

      Vendor.countDocuments({
        approvalStatus: "approved",
      }),

      Vendor.countDocuments({
        approvalStatus: "pending",
      }),

      Vendor.countDocuments({
        approvalStatus: "rejected",
      }),

      Vendor.countDocuments({
        isBlocked: true,
      }),

      Vendor.countDocuments({
        isOnline: true,

        approvalStatus: "approved",
      }),
    ]);

  res.status(200).json({
    success: true,

    data: {
      total,
      approved,
      pending,
      rejected,
      blocked,
      online,
    },
  });
});
