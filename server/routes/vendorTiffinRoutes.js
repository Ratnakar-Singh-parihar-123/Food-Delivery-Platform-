import express from "express";
import { protectVendor } from "../middleware/vendorAuth.js";
import {
  getTiffinPlans,
  addTiffinPlan,
  updateTiffinPlan,
  deleteTiffinPlan,
  getDailyMenu,
  upsertDailyMenu,
  deleteDailyMenu,
} from "../controllers/vendorTiffinController.js";

const router = express.Router();

router.use(protectVendor);

// Tiffin Plans
router.get("/plans", getTiffinPlans);
router.post("/plans", addTiffinPlan);
router.put("/plans/:planId", updateTiffinPlan);
router.delete("/plans/:planId", deleteTiffinPlan);

// Daily Menus
router.get("/daily", getDailyMenu);
router.post("/daily", upsertDailyMenu);
router.delete("/daily/:date", deleteDailyMenu);

export default router;
