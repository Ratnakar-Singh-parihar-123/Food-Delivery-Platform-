import api from "./axios";

/* =====================================================
   ADMIN REGISTER
===================================================== */

export const registerAdmin = async (data) => {
  const response = await api.post("/admin/register", data);
  return response.data;
};

/* =====================================================
   ADMIN LOGIN
===================================================== */

export const loginAdmin = async (data) => {
  const response = await api.post("/admin/login", data);
  return response.data;
};

/* =====================================================
   ADMIN LOGOUT
===================================================== */

export const logoutAdmin = async () => {
  const response = await api.post("/admin/logout");
  return response.data;
};

/* =====================================================
   GET ADMIN PROFILE
===================================================== */

export const getAdminProfile = async () => {
  const response = await api.get("/admin/profile");
  return response.data;
};

/* =====================================================
   UPDATE ADMIN PROFILE
===================================================== */

export const updateAdminProfile = async (data) => {
  const response = await api.patch("/admin/profile", data);
  return response.data;
};

/* =====================================================
   UPDATE EMAIL
===================================================== */

export const updateAdminEmail = async (data) => {
  const response = await api.patch("/admin/email", data);
  return response.data;
};

/* =====================================================
   CHANGE PASSWORD
===================================================== */

export const changeAdminPassword = async (data) => {
  const response = await api.patch("/admin/change/password", data);
  return response.data;
};

/* =====================================================
   FORGOT PASSWORD
===================================================== */

export const forgotAdminPassword = async (email) => {
  const response = await api.post("/admin/forgot/password", { email });
  return response.data;
};

/* =====================================================
   RESET PASSWORD
===================================================== */

export const resetAdminPassword = async (token, data) => {
  const response = await api.patch(`/admin/reset/password/${token}`, data);
  return response.data;
};

/* =====================================================
   UPDATE PROFILE IMAGE
===================================================== */

export const updateAdminProfileImage = async (file) => {
  if (!(file instanceof File)) {
    throw new Error("Valid image file is required");
  }
  const formData = new FormData();
  formData.append("profileImage", file, file.name);
  const response = await api.patch("/admin/profile/image", formData);
  return response.data;
};

/* =====================================================
   DELETE PROFILE IMAGE
===================================================== */

export const deleteAdminProfileImage = async () => {
  const response = await api.delete("/admin/profile/image");
  return response.data;
};

/* ============================================
   CREATE NOTIFICATION
============================================ */

export const createAdminNotification = async (data) => {
  const response = await api.post("/admin/notifications", data);
  return response.data;
};

/* ============================================
   NOTIFICATION HISTORY
============================================ */

export const getAdminNotificationHistory = async ({
  page = 1,
  limit = 20,
} = {}) => {
  const response = await api.get("/admin/notifications", {
    params: { page, limit },
  });
  return response.data;
};

/* =====================================================
   BANNERS
===================================================== */

export const getAdminBanners = async (params = {}) => {
  const response = await api.get("/admin/banners", { params });
  return response.data;
};

export const createAdminBanner = async (data) => {
  const response = await api.post("/admin/banners", data);
  return response.data;
};

export const updateAdminBanner = async (bannerId, data) => {
  const response = await api.patch(`/admin/banners/${bannerId}`, data);
  return response.data;
};

export const toggleAdminBanner = async (bannerId) => {
  const response = await api.patch(`/admin/banners/${bannerId}/toggle`);
  return response.data;
};

export const deleteAdminBanner = async (bannerId) => {
  const response = await api.delete(`/admin/banners/${bannerId}`);
  return response.data;
};

/* =====================================================
   COUPONS
===================================================== */

export const getAdminCoupons = async (params = {}) => {
  const response = await api.get("/admin/coupons", { params });
  return response.data;
};

export const createAdminCoupon = async (data) => {
  const response = await api.post("/admin/coupons", data);
  return response.data;
};

export const updateAdminCoupon = async (couponId, data) => {
  const response = await api.patch(`/admin/coupons/${couponId}`, data);
  return response.data;
};

export const toggleAdminCoupon = async (couponId) => {
  const response = await api.patch(`/admin/coupons/${couponId}/toggle`);
  return response.data;
};

export const deleteAdminCoupon = async (couponId) => {
  const response = await api.delete(`/admin/coupons/${couponId}`);
  return response.data;
};

/* =====================================================
   AUDIT LOGS
===================================================== */

export const getAuditLogs = async (params = {}) => {
  const response = await api.get("/admin/audit/logs", { params });
  return response.data;
};

export const getAuditLogById = async (logId) => {
  const response = await api.get(`/admin/audit/logs/${logId}`);
  return response.data;
};

export const getAuditLogStats = async () => {
  const response = await api.get("/admin/audit/logs/stats");
  return response.data;
};

/* =====================================================
   APPROVAL CENTER
===================================================== */

export const getPendingVendorsApi = async () => {
  const response = await api.get("/admin/vendors/pending");
  return response.data;
};

export const approveVendorApi = async (vendorId) => {
  const response = await api.patch(`/admin/vendors/${vendorId}/approve`);
  return response.data;
};

export const rejectVendorApi = async (vendorId, reason) => {
  const response = await api.patch(`/admin/vendors/${vendorId}/reject`, {
    reason,
  });
  return response.data;
};

export const getPendingRidersApi = async () => {
  const response = await api.get("/admin/riders/pending");
  return response.data;
};

export const approveRiderApi = async (riderId) => {
  const response = await api.patch(`/admin/riders/${riderId}/approve`);
  return response.data;
};

export const rejectRiderApi = async (riderId, reason) => {
  const response = await api.patch(`/admin/riders/${riderId}/reject`, {
    reason,
  });
  return response.data;
};

/* =====================================================
   VENDORS
===================================================== */

export const getAllVendorsApi = async (params = {}) => {
  const response = await api.get("/admin/vendors", { params });
  return response.data;
};

export const getVendorByIdApi = async (vendorId) => {
  const response = await api.get(`/admin/vendors/${vendorId}`);
  return response.data;
};

export const blockVendorApi = async (vendorId, reason) => {
  const response = await api.patch(`/admin/vendors/${vendorId}/block`, {
    reason,
  });
  return response.data;
};

export const unblockVendorApi = async (vendorId) => {
  const response = await api.patch(`/admin/vendors/${vendorId}/unblock`);
  return response.data;
};

export const updateVendorStatusApi = async (vendorId, isActive) => {
  const response = await api.patch(`/admin/vendors/${vendorId}/status`, {
    isActive,
  });
  return response.data;
};

export const updateVendorCommissionApi = async (
  vendorId,
  commissionPercentage,
) => {
  const response = await api.patch(`/admin/vendors/${vendorId}/commission`, {
    commissionPercentage,
  });
  return response.data;
};

/* =====================================================
   RIDERS
===================================================== */

export const getAllRidersApi = async (params = {}) => {
  const response = await api.get("/admin/riders", { params });
  return response.data;
};

export const getRiderStatsApi = async () => {
  const response = await api.get("/admin/riders/stats");
  return response.data;
};

export const getRiderByIdApi = async (riderId) => {
  const response = await api.get(`/admin/riders/${riderId}`);
  return response.data;
};

export const createRiderByAdminApi = async (formData) => {
  const response = await api.post("/admin/riders", formData);
  return response.data;
};

export const blockRiderApi = async (riderId, reason) => {
  const response = await api.patch(`/admin/riders/${riderId}/block`, {
    reason,
  });
  return response.data;
};

export const unblockRiderApi = async (riderId) => {
  const response = await api.patch(`/admin/riders/${riderId}/unblock`);
  return response.data;
};

export const updateRiderStatusApi = async (riderId, isActive) => {
  const response = await api.patch(`/admin/riders/${riderId}/status`, {
    isActive,
  });
  return response.data;
};

/* =====================================================
   ✅ ORDERS MANAGEMENT (NEW)
===================================================== */

/**
 * Get all orders with pagination and filters
 * @param {Object} params - { status, vendorId, riderId, page, limit, sort }
 */
export const getAdminOrders = async (params = {}) => {
  const response = await api.get("/admin/orders", { params });
  return response.data;
};

/**
 * Get live orders (active statuses)
 */
export const getAdminLiveOrders = async () => {
  const response = await api.get("/admin/orders/live");
  return response.data;
};

/**
 * Get single order details by ID
 */
export const getAdminOrderDetails = async (orderId) => {
  const response = await api.get(`/admin/orders/${orderId}`);
  return response.data;
};

/**
 * Update order status (admin action)
 * @param {string} orderId - Order ID
 * @param {string} status - New status
 * @param {string} note - Optional note
 */
export const updateAdminOrderStatus = async (orderId, status, note = "") => {
  const response = await api.put(`/admin/orders/${orderId}/status`, {
    status,
    note,
  });
  return response.data;
};

/**
 * Assign a rider to an order
 * @param {string} orderId - Order ID
 * @param {string} riderId - Rider ID
 */
export const assignAdminOrderRider = async (orderId, riderId) => {
  const response = await api.put(`/admin/orders/${orderId}/assign-rider`, {
    riderId,
  });
  return response.data;
};

/**
 * Cancel an order (admin action)
 * @param {string} orderId - Order ID
 * @param {string} reason - Cancellation reason
 */
export const cancelAdminOrder = async (orderId, reason) => {
  const response = await api.put(`/admin/orders/${orderId}/cancel`, { reason });
  return response.data;
};

/**
 * Get order statistics for dashboard
 */
export const getAdminOrderStats = async () => {
  const response = await api.get("/admin/orders/stats");
  return response.data;
};

export const getServiceAreas = async (params = {}) => {
  const response = await api.get("/admin/service/areas", { params });
  return response.data;
};

export const getServiceAreaById = async (id) => {
  const response = await api.get(`/admin/service/areas/${id}`);
  return response.data;
};

export const createServiceArea = async (data) => {
  const response = await api.post("/admin/service/areas", data);
  return response.data;
};

export const updateServiceArea = async (id, data) => {
  const response = await api.put(`/admin/service/areas/${id}`, data);
  return response.data;
};

export const deleteServiceArea = async (id) => {
  const response = await api.delete(`/admin/service/areas/${id}`);
  return response.data;
};

export const toggleServiceAreaStatus = async (id, isActive) => {
  const response = await api.patch(`/admin/service/areas/${id}/toggle`, {
    isActive,
  });
  return response.data;
};

export const checkServiceAreaCoverage = async (lat, lng) => {
  const response = await api.get(
    `/admin/service/areas/check-coverage?latitude=${lat}&longitude=${lng}`,
  );
  return response.data;
};
export const getAdminPopularFoods = async (params) => {
  const response = await api.get("/admin/popular/foods", { params });
  return response.data;
};
export const togglePopularFood = async (id, isActive) => {
  const response = await api.patch(`/admin/popular/foods/${id}/toggle`, {
    isActive,
  });
  return response.data;
};
export const deletePopularFood = async (id) => {
  const response = await api.delete(`/admin/popular/foods/${id}`);
  return response.data;
};
export const getSuggestions = async () => {
  const response = await api.get(`/admin/explore/suggestions`);
  return response.data;
};
export const getExploreCategories = async () => {
  const res = await api.get("/admin/explore");
  return res.data;
};

export const createExploreCategory = async (data) => {
  const res = await api.post("/admin/explore", data);
  return res.data;
};

export const updateExploreCategory = async (id, data) => {
  const res = await api.put(`/admin/explore/${id}`, data);
  return res.data;
};

export const deleteExploreCategory = async (id) => {
  const res = await api.delete(`/admin/explore/${id}`);
  return res.data;
};

// ─── Vendor & Menu Item lists (for dropdowns) ──────────
export const getAllVendors = async () => {
  const res = await api.get("/admin/vendors"); // adjust endpoint
  return res.data;
};

export const getAllMenuItems = async () => {
  const res = await api.get("/admin/menu/items"); // adjust endpoint
  return res.data;
};
export const getFoodCategories = async (params = {}) => {
  const response = await api.get("/admin/food/categories", { params });
  return response.data;
};
export const createFoodCategory = async (data) => {
  const response = await api.post("/admin/food/categories", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

// ─── Update food category with image ──────────────────────
export const updateFoodCategory = async (id, data) => {
  const response = await api.put(`/admin/food/categories/${id}`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};
export const deleteFoodCategory = async (id) => {
  const response = await api.delete(`/admin/food/categories/${id}`);
  return response.data;
};
// In adminApi.js

// ─── Get all rider locations (for admin map) ──────────────
// ─── Live Map & Tracking ──────────────────────────────────

/**
 * Get all online riders with their current location
 * Returns: { riders: [{ id, name, phone, lat, lng, isOnline }] }
 */
export const getRiderLocations = async () => {
  const response = await api.get("/admin/locations");
  return response.data;
};

/**
 * Get a single rider's current location
 */
export const getRiderLocation = async (riderId) => {
  const response = await api.get(`/admin/riders/${riderId}/location`);
  return response.data;
};

/**
 * Get a vendor's location
 */
export const getVendorLocation = async (vendorId) => {
  const response = await api.get(`/admin/vendors/${vendorId}/location`);
  return response.data;
};

/**
 * Get order tracking (vendor, rider, delivery locations)
 */
export const getOrderTracking = async (orderId) => {
  const response = await api.get(`/admin/orders/${orderId}/tracking`);
  return response.data;
};
export const getPendingTiffinVendorsApi = () => {
  return api.get("/admin/vendors/pending?businessType=tiffin_center");
};

// export const approveVendorApi = (vendorId) => {
//   return api.put(`/admin/vendors/${vendorId}/approve`);
// };

// export const rejectVendorApi = (vendorId, reason) => {
//   return api.put(`/admin/vendors/${vendorId}/reject`, { reason });
// };
// Get all tiffin houses (vendors with businessType tiffin_center)
export const getTiffinHouses = (params) => {
  return api.get("/admin/vendors", {
    params: { ...params, businessType: "tiffin_center" },
  });
};

// Get aggregate earnings for all tiffin houses (optional)
export const getTiffinEarningsSummary = () => {
  return api.get("/admin/tiffin-houses/earnings-summary");
};

// Get all subscription plans (admin can see all)
export const getAllSubscriptionPlans = () => {
  return api.get("/admin/subscription-plans");
};

// Get all subscriptions (customer subscriptions)
export const getAllSubscriptions = () => {
  return api.get("/admin/subscriptions");
};

// Get all reviews (with filter for vendor type)
export const getAllReviews = (params) => {
  return api.get("/admin/reviews", { params });
};

// Hide/Delete review
export const hideReview = (reviewId) => {
  return api.patch(`/admin/reviews/${reviewId}/hide`);
};
export const deleteReview = (reviewId) => {
  return api.delete(`/admin/reviews/${reviewId}`);
};
// Get all vendors (admin)
// export const getAdminVendors = async (params = {}) => {
//   const query = new URLSearchParams(params).toString();
//   const response = await api.get(`/admin/vendors?${query}`);
//   return response.data;
// };

// Get only top vendors (admin) – uses the same endpoint with `onlyTop=true`
export const getTopVendors = async (params = {}) => {
  const query = new URLSearchParams({ ...params, onlyTop: true }).toString();
  const response = await api.get(`/admin/vendors?${query}`);
  return response.data;
};
// Toggle vendor active status
export const toggleVendorActive = async (vendorId, isActive) => {
  const response = await api.patch(`/admin/vendors/${vendorId}/status`, {
    isActive,
  });
  return response.data;
};

// Toggle vendor top status
export const toggleVendorTop = async (vendorId, isTop) => {
  const response = await api.patch(`/admin/vendors/${vendorId}/top`, {
    isTop,
  });
  return response.data;
};
// src/api/adminApi.js

// ─── ANALYTICS ────────────────────────────────────────────────

/**
 * Get overview analytics
 * @param {string} startDate - YYYY-MM-DD
 * @param {string} endDate - YYYY-MM-DD
 */
export const getOverviewAnalytics = async (startDate, endDate) => {
  const response = await api.get("/admin/analytics/overview", {
    params: { startDate, endDate },
  });
  return response.data;
};

/**
 * Get revenue analytics
 */
export const getRevenueAnalytics = async (startDate, endDate) => {
  const response = await api.get("/admin/analytics/revenue", {
    params: { startDate, endDate },
  });
  return response.data;
};

/**
 * Get order analytics
 */
export const getOrderAnalytics = async (startDate, endDate) => {
  const response = await api.get("/admin/analytics/orders", {
    params: { startDate, endDate },
  });
  return response.data;
};

/**
 * Get vendor analytics
 */
export const getVendorAnalytics = async (startDate, endDate) => {
  const response = await api.get("/admin/analytics/vendors", {
    params: { startDate, endDate },
  });
  return response.data;
};

/**
 * Get rider analytics
 */
export const getRiderAnalytics = async (startDate, endDate) => {
  const response = await api.get("/admin/analytics/riders", {
    params: { startDate, endDate },
  });
  return response.data;
};

/**
 * Get customer analytics
 */
export const getCustomerAnalytics = async (startDate, endDate) => {
  const response = await api.get("/admin/analytics/customers", {
    params: { startDate, endDate },
  });
  return response.data;
};

/**
 * Get payment analytics
 */
// export const getPaymentAnalytics = async (startDate, endDate) => {
//   const response = await api.get("/admin/analytics/payments", {
//     params: { startDate, endDate },
//   });
//   return response.data;
// };

/**
 * Get tiffin analytics
 */
export const getTiffinAnalytics = async (startDate, endDate) => {
  const response = await api.get("/admin/analytics/tiffin", {
    params: { startDate, endDate },
  });
  return response.data;
};

/**
 * Get product analytics
 */
export const getProductAnalytics = async (startDate, endDate) => {
  const response = await api.get("/admin/analytics/products", {
    params: { startDate, endDate },
  });
  return response.data;
};

/**
 * Get revenue comparison (previous period)
 */
export const getRevenueComparison = async (startDate, endDate) => {
  const response = await api.get("/admin/analytics/revenue/comparison", {
    params: { startDate, endDate },
  });
  return response.data;
};
// ─── PAYMENT MANAGEMENT ──────────────────────────────────────

/**
 * Get payment overview
 */
export const getPaymentOverview = async () => {
  const response = await api.get("/admin/payments/overview");
  return response.data;
};

/**
 * Get vendor settlements
 * @param {Object} params - { status, vendorId, page, limit }
 */
export const getVendorSettlements = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const response = await api.get(`/admin/payments/vendor-settlements?${query}`);
  return response.data;
};

/**
 * Process a vendor settlement (admin action)
 * @param {string} settlementId
 */
export const processVendorSettlement = async (settlementId) => {
  const response = await api.post(
    `/admin/payments/vendor-settlements/${settlementId}/process`,
  );
  return response.data;
};

/**
 * Get rider earnings
 * @param {Object} params - { riderId, status }
 */
export const getRiderEarnings = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const response = await api.get(`/admin/payments/rider-earnings?${query}`);
  return response.data;
};

/**
 * Get rider payouts
 * @param {Object} params - { riderId, status, page, limit }
 */
export const getRiderPayouts = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const response = await api.get(`/admin/payments/rider-payouts?${query}`);
  return response.data;
};

/**
 * Process a rider payout (admin action)
 * @param {string} payoutId
 */
export const processRiderPayout = async (payoutId) => {
  const response = await api.post(
    `/admin/payments/rider-payouts/${payoutId}/process`,
  );
  return response.data;
};

/**
 * Get refunds list
 * @param {Object} params - { status, page, limit }
 */
export const getRefunds = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const response = await api.get(`/admin/payments/refunds?${query}`);
  return response.data;
};

/**
 * Get reconciliation summary
 */
export const getReconciliation = async () => {
  const response = await api.get("/admin/payments/reconciliation");
  return response.data;
};

/**
 * Get payment analytics with date range
 * @param {string} startDate - YYYY-MM-DD
 * @param {string} endDate - YYYY-MM-DD
 */
export const getPaymentAnalytics = async (startDate, endDate) => {
  const params = new URLSearchParams();
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);
  const response = await api.get(`/admin/payments/analytics?${params}`);
  return response.data;
};
