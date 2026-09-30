import { io } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  "https://food-delivery-platform-ypx6.onrender.com";

export const socket = io(SOCKET_URL, {
  autoConnect: false,

  withCredentials: true,

  transports: ["websocket", "polling"],
});
