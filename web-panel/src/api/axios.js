<<<<<<< HEAD
=======
// // import axios from "axios";

// // const api = axios.create({
// //   baseURL:
// //     import.meta.env.VITE_API_BASE_URL || "http://localhost:9000/api/2026",

// //   withCredentials: true,

// //   timeout: 15000,
// // });

// // // IMPORTANT:
// // // Yahan Content-Type: application/json MAT lagana.
// // //
// // // Axios JSON request ke liye khud JSON use karega
// // // aur FormData ke liye multipart/form-data boundary khud banayega.

// // api.interceptors.response.use(
// //   (response) => response,
// //   (error) => Promise.reject(error),
// // );

// // export default api;

// import axios from "axios";

// const api = axios.create({
//   baseURL:
//     import.meta.env.VITE_API_BASE_URL || "http://localhost:9000/api/2026",

//   withCredentials: true,

//   timeout: 15000,
// });

// // api.interceptors.request.use(
// //   (config) => {
// //     const adminToken = localStorage.getItem("adminToken");

// //     if (adminToken) {
// //       config.headers.Authorization = `Bearer ${adminToken}`;
// //     }

// //     return config;
// //   },
// //   (error) => Promise.reject(error),
// // );
// api.interceptors.request.use(
//   (config) => {
//     const vendorToken = localStorage.getItem("vendorToken");

//     if (vendorToken) {
//       config.headers.Authorization = `Bearer ${vendorToken}`;
//     }

//     return config;
//   },
//   (error) => Promise.reject(error),
// );

// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     return Promise.reject(error);
//   },
// );

// export default api;

>>>>>>> 556124a (update home page)
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
