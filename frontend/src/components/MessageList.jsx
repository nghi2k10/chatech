import { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

export default function MessageList({ currentChat, currentUser }) {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!currentChat?._id) return;

    // Load tin nhắn cũ
    const loadMessages = async () => {
      const res = await axios.get(`http://localhost:5000/api/messages/${currentChat._id}`);
      setMessages(res.data);
    };
    loadMessages();

    // Tham gia room chat
    socket.emit("joinChat", currentChat._id);

    // Nhận tin nhắn realtime
    socket.off("messageReceived").on("messageReceived", (newMsg) => {
      // Chỉ nhận tin nhắn thuộc chat hiện tại
      if (newMsg.chatId === currentChat._id) {
        setMessages((prev) =>
          prev.find((m) => m._id === newMsg._id) ? prev : [...prev, newMsg]
        );
      }
    });

  }, [currentChat]);

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
      {messages.map((msg) => (
        <div
          key={msg._id}
          className={`my-1 flex ${
            msg.senderId._id === currentUser._id ? "justify-end" : "justify-start"
          }`}
        >
          <div
            className={`px-3 py-2 rounded-lg ${
              msg.senderId._id === currentUser._id
                ? "bg-blue-500 text-white"
                : "bg-gray-200"
            }`}
          >
            {msg.text}
          </div>
        </div>
      ))}
    </div>
  );
}
