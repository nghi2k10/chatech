import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// ⚙️ Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ Lấy danh sách user (trừ chính mình)
router.get("/", async (req, res) => {
  try {
    const excludeId = req.query.excludeId;
    const users = await User.find(
      excludeId ? { _id: { $ne: excludeId } } : {}
    ).select("-password");
    res.json(users);
  } catch (err) {
    console.error("Lỗi load users:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Cập nhật profile (tên & avatar)
router.put("/:id", upload.single("avatar"), async (req, res) => {
  try {
    const { name } = req.body;
    let avatarUrl = null;

    // Nếu có upload file → đẩy lên Cloudinary
    if (req.file) {
      const uploadRes = await cloudinary.uploader.upload_stream(
        { folder: "avatars" },
        (error, result) => {
          if (error) throw error;
          avatarUrl = result.secure_url;
        }
      );
      uploadRes.end(req.file.buffer);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        ...(name && { name }),
        ...(avatarUrl && { avatar: avatarUrl }),
      },
      { new: true }
    ).select("-password");

    res.json(updatedUser);
  } catch (err) {
    console.error("Lỗi cập nhật user:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
