import { useEffect } from 'react';

const IconCheck = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconX = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

export default function ToastNotification({ message, type = 'success', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  const isSuccess = type === 'success';
  const color = isSuccess ? 'var(--nz-success)' : 'var(--nz-danger)';

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24,
      background: 'var(--surface)',
      border: `1px solid ${color}`,
      borderRadius: 'var(--radius-lg)',
      padding: '12px 16px',
      display: 'flex', alignItems: 'center', gap: 12,
      zIndex: 3000,
      boxShadow: 'var(--shadow-lg)',
      animation: 'slideUp 0.25s var(--ease-out)',
    }}>
      <style>{`@keyframes slideUp { from { transform: translateY(16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
      <span style={{ color, display: 'flex' }}>{isSuccess ? <IconCheck /> : <IconX />}</span>
      <span style={{ color: 'var(--text)', fontSize: 13, fontWeight: 500 }}>{message}</span>
      <button
        onClick={onClose}
        style={{ background: 'none', border: 'none', color: 'var(--text-subtle)', cursor: 'pointer', padding: 0, display: 'flex', marginLeft: 4 }}
      >
        <IconX />
      </button>
    </div>
  );
}
