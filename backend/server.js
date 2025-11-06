import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import usersRoutes from "./routes/usersRoutes.js";

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// 🧩 API Routes
app.use("/api/auth", authRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", usersRoutes);

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" },
});

// ==========================================================
// 🔌 SOCKET.IO REALTIME SERVER
// ==========================================================
const userSockets = new Map(); // userId → socket.id

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  if (userId) {
    userSockets.set(userId, socket.id);
    console.log(`✅ ${userId} connected (${socket.id})`);
  }

  // 🏠 User vào chat cụ thể
  socket.on("joinChat", (chatId) => {
    socket.join(chatId);
    console.log(`👥 User ${userId} joined chat ${chatId}`);
  });

  // ✍️ "Đang nhập..."
  socket.on("typing", (chatId) => {
    socket.to(chatId).emit("typing", chatId);
  });

  socket.on("stopTyping", (chatId) => {
    socket.to(chatId).emit("stopTyping", chatId);
  });

  // 💬 Tin nhắn mới
  socket.on("newMessage", (messageData) => {
    const chatId = messageData.chatId;
    if (!chatId) return;
    socket.to(chatId).emit("messageReceived", messageData);
  });

  // ❌ Khi ngắt kết nối
  socket.on("disconnect", () => {
    if (userId) {
      userSockets.delete(userId);
      console.log(`🔴 ${userId} disconnected`);
    }
  });
});

// ==========================================================
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
