import "dotenv/config";
import http from "http";
import app from "./app.js";
import connectDB from "./config/db.js";
import { initializeSocket } from "./socket/socket.js";

/* =====================================================
   ENV VALIDATION
===================================================== */

const requiredEnv = [
  "MONGODB_URI",
  "JWT_ADMIN_SECRET",
  "JWT_VENDOR_SECRET",
  "JWT_CUSTOMER_SECRET",
  "JWT_RIDER_SECRET",
];

const missing = requiredEnv.filter((key) => !process.env[key]);
if (missing.length) {
  console.error("❌ Missing environment variables:");
  missing.forEach((key) => console.error(`   - ${key}`));
  process.exit(1);
}

/* =====================================================
   SERVER SETUP
===================================================== */

const PORT = Number(process.env.PORT) || 9000;
const server = http.createServer(app);

// Initialize Socket.IO and attach to app
const io = initializeSocket(server, app);

/* =====================================================
   START SERVER
===================================================== */

const startServer = async () => {
  try {
    await connectDB();
    console.log("✅ Database connected successfully");

    server.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 API: http://localhost:${PORT}/api/2026`);
      console.log(`⚡ Socket.IO ready`);
      console.log(`📦 Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

/* =====================================================
   GRACEFUL SHUTDOWN
===================================================== */

const shutdown = (signal) => {
  console.log(`\n🛑 ${signal} received. Shutting down gracefully...`);

  server.close(() => {
    console.log("✅ HTTP server closed.");
    if (io) {
      io.close(() => {
        console.log("✅ Socket.IO server closed.");
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  });

  // Force exit after 10 seconds if graceful shutdown fails
  setTimeout(() => {
    console.error("❌ Graceful shutdown timed out. Forcing exit.");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

/* =====================================================
   UNHANDLED REJECTIONS / EXCEPTIONS
===================================================== */

process.on("unhandledRejection", (error) => {
  console.error("❌ Unhandled Rejection:", error);
  shutdown("unhandledRejection");
});

process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  shutdown("uncaughtException");
});
