// src/socket.js
import { io } from "socket.io-client";

let socket = null;

// ⚡ Kết nối socket nếu chưa kết nối
export const connectSocket = (userId) => {
  if (!socket || !socket.connected) {
    socket = io("http://localhost:5000", {
      transports: ["websocket"],
      query: { userId },
      reconnection: true,          // tự động reconnect nếu mất kết nối
      reconnectionAttempts: 5,     // thử lại tối đa 5 lần
      reconnectionDelay: 2000,     // delay 2s mỗi lần
    });

    console.log("🔌 Socket connecting...");

    socket.on("connect", () => {
      console.log("✅ Connected to socket:", socket.id);
    });

    socket.on("disconnect", (reason) => {
      console.log("⚠️ Socket disconnected:", reason);
    });
  }

  return socket;
};

// Lấy socket hiện tại
export const getSocket = () => socket;

// Ngắt kết nối khi logout
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log("🔴 Socket manually disconnected");
  }
};
