import { useEffect, useState } from "react";
import io from "socket.io-client";
import ChatList from "../components/ChatList";
import MessageList from "../components/MessageList";
import MessageInput from "../components/MessageInput";
import { getChats } from "../api";

const socket = io("http://localhost:5000");

export default function Home() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const fetchChats = async () => {
      const { data } = await getChats(user.user._id);
      setChats(data);
    };
    fetchChats();
  }, []);

  useEffect(() => {
    if (selectedChat) socket.emit("join-chat", selectedChat._id);
  }, [selectedChat]);

  useEffect(() => {
    socket.on("receive-message", (msg) => {
      if (selectedChat && msg.chatId === selectedChat._id)
        setMessages(prev => [...prev, msg]);
    });
  }, [selectedChat]);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <ChatList chats={chats} setSelectedChat={setSelectedChat} />
      {selectedChat && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <MessageList messages={messages} />
          <MessageInput socket={socket} selectedChat={selectedChat} user={user.user} setMessages={setMessages} />
        </div>
      )}
    </div>
  );
}
