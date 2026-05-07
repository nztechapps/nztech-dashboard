import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export default function DAUChart({ data, height = 200 }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-subtle)', fontSize: 14 }}>
        Sin datos todavía
      </div>
    );
  }

  const maxDAU = Math.max(...data.map(d => d.dau || 0));
  const referenceValue = maxDAU * 0.15;

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div className="nz-card" style={{ padding: '8px 12px', boxShadow: 'var(--shadow-md)' }}>
        <div style={{ fontSize: 12, color: 'var(--text-subtle)', marginBottom: 4 }}>
          {new Date(d.fecha).toLocaleDateString('es-ES')}
        </div>
        <div style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 500 }}>
          {Math.round(d.dau || 0)} DAU
        </div>
      </div>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="fecha" stroke="var(--border)" tick={{ fontSize: 12, fill: 'var(--text-subtle)' }}
          tickFormatter={(d) => new Date(d).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })} />
        <YAxis stroke="var(--border)" tick={{ fontSize: 12, fill: 'var(--text-subtle)' }} />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={referenceValue} stroke="var(--border-strong)" strokeDasharray="5 5"
          label={{ value: 'Objetivo D7 (15%)', position: 'insideTopRight', offset: -10, fill: 'var(--text-subtle)', fontSize: 11 }} />
        <Line type="monotone" dataKey="dau" stroke="var(--primary)" strokeWidth={2} dot={false} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
