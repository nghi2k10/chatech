import express from "express";
import Message from "../models/Message.js";
import Chat from "../models/Chat.js";

const router = express.Router();

/**
 * ✅ Lấy danh sách tin nhắn của 1 chat
 * GET /api/messages/:chatId
 */
router.get("/:chatId", async (req, res) => {
  try {
    const messages = await Message.find({ chatId: req.params.chatId })
      .populate("senderId", "name avatar")
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    console.error("Lỗi load messages:", err);
    res.status(500).json({ message: "Lỗi server khi load tin nhắn" });
  }
});

/**
 * ✅ Gửi tin nhắn mới
 * POST /api/messages
 */
router.post("/", async (req, res) => {
  try {
    const { chatId, senderId, text, media } = req.body;

    if (!chatId || !senderId) {
      return res.status(400).json({ message: "Thiếu chatId hoặc senderId" });
    }

    const newMessage = await Message.create({
      chatId,
      senderId,
      text,
      media: media || null,
    });

    // ✅ Cập nhật tin nhắn mới nhất cho chat
    await Chat.findByIdAndUpdate(chatId, { latestMessage: newMessage._id });

    // ✅ Populate để gửi lại dữ liệu đầy đủ cho frontend
    const populatedMsg = await Message.findById(newMessage._id)
      .populate("senderId", "name avatar");

    res.json(populatedMsg);
  } catch (err) {
    console.error("Lỗi gửi tin nhắn:", err);
    res.status(500).json({ message: "Lỗi server khi gửi tin nhắn" });
  }
});

export default router;
