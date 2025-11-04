import express from "express";
import Message from "../models/Message.js";
import multer from "multer";
import cloudinary from "../utils/cloudinary.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Get messages
router.get("/:chatId", async (req, res) => {
  const messages = await Message.find({ chatId: req.params.chatId })
    .populate("senderId", "-password");
  res.json(messages);
});

// Send message (text + optional media)
router.post("/", upload.single("media"), async (req, res) => {
  let mediaUrl = null;
  if (req.file) {
    const result = await cloudinary.uploader.upload(req.file.path);
    mediaUrl = result.secure_url;
  }

  const { chatId, senderId, text } = req.body;
  const message = await Message.create({ chatId, senderId, text, media: mediaUrl });
  res.json(message);
});

export default router;
