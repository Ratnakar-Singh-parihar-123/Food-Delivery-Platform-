import express from "express";

import {
  getAuditLogs,
  getAuditLogById,
  getAuditLogStats,
} from "../controllers/auditLogController.js";

import { protectAdmin } from "../middleware/adminAuth.js";

const router = express.Router();

router.use(protectAdmin);

router.get("/stats", getAuditLogStats);

router.get("/", getAuditLogs);

router.get("/:logId", getAuditLogById);

export default router;
