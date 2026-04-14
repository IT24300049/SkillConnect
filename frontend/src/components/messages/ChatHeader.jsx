export default function ChatHeader({ thread, title, onBack }) {
  return (
    <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 10, background: '#fff' }}>
      <button
        type="button"
        onClick={onBack}
        style={{ width: 36, height: 36, borderRadius: 10, border: '1px solid #e2e8f0', color: '#334155', background: '#fff', cursor: 'pointer' }}
      >
        <span className="material-symbols-outlined">arrow_back</span>
      </button>

      <div style={{ width: 40, height: 40, borderRadius: '999px', background: 'linear-gradient(135deg,#0891b2,#0e7490)', color: '#fff', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {title[0]?.toUpperCase() || '?'}
      </div>
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</p>
        {thread?.booking?.bookingId && (
          <p style={{ fontSize: 12, color: '#64748b' }}>Booking #{thread.booking.bookingId}</p>
        )}
      </div>
    </div>
  );
}
