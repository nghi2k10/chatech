import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  chatId: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  text: String,
  media: String
}, { timestamps: true });

export default mongoose.model("Message", messageSchema);
