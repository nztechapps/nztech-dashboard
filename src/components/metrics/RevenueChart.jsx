import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function RevenueChart({ data, height = 200 }) {
  if (!data || data.length === 0) {
    return (
      <div
        style={{
          height: `${height}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#999',
          fontSize: '14px',
        }}
      >
        Sin datos todavía
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div
          style={{
            backgroundColor: '#13131A',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '8px',
            padding: '8px 12px',
            color: '#fff',
          }}
        >
          <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>
            {new Date(data.fecha).toLocaleDateString('es-ES')}
          </div>
          <div style={{ fontSize: '13px', color: '#00E5A0', fontWeight: '500' }}>
            ${data.ingresos?.toFixed(2) || '0.00'}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        <XAxis
          dataKey="fecha"
          stroke="rgba(255,255,255,0.2)"
          tick={{ fontSize: 12, fill: '#999' }}
          tickFormatter={(date) => new Date(date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
        />
        <YAxis
          stroke="rgba(255,255,255,0.2)"
          tick={{ fontSize: 12, fill: '#999' }}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="ingresos"
          stroke="#00E5A0"
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
