export default function Modal({ isOpen, onClose, title, children, maxWidth = 460 }) {
  if (!isOpen) return null;

  return (
    <div
      className="fade-in"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background: 'rgba(0,0,0,0.45)',
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="hm-card"
        style={{
          width: '100%',
          maxWidth,
          borderRadius: 20,
          padding: 32,
          background: '#fff',
          border: '1px solid #e0f2fe',
          boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <h2
            id="modal-title"
            style={{
              fontSize: 18,
              fontWeight: 800,
              color: '#0c4a6e',
              marginBottom: 20,
            }}
          >
            {title}
          </h2>
        )}
        {children}
      </div>
    </div>
  );
}
