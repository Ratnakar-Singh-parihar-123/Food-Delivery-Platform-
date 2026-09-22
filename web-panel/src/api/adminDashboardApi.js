import axios from "./axios";

// ─── DASHBOARD STATS ────────────────────────────────────
export const getDashboardStats = async () => {
  const { data } = await axios.get("/admin/dashboard/stats");
  return data;
};

// ─── ORDERS OVERVIEW (chart data) ──────────────────────
export const getOrdersOverview = async (period = "today") => {
  const { data } = await axios.get("/admin/dashboard/orders/overview", {
    params: { period },
  });
  return data;
};

// ─── REVENUE BREAKDOWN ──────────────────────────────────
export const getRevenueBreakdown = async () => {
  const { data } = await axios.get("/admin/dashboard/revenue/breakdown");
  return data;
};

// ─── ACTIVE ORDERS ──────────────────────────────────────
export const getActiveOrders = async () => {
  // ✅ Fixed: matches backend route "/active/orders"
  const { data } = await axios.get("/admin/dashboard/active/orders");
  return data;
};

// ─── RIDER STATUS ───────────────────────────────────────
export const getRiderStatus = async () => {
  const { data } = await axios.get("/admin/dashboard/rider/status");
  return data;
};

// ─── RECENT ORDERS ──────────────────────────────────────
export const getRecentOrders = async (limit = 10) => {
  const { data } = await axios.get("/admin/orders/recent", {
    params: { limit },
  });
  return data;
};

// ─── TOP VENDORS ────────────────────────────────────────
export const getTopVendors = async () => {
  const { data } = await axios.get("/admin/dashboard/top/vendors");
  return data;
};

// ─── PENDING VENDORS ────────────────────────────────────
export const getPendingVendors = async () => {
  const { data } = await axios.get("/admin/dashboard/pending/vendors");
  return data;
};

// ─── PENDING RIDERS ─────────────────────────────────────
export const getPendingRiders = async () => {
  const { data } = await axios.get("/admin/dashboard/pending/riders");
  return data;
};

// ─── SUPPORT TICKETS ────────────────────────────────────
export const getSupportTickets = async () => {
  const { data } = await axios.get("/admin/dashboard/support/tickets");
  return data;
};

// ─── SERVICE AREAS ──────────────────────────────────────
export const getServiceAreas = async () => {
  const { data } = await axios.get("/admin/dashboard/service/areas");
  return data;
};
