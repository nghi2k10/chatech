import React from "react";

export default function ChatList({ chats, selectedChat, onSelectChat }) {
  return (
    <div className="border-r w-64 overflow-y-auto bg-white">
      <h2 className="p-3 font-semibold text-lg border-b">Cuộc trò chuyện</h2>
      {chats.map((chat) => (
        <div
          key={chat._id} // ✅ dùng _id, không dùng name hoặc members
          className={`p-3 cursor-pointer hover:bg-gray-100 ${
            selectedChat?._id === chat._id ? "bg-blue-100" : ""
          }`}
          onClick={() => onSelectChat(chat)}
        >
          <div className="font-medium">
            {chat.isGroup
              ? chat.name
              : chat.members?.find((m) => m._id !== selectedChat?.currentUserId)
                  ?.name}
          </div>
          <div className="text-sm text-gray-500">
            {chat.latestMessage?.text || "Chưa có tin nhắn"}
          </div>
        </div>
      ))}
    </div>
  );
}
