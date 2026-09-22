import express from "express";
import {
  getAllCustomers,
  getCustomerById,
  blockCustomer,
  unblockCustomer,
  updateCustomerStatus,
  getCustomerStats,
  getRecentCustomers,
} from "../controllers/adminCustomerController.js";
import { protectAdmin } from "../middleware/adminAuth.js";

const router = express.Router();

router.use(protectAdmin);

/* IMPORTANT:
   static routes (like /stats, /recent) must come BEFORE dynamic ones (/:customerId)
*/
router.get("/stats", getCustomerStats);
router.get("/recent", getRecentCustomers); // ✅ MOVED UP
router.get("/", getAllCustomers);
router.get("/:customerId", getCustomerById);
router.patch("/:customerId/block", blockCustomer);
router.patch("/:customerId/unblock", unblockCustomer);
router.patch("/:customerId/status", updateCustomerStatus);

export default router;
