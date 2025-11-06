import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { connectSocket, getSocket, disconnectSocket } from "../socket";
import UserList from "../components/UserList";

export default function Home() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null); // 👈 giữ socket cố định

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  // ✅ Kết nối socket 1 lần duy nhất khi có user._id
  useEffect(() => {
    if (!user?._id || socketRef.current) return;

    socketRef.current = connectSocket(user._id);

    const socket = socketRef.current;
    socket.on("connect", () => console.log("✅ Socket connected:", socket.id));
    socket.on("disconnect", () => console.log("🔴 Socket disconnected"));

    // cleanup
    return () => {
      disconnectSocket();
      socketRef.current = null;
    };
  }, [user?._id]);

  // ✅ Lấy danh sách chat
  useEffect(() => {
    if (!user?._id) return;

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

    fetchChats();
  }, [user?._id]);

  // ✅ Join chat khi chọn
  useEffect(() => {
    const socket = socketRef.current;
    if (!selectedChat?._id || !socket) return;

    socket.emit("joinChat", selectedChat._id);
    fetchMessages(selectedChat._id);
  }, [selectedChat]);

  const fetchMessages = async (chatId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/messages/${chatId}`);
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error("Lỗi load message:", err);
    }
  };

  // ✅ Lắng nghe message realtime
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const handleMessage = (msg) => {
      if (msg.chatId === selectedChat?._id) {
        setMessages((prev) => {
          const exists = prev.some((m) => m._id === msg._id);
          return exists ? prev : [...prev, msg];
        });
      }
    };

    socket.on("messageReceived", handleMessage);
    socket.on("typing", (chatId) => {
      if (chatId === selectedChat?._id) setIsTyping(true);
    });
    socket.on("stopTyping", (chatId) => {
      if (chatId === selectedChat?._id) setIsTyping(false);
    });

    return () => {
      socket.off("messageReceived", handleMessage);
      socket.off("typing");
      socket.off("stopTyping");
    };
  }, [selectedChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-64 bg-white border-r shadow-sm p-4">
        <h2 className="text-xl font-semibold mb-4 text-blue-600">
          Xin chào, {user?.name} 👋
        </h2>

        <button
          onClick={() => navigate("/profile")}
          className="mb-4 px-3 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
        >
          Hồ sơ cá nhân
        </button>
        
        <UserList
          currentUser={user}
          chats={chats}
          setChats={setChats}
          setSelectedChat={setSelectedChat}
        />
      </div>

      <div className="flex flex-col flex-1">
        {!selectedChat ? (
          <div className="flex items-center justify-center h-full text-lg text-gray-500">
            Hãy chọn một cuộc trò chuyện 👈
          </div>
        ) : (
          <>
            <div className="p-4 bg-white shadow">
              <h2 className="text-lg font-semibold">
                {selectedChat.isGroup
                  ? selectedChat.name
                  : selectedChat.members.find((m) => m._id !== user._id)?.name}
              </h2>
              {isTyping ? (
                <p className="text-sm text-blue-500 animate-pulse">
                  đang nhập...
                </p>
              ) : (
                <p className="text-sm text-gray-400">Đang trò chuyện</p>
              )}
            </div>

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
                  <p>{msg.text}</p>
                  <p className="text-[10px] text-gray-400 mt-1 text-right">
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

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

function MessageInput({ user, chat, setMessages }) {
  const [text, setText] = useState("");
  const typingTimeoutRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);
  const socket = getSocket();

  const handleTyping = (e) => {
    const value = e.target.value;
    setText(value);

    if (!socket) return;

    if (!isTyping) {
      setIsTyping(true);
      socket.emit("typing", chat._id);
    }

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit("stopTyping", chat._id);
    }, 2000);
  };

  const handleSend = async () => {
    if (!text.trim()) return;
    if (!socket) return;

    socket.emit("stopTyping", chat._id);

    const payload = {
      chatId: chat._id,
      senderId: user._id,
      text,
    };

    try {
      const res = await fetch("http://localhost:5000/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      setMessages((prev) => [...prev, data]);
      socket.emit("newMessage", data);
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
        onChange={handleTyping}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
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
