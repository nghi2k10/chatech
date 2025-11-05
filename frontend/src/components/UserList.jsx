// src/components/UserList.jsx
import { useEffect, useState } from "react";

export default function UserList({ currentUser, chats, setChats, setSelectedChat }) {
  const [users, setUsers] = useState([]);

  // ✅ Lấy danh sách tất cả user trừ chính mình
  useEffect(() => {
    if (!currentUser?._id) return;

    const fetchUsers = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/users?excludeId=${currentUser._id}`
        );
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error("Lỗi load users:", err);
      }
    };

    fetchUsers();
  }, [currentUser]);

  // ✅ Khi chọn user để chat
  const handleSelectUser = async (user) => {
    try {
      // Tìm xem đã có chat 1-1 giữa 2 người chưa
      const existingChat = chats.find(
        (chat) =>
          !chat.isGroup &&
          chat.members.some((m) => m._id === currentUser._id) &&
          chat.members.some((m) => m._id === user._id)
      );

      if (existingChat) {
        // Nếu đã có → mở luôn
        setSelectedChat(existingChat);
      } else {
        // Nếu chưa có → tạo mới
        const res = await fetch("http://localhost:5000/api/chats", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            isGroup: false,
            members: [currentUser._id, user._id],
          }),
        });

        const newChat = await res.json();
        setChats((prev) => [...prev, newChat]);
        setSelectedChat(newChat);
      }
    } catch (err) {
      console.error("Lỗi khi chọn user:", err);
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      {users.map((user) => (
        <button
          key={user._id}
          onClick={() => handleSelectUser(user)}
          className="flex items-center p-2 rounded-lg hover:bg-gray-100 transition"
        >
          <img
            src={user.avatar || "/default-avatar.png"}
            alt={user.name}
            className="w-8 h-8 rounded-full mr-3"
          />
          <span className="text-gray-800">{user.name}</span>
        </button>
      ))}
    </div>
  );
}
