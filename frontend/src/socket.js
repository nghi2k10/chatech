import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:5000";

export const socket = io(SOCKET_URL, {
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: 5,
});

export const joinChat = (chatId) => {
  if (socket && chatId) socket.emit("join chat", chatId);
};

export const sendMessage = (message) => {
  if (socket && message) socket.emit("new message", message);
};

export const listenForMessages = (callback) => {
  if (socket) socket.on("message received", callback);
};

export const stopListening = () => {
  if (socket) socket.off("message received");
};

socket.on("connect", () => console.log("✅ Socket connected:", socket.id));
socket.on("disconnect", () => console.log("❌ Socket disconnected"));
