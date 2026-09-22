import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import io from "socket.io-client";

// ─── Socket URL ────────────────────────────────────────────
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:9000";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  // ─── Connect with token ──────────────────────────────────
  const connectSocket = (token) => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    const newSocket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on("connect", () => {
      console.log("✅ Vendor socket connected");
      setIsConnected(true);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("❌ Vendor socket disconnected:", reason);
      setIsConnected(false);
    });

    newSocket.on("connect_error", (error) => {
      console.log("⚠️ Vendor socket error:", error.message);
    });

    socketRef.current = newSocket;
    setSocket(newSocket);
  };

  // ─── Reconnect with stored token ─────────────────────────
  const reconnect = () => {
    const token = localStorage.getItem("vendorToken");
    if (token) {
      connectSocket(token);
    }
  };

  // ─── Join / leave order rooms ────────────────────────────
  const joinOrderRoom = (orderId) => {
    if (socket) socket.emit("join:order", orderId);
  };

  const leaveOrderRoom = (orderId) => {
    if (socket) socket.emit("leave:order", orderId);
  };

  // ─── Initial connection ──────────────────────────────────
  useEffect(() => {
    reconnect();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
      }
    };
  }, []);

  const value = {
    socket,
    isConnected,
    reconnect,
    joinOrderRoom,
    leaveOrderRoom,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
