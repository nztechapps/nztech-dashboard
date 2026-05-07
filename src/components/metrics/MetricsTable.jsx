export default function MetricsTable({ metrics }) {
  if (!metrics || metrics.length === 0) {
    return (
      <div className="nz-card" style={{ padding: '40px 24px', textAlign: 'center', color: 'var(--text-subtle)' }}>
        Sin datos
      </div>
    );
  }

  const thStyle = { padding: 12, fontWeight: 500, color: 'var(--text-subtle)', fontSize: 12, background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' };

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr>
            <th style={{ ...thStyle, textAlign: 'left' }}>Fecha</th>
            <th style={{ ...thStyle, textAlign: 'right' }}>Ingresos</th>
            <th style={{ ...thStyle, textAlign: 'right' }}>DAU</th>
            <th style={{ ...thStyle, textAlign: 'right' }}>eCPM</th>
            <th style={{ ...thStyle, textAlign: 'right' }}>Crash Rate</th>
            <th style={{ ...thStyle, textAlign: 'right' }}>Rating</th>
          </tr>
        </thead>
        <tbody>
          {metrics.map((m, i) => {
            const ecpm = m.impresiones > 0 ? ((m.ingresos / m.impresiones) * 1000).toFixed(2) : '—';
            const crashBad = m.crash_rate && parseFloat(m.crash_rate) > 1;
            return (
              <tr key={m.id} style={{ background: i % 2 === 0 ? 'var(--surface)' : 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: 12, color: 'var(--text)' }}>{new Date(m.fecha).toLocaleDateString('es-ES')}</td>
                <td style={{ padding: 12, textAlign: 'right', color: 'var(--nz-success)', fontVariantNumeric: 'tabular-nums' }}>${m.ingresos?.toFixed(2) || '0.00'}</td>
                <td style={{ padding: 12, textAlign: 'right', color: 'var(--primary)', fontVariantNumeric: 'tabular-nums' }}>{Math.round(m.dau || 0)}</td>
                <td style={{ padding: 12, textAlign: 'right', color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>${ecpm === '—' ? '—' : ecpm}</td>
                <td style={{ padding: 12, textAlign: 'right', color: crashBad ? 'var(--nz-danger)' : 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>{m.crash_rate?.toFixed(2) || '0.00'}%</td>
                <td style={{ padding: 12, textAlign: 'right', color: 'var(--nz-warning)', fontVariantNumeric: 'tabular-nums' }}>{m.rating?.toFixed(1) || '—'}⭐</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
