const STATUS_CONFIG = {
  published:     { bg: 'oklch(0.97 0.06 155)', color: 'oklch(0.40 0.14 155)' },
  publicada:     { bg: 'oklch(0.97 0.06 155)', color: 'oklch(0.40 0.14 155)' },
  development:   { bg: 'var(--primary-soft)',   color: 'var(--primary)' },
  en_desarrollo: { bg: 'var(--primary-soft)',   color: 'var(--primary)' },
  testing:       { bg: 'oklch(0.97 0.06 75)',   color: 'oklch(0.45 0.15 75)' },
  idea:          { bg: 'oklch(0.97 0.04 235)',  color: 'oklch(0.45 0.14 235)' },
  aprobada:      { bg: 'oklch(0.97 0.06 155)',  color: 'oklch(0.40 0.14 155)' },
  descartada:    { bg: 'oklch(0.97 0.05 27)',   color: 'oklch(0.45 0.18 27)' },
  deprecated:    { bg: 'oklch(0.97 0.05 27)',   color: 'oklch(0.45 0.18 27)' },
  investigando:  { bg: 'oklch(0.97 0.04 235)',  color: 'oklch(0.45 0.14 235)' },
  running:       { bg: 'var(--primary-soft)',   color: 'var(--primary)' },
  completado:    { bg: 'oklch(0.97 0.06 155)',  color: 'oklch(0.40 0.14 155)' },
  error:         { bg: 'oklch(0.97 0.05 27)',   color: 'oklch(0.45 0.18 27)' },
  ensamblando:   { bg: 'oklch(0.97 0.06 75)',   color: 'oklch(0.45 0.15 75)' },
};

export default function Badge({ status, label }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.idea;
  return (
    <span style={{
      background: cfg.bg,
      color: cfg.color,
      fontSize: 11,
      padding: '3px 10px',
      borderRadius: 'var(--radius-pill)',
      fontWeight: 500,
      display: 'inline-block',
    }}>
      {label || status}
    </span>
  );
}
