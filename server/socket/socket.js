import { Server } from "socket.io";
import { socketAuth } from "./socketAuth.js";
import Order from "../models/order.js";
import Rider from "../models/rider.js";

let io;

export const initializeSocket = (httpServer, app) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "*",
      credentials: true,
    },
    transports: ["websocket", "polling"],
  });

  io.use(socketAuth);

  io.on("connection", async (socket) => {
    if (!socket.userId || !socket.userType) {
      socket.disconnect(true);
      return;
    }

    console.log(`🔌 Socket Connected -> ${socket.userType}: ${socket.userId}`);

    socket.join(`user:${socket.userId}`);
    socket.join(`role:${socket.userType}`);

    if (socket.userType === "vendor") {
      socket.join(`vendor:${socket.userId}`);
    }

    if (socket.userType === "customer") {
      socket.join(`customer:${socket.userId}`);
      try {
        const vendorIds = await Order.distinct("vendor", {
          customer: socket.userId,
          status: "delivered",
        });

        vendorIds.forEach((vendorId) => {
          socket.join(`vendor-customers:${vendorId}`);
        });
      } catch (err) {
        console.error("Vendor room join error:", err.message);
      }
    }

    if (socket.userType === "rider") {
      socket.join(`rider:${socket.userId}`);

      try {
        const rider = await Rider.findById(socket.userId);
        if (rider?.currentLocation?.coordinates) {
          socket.join(`rider-location:${socket.userId}`);
        }
      } catch (err) {
        console.error("Rider room join error:", err.message);
      }
    }

    socket.on("join-order", (orderId) => {
      if (!orderId) return;

      socket.join(`order:${orderId}`);

      console.log(`${socket.userType} joined order:${orderId}`);
    });

    socket.on("leave-order", (orderId) => {
      if (!orderId) return;

      socket.leave(`order:${orderId}`);
    });

    socket.on("disconnect", (reason) => {
      console.log(`${socket.userType} disconnected: ${reason}`);
    });
  });

  app.set("io", io);

  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket not initialized");
  return io;
};
