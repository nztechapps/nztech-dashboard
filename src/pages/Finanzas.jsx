import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import MetricCard from '../components/ui/MetricCard';
import { useFinanzas } from '../hooks/useFinanzas';
import { useApps } from '../hooks/useApps';

const MARKET_COLORS = {
  AR: '#00E5A0',
  MX: '#7C6AFF',
  ES: '#6496FF',
  CL: '#FFB400',
  CO: '#FF77B4',
  PE: '#4ECDC4',
  global: '#999999',
};

const APP_COLORS = [
  '#00E5A0',
  '#7C6AFF',
  '#6496FF',
  '#FFB400',
  '#FF77B4',
  '#4ECDC4',
  '#FF6B6B',
  '#A78BFA',
];

function formatCurrency(value) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}

export default function Finanzas() {
  const { ingresosPorApp, ingresosPorMercado, marMensual, loading } = useFinanzas();
  const { apps } = useApps();
  const [viewMode, setViewMode] = useState('app'); // 'app' o 'mercado'

  // Preparar datos para gráficos
  const months = Object.keys(ingresosPorApp).sort();

  const appChartData = months.map((month) => ({
    month: new Date(month + '-01').toLocaleDateString('es-ES', { month: 'short', year: '2-digit' }),
    ...ingresosPorApp[month],
  }));

  const mercadoChartData = months.map((month) => ({
    month: new Date(month + '-01').toLocaleDateString('es-ES', { month: 'short', year: '2-digit' }),
    ...ingresosPorMercado[month],
  }));

  // MAR actual (último mes)
  const currentMonth = months[months.length - 1];
  const currentMarValue = marMensual[currentMonth] || 0;
  const objectivePerApp = 50;
  const activeAppsCount = apps.filter(a => a.status === 'published' || a.status === 'testing').length || 1;
  const objective = objectivePerApp * activeAppsCount;
  const progressPercent = Math.min((currentMarValue / objective) * 100, 100);

  // Tabla resumen
  const tableSummary = months.map((month, idx) => {
    const prevMonth = idx > 0 ? months[idx - 1] : null;
    const currentTotal = Object.values(ingresosPorApp[month]).reduce((a, b) => a + b, 0);
    const prevTotal = prevMonth ? Object.values(ingresosPorApp[prevMonth]).reduce((a, b) => a + b, 0) : currentTotal;
    const delta = currentTotal - prevTotal;
    const deltaPercent = prevTotal > 0 ? ((delta / prevTotal) * 100).toFixed(1) : 0;
    const appCount = Object.keys(ingresosPorApp[month]).length;
    const mar = marMensual[month] || 0;

    return {
      month,
      displayMonth: new Date(month + '-01').toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }),
      totalIngresos: currentTotal,
      appsActivas: appCount,
      mar,
      delta,
      deltaPercent,
    };
  });

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
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
          {payload.map((entry, idx) => (
            <div key={idx} style={{ fontSize: '12px', color: entry.color }}>
              {entry.name}: ${entry.value.toFixed(2)}
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const allAppNames = [...new Set(months.flatMap((m) => Object.keys(ingresosPorApp[m] || {})))];
  const allMarkets = [...new Set(months.flatMap((m) => Object.keys(ingresosPorMercado[m] || {})))];

  return (
    <div style={{ backgroundColor: '#0A0A0F', minHeight: '100vh', padding: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ color: 'white', margin: 0, fontSize: '24px', fontWeight: '600' }}>
          Finanzas
        </h1>

        {/* Toggle */}
        <div
          style={{
            display: 'flex',
            gap: '4px',
            backgroundColor: '#13131A',
            padding: '4px',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <button
            onClick={() => setViewMode('app')}
            style={{
              padding: '8px 16px',
              backgroundColor: viewMode === 'app' ? '#00E5A0' : 'transparent',
              color: viewMode === 'app' ? '#0A0A0F' : '#999',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500',
            }}
          >
            Por app
          </button>
          <button
            onClick={() => setViewMode('mercado')}
            style={{
              padding: '8px 16px',
              backgroundColor: viewMode === 'mercado' ? '#00E5A0' : 'transparent',
              color: viewMode === 'mercado' ? '#0A0A0F' : '#999',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500',
            }}
          >
            Por mercado
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ color: '#999', textAlign: 'center', padding: '40px 0' }}>
          Cargando finanzas...
        </div>
      ) : (
        <>
          {/* Sección MAR */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px' }}>
              <MetricCard
                label="MAR Actual"
                value={formatCurrency(currentMarValue)}
                sub={`Objetivo: ${formatCurrency(objective)}`}
                subColor={currentMarValue >= objective ? 'green' : 'red'}
              />

              {/* Progress Bar */}
              <div
                style={{
                  backgroundColor: '#13131A',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '10px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#999', fontSize: '11px' }}>Progreso al objetivo</span>
                  <span style={{ color: '#00E5A0', fontSize: '11px', fontWeight: '500' }}>
                    {progressPercent.toFixed(0)}%
                  </span>
                </div>
                <div
                  style={{
                    height: '8px',
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    borderRadius: '4px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      backgroundColor: currentMarValue >= objective ? '#00E5A0' : '#FF4D4F',
                      width: `${progressPercent}%`,
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Gráfico */}
          <div
            style={{
              marginBottom: '24px',
              backgroundColor: '#13131A',
              padding: '16px',
              borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <h2 style={{ color: 'white', fontSize: '14px', fontWeight: '600', margin: '0 0 16px 0' }}>
              {viewMode === 'app' ? 'Ingresos por app' : 'Ingresos por mercado'}
            </h2>

            {viewMode === 'app' ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={appChartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="month" stroke="#999" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#999" tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  {allAppNames.map((appName, idx) => (
                    <Bar
                      key={appName}
                      dataKey={appName}
                      stackId="a"
                      fill={APP_COLORS[idx % APP_COLORS.length]}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mercadoChartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="month" stroke="#999" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#999" tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  {allMarkets.map((market) => (
                    <Bar
                      key={market}
                      dataKey={market}
                      stackId="a"
                      fill={MARKET_COLORS[market] || '#999'}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Tabla */}
          <div
            style={{
              backgroundColor: '#13131A',
              padding: '16px',
              borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.08)',
              overflowX: 'auto',
            }}
          >
            <h2 style={{ color: 'white', fontSize: '14px', fontWeight: '600', margin: '0 0 16px 0' }}>
              Resumen mensual
            </h2>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '13px',
              }}
            >
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#999', fontWeight: '500' }}>
                    Mes
                  </th>
                  <th style={{ padding: '12px', textAlign: 'right', color: '#999', fontWeight: '500' }}>
                    Ingresos totales
                  </th>
                  <th style={{ padding: '12px', textAlign: 'right', color: '#999', fontWeight: '500' }}>
                    Apps activas
                  </th>
                  <th style={{ padding: '12px', textAlign: 'right', color: '#999', fontWeight: '500' }}>
                    MAR
                  </th>
                  <th style={{ padding: '12px', textAlign: 'right', color: '#999', fontWeight: '500' }}>
                    Delta vs mes anterior
                  </th>
                </tr>
              </thead>
              <tbody>
                {tableSummary.map((row, idx) => {
                  const bgColor = idx % 2 === 0 ? '#0A0A0F' : '#1C1C26';
                  const deltaColor = row.delta >= 0 ? '#00E5A0' : '#FF4D4F';
                  const deltaSymbol = row.delta >= 0 ? '↑' : '↓';

                  return (
                    <tr
                      key={row.month}
                      style={{
                        backgroundColor: bgColor,
                        borderBottom: '1px solid rgba(255,255,255,0.08)',
                      }}
                    >
                      <td style={{ padding: '12px', color: 'white' }}>
                        {row.displayMonth}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right', color: '#00E5A0' }}>
                        {formatCurrency(row.totalIngresos)}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right', color: '#7C6AFF' }}>
                        {row.appsActivas}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right', color: '#00E5A0' }}>
                        {formatCurrency(row.mar)}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right', color: deltaColor }}>
                        {deltaSymbol} {formatCurrency(Math.abs(row.delta))} ({row.deltaPercent}%)
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
