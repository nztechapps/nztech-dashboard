import { useEffect } from 'react';

const IconCheck = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const IconX = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

export default function ToastNotification({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const isSuccess = type === 'success';
  const bgColor = isSuccess ? 'rgba(0, 229, 160, 0.1)' : 'rgba(255, 77, 79, 0.1)';
  const borderColor = isSuccess ? 'rgba(0, 229, 160, 0.3)' : 'rgba(255, 77, 79, 0.3)';
  const textColor = isSuccess ? '#00E5A0' : '#FF4D4F';

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        backgroundColor: bgColor,
        border: `1px solid ${borderColor}`,
        borderRadius: '8px',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        zIndex: 3000,
        animation: 'slideUp 0.3s ease-out',
      }}
    >
      <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(100px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
      <span style={{ color: textColor, display: 'flex', alignItems: 'center' }}>
        {isSuccess ? <IconCheck /> : <IconX />}
      </span>
      <span style={{ color: textColor, fontSize: '13px', fontWeight: '500' }}>
        {message}
      </span>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: textColor,
          cursor: 'pointer',
          padding: '0',
          display: 'flex',
          alignItems: 'center',
          opacity: 0.7,
          marginLeft: '8px',
        }}
        onMouseEnter={(e) => {
          e.target.style.opacity = '1';
        }}
        onMouseLeave={(e) => {
          e.target.style.opacity = '0.7';
        }}
      >
        <IconX />
      </button>
    </div>
  );
}
