import express from "express";
import Chat from "../models/Chat.js";
import Message from "../models/Message.js";

const router = express.Router();

// Get all chats for user
router.get("/", async (req, res) => {
  const userId = req.query.userId;
  const chats = await Chat.find({ members: userId })
    .populate("members", "-password")
    .populate("latestMessage");
  res.json(chats);
});

// Create chat (1-1)
router.post("/", async (req, res) => {
  const { members, name } = req.body;
  const chat = await Chat.create({ members, name, isGroup: false });
  const fullChat = await Chat.findById(chat._id).populate("members", "-password");
  res.json(fullChat);
});

export default router;
