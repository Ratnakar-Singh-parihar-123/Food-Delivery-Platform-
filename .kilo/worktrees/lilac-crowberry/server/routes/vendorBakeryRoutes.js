import express from "express";
import { protectVendor } from "../middleware/vendorAuth.js";
import {
  getBakeryProducts,
  addBakeryProduct,
  updateBakeryProduct,
  deleteBakeryProduct,
} from "../controllers/vendorBakeryController.js";

const router = express.Router();

router.use(protectVendor);

router.get("/", getBakeryProducts);
router.post("/", addBakeryProduct);
router.put("/:productId", updateBakeryProduct);
router.delete("/:productId", deleteBakeryProduct);

export default router;
