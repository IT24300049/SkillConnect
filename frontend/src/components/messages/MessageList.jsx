function formatMessageTime(dateTime) {
  if (!dateTime) return '';
  return new Date(dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function MessageList({ loading, messages, currentUserId, bottomRef }) {
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: 16, background: '#f8fafc' }}>
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0' }}><span className="spinner" /></div>
      ) : messages.length === 0 ? (
        <div style={{ textAlign: 'center', fontSize: 13, color: '#64748b', padding: '24px 0' }}>No messages yet. Start the conversation.</div>
      ) : (
        messages.map((msg) => {
          const isMine = msg.sender?.userId === currentUserId;
          return (
            <div key={msg.messageId} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start', marginBottom: 10 }}>
              <div
                style={{
                  maxWidth: '78%',
                  borderRadius: 16,
                  padding: '10px 14px',
                  fontSize: 14,
                  boxShadow: '0 1px 3px rgba(15,23,42,0.07)',
                  background: isMine ? '#67e8f9' : '#fff',
                  color: isMine ? '#0f172a' : '#334155',
                  border: isMine ? 'none' : '1px solid #e2e8f0',
                }}
              >
                <p style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{msg.messageText}</p>
                <p style={{ fontSize: 10, marginTop: 4, color: isMine ? 'rgba(15,23,42,0.7)' : '#94a3b8' }}>
                  {formatMessageTime(msg.createdAt)}
                </p>
              </div>
            </div>
          );
        })
      )}
      <div ref={bottomRef} />
    </div>
  );
}
