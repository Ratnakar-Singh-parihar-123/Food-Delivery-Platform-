import express from "express";

import {
  registerCustomer,
  verifyCustomerEmailOtp,
  resendCustomerOtp,
  loginCustomer,
  logoutCustomer,
  getCustomerProfile,
  updateCustomerProfile,
  changeCustomerPassword,
  forgotCustomerPassword,
  verifyCustomerResetOtp,
  resetCustomerPassword,
  updateCustomerProfileImage,
  deleteCustomerProfileImage,
  skipCustomerProfile,
  phoneLogin,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getCategories,
  getFastDeliveryVendors,
  getVendorsWithFilters,
  getDishesByCategory,
} from "../controllers/customerController.js";
import {
  getExploreCategories,
  getExploreCategoryById,
} from "../controllers/exploreController.js";
import { search } from "../controllers/searchController.js";
import { getNearbyPopularFoods } from "../controllers/popularFoodController.js";

import { protectCustomer } from "../middleware/customerAuth.js";

import { uploadCustomerProfile } from "../middleware/customerUpload.js";

const router = express.Router();

/* =====================================================
   PUBLIC
===================================================== */

router.post("/register", registerCustomer);
router.post("/phone/login", phoneLogin);

router.post("/verify-email", verifyCustomerEmailOtp);

router.post("/resend-otp", resendCustomerOtp);

router.post("/login", loginCustomer);

router.post("/forgot-password", forgotCustomerPassword);

router.post("/verify-reset-otp", verifyCustomerResetOtp);

router.patch("/reset/password", resetCustomerPassword);
router.get("/explore", getExploreCategories);
router.get("/explore/:id", getExploreCategoryById);
router.get("/categories", getCategories);
router.get("/fast/delivery", getFastDeliveryVendors);
router.get("/vendors", getVendorsWithFilters);
router.get("/dishes", getDishesByCategory);
/* =====================================================
   PROTECTED
===================================================== */

router.use(protectCustomer);

router.post("/logout", logoutCustomer);

router.get("/profile", getCustomerProfile);

router.patch("/profile", updateCustomerProfile);

router.patch("/change/password", changeCustomerPassword);
router.get("/search", search);

router.patch(
  "/profile/image",
  uploadCustomerProfile,
  updateCustomerProfileImage,
);
router.patch("/profile/skip", skipCustomerProfile);
router.delete("/profile/image", deleteCustomerProfileImage);
router.get("/popular/foods/nearby", protectCustomer, getNearbyPopularFoods);

// ─── Address routes ──────────────────────────────────────
router.get("/addresses", getAddresses);
router.post("/addresses", addAddress);
router.patch("/addresses/:addressId", updateAddress);
router.delete("/addresses/:addressId", deleteAddress);
router.patch("/addresses/:addressId/default", setDefaultAddress);

export default router;
