import express from "express";
import {
  getIcons,
  createIcon,
  updateIcon,
  deleteIcon,
} from "../controllers/iconController.js";
import {
  protectVendor,
  requireApprovedVendor,
} from "../middleware/vendorAuth.js";
import { uploadIconImage } from "../middleware/upload.js";

const router = express.Router();

router.use(protectVendor);
router.use(requireApprovedVendor);

router.get("/", getIcons);
router.post("/", uploadIconImage, createIcon);
router.put("/:iconId", uploadIconImage, updateIcon);
router.delete("/:iconId", deleteIcon);

export const iconRoutes = router;
