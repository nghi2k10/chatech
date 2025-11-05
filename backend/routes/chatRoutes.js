import express from "express";
import Chat from "../models/Chat.js";
import User from "../models/User.js";

const router = express.Router();

/**
 * ✅ Lấy danh sách chat mà user tham gia
 * GET /api/chats?userId=...
 */
router.get("/", async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ message: "Thiếu userId" });

    // Tìm tất cả chat mà user đang tham gia
    const chats = await Chat.find({ members: { $in: [userId] } })
      .populate("members", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

    res.json(chats);
  } catch (err) {
    console.error("Lỗi load danh sách chat:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * ✅ Tạo mới chat (1-1 hoặc nhóm)
 * POST /api/chats
 * body: { isGroup, members, name? }
 */
router.post("/", async (req, res) => {
  try {
    const { isGroup, members, name } = req.body;

    if (!members || members.length === 0) {
      return res.status(400).json({ message: "Thiếu danh sách thành viên" });
    }

    // Nếu là chat 1-1 thì kiểm tra có tồn tại chưa
    if (!isGroup && members.length === 2) {
      const existingChat = await Chat.findOne({
        isGroup: false,
        members: { $all: members, $size: 2 },
      }).populate("members", "-password");

      if (existingChat) return res.json(existingChat);
    }

    // Tạo chat mới
    const newChat = await Chat.create({
      name: isGroup ? name : "",
      isGroup: !!isGroup,
      members,
    });

    const fullChat = await newChat.populate("members", "-password");
    res.json(fullChat);
  } catch (err) {
    console.error("Lỗi tạo chat:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
