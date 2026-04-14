export default function EmptyState({
  icon = '📭',
  title = 'Nothing here yet',
  message,
  action,
}) {
  return (
    <div className="empty-state">
      <span className="empty-icon">{icon}</span>
      <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0c4a6e', marginBottom: 8 }}>
        {title}
      </h3>
      {message && <p>{message}</p>}
      {action && (
        <button
          type="button"
          className="btn-primary"
          onClick={action.onClick}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
