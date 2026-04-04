export default function MetricsTable({ metrics }) {
  if (!metrics || metrics.length === 0) {
    return (
      <div
        style={{
          padding: '40px 24px',
          backgroundColor: '#13131A',
          borderRadius: '10px',
          border: '1px solid rgba(255,255,255,0.08)',
          textAlign: 'center',
          color: '#999',
        }}
      >
        Sin datos
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '13px',
        }}
      >
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <th
              style={{
                padding: '12px',
                textAlign: 'left',
                color: '#999',
                fontWeight: '500',
                backgroundColor: '#0A0A0F',
              }}
            >
              Fecha
            </th>
            <th
              style={{
                padding: '12px',
                textAlign: 'right',
                color: '#999',
                fontWeight: '500',
                backgroundColor: '#0A0A0F',
              }}
            >
              Ingresos
            </th>
            <th
              style={{
                padding: '12px',
                textAlign: 'right',
                color: '#999',
                fontWeight: '500',
                backgroundColor: '#0A0A0F',
              }}
            >
              DAU
            </th>
            <th
              style={{
                padding: '12px',
                textAlign: 'right',
                color: '#999',
                fontWeight: '500',
                backgroundColor: '#0A0A0F',
              }}
            >
              eCPM
            </th>
            <th
              style={{
                padding: '12px',
                textAlign: 'right',
                color: '#999',
                fontWeight: '500',
                backgroundColor: '#0A0A0F',
              }}
            >
              Crash Rate
            </th>
            <th
              style={{
                padding: '12px',
                textAlign: 'right',
                color: '#999',
                fontWeight: '500',
                backgroundColor: '#0A0A0F',
              }}
            >
              Rating
            </th>
          </tr>
        </thead>
        <tbody>
          {metrics.map((metric, index) => {
            const ecpm =
              metric.impresiones && metric.impresiones > 0
                ? ((metric.ingresos / metric.impresiones) * 1000).toFixed(2)
                : '—';

            const crashRateColor =
              metric.crash_rate && parseFloat(metric.crash_rate) > 1 ? '#FF4D4F' : 'inherit';

            const bgColor = index % 2 === 0 ? '#0A0A0F' : '#13131A';

            return (
              <tr
                key={metric.id}
                style={{
                  backgroundColor: bgColor,
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <td style={{ padding: '12px', color: 'white' }}>
                  {new Date(metric.fecha).toLocaleDateString('es-ES')}
                </td>
                <td style={{ padding: '12px', textAlign: 'right', color: '#00E5A0' }}>
                  ${metric.ingresos?.toFixed(2) || '0.00'}
                </td>
                <td style={{ padding: '12px', textAlign: 'right', color: '#7C6AFF' }}>
                  {Math.round(metric.dau || 0)}
                </td>
                <td style={{ padding: '12px', textAlign: 'right', color: '#6496FF' }}>
                  ${ecpm === '—' ? '—' : ecpm}
                </td>
                <td style={{ padding: '12px', textAlign: 'right', color: crashRateColor }}>
                  {metric.crash_rate?.toFixed(2) || '0.00'}%
                </td>
                <td style={{ padding: '12px', textAlign: 'right', color: '#FFB400' }}>
                  {metric.rating?.toFixed(1) || '—'}⭐
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
