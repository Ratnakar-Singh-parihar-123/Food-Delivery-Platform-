import axios from "./axios";

// ─── GET ALL CUSTOMERS ────────────────────────────────
export const getCustomers = async (params = {}) => {
  const { data } = await axios.get("/admin/customers", { params });
  return data;
};

// ─── GET CUSTOMER BY ID ──────────────────────────────
export const getCustomerById = async (customerId) => {
  const { data } = await axios.get(`/admin/customers/${customerId}`);
  return data;
};

// ─── GET CUSTOMER STATS ───────────────────────────────
export const getCustomerStats = async () => {
  const { data } = await axios.get("/admin/customers/stats");
  return data;
};

// ─── BLOCK CUSTOMER ────────────────────────────────────
export const blockCustomer = async (customerId, reason = "") => {
  const { data } = await axios.patch(`/admin/customers/${customerId}/block`, {
    reason,
  });
  return data;
};

// ─── UNBLOCK CUSTOMER ──────────────────────────────────
export const unblockCustomer = async (customerId) => {
  const { data } = await axios.patch(`/admin/customers/${customerId}/unblock`);
  return data;
};

// ─── UPDATE CUSTOMER STATUS ────────────────────────────
export const updateCustomerStatus = async (customerId, status) => {
  const { data } = await axios.patch(`/admin/customers/${customerId}/status`, {
    status,
  });
  return data;
};

export const getRecentCustomers = async (limit = 5) => {
  const { data } = await axios.get("/admin/customers/recent", {
    params: { limit },
  });
  return data;
};
