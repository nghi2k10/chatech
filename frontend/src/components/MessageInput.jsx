import { useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

export default function MessageInput({ currentChat, currentUser }) {
  const [text, setText] = useState("");

  const sendMessage = async () => {
    if (!text.trim()) return;

    try {
      const res = await axios.post("http://localhost:5000/api/messages", {
        chatId: currentChat._id,
        senderId: currentUser._id,
        text,
      });

      // Gửi tin nhắn realtime qua socket
      socket.emit("newMessage", res.data);
      setText("");
    } catch (err) {
      console.error("Lỗi gửi tin:", err);
    }
  };

  return (
    <div className="flex p-3 border-t">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="flex-1 border rounded px-2 py-1"
        placeholder="Nhập tin nhắn..."
      />
      <button
        onClick={sendMessage}
        className="ml-2 bg-blue-500 text-white px-4 py-1 rounded"
      >
        Gửis
      </button>
    </div>
  );
}
