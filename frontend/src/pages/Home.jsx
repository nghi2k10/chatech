import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";

const socket = io("http://localhost:5000"); // backend Socket.IO

export default function Home() {
  const navigate = useNavigate();

  // ✅ Kiểm tra user đã đăng nhập chưa
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);

  // Nếu chưa login → chuyển về login
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, []);

  // ✅ Lấy danh sách chat khi vào trang Home
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/chats?userId=${user._id}`
        );
        const data = await res.json();
        setChats(data);
      } catch (err) {
        console.error("Lỗi load danh sách chat:", err);
      }
    };

    if (user?._id) fetchChats();
  }, [user]);

  // ✅ Mỗi khi chọn chat → join room socket
  useEffect(() => {
    if (selectedChat?._id) {
      socket.emit("join-chat", selectedChat._id);
      fetchMessages(selectedChat._id);
    }
  }, [selectedChat]);

  // ✅ Lấy tin nhắn của chat đang mở
  const fetchMessages = async (chatId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/messages/${chatId}`);
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error("Lỗi load message:", err);
    }
  };

  // ✅ Lắng nghe tin nhắn realtime
  useEffect(() => {
    socket.on("receive-message", (msg) => {
      if (msg.chatId === selectedChat?._id) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => socket.off("receive-message");
  }, [selectedChat]);


  return (
    <div className="flex h-screen bg-gray-100">

      {/* Sidebar */}
      <div className="w-64 bg-white border-r shadow-sm p-4">
        <h2 className="text-xl font-semibold mb-4 text-blue-600">
          Xin chào, {user?.name} 👋
        </h2>

        <h3 className="font-medium text-gray-600 mb-2">Danh sách chat</h3>
        <div className="flex flex-col space-y-2">
          {chats.map((chat) => (
            <button
              key={chat._id}
              onClick={() => setSelectedChat(chat)}
              className={`p-3 rounded-lg text-left ${
                selectedChat?._id === chat._id
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              {chat.isGroup
                ? chat.name
                : chat.members.find((m) => m._id !== user._id)?.name}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex flex-col flex-1">

        {/* Nếu chưa chọn chat */}
        {!selectedChat && (
          <div className="flex items-center justify-center h-full text-lg text-gray-500">
            Hãy chọn một cuộc trò chuyện 👈
          </div>
        )}

        {/* Nếu đã chọn chat */}
        {selectedChat && (
          <>
            {/* Header */}
            <div className="p-4 bg-white shadow flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {selectedChat.isGroup
                  ? selectedChat.name
                  : selectedChat.members.find((m) => m._id !== user._id)?.name}
              </h2>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg._id}
                  className={`p-3 max-w-xs rounded-xl ${
                    msg.senderId._id === user._id
                      ? "bg-blue-500 text-white self-end ml-auto"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  {msg.text}
                  {msg.media && (
                    <img
                      src={msg.media}
                      alt="media"
                      className="mt-2 rounded-lg max-w-[180px]"
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Input */}
            <MessageInput
              user={user}
              chat={selectedChat}
              setMessages={setMessages}
            />
          </>
        )}
      </div>
    </div>
  );
}

// ✅ Tách input box ra component nhỏ cho dễ quản lý
function MessageInput({ user, chat, setMessages }) {
  const [text, setText] = useState("");

  const handleSend = async () => {
    if (!text.trim()) return;

    const payload = {
      chatId: chat._id,
      senderId: user._id,
      text,
    };

    try {
      const res = await fetch("http://localhost:5000/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setMessages((prev) => [...prev, data]);

      // gửi realtime
      socket.emit("send-message", data);

      setText("");
    } catch (err) {
      console.error("Lỗi gửi message:", err);
    }
  };

  return (
    <div className="p-4 bg-white flex space-x-3 border-t">
      <input
        type="text"
        className="flex-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 outline-none"
        placeholder="Nhập tin nhắn..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button
        onClick={handleSend}
        className="px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Gửi
      </button>
    </div>
  );
}
