import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";

import adminRoutes from "./routes/adminRoutes.js";
import adminNotificationRoutes from "./routes/adminNotificationRoutes.js";
import vendorNotificationRoutes from "./routes/vendorNotificationRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import adminCustomerRoutes from "./routes/adminCustomerRoutes.js";
import { iconRoutes } from "./routes/iconRoutes.js";
import { notFound, errorHandler } from "./middleware/error.js";
import vendorRoutes from "./routes/vendorRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import adminPaymentRoutes from "./routes/adminPaymentRoutes.js";
import adminVendorRoutes from "./routes/adminVendorRoutes.js";
import adminBannerRoutes from "./routes/adminBannerRoutes.js";
import bannerRoutes from "./routes/bannerRoutes.js";
import adminCouponRoutes from "./routes/adminCouponRoutes.js";
import couponRoutes from "./routes/couponRoutes.js";
import auditLogRoutes from "./routes/auditLogRoutes.js";
import vendorPanelRoutes from "./routes/vendorPanelRoutes.js";
import riderRoutes from "./routes/riderRoutes.js";
import adminRiderRoutes from "./routes/adminRiderRoutes.js";
import adminDashboardRoutes from "./routes/adminDashboardRoutes.js";
import vendorMenuRoutes from "./routes/vendorMenuRoutes.js";
import vendorTiffinRoutes from "./routes/vendorTiffinRoutes.js";
import vendorBakeryRoutes from "./routes/vendorBakeryRoutes.js";
import vendorLocationRoutes from "./routes/vendorLocationRoutes.js";
import categoryRoutes from "./routes/vendorCategoryRoutes.js";
import menuItemRoutes from "./routes/vendorMenuItemRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import houseTiffinRoutes from "./routes/houseTiffinRoutes.js";
import adminAnalyticsRoutes from "./routes/adminAnalyticsRoutes.js";
// ─── Import middleware and controllers ────────────────────
import {
  protectVendor,
  requireApprovedVendor,
} from "./middleware/vendorAuth.js";
import {
  getMenuItems,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from "./controllers/vendorMenuController.js";
import { uploadVendorMenu } from "./middleware/upload.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* =================================================
   SECURITY
================================================= */

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  }),
);

/* =================================================
   CORS
================================================= */

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

/* =================================================
   BODY PARSER
================================================= */

app.use(
  express.json({
    limit: "20kb",
  }),
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "20kb",
  }),
);

app.use(cookieParser());

/* =================================================
   LOGGING
================================================= */

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

/* =================================================
   RATE LIMIT
================================================= */

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

app.use("/api", apiLimiter);

/* =================================================
   STATIC FILES
================================================= */

const uploadsPath = path.join(__dirname, "./uploads");
app.use("/uploads", express.static(uploadsPath));

/* =================================================
   HEALTH CHECK
================================================= */

app.get("/api/2026/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Food Delivery API is running",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

/* =================================================
   ROUTES
================================================= */

// ─── Admin ───────────────────────────────────────────
app.use("/api/2026/admin", adminRoutes);
app.use("/api/2026/admin/notifications", adminNotificationRoutes);
app.use("/api/2026/admin/vendors", adminVendorRoutes);
app.use("/api/2026/admin/banners", adminBannerRoutes);
app.use("/api/2026/admin/coupons", adminCouponRoutes);
app.use("/api/2026/admin/audit/logs", auditLogRoutes);
app.use("/api/2026/admin/riders", adminRiderRoutes);
app.use("/api/2026/admin/customers", adminCustomerRoutes);
app.use("/api/2026/admin/dashboard", adminDashboardRoutes);
app.use("/api/2026/admin/analytics", adminAnalyticsRoutes);
app.use("/api/2026/payments", paymentRoutes);
app.use("/api/2026/admin/payments", adminPaymentRoutes);
// ─── Vendor ──────────────────────────────────────────
app.use("/api/2026/vendors", vendorRoutes);
app.use("/api/2026/vendors/panel", vendorPanelRoutes);
app.use("/api/2026/vendors/notifications", vendorNotificationRoutes);
app.use("/api/2026/vendors/menu", vendorMenuRoutes);
app.use("/api/2026/vendors/tiffin", vendorTiffinRoutes);
app.use("/api/2026/vendors/bakery", vendorBakeryRoutes);
app.use("/api/2026/vendors/location", vendorLocationRoutes);

// ─── Vendor menu & category routes ──────────────────
// Public: get all items for a vendor (no auth required)
app.get("/api/2026/vendors/:vendorId/items", getMenuItems);

// Protected: category management
app.use(
  "/api/2026/vendors/:vendorId/categories",
  protectVendor,
  requireApprovedVendor,
  categoryRoutes,
);

// Protected: nested item routes (GET/PUT/DELETE specific items)
app.use(
  "/api/2026/vendors/:vendorId/categories/:categoryId/items",
  protectVendor,
  requireApprovedVendor,
  menuItemRoutes,
);

// ✅ Direct POST for adding an item (categoryId in body)
app.post(
  "/api/2026/vendors/:vendorId/items",
  protectVendor,
  requireApprovedVendor,
  uploadVendorMenu,
  addMenuItem,
);

// ─── Other ────────────────────────────────────────────
app.use("/api/2026/notifications", notificationRoutes);
app.use("/api/2026/customers", customerRoutes);
app.use("/api/2026/banners", bannerRoutes);
app.use("/api/2026/coupons", couponRoutes);
app.use("/api/2026/rider", riderRoutes);
app.use("/api/2026/icons", iconRoutes);
app.use("/api/2026/orders", orderRoutes);
app.use("/api/2026/house/tiffin", houseTiffinRoutes);

/* =================================================
   404 & ERROR HANDLING
================================================= */

app.use(notFound);
app.use(errorHandler);

export default app;
