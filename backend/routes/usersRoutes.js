import express from "express";
import User from "../models/User.js";

const router = express.Router();

// ✅ Lấy danh sách user (trừ chính mình)
router.get("/", async (req, res) => {
  try {
    const excludeId = req.query.excludeId;
    const users = await User.find(excludeId ? { _id: { $ne: excludeId } } : {}).select(
      "-password"
    );
    res.json(users);
  } catch (err) {
    console.error("Lỗi load users:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
