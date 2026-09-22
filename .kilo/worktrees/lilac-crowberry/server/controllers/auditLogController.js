import AuditLog from "../models/auditLog.js";

import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

/* =====================================================
   GET ALL AUDIT LOGS
===================================================== */

export const getAuditLogs = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);

  const limit = Math.min(Number(req.query.limit) || 30, 100);

  const { search, module, action, status, actorType, startDate, endDate } =
    req.query;

  const query = {};

  /* MODULE */

  if (module) {
    query.module = module;
  }

  /* ACTION */

  if (action) {
    query.action = action;
  }

  /* STATUS */

  if (status) {
    query.status = status;
  }

  /* ACTOR */

  if (actorType) {
    query["actor.type"] = actorType;
  }

  /* SEARCH */

  if (search?.trim()) {
    const regex = new RegExp(search.trim(), "i");

    query.$or = [
      {
        description: regex,
      },

      {
        "actor.name": regex,
      },

      {
        "actor.email": regex,
      },

      {
        "target.name": regex,
      },
    ];
  }

  /* DATE */

  if (startDate || endDate) {
    query.createdAt = {};

    if (startDate) {
      query.createdAt.$gte = new Date(startDate);
    }

    if (endDate) {
      const date = new Date(endDate);

      date.setHours(23, 59, 59, 999);

      query.createdAt.$lte = date;
    }
  }

  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    AuditLog.find(query)
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit),

    AuditLog.countDocuments(query),
  ]);

  return res.status(200).json({
    success: true,

    data: {
      logs,

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
   GET ONE
===================================================== */

export const getAuditLogById = asyncHandler(async (req, res) => {
  const log = await AuditLog.findById(req.params.logId);

  if (!log) {
    throw new ApiError(404, "Audit log not found");
  }

  return res.status(200).json({
    success: true,

    data: {
      log,
    },
  });
});

export const getAuditLogStats = asyncHandler(async (req, res) => {
  const since = new Date();

  since.setDate(since.getDate() - 30);

  const [total, today, failed, adminActions] = await Promise.all([
    AuditLog.countDocuments(),

    AuditLog.countDocuments({
      createdAt: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
      },
    }),

    AuditLog.countDocuments({
      status: "failed",
    }),

    AuditLog.countDocuments({
      "actor.type": "admin",

      createdAt: {
        $gte: since,
      },
    }),
  ]);

  return res.status(200).json({
    success: true,

    data: {
      total,
      today,
      failed,
      adminActions,
    },
  });
});
