import { useEffect, useState } from "react";

export default function UserList({ currentUser, chats, setChats, setSelectedChat }) {
  const [users, setUsers] = useState([]);

  // ✅ Lấy danh sách tất cả user trừ chính mình
  useEffect(() => {
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

  // ✅ Khi click vào user → tạo hoặc mở chat
  const handleSelectUser = async (user) => {
    try {
      // Kiểm tra xem đã có chat chưa
      const existingChat = chats.find(
        (c) =>
          !c.isGroup &&
          c.members.some((m) => m._id === user._id) &&
          c.members.some((m) => m._id === currentUser._id)
      );

      if (existingChat) {
        setSelectedChat(existingChat);
        return;
      }

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
    } catch (err) {
      console.error("Lỗi tạo chat:", err);
    }
  };

  return (
    <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-140px)]">
      {users.map((user) => (
        <div
          key={user._id}
          onClick={() => handleSelectUser(user)}
          className="flex items-center p-2 rounded-lg hover:bg-blue-50 cursor-pointer transition"
        >
          <img
            src={
              user.avatar ||
              "https://cdn-icons-png.flaticon.com/512/149/149071.png"
            }
            alt={user.name}
            className="w-8 h-8 rounded-full border"
          />
          <p className="ml-3 font-medium text-gray-800">{user.name}</p>
        </div>
      ))}
    </div>
  );
}
