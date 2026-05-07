import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import MetricCard from '../components/ui/MetricCard';
import GastoForm from '../components/finanzas/GastoForm';
import ConfirmModal from '../components/ui/ConfirmModal';
import ToastNotification from '../components/ui/ToastNotification';
import { useFinanzas } from '../hooks/useFinanzas';
import { useGastos } from '../hooks/useGastos';
import { useApps } from '../hooks/useApps';

const card = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: '12px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  padding: '16px',
  marginBottom: '16px',
  overflowX: 'auto',
};

const IconPlus = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);
const IconTrash = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
);

const MARKET_COLORS = { AR: '#00E5A0', MX: '#7C3AED', ES: '#6496FF', CL: '#FFB400', CO: '#FF77B4', PE: '#4ECDC4', global: '#9CA3AF' };
const APP_COLORS = ['#00E5A0', '#7C3AED', '#6496FF', '#FFB400', '#FF77B4', '#4ECDC4', '#FF6B6B', '#A78BFA'];
const CATEGORY_COLORS = {
  plataforma:      { bg: 'oklch(0.97 0.04 235)', color: 'oklch(0.45 0.14 235)' },
  herramientas_ia: { bg: 'var(--primary-soft)',   color: 'var(--primary)' },
  equipo:          { bg: 'oklch(0.97 0.06 75)',   color: 'oklch(0.45 0.15 75)' },
  marketing:       { bg: 'oklch(0.97 0.06 155)',  color: 'oklch(0.40 0.14 155)' },
  otro:            { bg: 'var(--surface-2)',       color: 'var(--text-muted)' },
};

function formatCurrency(value) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(value);
}
function formatDate(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function Finanzas() {
  const { ingresosPorApp, ingresosPorMercado, marMensual, loading: loadingFinanzas } = useFinanzas();
  const { gastos, loading: loadingGastos, createGasto, deleteGasto } = useGastos();
  const { apps } = useApps();

  const [activeTab, setActiveTab] = useState('ingresos');
  const [viewMode, setViewMode] = useState('app');
  const [isGastoFormOpen, setIsGastoFormOpen] = useState(false);
  const [isSavingGasto, setIsSavingGasto] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, gastoId: null });
  const [toast, setToast] = useState(null);

  const months = Object.keys(ingresosPorApp).sort();
  const appChartData = months.map((month) => ({
    month: new Date(month + '-01').toLocaleDateString('es-ES', { month: 'short', year: '2-digit' }),
    ...ingresosPorApp[month],
  }));
  const mercadoChartData = months.map((month) => ({
    month: new Date(month + '-01').toLocaleDateString('es-ES', { month: 'short', year: '2-digit' }),
    ...ingresosPorMercado[month],
  }));

  const currentMonth = months[months.length - 1];
  const currentMarValue = marMensual[currentMonth] || 0;
  const activeAppsCount = apps.filter(a => a.status === 'published' || a.status === 'testing').length || 1;
  const objective = 50 * activeAppsCount;
  const progressPercent = Math.min((currentMarValue / objective) * 100, 100);

  const tableSummary = months.map((month, idx) => {
    const prevMonth = idx > 0 ? months[idx - 1] : null;
    const currentTotal = Object.values(ingresosPorApp[month]).reduce((a, b) => a + b, 0);
    const prevTotal = prevMonth ? Object.values(ingresosPorApp[prevMonth]).reduce((a, b) => a + b, 0) : currentTotal;
    const delta = currentTotal - prevTotal;
    const deltaPercent = prevTotal > 0 ? ((delta / prevTotal) * 100).toFixed(1) : 0;
    return {
      month, displayMonth: new Date(month + '-01').toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }),
      totalIngresos: currentTotal, appsActivas: Object.keys(ingresosPorApp[month]).length,
      mar: marMensual[month] || 0, delta, deltaPercent,
    };
  });

  const gastosPorMes = {};
  gastos.forEach((g) => { const mes = g.fecha.substring(0, 7); gastosPorMes[mes] = (gastosPorMes[mes] || 0) + g.monto_usd; });
  const allMonths = new Set([...months, ...Object.keys(gastosPorMes)]);
  const sortedMonths = Array.from(allMonths).sort();
  const pyData = sortedMonths.map((mes, idx) => {
    const ingresos = Object.values(ingresosPorApp[mes] || {}).reduce((a, b) => a + b, 0);
    const gastosMes = gastosPorMes[mes] || 0;
    const resultado = ingresos - gastosMes;
    const acumulado = sortedMonths.slice(0, idx + 1).reduce((sum, m) => {
      return sum + (Object.values(ingresosPorApp[m] || {}).reduce((a, b) => a + b, 0)) - (gastosPorMes[m] || 0);
    }, 0);
    return { mes, displayMes: new Date(mes + '-01').toLocaleDateString('es-ES', { month: 'short', year: '2-digit' }), ingresos, gastosMes, resultado, acumulado };
  });

  const allAppNames = [...new Set(months.flatMap((m) => Object.keys(ingresosPorApp[m] || {})))];
  const allMarkets = [...new Set(months.flatMap((m) => Object.keys(ingresosPorMercado[m] || {})))];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '8px 12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          {payload.map((entry, idx) => (
            <div key={idx} style={{ fontSize: '12px', color: entry.color }}>{entry.name}: ${entry.value.toFixed(2)}</div>
          ))}
        </div>
      );
    }
    return null;
  };

  const thStyle = { padding: '12px', color: 'var(--text-muted)', fontWeight: '500', whiteSpace: 'nowrap' };
  const tdStyle = { padding: '12px', borderBottom: '1px solid var(--border)', color: 'var(--text)' };

  const currentMonthStr = new Date().toISOString().substring(0, 7);
  const totalGastosMes = gastos.filter(g => g.fecha.startsWith(currentMonthStr)).reduce((sum, g) => sum + g.monto_usd, 0);

  const handleSaveGasto = async (gastoData) => {
    try {
      setIsSavingGasto(true);
      await createGasto(gastoData);
      setIsGastoFormOpen(false);
      setToast({ message: 'Gasto guardado correctamente', type: 'success' });
    } catch (err) {
      setToast({ message: 'Error al guardar gasto', type: 'error' });
    } finally {
      setIsSavingGasto(false);
    }
  };

  const handleDeleteGasto = (id) => setConfirmModal({ isOpen: true, gastoId: id });
  const handleConfirmDelete = async () => {
    try {
      await deleteGasto(confirmModal.gastoId);
      setToast({ message: 'Gasto eliminado', type: 'success' });
      setConfirmModal({ isOpen: false, gastoId: null });
    } catch (err) {
      setToast({ message: 'Error al eliminar gasto', type: 'error' });
      setConfirmModal({ isOpen: false, gastoId: null });
    }
  };

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100%', padding: '24px' }}>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0', borderBottom: '1px solid var(--border)', marginBottom: '24px' }}>
        {['ingresos', 'gastos', 'pyL'].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '10px 16px', fontSize: '14px', fontWeight: '500',
              color: activeTab === tab ? '#00E5A0' : '#6B7280',
              borderBottom: activeTab === tab ? '2px solid #00E5A0' : '2px solid transparent',
              marginBottom: '-1px', transition: 'color 0.2s',
            }}>
            {tab === 'ingresos' ? 'Ingresos' : tab === 'gastos' ? 'Gastos' : 'P&L'}
          </button>
        ))}
      </div>

      {/* TAB: INGRESOS */}
      {activeTab === 'ingresos' && (
        loadingFinanzas ? <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0' }}>Cargando finanzas...</div> : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px', marginBottom: '16px' }}>
              <MetricCard label="MAR Actual" value={formatCurrency(currentMarValue)} sub={`Objetivo: ${formatCurrency(objective)}`} subColor={currentMarValue >= objective ? 'green' : 'red'} />
              <div style={{ ...card, marginBottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>Progreso al objetivo</span>
                  <span style={{ color: 'var(--primary)', fontSize: '11px', fontWeight: '500' }}>{progressPercent.toFixed(0)}%</span>
                </div>
                <div style={{ height: '8px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: currentMarValue >= objective ? 'var(--primary)' : 'var(--nz-danger)', width: `${progressPercent}%`, transition: 'width 0.3s ease' }} />
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ display: 'flex', gap: '4px', background: 'var(--surface-2)', padding: '4px', borderRadius: '8px' }}>
                <button onClick={() => setViewMode('app')}
                  style={{ padding: '6px 14px', backgroundColor: viewMode === 'app' ? '#FFFFFF' : 'transparent', color: viewMode === 'app' ? '#111827' : '#6B7280', border: viewMode === 'app' ? '1px solid rgba(0,0,0,0.08)' : 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500', boxShadow: viewMode === 'app' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none' }}>
                  Por app
                </button>
                <button onClick={() => setViewMode('mercado')}
                  style={{ padding: '6px 14px', backgroundColor: viewMode === 'mercado' ? '#FFFFFF' : 'transparent', color: viewMode === 'mercado' ? '#111827' : '#6B7280', border: viewMode === 'mercado' ? '1px solid rgba(0,0,0,0.08)' : 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500', boxShadow: viewMode === 'mercado' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none' }}>
                  Por mercado
                </button>
              </div>
            </div>

            <div style={card}>
              <h2 style={{ color: 'var(--text)', fontSize: '14px', fontWeight: '600', margin: '0 0 16px 0' }}>
                {viewMode === 'app' ? 'Ingresos por app' : 'Ingresos por mercado'}
              </h2>
              {viewMode === 'app' ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={appChartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="month" stroke="var(--text-subtle)" tick={{ fontSize: 12 }} />
                    <YAxis stroke="var(--text-subtle)" tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    {allAppNames.map((appName, idx) => (
                      <Bar key={appName} dataKey={appName} stackId="a" fill={APP_COLORS[idx % APP_COLORS.length]} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={mercadoChartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="month" stroke="var(--text-subtle)" tick={{ fontSize: 12 }} />
                    <YAxis stroke="var(--text-subtle)" tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    {allMarkets.map((market) => (
                      <Bar key={market} dataKey={market} stackId="a" fill={MARKET_COLORS[market] || '#9CA3AF'} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <div style={card}>
              <h2 style={{ color: 'var(--text)', fontSize: '14px', fontWeight: '600', margin: '0 0 16px 0' }}>Resumen mensual</h2>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th style={{ ...thStyle, textAlign: 'left' }}>Mes</th>
                    <th style={{ ...thStyle, textAlign: 'right' }}>Ingresos totales</th>
                    <th style={{ ...thStyle, textAlign: 'right' }}>Apps activas</th>
                    <th style={{ ...thStyle, textAlign: 'right' }}>MAR</th>
                    <th style={{ ...thStyle, textAlign: 'right' }}>Delta vs mes anterior</th>
                  </tr>
                </thead>
                <tbody>
                  {tableSummary.map((row) => (
                    <tr key={row.month}>
                      <td style={{ ...tdStyle }}>{row.displayMonth}</td>
                      <td style={{ ...tdStyle, textAlign: 'right', color: 'var(--nz-success)', fontFamily: 'var(--font-mono)' }}>{formatCurrency(row.totalIngresos)}</td>
                      <td style={{ ...tdStyle, textAlign: 'right', color: 'var(--primary)' }}>{row.appsActivas}</td>
                      <td style={{ ...tdStyle, textAlign: 'right', color: 'var(--nz-success)', fontFamily: 'var(--font-mono)' }}>{formatCurrency(row.mar)}</td>
                      <td style={{ ...tdStyle, textAlign: 'right', color: row.delta >= 0 ? '#059669' : '#DC2626' }}>
                        {row.delta >= 0 ? '↑' : '↓'} {formatCurrency(Math.abs(row.delta))} ({row.deltaPercent}%)
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )
      )}

      {/* TAB: GASTOS */}
      {activeTab === 'gastos' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <span style={{ color: 'var(--text)', fontSize: '16px', fontWeight: '600' }}>Gastos</span>
            <button onClick={() => setIsGastoFormOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'var(--primary)', border: 'none', color: 'var(--primary-fg)', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>
              <IconPlus /> Nuevo gasto
            </button>
          </div>

          {loadingGastos ? <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0' }}>Cargando gastos...</div> : (
            <>
              <div style={{ ...card, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Total — {new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</span>
                <span style={{ color: 'var(--nz-danger)', fontSize: '20px', fontWeight: '600', fontFamily: 'var(--font-mono)' }}>{formatCurrency(totalGastosMes)}</span>
              </div>

              <div style={card}>
                {gastos.length === 0 ? (
                  <div style={{ color: 'var(--text-subtle)', textAlign: 'center', padding: '40px 0' }}>Sin gastos registrados</div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border)' }}>
                        <th style={{ ...thStyle, textAlign: 'left' }}>Fecha</th>
                        <th style={{ ...thStyle, textAlign: 'left' }}>Concepto</th>
                        <th style={{ ...thStyle, textAlign: 'left' }}>Categoría</th>
                        <th style={{ ...thStyle, textAlign: 'right' }}>Monto</th>
                        <th style={{ ...thStyle, textAlign: 'center' }}>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gastos.map((gasto) => {
                        const cat = CATEGORY_COLORS[gasto.categoria] || CATEGORY_COLORS.otro;
                        return (
                          <tr key={gasto.id}>
                            <td style={{ ...tdStyle, color: 'var(--text-muted)' }}>{formatDate(gasto.fecha)}</td>
                            <td style={{ ...tdStyle }}>{gasto.concepto}</td>
                            <td style={{ ...tdStyle }}>
                              <span style={{ backgroundColor: cat.bg, color: cat.text, fontSize: '10px', padding: '2px 8px', borderRadius: '12px', fontWeight: '500' }}>{gasto.categoria}</span>
                            </td>
                            <td style={{ ...tdStyle, textAlign: 'right', color: 'var(--nz-danger)', fontWeight: '500', fontFamily: 'var(--font-mono)' }}>{formatCurrency(gasto.monto_usd)}</td>
                            <td style={{ ...tdStyle, textAlign: 'center' }}>
                              <button onClick={() => handleDeleteGasto(gasto.id)}
                                style={{ background: 'none', border: 'none', color: 'var(--nz-danger)', cursor: 'pointer', padding: '0', display: 'flex', alignItems: 'center', margin: '0 auto' }}>
                                <IconTrash />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}

          <GastoForm isOpen={isGastoFormOpen} onClose={() => setIsGastoFormOpen(false)} onSave={handleSaveGasto} isLoading={isSavingGasto} />
        </>
      )}

      {/* TAB: P&L */}
      {activeTab === 'pyL' && (
        <div style={card}>
          <h2 style={{ color: 'var(--text)', fontSize: '14px', fontWeight: '600', margin: '0 0 16px 0' }}>Profit & Loss (P&L)</h2>
          {loadingFinanzas || loadingGastos ? (
            <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0' }}>Cargando datos...</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ ...thStyle, textAlign: 'left' }}>Mes</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Ingresos ($)</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Gastos ($)</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Resultado ($)</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Acumulado ($)</th>
                </tr>
              </thead>
              <tbody>
                {pyData.map((row) => (
                  <tr key={row.mes}>
                    <td style={{ ...tdStyle }}>{row.displayMes}</td>
                    <td style={{ ...tdStyle, textAlign: 'right', color: 'var(--nz-success)', fontFamily: 'var(--font-mono)' }}>{formatCurrency(row.ingresos)}</td>
                    <td style={{ ...tdStyle, textAlign: 'right', color: 'var(--nz-danger)', fontFamily: 'var(--font-mono)' }}>{formatCurrency(row.gastosMes)}</td>
                    <td style={{ ...tdStyle, textAlign: 'right', color: row.resultado >= 0 ? '#059669' : '#DC2626', fontWeight: '500', fontFamily: 'var(--font-mono)' }}>{formatCurrency(row.resultado)}</td>
                    <td style={{ ...tdStyle, textAlign: 'right', color: row.acumulado >= 0 ? '#059669' : '#DC2626', fontWeight: '600', fontFamily: 'var(--font-mono)' }}>{formatCurrency(row.acumulado)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      <ConfirmModal isOpen={confirmModal.isOpen} title="Eliminar gasto"
        message="¿Estás seguro que deseas eliminar este gasto? Esta acción no se puede deshacer."
        onConfirm={handleConfirmDelete} onCancel={() => setConfirmModal({ isOpen: false, gastoId: null })}
        confirmLabel="Eliminar" confirmColor="#DC2626" />
      {toast && <ToastNotification message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
