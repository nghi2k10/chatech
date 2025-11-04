export default function ChatList({ chats, setSelectedChat }) {
  return (
    <div style={{ width: 250, borderRight: "1px solid #ccc" }}>
      {chats.map(chat => (
        <div key={chat._id} onClick={() => setSelectedChat(chat)}>
          {chat.isGroup ? chat.name : chat.members.find(m => m._id !== JSON.parse(localStorage.getItem("user")).user._id).name}
        </div>
      ))}
    </div>
  );
}
