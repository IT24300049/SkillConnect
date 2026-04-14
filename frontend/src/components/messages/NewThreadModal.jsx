export default function NewThreadModal({
  open,
  onClose,
  recipients,
  loading,
  form,
  onFormChange,
  onSubmit,
  submitting,
}) {
  if (!open) return null;

  const overlay = {
    position: 'fixed',
    inset: 0,
    zIndex: 1000,
    background: 'rgba(15, 23, 42, 0.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  };

  const card = {
    width: '100%',
    maxWidth: 460,
    borderRadius: 18,
    background: '#fff',
    boxShadow: '0 20px 48px rgba(15, 23, 42, 0.2)',
    padding: 24,
  };

  const input = {
    width: '100%',
    height: 44,
    borderRadius: 12,
    border: '1px solid #e2e8f0',
    padding: '0 12px',
    fontSize: 14,
    outline: 'none',
  };

  return (
    <div style={overlay} onClick={onClose}>
      <div style={card} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontSize: 19, fontWeight: 800, color: '#0f172a' }}>Start New Chat</h3>
          <button
            type="button"
            onClick={onClose}
            style={{ width: 36, height: 36, borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer' }}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="hm-label">Recipient</label>
            <select
              required
              value={form.participantId}
              onChange={(e) => onFormChange({ ...form, participantId: e.target.value })}
              style={input}
            >
              <option value="">Select a user</option>
              {recipients.map((r) => (
                <option key={r.userId} value={r.userId}>
                  {r.email} ({String(r.role || '').toUpperCase()})
                </option>
              ))}
            </select>
            {loading && <p style={{ fontSize: 12, color: '#64748b', marginTop: 6 }}>Loading recipients...</p>}
          </div>

          <div>
            <label className="hm-label">Booking ID (optional)</label>
            <input
              type="number"
              value={form.bookingId}
              onChange={(e) => onFormChange({ ...form, bookingId: e.target.value })}
              placeholder="Attach a booking context"
              style={input}
            />
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 2 }}>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              style={{ flex: 1, height: 44 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary"
              style={{ flex: 1, height: 44, opacity: submitting ? 0.7 : 1 }}
            >
              {submitting ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
