import Customer from "../models/customer.js";

import asyncHandler from "../utils/asyncHandler.js";

import { ApiError } from "../utils/ApiError.js";

/* =====================================================
   GET ALL CUSTOMERS
===================================================== */

export const getAllCustomers = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);

  const limit = Math.min(Number(req.query.limit) || 20, 100);

  const skip = (page - 1) * limit;

  const { search, status, verified } = req.query;

  const query = {};

  /* SEARCH */

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
    ];
  }

  /* STATUS */

  if (status === "active") {
    query.isActive = true;

    query.isBlocked = false;
  }

  if (status === "blocked") {
    query.isBlocked = true;
  }

  if (status === "inactive") {
    query.isActive = false;
  }

  /* EMAIL VERIFIED */

  if (verified === "true") {
    query.isEmailVerified = true;
  }

  if (verified === "false") {
    query.isEmailVerified = false;
  }

  const [customers, total] = await Promise.all([
    Customer.find(query)
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit),

    Customer.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,

    data: {
      customers,

      pagination: {
        page,
        limit,
        total,

        pages: Math.ceil(total / limit),
      },
    },
  });
});

export const getCustomerById = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.customerId);

  if (!customer) {
    throw new ApiError(404, "Customer not found");
  }

  res.status(200).json({
    success: true,

    data: {
      customer,
    },
  });
});
export const blockCustomer = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  if (!reason?.trim()) {
    throw new ApiError(400, "Block reason is required");
  }

  const customer = await Customer.findById(req.params.customerId);

  if (!customer) {
    throw new ApiError(404, "Customer not found");
  }

  customer.isBlocked = true;

  customer.blockReason = reason.trim();

  customer.blockedAt = new Date();

  customer.blockedBy = req.admin._id;

  await customer.save();

  res.status(200).json({
    success: true,

    message: "Customer blocked successfully",
  });
});
export const unblockCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.customerId);

  if (!customer) {
    throw new ApiError(404, "Customer not found");
  }

  customer.isBlocked = false;

  customer.blockReason = "";

  customer.blockedAt = null;

  customer.blockedBy = null;

  customer.failedLoginAttempts = 0;

  customer.lockUntil = null;

  await customer.save();

  res.status(200).json({
    success: true,

    message: "Customer unblocked successfully",
  });
});
export const updateCustomerStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body;

  if (typeof isActive !== "boolean") {
    throw new ApiError(400, "isActive must be boolean");
  }

  const customer = await Customer.findByIdAndUpdate(
    req.params.customerId,

    {
      isActive,
    },

    {
      new: true,
      runValidators: true,
    },
  );

  if (!customer) {
    throw new ApiError(404, "Customer not found");
  }

  res.status(200).json({
    success: true,

    message: isActive ? "Customer activated" : "Customer deactivated",

    data: {
      customer,
    },
  });
});
export const getCustomerStats = asyncHandler(async (req, res) => {
  const [
    totalCustomers,

    activeCustomers,

    blockedCustomers,

    verifiedCustomers,

    newCustomersThisMonth,
  ] = await Promise.all([
    Customer.countDocuments(),

    Customer.countDocuments({
      isActive: true,
      isBlocked: false,
    }),

    Customer.countDocuments({
      isBlocked: true,
    }),

    Customer.countDocuments({
      isEmailVerified: true,
    }),

    Customer.countDocuments({
      createdAt: {
        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      },
    }),
  ]);

  res.status(200).json({
    success: true,

    data: {
      totalCustomers,

      activeCustomers,

      blockedCustomers,

      verifiedCustomers,

      newCustomersThisMonth,
    },
  });
});

export const getRecentCustomers = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 5;
  const recent = await Customer.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .select("firstName lastName email phone createdAt profileImage isActive")
    .lean();

  const data = recent.map((c) => ({
    id: c._id,
    name: `${c.firstName} ${c.lastName || ""}`.trim(),
    email: c.email,
    phone: c.phone || "—",
    joined: c.createdAt.toLocaleDateString(),
    status: c.isActive ? "Active" : "Inactive",
    avatar: c.profileImage || null,
  }));

  res.status(200).json({ success: true, data });
});
