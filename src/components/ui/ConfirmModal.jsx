export default function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = 'Confirmar',
  confirmColor = '#FF4D4F',
}) {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
      }}
      onClick={handleBackdropClick}
    >
      <div
        style={{
          backgroundColor: '#13131A',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '12px',
          padding: '24px',
          maxWidth: '360px',
          width: '90%',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ color: 'white', fontSize: '16px', fontWeight: '500', margin: '0 0 12px 0' }}>
          {title}
        </h2>
        <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '13px', margin: '0 0 24px 0', lineHeight: '1.5' }}>
          {message}
        </p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '10px 16px',
              backgroundColor: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#999',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)';
            }}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '10px 16px',
              backgroundColor: confirmColor,
              border: 'none',
              color: '#0A0A0F',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '600',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) => {
              e.target.style.opacity = '0.9';
            }}
            onMouseLeave={(e) => {
              e.target.style.opacity = '1';
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
