// src/api/customerApi.js
import api from './axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Phone Login ──────────────────────────────────────────
export const phoneLogin = async idToken => {
  try {
    const res = await api.post('/customers/phone/login', { idToken });

    // ✅ Save token from response
    const token = res.data?.data?.token || res.data?.token;
    if (token) {
      await AsyncStorage.setItem('token', token);
      console.log('✅ Token saved to AsyncStorage');
    } else {
      console.warn('⚠️ No token in login response:', res.data);
    }

    return res.data;
  } catch (error) {
    console.error('Phone login error:', error.response?.data || error.message);
    throw error;
  }
};

// ─── Get Customer Profile ─────────────────────────────────
export const getCustomerProfile = async () => {
  const { data } = await api.get('/customers/profile');
  return data;
};

// ─── Update Customer Profile ─────────────────────────────
export const updateCustomerProfile = async payload => {
  const { data } = await api.patch('/customers/profile', payload);
  return data;
};

// ─── Upload Customer Image ──────────────────────────────
export const uploadCustomerImage = async formData => {
  const { data } = await api.patch('/customers/profile/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

// ─── Delete Customer Image ──────────────────────────────
export const deleteCustomerImage = async () => {
  const { data } = await api.delete('/customers/profile/image');
  return data;
};

// ─── Skip Customer Profile ──────────────────────────────
export const skipCustomerProfile = async () => {
  const { data } = await api.patch('/customers/profile/skip');
  return data;
};

// ─── Banners ──────────────────────────────────────────────
export const getBanners = async (target = 'customer') => {
  const { data } = await api.get(`/banners/${target}`);
  return data;
};

// ─── Customer Orders ──────────────────────────────────────
export const getCustomerOrders = async (params = {}) => {
  const response = await api.get('/orders/customer', { params });
  return response.data;
};

// ─── Order Details ────────────────────────────────────────
export const getOrderDetails = async orderId => {
  const response = await api.get(`/orders/${orderId}`);
  return response.data;
};

// ─── Reorder ──────────────────────────────────────────────
export const reorder = async orderId => {
  const response = await api.post(`/orders/${orderId}/reorder`);
  return response.data;
};

// ─── Cancel Order ─────────────────────────────────────────
export const cancelOrder = async (orderId, reason) => {
  const response = await api.put(`/orders/${orderId}/cancel`, { reason });
  return response.data;
};

// ─── Addresses ─────────────────────────────────────────────
export const getAddresses = async () => {
  const response = await api.get('/customers/addresses');
  return response.data;
};

export const addAddress = async payload => {
  const response = await api.post('/customers/addresses', payload);
  return response.data;
};

export const updateAddress = async (id, payload) => {
  const response = await api.put(`/customers/addresses/${id}`, payload);
  return response.data;
};

export const deleteAddress = async id => {
  const response = await api.delete(`/customers/addresses/${id}`);
  return response.data;
};

export const setDefaultAddress = async id => {
  const response = await api.put(`/customers/addresses/${id}/default`);
  return response.data;
};

// ─── Place Order ───────────────────────────────────────────
export const placeOrder = async orderData => {
  const response = await api.post('/orders', orderData);
  return response.data;
};

export const search = async params => {
  const response = await api.get('/customers/search', { params });
  return response.data;
};
export const getNearbyPopularFoods = async params => {
  const response = await api.get('/customers/popular/foods/nearby', { params });
  return response.data;
};

export const getExploreCategories = async () => {
  const response = await api.get('/customers/explore');
  return response.data;
};

export const getExploreCategoryById = async categoryId => {
  const response = await api.get(`/customers/explore/${categoryId}`);
  return response.data;
};
export const getFoodCategories = async () => {
  const response = await api.get('/customers/categories');
  return response.data;
};

// ─── Fast Delivery Vendors ───────────────────────────
export const getFastDeliveryVendors = async (limit = 10) => {
  const response = await api.get(`/customers/fast/delivery?limit=${limit}`);
  return response.data;
};

// ─── Vendors with Filters ────────────────────────────
export const getVendorsWithFilters = async params => {
  const response = await api.get('/customers/vendors', { params });
  return response.data;
};
export const getDishesByCategory = async categoryId => {
  // if you have an endpoint for dishes per category
  const res = await api.get(`/customers/dishes?category=${categoryId}`);
  return res.data;
};
