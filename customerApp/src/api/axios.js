// src/api/axios.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: 'https://myfoodmitra-ecosystem.onrender.com/api/2026',
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request Interceptor: Attach Token ──────────────────
api.interceptors.request.use(
  async config => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('✅ Token attached:', token.substring(0, 20) + '...');
      } else {
        console.warn('⚠️ No token found in AsyncStorage');
      }
    } catch (error) {
      console.error('❌ Error reading token:', error);
    }
    return config;
  },
  error => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  },
);

// ─── Response Interceptor: Handle 401 ────────────────────
api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      console.warn('🔒 401 Unauthorized – clearing token');
      await AsyncStorage.removeItem('token');
      // Optionally navigate to login screen (use navigation ref)
    }
    return Promise.reject(error);
  },
);

export default api;
