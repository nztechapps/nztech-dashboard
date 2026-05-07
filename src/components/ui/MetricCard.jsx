export default function MetricCard({ label, value, sub, subColor = 'neutral' }) {
  const subColorMap = {
    green:   'var(--nz-success)',
    red:     'var(--nz-danger)',
    neutral: 'var(--text-subtle)',
  };

  return (
    <div className="nz-card" style={{ padding: 16 }}>
      <div style={{ fontSize: 11, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 12, fontWeight: 500 }}>
        {label}
      </div>
      <div style={{ fontSize: 28, fontWeight: 500, color: 'var(--text)', marginBottom: 8, fontFamily: 'var(--font-sans)', fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 12, color: subColorMap[subColor] || 'var(--text-subtle)' }}>
          {sub}
        </div>
      )}
    </div>
  );
}
