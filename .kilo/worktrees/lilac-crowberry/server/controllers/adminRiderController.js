import Rider from "../models/rider.js";

import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

const getFilePath = (file, folder) =>
  file ? `/uploads/riders/${folder}/${file.filename}` : "";

/* =====================================================
   PENDING RIDERS
===================================================== */

// export const getPendingRiders = asyncHandler(async (req, res) => {
//   const riders = await Rider.find({
//     approvalStatus: "pending",
//   }).sort({
//     createdAt: 1,
//   });

//   res.status(200).json({
//     success: true,

//     data: {
//       riders,
//     },
//   });
// });

/* =====================================================
   APPROVE RIDER
===================================================== */

// export const approveRider = asyncHandler(async (req, res) => {
//   const rider = await Rider.findById(req.params.riderId);

//   if (!rider) {
//     throw new ApiError(404, "Rider not found");
//   }

//   if (rider.approvalStatus === "approved") {
//     throw new ApiError(400, "Rider is already approved");
//   }

//   rider.approvalStatus = "approved";

//   rider.isActive = true;

//   rider.approvedAt = new Date();

//   rider.approvedBy = req.admin._id;

//   rider.rejectionReason = "";

//   await rider.save();

//   res.status(200).json({
//     success: true,

//     message: "Rider approved successfully",

//     data: {
//       rider,
//     },
//   });
// });

/* =====================================================
   REJECT RIDER
===================================================== */

// export const rejectRider = asyncHandler(async (req, res) => {
//   const { reason } = req.body;

//   if (!reason?.trim()) {
//     throw new ApiError(400, "Rejection reason is required");
//   }

//   const rider = await Rider.findById(req.params.riderId);

//   if (!rider) {
//     throw new ApiError(404, "Rider not found");
//   }

//   rider.approvalStatus = "rejected";

//   rider.rejectionReason = reason.trim();

//   rider.isActive = false;

//   rider.isOnline = false;

//   await rider.save();

//   res.status(200).json({
//     success: true,

//     message: "Rider rejected successfully",
//   });
// });

/* =====================================================
   ADMIN CREATE RIDER
===================================================== */

export const createRiderByAdmin = asyncHandler(async (req, res) => {
  const body = req.body || {};

  const {
    firstName,
    lastName,
    email,
    phone,
    password,

    dateOfBirth,
    gender,

    addressLine,
    landmark,
    city,
    state,
    pincode,

    vehicleType,
    vehicleNumber,
    vehicleModel,
    vehicleColor,

    drivingLicenseNumber,
    panNumber,
    aadhaarLast4,

    accountHolderName,
    accountNumber,
    ifscCode,
    bankName,
    upiId,

    approveImmediately = false,
  } = body;

  if (!firstName?.trim() || !email?.trim() || !phone?.trim() || !password) {
    throw new ApiError(
      400,
      "First name, email, phone and password are required",
    );
  }

  if (password.length < 8) {
    throw new ApiError(400, "Password must be at least 8 characters");
  }

  const normalizedEmail = email.trim().toLowerCase();

  const exists = await Rider.findOne({
    $or: [
      {
        email: normalizedEmail,
      },
      {
        phone: phone.trim(),
      },
    ],
  });

  if (exists) {
    throw new ApiError(409, "Rider already exists with this email or phone");
  }

  const files = req.files || {};

  const shouldApprove =
    approveImmediately === true || String(approveImmediately) === "true";

  const rider = await Rider.create({
    firstName: firstName.trim(),
    lastName: lastName?.trim() || "",
    email: normalizedEmail,
    phone: phone.trim(),
    password,

    profileImage: getFilePath(files.profileImage?.[0], "profiles"),

    dateOfBirth: dateOfBirth || null,
    gender: gender || "",

    address: {
      addressLine: addressLine?.trim() || "",
      landmark: landmark?.trim() || "",
      city: city?.trim() || "",
      state: state?.trim() || "",
      pincode: pincode?.trim() || "",
    },

    vehicle: {
      type: vehicleType || "",
      number: vehicleNumber?.trim().toUpperCase() || "",
      model: vehicleModel?.trim() || "",
      color: vehicleColor?.trim() || "",
    },

    drivingLicenseNumber: drivingLicenseNumber?.trim().toUpperCase() || "",

    panNumber: panNumber?.trim().toUpperCase() || "",

    aadhaarLast4: aadhaarLast4?.trim() || "",

    documents: {
      aadhaarFront: getFilePath(files.aadhaarFront?.[0], "documents"),

      aadhaarBack: getFilePath(files.aadhaarBack?.[0], "documents"),

      panCard: getFilePath(files.panCard?.[0], "documents"),

      drivingLicense: getFilePath(files.drivingLicense?.[0], "documents"),

      vehicleRc: getFilePath(files.vehicleRc?.[0], "documents"),

      vehicleInsurance: getFilePath(files.vehicleInsurance?.[0], "documents"),
    },

    bankDetails: {
      accountHolderName: accountHolderName?.trim() || "",

      accountNumber: accountNumber?.trim() || "",

      ifscCode: ifscCode?.trim().toUpperCase() || "",

      bankName: bankName?.trim() || "",
      upiId: upiId?.trim().toLowerCase() || "",
      isVerified: false,
    },

    isEmailVerified: true,

    approvalStatus: shouldApprove ? "approved" : "pending",

    kycStatus: shouldApprove ? "verified" : "pending",

    approvedAt: shouldApprove ? new Date() : null,

    approvedBy: shouldApprove ? req.admin._id : null,

    isActive: true,
  });

  res.status(201).json({
    success: true,

    message: shouldApprove
      ? "Rider created and approved successfully"
      : "Rider created successfully",

    data: {
      rider: rider.toSafeObject(),
    },
  });
});

/* =====================================================
   GET ALL RIDERS
===================================================== */

export const getAllRiders = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);

  const limit = Math.min(Number(req.query.limit) || 20, 100);

  const { search, approvalStatus, kycStatus, workStatus, vehicleType, city } =
    req.query;

  const query = {};

  if (search?.trim()) {
    const regex = new RegExp(search.trim(), "i");

    query.$or = [
      {
        firstName: regex,
      },
      {
        lastName: regex,
      },
      {
        email: regex,
      },
      {
        phone: regex,
      },
      {
        "vehicle.number": regex,
      },
    ];
  }

  if (approvalStatus) {
    query.approvalStatus = approvalStatus;
  }

  if (kycStatus) {
    query.kycStatus = kycStatus;
  }

  if (vehicleType) {
    query["vehicle.type"] = vehicleType;
  }

  if (city) {
    query["address.city"] = {
      $regex: city,
      $options: "i",
    };
  }

  if (workStatus === "online") {
    query.isOnline = true;
  }

  if (workStatus === "offline") {
    query.isOnline = false;
  }

  if (workStatus === "available") {
    query.isAvailable = true;
  }

  if (workStatus === "blocked") {
    query.isBlocked = true;
  }

  const skip = (page - 1) * limit;

  const [riders, total] = await Promise.all([
    Rider.find(query)
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit),

    Rider.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,

    data: {
      riders,

      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    },
  });
});

export const getPendingRiders = asyncHandler(async (req, res) => {
  const riders = await Rider.find({
    approvalStatus: "pending",
  }).sort({
    createdAt: 1,
  });

  res.status(200).json({
    success: true,
    data: {
      riders,
    },
  });
});

export const getRiderById = asyncHandler(async (req, res) => {
  const rider = await Rider.findById(req.params.riderId).select(
    "+bankDetails.accountNumber",
  );

  if (!rider) {
    throw new ApiError(404, "Rider not found");
  }

  res.status(200).json({
    success: true,
    data: {
      rider,
    },
  });
});

/* =====================================================
   APPROVE / REJECT
===================================================== */

export const approveRider = asyncHandler(async (req, res) => {
  const rider = await Rider.findById(req.params.riderId);

  if (!rider) {
    throw new ApiError(404, "Rider not found");
  }

  // if (!rider.isEmailVerified) {
  //   throw new ApiError(400, "Rider email is not verified");
  // }

  rider.approvalStatus = "approved";
  rider.kycStatus = "verified";
  rider.rejectionReason = "";
  rider.approvedAt = new Date();
  rider.approvedBy = req.admin._id;
  rider.isActive = true;

  await rider.save();

  res.status(200).json({
    success: true,
    message: "Rider approved successfully",
    data: {
      rider,
    },
  });
});

export const rejectRider = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  if (!reason?.trim()) {
    throw new ApiError(400, "Rejection reason is required");
  }

  const rider = await Rider.findById(req.params.riderId);

  if (!rider) {
    throw new ApiError(404, "Rider not found");
  }

  rider.approvalStatus = "rejected";
  rider.kycStatus = "rejected";
  rider.rejectionReason = reason.trim();
  rider.isOnline = false;
  rider.isAvailable = false;

  await rider.save();

  res.status(200).json({
    success: true,
    message: "Rider rejected successfully",
  });
});

/* =====================================================
   BLOCK / UNBLOCK
===================================================== */

export const blockRider = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  if (!reason?.trim()) {
    throw new ApiError(400, "Block reason is required");
  }

  const rider = await Rider.findById(req.params.riderId);

  if (!rider) {
    throw new ApiError(404, "Rider not found");
  }

  rider.isBlocked = true;
  rider.blockReason = reason.trim();
  rider.blockedAt = new Date();
  rider.blockedBy = req.admin._id;
  rider.isOnline = false;
  rider.isAvailable = false;

  await rider.save();

  res.status(200).json({
    success: true,
    message: "Rider blocked successfully",
  });
});

export const unblockRider = asyncHandler(async (req, res) => {
  const rider = await Rider.findById(req.params.riderId);

  if (!rider) {
    throw new ApiError(404, "Rider not found");
  }

  rider.isBlocked = false;
  rider.blockReason = "";
  rider.blockedAt = null;
  rider.blockedBy = null;
  rider.failedLoginAttempts = 0;
  rider.lockUntil = null;

  await rider.save();

  res.status(200).json({
    success: true,
    message: "Rider unblocked successfully",
  });
});

/* =====================================================
   ACTIVE STATUS
===================================================== */

export const updateRiderStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body;

  if (typeof isActive !== "boolean") {
    throw new ApiError(400, "isActive must be boolean");
  }

  const rider = await Rider.findById(req.params.riderId);

  if (!rider) {
    throw new ApiError(404, "Rider not found");
  }

  rider.isActive = isActive;

  if (!isActive) {
    rider.isOnline = false;
    rider.isAvailable = false;
  }

  await rider.save();

  res.status(200).json({
    success: true,

    message: isActive
      ? "Rider activated successfully"
      : "Rider deactivated successfully",
  });
});

/* =====================================================
   STATS
===================================================== */

export const getRiderStats = asyncHandler(async (req, res) => {
  const [total, approved, pending, rejected, online, available, blocked] =
    await Promise.all([
      Rider.countDocuments(),

      Rider.countDocuments({
        approvalStatus: "approved",
      }),

      Rider.countDocuments({
        approvalStatus: "pending",
      }),

      Rider.countDocuments({
        approvalStatus: "rejected",
      }),

      Rider.countDocuments({
        isOnline: true,
      }),

      Rider.countDocuments({
        isAvailable: true,
      }),

      Rider.countDocuments({
        isBlocked: true,
      }),
    ]);

  res.status(200).json({
    success: true,

    data: {
      total,
      approved,
      pending,
      rejected,
      online,
      available,
      blocked,
    },
  });
});
