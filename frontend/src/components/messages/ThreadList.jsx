function formatLastTime(dateTime) {
  if (!dateTime) return 'No messages yet';
  const d = new Date(dateTime);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  return isToday
    ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : d.toLocaleDateString();
}

export default function ThreadList({
  loading,
  threads,
  search,
  onSearch,
  activeThreadId,
  getDisplayName,
  onSelect,
}) {
  const shell = {
    width: '100%',
    maxWidth: 360,
    borderRight: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    background: '#fff',
  };

  return (
    <aside style={shell}>
      <div style={{ padding: 12, borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ position: 'relative' }}>
          <span className="material-symbols-outlined" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: 19 }}>search</span>
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search conversations..."
            style={{ width: '100%', height: 40, borderRadius: 10, border: '1px solid #e2e8f0', padding: '0 12px 0 36px', fontSize: 14, outline: 'none' }}
          />
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0' }}><span className="spinner" /></div>
        ) : threads.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', fontSize: 13, color: '#64748b' }}>No conversations yet</div>
        ) : (
          threads.map((thread) => {
            const isActive = activeThreadId === thread.threadId;
            const name = getDisplayName(thread);
            return (
              <button
                key={thread.threadId}
                onClick={() => onSelect(thread)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '12px 14px',
                  border: 'none',
                  borderBottom: '1px solid #f1f5f9',
                  borderLeft: isActive ? '4px solid #0891b2' : '4px solid transparent',
                  background: isActive ? '#e0f2fe' : '#fff',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 38, height: 38, borderRadius: '999px', background: 'linear-gradient(135deg,#0891b2,#0e7490)', color: '#fff', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {name[0]?.toUpperCase() || '?'}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</p>
                    <p style={{ fontSize: 12, color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{formatLastTime(thread.lastMessageAt)}</p>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
}
