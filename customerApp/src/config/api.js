// config/api.js
import { Platform } from 'react-native';

let baseURL = 'http://localhost:9000/api/2026/customers'; // fallback

if (Platform.OS === 'android') {
  // Android emulator uses 10.0.2.2 to reach host machine
  baseURL = 'https://myfoodmitra-ecosystem.onrender.com/api/2026/customers';
} else if (Platform.OS === 'ios') {
  // iOS simulator can use localhost or 127.0.0.1
  baseURL = 'http://127.0.0.1:9000/api/2026/customers';
}

// For real devices, you can use your local IP or a production URL
// baseURL = 'https://your-production-api.com/api/customer';

export const API_BASE = baseURL;
