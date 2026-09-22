import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Base URL ──────────────────────────────────────────────
const SOCKET_URL = 'http://10.200.227.211:9000';
const API_BASE = 'http://10.200.227.211:9000/api/2026';

// ─── Create Axios Instance ──────────────────────────────
const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Token Helpers (AsyncStorage) ──────────────────────
const STORAGE_KEY = 'riderToken';
export const storeToken = async token => {
  try {
    console.log(
      '🟢 storeToken called with:',
      token ? 'token present' : 'no token',
    );
    if (token) {
      await AsyncStorage.setItem(STORAGE_KEY, token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('✅ Token stored successfully');
    } else {
      await AsyncStorage.removeItem(STORAGE_KEY);
      delete api.defaults.headers.common['Authorization'];
      console.log('🗑️ Token removed');
    }
  } catch (e) {
    console.error('❌ Error saving token', e);
  }
};

export const getToken = async () => {
  try {
    const token = await AsyncStorage.getItem(STORAGE_KEY);
    console.log('🔑 getToken retrieved:', token ? 'yes' : 'no');
    return token;
  } catch (e) {
    console.error('❌ Error fetching token', e);
    return null;
  }
};

export const clearToken = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
    delete api.defaults.headers.common['Authorization'];
  } catch (e) {
    console.error('Error clearing token', e);
  }
};

// ─── Request Interceptor ──────────────────────────────
api.interceptors.request.use(
  async config => {
    // If Authorization header not set, try to load from storage
    if (!config.headers.Authorization) {
      const token = await getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    // Debug log (remove in production)
    console.log(
      `🚀 ${config.method.toUpperCase()} ${config.url}`,
      config.headers.Authorization ? '✅ token attached' : '❌ no token',
    );
    return config;
  },
  error => Promise.reject(error),
);

// ─── Response Interceptor ──────────────────────────────
api.interceptors.response.use(
  response => response,
  async error => {
    // Only clear token if we get a 401 and the request was not already a login/otp attempt
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      // Avoid clearing token during OTP verification or login (those are public)
      if (
        !url.includes('/send/otp') &&
        !url.includes('/verify/otp') &&
        !url.includes('/login')
      ) {
        console.warn('🔴 401 Unauthorized – clearing token');
        await clearToken();
      }
    }
    return Promise.reject(error);
  },
);

/* ===========================================================
   API FUNCTIONS
============================================================ */

export const riderSendOtp = async data => {
  const res = await api.post('/rider/send/otp', data);
  return res.data;
};

export const riderVerifyOtp = async data => {
  const res = await api.post('/rider/verify/otp', data);
  const token = res.data?.data?.token || res.data?.token;
  if (token) {
    await storeToken(token); // sets default header too
  } else {
    console.warn('⚠️ No token received in OTP response');
  }
  return res.data;
};

export const riderLogin = async data => {
  const res = await api.post('/rider/login', data);
  const token = res.data?.data?.token || res.data?.token;
  if (token) {
    await storeToken(token);
  }
  return res.data;
};

export const riderRegister = async data => {
  const res = await api.post('/rider/register', data);
  const token = res.data?.data?.token || res.data?.token;
  if (token) {
    await storeToken(token);
  }
  return res.data;
};

export const getRiderProfile = async () => {
  const res = await api.get('/rider/profile');
  return res.data;
};

export const riderCompleteProfile = async data => {
  const res = await api.post('/rider/profile/complete', data);
  return res.data;
};

// Document upload – note: multipart form-data
export const riderUploadDocument = async (formData, config = {}) => {
  const res = await api.post('/rider/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: config.timeout || 10000,
  });
  return res.data;
};

export const riderSubmitDocuments = async data => {
  const res = await api.post('/rider/documents/submit', data);
  return res.data;
};

export const getRiderDocuments = async () => {
  const res = await api.get('/rider/documents');
  return res.data;
};

export const updateRiderLocation = async data => {
  const res = await api.put('/rider/location', data);
  return res.data;
};

export const toggleRiderOnline = async data => {
  const res = await api.put('/rider/online', data);
  return res.data;
};

export const getRiderOrders = async params => {
  const res = await api.get('/rider/orders', { params });
  return res.data;
};

export const getNearbyOrders = async () => {
  const res = await api.get('/rider/nearby/orders', {
    params: { _t: Date.now() },
  });
  return res.data;
};

export const riderAcceptOrder = async data => {
  const res = await api.post('/rider/orders/accept', data);
  return res.data;
};

export const riderUpdateOrderStatus = async (orderId, data) => {
  const res = await api.patch(`/rider/orders/${orderId}/status`, data);
  return res.data;
};

export const adminUpdateRiderStatus = async data => {
  const res = await api.put('/rider/admin/status', data);
  return res.data;
};

export const riderRejectOrder = async data => {
  const res = await api.post('/rider/orders/reject', data);
  return res.data;
};

// export const getRiderOrder = async orderId => {
//   const res = await api.get(`/rider/orderDetails/${orderId}`);
//   return res.data;
// };
export const getRiderOrder = async orderId => {
  const res = await api.get(`/orders/${orderId}`);
  return res.data;
};
export const updateRiderProfile = async data => {
  const res = await api.patch('/rider/profile', data);
  return res.data;
};

export const changeRiderPassword = async data => {
  const res = await api.patch('/rider/change-password', data);
  return res.data;
};

// export const getRiderEarnings = async () => {
//   const res = await api.get('/rider/earnings');
//   return res.data;
// };

export const requestWithdrawal = async data => {
  const res = await api.post('/rider/withdraw', data);
  return res.data;
};

export const getBankDetails = async () => {
  const res = await api.get('/rider/bank-details');
  return res.data;
};

export const addBankDetails = async data => {
  const res = await api.post('/rider/bank-details', data);
  return res.data;
};
export const getRiderEarnings = async () => {
  const res = await api.get('/rider/earnings');
  return res.data;
};
export const riderCompleteOrderWithOTP = async data => {
  const res = await api.post('/rider/orders/complete', data);
  return res.data;
};
// ─── Default export ──────────────────────────────────────
export default {
  riderSendOtp,
  // getRiderEarnings,
  requestWithdrawal,
  addBankDetails,
  getBankDetails,
  changeRiderPassword,
  updateRiderProfile,
  riderVerifyOtp,
  riderLogin,
  getRiderOrder,
  riderRegister,
  getRiderProfile,
  riderCompleteProfile,
  riderUploadDocument,
  riderSubmitDocuments,
  getRiderDocuments,
  updateRiderLocation,
  toggleRiderOnline,
  getRiderOrders,
  getNearbyOrders,
  riderAcceptOrder,
  riderUpdateOrderStatus,
  adminUpdateRiderStatus,
  storeToken,
  getToken,
  clearToken,
  riderRejectOrder,
  getRiderEarnings,
  riderCompleteOrderWithOTP,
};
