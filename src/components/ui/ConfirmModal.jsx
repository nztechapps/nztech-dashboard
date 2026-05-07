export default function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = 'Confirmar',
  confirmColor,
}) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 2000,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div
        className="nz-card"
        style={{ padding: 24, maxWidth: 360, width: '90%', boxShadow: 'var(--shadow-lg)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ color: 'var(--text)', fontSize: 16, fontWeight: 500, margin: '0 0 12px 0' }}>
          {title}
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: '0 0 24px 0', lineHeight: 1.5 }}>
          {message}
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onCancel} className="nz-btn nz-btn-ghost">
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '8px 16px',
              background: confirmColor || 'var(--nz-danger)',
              border: 'none',
              color: '#fff',
              borderRadius: 'var(--radius)',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
