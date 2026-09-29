import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:9000/api/2026",

  withCredentials: true,

  timeout: 15000,
});

api.interceptors.request.use(
  (config) => {
    const adminToken = localStorage.getItem("adminToken");
    const vendorToken = localStorage.getItem("vendorToken");

    // Vendor APIs
    if (config.url?.startsWith("/icons")) {
      if (vendorToken) {
        config.headers.Authorization = `Bearer ${vendorToken}`;
      }
    }

    // Baaki APIs → Admin
    else if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  },
);

export default api;
