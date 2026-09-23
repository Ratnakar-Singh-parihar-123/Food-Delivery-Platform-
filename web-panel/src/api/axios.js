// import axios from "axios";

// const api = axios.create({
//   baseURL:
//     import.meta.env.VITE_API_BASE_URL || "http://localhost:9000/api/2026",

//   withCredentials: true,

//   timeout: 15000,
// });

// // IMPORTANT:
// // Yahan Content-Type: application/json MAT lagana.
// //
// // Axios JSON request ke liye khud JSON use karega
// // aur FormData ke liye multipart/form-data boundary khud banayega.

// api.interceptors.response.use(
//   (response) => response,
//   (error) => Promise.reject(error),
// );

// export default api;

import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL || "http://localhost:9000/api/2026",

  withCredentials: true,

  timeout: 15000,
});

// ============================================================
// ADMIN AUTH TOKEN
// ============================================================

api.interceptors.request.use(
  (config) => {
    const adminToken = localStorage.getItem("adminToken");

    if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// ============================================================
// RESPONSE
// ============================================================

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("admin");

      if (window.location.pathname.startsWith("/admin")) {
        window.location.href = "/admin/login";
      }
    }

    return Promise.reject(error);
  },
);

export default api;
