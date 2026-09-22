import express from "express";

import {
  createBanner,
  getAllBanners,
  getBannerById,
  updateBanner,
  toggleBannerStatus,
  deleteBanner,
} from "../controllers/bannerController.js";

import { protectAdmin } from "../middleware/adminAuth.js";

import { uploadBannerImage } from "../middleware/bannerUpload.js";

const router = express.Router();

router.use(protectAdmin);

router.get("/", getAllBanners);

router.post("/", uploadBannerImage, createBanner);

router.get("/:bannerId", getBannerById);

router.patch("/:bannerId", uploadBannerImage, updateBanner);

router.patch("/:bannerId/toggle", toggleBannerStatus);

router.delete("/:bannerId", deleteBanner);

export default router;
