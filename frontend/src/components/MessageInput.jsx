import { useState } from "react";
import { sendMessage } from "../api";

export default function MessageInput({ socket, selectedChat, user, setMessages }) {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);

  const handleSend = async () => {
    const formData = new FormData();
    formData.append("chatId", selectedChat._id);
    formData.append("senderId", user._id);
    formData.append("text", text);
    if (file) formData.append("media", file);

    const { data } = await sendMessage(formData);
    socket.emit("send-message", data);
    setMessages(prev => [...prev, data]);
    setText("");
    setFile(null);
  };

  return (
    <div style={{ display: "flex", padding: 10 }}>
      <input style={{ flex: 1 }} value={text} onChange={e => setText(e.target.value)} placeholder="Type a message..." />
      <input type="file" onChange={e => setFile(e.target.files[0])} />
      <button onClick={handleSend}>Send</button>
    </div>
  );
}
