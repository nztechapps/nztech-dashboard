const STATUS_CONFIG = {
  development: { bg: 'var(--primary-soft)',  color: 'var(--primary)' },
  testing:     { bg: 'oklch(0.97 0.06 75)',  color: 'oklch(0.45 0.15 75)' },
  published:   { bg: 'oklch(0.97 0.06 155)', color: 'oklch(0.40 0.14 155)' },
  deprecated:  { bg: 'oklch(0.97 0.05 27)',  color: 'oklch(0.45 0.18 27)' },
};

export default function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.development;
  return (
    <span style={{
      background: cfg.bg,
      color: cfg.color,
      fontSize: 11,
      padding: '2px 10px',
      borderRadius: 'var(--radius-pill)',
      fontWeight: 500,
      display: 'inline-block',
    }}>
      {status}
    </span>
  );
}
