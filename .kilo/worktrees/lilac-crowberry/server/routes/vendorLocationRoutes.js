import express from "express";
import { protectVendor } from "../middleware/vendorAuth.js";
import {
  updateVendorAddress,
  reverseGeocodeVendor,
} from "../controllers/vendorLocationController.js"; // or vendorController if you put it there

const router = express.Router();

router.use(protectVendor);

router.put("/address", updateVendorAddress);
router.post("/reverse/geocode", reverseGeocodeVendor);

export default router;
