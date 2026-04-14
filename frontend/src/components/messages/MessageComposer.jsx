export default function MessageComposer({ value, onChange, onSubmit, sending }) {
  return (
    <form onSubmit={onSubmit} style={{ padding: 12, borderTop: '1px solid #f1f5f9', background: '#fff', display: 'flex', alignItems: 'flex-end', gap: 8 }}>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={1}
        placeholder="Type a message..."
        style={{ flex: 1, minHeight: 40, maxHeight: 140, borderRadius: 12, border: '1px solid #e2e8f0', padding: '10px 14px', fontSize: 14, outline: 'none', resize: 'vertical' }}
      />
      <button
        type="submit"
        disabled={!value.trim() || sending}
        className="btn-primary"
        style={{ height: 40, padding: '0 14px', opacity: (!value.trim() || sending) ? 0.55 : 1 }}
      >
        <span className="material-symbols-outlined text-lg">send</span>
      </button>
    </form>
  );
}
