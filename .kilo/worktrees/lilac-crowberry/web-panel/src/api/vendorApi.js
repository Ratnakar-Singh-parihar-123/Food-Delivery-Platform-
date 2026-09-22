import axios from "axios";

// ─── Base URL ──────────────────────────────────────────────────
const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:9000/api/2026";

export const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || "http://localhost:9000";

// ─── Axios instance ──────────────────────────────────────────
const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

// ─── Request interceptor ─────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("vendorToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Response interceptor ────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("vendorToken");
      localStorage.removeItem("vendor");
      if (window.location.pathname.includes("/vendor/")) {
        window.location.href = "/vendor/login";
      }
    }
    return Promise.reject(error);
  },
);

/* ============================================================
   AUTH
============================================================ */
export const registerVendorApi = async (data) => {
  const response = await api.post("/vendors/register", data);
  return response.data;
};

export const verifyVendorEmailApi = async (data) => {
  const response = await api.post("/vendors/verify/email", data);
  return response.data;
};

export const loginVendorApi = async (data) => {
  const response = await api.post("/vendors/login", data);
  return response.data;
};

export const logoutVendorApi = async () => {
  const response = await api.post("/vendors/logout");
  return response.data;
};

export const resendVendorOtpApi = async (data) => {
  const response = await api.post("/vendors/resend/otp", data);
  return response.data;
};

/* ============================================================
   PROFILE
============================================================ */
export const getVendorProfileApi = async () => {
  const response = await api.get("/vendors/profile");
  return response.data;
};

export const updateVendorProfileApi = async (data) => {
  const response = await api.patch("/vendors/profile", data);
  return response.data;
};

export const updateVendorBusinessApi = async (data) => {
  const response = await api.patch("/vendors/business", data);
  return response.data;
};

export const updateVendorOnlineStatusApi = async (isOnline) => {
  const response = await api.patch("/vendors/online/status", { isOnline });
  return response.data;
};

export const updateVendorProfileImage = async (formData) => {
  const response = await api.patch("/vendors/profile/image", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

/* ============================================================
   DASHBOARD
============================================================ */
export const getVendorDashboardApi = async () => {
  const response = await api.get("/vendors/dashboard");
  return response.data;
};

/* ============================================================
   ORDERS (Vendor)
============================================================ */
export const getVendorOrdersApi = async (params = {}) => {
  const response = await api.get("/vendors/panel/orders", { params });
  return response.data;
};

export const getVendorLiveOrdersApi = async () => {
  const response = await api.get("/vendors/orders/live");
  return response.data;
};

export const getVendorOrderApi = async (orderId) => {
  const response = await api.get(`/vendors/orders/${orderId}`);
  return response.data;
};

export const acceptVendorOrderApi = async (orderId) => {
  const response = await api.patch(`/vendors/orders/${orderId}/accept`);
  return response.data;
};

export const rejectVendorOrderApi = async (orderId, reason) => {
  const response = await api.patch(`/vendors/orders/${orderId}/reject`, {
    reason,
  });
  return response.data;
};

// ✅ This is the missing export – now properly defined
export const updateVendorOrderStatusApi = async (orderId, status) => {
  const response = await api.patch(`/vendors/orders/${orderId}/status`, {
    status,
  });
  return response.data;
};
export const updateVendorOrderStatus = updateVendorOrderStatusApi;

/* ============================================================
   CUSTOMERS
============================================================ */
export const getVendorCustomersApi = async () => {
  const response = await api.get("/vendors/customers");
  return response.data;
};

/* ============================================================
   NOTIFICATIONS
============================================================ */
export const getVendorNotificationsApi = async () => {
  const response = await api.get("/vendors/notifications");
  return response.data;
};

export const createVendorNotificationApi = async (data) => {
  const response = await api.post("/vendors/notifications", data);
  return response.data;
};

/* ============================================================
   LOCATION
============================================================ */
export const reverseGeocodeVendorApi = async (lat, lng) => {
  const response = await api.post("/vendors/reverse/geocode", { lat, lng });
  return response.data;
};

export const updateVendorAddressApi = async (data) => {
  const response = await api.patch("/vendors/address", data);
  return response.data;
};

/* ============================================================
   MENU & CATEGORIES
============================================================ */
export const getVendorMenuItems = async (vendorId) => {
  const response = await api.get(`/vendors/${vendorId}/items`);
  return response.data;
};

export const getVendorItems = async (vendorId, params = {}) => {
  const response = await api.get(`/vendors/${vendorId}/items`, { params });
  return response.data;
};

export const addVendorItem = async (vendorId, formData) => {
  const response = await api.post(`/vendors/${vendorId}/items`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const updateVendorItem = async (vendorId, itemId, formData) => {
  const response = await api.put(
    `/vendors/${vendorId}/items/${itemId}`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
  return response.data;
};

export const deleteVendorItem = async (vendorId, itemId) => {
  const response = await api.delete(`/vendors/${vendorId}/items/${itemId}`);
  return response.data;
};

// ─── Categories ──────────────────────────────────────────────
export const getVendorCategories = async (vendorId) => {
  const response = await api.get(`/vendors/${vendorId}/categories`);
  return response.data;
};

export const addVendorCategory = async (vendorId, data) => {
  const response = await api.post(`/vendors/${vendorId}/categories`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const updateVendorCategory = async (vendorId, categoryId, data) => {
  const response = await api.put(
    `/vendors/${vendorId}/categories/${categoryId}`,
    data,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
  return response.data;
};

export const deleteVendorCategory = async (vendorId, categoryId) => {
  const response = await api.delete(
    `/vendors/${vendorId}/categories/${categoryId}`,
  );
  return response.data;
};

export const getGlobalCategories = async () => {
  const response = await api.get("/vendors/global/categories");
  return response.data;
};

export const getCategoryIcons = async () => {
  const response = await api.get("/icons");
  return response.data;
};

/* ============================================================
   POPULAR FOODS
============================================================ */
export const addPopularFood = async (menuItemId) => {
  const response = await api.post("/vendors/popular/foods", { menuItemId });
  return response.data;
};

export const removePopularFood = async (popularFoodId) => {
  const response = await api.delete(`/vendors/popular/foods/${popularFoodId}`);
  return response.data;
};

export const getVendorPopularFoods = async () => {
  const response = await api.get("/vendors/popular/foods");
  return response.data;
};

/* ============================================================
   RIDER ASSIGNMENT & HANDOVER
============================================================ */
export const assignRiderApi = async (orderId, riderData) => {
  const response = await api.post(
    `/vendors/orders/${orderId}/assign/rider`,
    riderData,
  );
  return response.data;
};

export const handoverOrderApi = async (orderId) => {
  const response = await api.post(`/vendors/orders/${orderId}/handover`);
  return response.data;
};

/* ============================================================
   ORDER DETAILS (common)
============================================================ */
export const getOrderDetails = async (orderId) => {
  const response = await api.get(`/orders/${orderId}`);
  return response.data;
};

/* ============================================================
   LEGACY (kept for backward compatibility)
============================================================ */
export const vendorRespondOrder = async (orderId, action, reason = "") => {
  if (action === "accept") {
    return acceptVendorOrderApi(orderId);
  } else if (action === "reject") {
    return rejectVendorOrderApi(orderId, reason);
  }
  throw new Error("Invalid action. Use 'accept' or 'reject'.");
};
export const getVendorBankDetailsApi = () => axios.get("/vendor/bank-details");
export const updateVendorBankDetailsApi = (data) =>
  axios.put("/vendor/bank-details", data);
