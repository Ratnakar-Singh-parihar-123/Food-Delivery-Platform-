import express from "express";

import { getActiveBanners } from "../controllers/bannerController.js";

const router = express.Router();

router.get("/:target", getActiveBanners);

export default router;
