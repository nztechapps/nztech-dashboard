const STATUS_CONFIG = {
  published:     { bg: '#ECFDF5', color: '#065F46' },
  publicada:     { bg: '#ECFDF5', color: '#065F46' },
  development:   { bg: '#F5F3FF', color: '#7C3AED' },
  en_desarrollo: { bg: '#F5F3FF', color: '#7C3AED' },
  testing:       { bg: '#FFFBEB', color: '#92400E' },
  idea:          { bg: '#EFF6FF', color: '#1E40AF' },
  aprobada:      { bg: '#ECFDF5', color: '#065F46' },
  descartada:    { bg: '#FEF2F2', color: '#991B1B' },
  deprecated:    { bg: '#FEF2F2', color: '#991B1B' },
  investigando:  { bg: '#EFF6FF', color: '#1E40AF' },
  running:       { bg: '#EEF2FF', color: '#4F46E5' },
  completado:    { bg: '#ECFDF5', color: '#059669' },
  error:         { bg: '#FEF2F2', color: '#DC2626' },
  ensamblando:   { bg: '#FFFBEB', color: '#D97706' },
};

export default function Badge({ status, label }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.idea;
  const displayLabel = label || status;
  return (
    <span style={{
      backgroundColor: cfg.bg,
      color: cfg.color,
      fontSize: '11px',
      padding: '3px 8px',
      borderRadius: '20px',
      fontWeight: '500',
      display: 'inline-block',
    }}>
      {displayLabel}
    </span>
  );
}
