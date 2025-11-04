export default function MessageList({ messages }) {
  return (
    <div style={{ flex: 1, padding: 10, overflowY: "auto" }}>
      {messages.map(msg => (
        <div key={msg._id} style={{ margin: "5px 0" }}>
          <b>{msg.senderId.name}:</b> {msg.text}
          {msg.media && <img src={msg.media} alt="media" style={{ maxWidth: 200 }} />}
        </div>
      ))}
    </div>
  );
}
