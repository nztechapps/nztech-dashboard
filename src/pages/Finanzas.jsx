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
} from 'recharts';
import MetricCard from '../components/ui/MetricCard';
import GastoForm from '../components/finanzas/GastoForm';
import ConfirmModal from '../components/ui/ConfirmModal';
import ToastNotification from '../components/ui/ToastNotification';
import { useFinanzas } from '../hooks/useFinanzas';
import { useGastos } from '../hooks/useGastos';
import { useApps } from '../hooks/useApps';

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

const CATEGORY_COLORS = {
  plataforma: { bg: 'rgba(100,150,255,0.12)', text: '#6496FF' },
  herramientas_ia: { bg: 'rgba(124,106,255,0.12)', text: '#7C6AFF' },
  equipo: { bg: 'rgba(255,180,0,0.12)', text: '#FFB400' },
  marketing: { bg: 'rgba(0,229,160,0.12)', text: '#00E5A0' },
  otro: { bg: 'rgba(155,155,155,0.12)', text: '#9B9B9B' },
};

function formatCurrency(value) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}

function formatDate(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
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

  // Datos para gráficos
  const months = Object.keys(ingresosPorApp).sort();
  const appChartData = months.map((month) => ({
    month: new Date(month + '-01').toLocaleDateString('es-ES', { month: 'short', year: '2-digit' }),
    ...ingresosPorApp[month],
  }));
  const mercadoChartData = months.map((month) => ({
    month: new Date(month + '-01').toLocaleDateString('es-ES', { month: 'short', year: '2-digit' }),
    ...ingresosPorMercado[month],
  }));

  // MAR actual
  const currentMonth = months[months.length - 1];
  const currentMarValue = marMensual[currentMonth] || 0;
  const objectivePerApp = 50;
  const activeAppsCount = apps.filter(a => a.status === 'published' || a.status === 'testing').length || 1;
  const objective = objectivePerApp * activeAppsCount;
  const progressPercent = Math.min((currentMarValue / objective) * 100, 100);

  // Tabla resumen Ingresos
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

  // P&L: agrupar gastos y ingresos por mes
  const gastosPorMes = {};
  gastos.forEach((gasto) => {
    const mes = gasto.fecha.substring(0, 7);
    gastosPorMes[mes] = (gastosPorMes[mes] || 0) + gasto.monto_usd;
  });

  const allMonths = new Set([...months, ...Object.keys(gastosPorMes)]);
  const sortedMonths = Array.from(allMonths).sort();

  const pyData = sortedMonths.map((mes, idx) => {
    const ingresos = Object.values(ingresosPorApp[mes] || {}).reduce((a, b) => a + b, 0);
    const gastosMes = gastosPorMes[mes] || 0;
    const resultado = ingresos - gastosMes;
    const acumulado = sortedMonths.slice(0, idx + 1).reduce((sum, m) => {
      const ing = Object.values(ingresosPorApp[m] || {}).reduce((a, b) => a + b, 0);
      const gas = gastosPorMes[m] || 0;
      return sum + (ing - gas);
    }, 0);

    return {
      mes,
      displayMes: new Date(mes + '-01').toLocaleDateString('es-ES', { month: 'short', year: '2-digit' }),
      ingresos,
      gastosMes,
      resultado,
      acumulado,
    };
  });

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ backgroundColor: '#13131A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '8px 12px', color: '#fff' }}>
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

  const handleDeleteGasto = async (id) => {
    setConfirmModal({ isOpen: true, gastoId: id });
  };

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

  // Mes actual
  const currentMonthStr = new Date().toISOString().substring(0, 7);
  const gastosDelMes = gastos.filter(g => g.fecha.startsWith(currentMonthStr));
  const totalGastosMes = gastosDelMes.reduce((sum, g) => sum + g.monto_usd, 0);

  return (
    <div style={{ backgroundColor: '#0A0A0F', minHeight: '100vh', padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ color: 'white', margin: '0 0 16px 0', fontSize: '24px', fontWeight: '600' }}>
          Finanzas
        </h1>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          {['ingresos', 'gastos', 'pyL'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: 'none',
                border: 'none',
                color: activeTab === tab ? '#00E5A0' : '#999',
                cursor: 'pointer',
                padding: '12px 0',
                fontSize: '14px',
                fontWeight: '500',
                borderBottom: activeTab === tab ? '2px solid #00E5A0' : 'none',
                marginBottom: '-1px',
                transition: 'color 0.2s',
              }}
            >
              {tab === 'ingresos' ? 'Ingresos' : tab === 'gastos' ? 'Gastos' : 'P&L'}
            </button>
          ))}
        </div>
      </div>

      {/* TAB: INGRESOS */}
      {activeTab === 'ingresos' && (
        <div>
          {loadingFinanzas ? (
            <div style={{ color: '#999', textAlign: 'center', padding: '40px 0' }}>
              Cargando finanzas...
            </div>
          ) : (
            <>
              {/* View Mode Toggle */}
              <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ display: 'flex', gap: '4px', backgroundColor: '#13131A', padding: '4px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <button onClick={() => setViewMode('app')} style={{ padding: '8px 16px', backgroundColor: viewMode === 'app' ? '#00E5A0' : 'transparent', color: viewMode === 'app' ? '#0A0A0F' : '#999', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>
                    Por app
                  </button>
                  <button onClick={() => setViewMode('mercado')} style={{ padding: '8px 16px', backgroundColor: viewMode === 'mercado' ? '#00E5A0' : 'transparent', color: viewMode === 'mercado' ? '#0A0A0F' : '#999', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>
                    Por mercado
                  </button>
                </div>
              </div>

              {/* MAR */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px' }}>
                  <MetricCard label="MAR Actual" value={formatCurrency(currentMarValue)} sub={`Objetivo: ${formatCurrency(objective)}`} subColor={currentMarValue >= objective ? 'green' : 'red'} />
                  <div style={{ backgroundColor: '#13131A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ color: '#999', fontSize: '11px' }}>Progreso al objetivo</span>
                      <span style={{ color: '#00E5A0', fontSize: '11px', fontWeight: '500' }}>{progressPercent.toFixed(0)}%</span>
                    </div>
                    <div style={{ height: '8px', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', backgroundColor: currentMarValue >= objective ? '#00E5A0' : '#FF4D4F', width: `${progressPercent}%`, transition: 'width 0.3s ease' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Gráfico */}
              <div style={{ marginBottom: '24px', backgroundColor: '#13131A', padding: '16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
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
                        <Bar key={appName} dataKey={appName} stackId="a" fill={APP_COLORS[idx % APP_COLORS.length]} />
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
                        <Bar key={market} dataKey={market} stackId="a" fill={MARKET_COLORS[market] || '#999'} />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Tabla */}
              <div style={{ backgroundColor: '#13131A', padding: '16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', overflowX: 'auto' }}>
                <h2 style={{ color: 'white', fontSize: '14px', fontWeight: '600', margin: '0 0 16px 0' }}>
                  Resumen mensual
                </h2>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                      <th style={{ padding: '12px', textAlign: 'left', color: '#999', fontWeight: '500' }}>Mes</th>
                      <th style={{ padding: '12px', textAlign: 'right', color: '#999', fontWeight: '500' }}>Ingresos totales</th>
                      <th style={{ padding: '12px', textAlign: 'right', color: '#999', fontWeight: '500' }}>Apps activas</th>
                      <th style={{ padding: '12px', textAlign: 'right', color: '#999', fontWeight: '500' }}>MAR</th>
                      <th style={{ padding: '12px', textAlign: 'right', color: '#999', fontWeight: '500' }}>Delta vs mes anterior</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableSummary.map((row, idx) => {
                      const bgColor = idx % 2 === 0 ? '#0A0A0F' : '#1C1C26';
                      const deltaColor = row.delta >= 0 ? '#00E5A0' : '#FF4D4F';
                      const deltaSymbol = row.delta >= 0 ? '↑' : '↓';
                      return (
                        <tr key={row.month} style={{ backgroundColor: bgColor, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                          <td style={{ padding: '12px', color: 'white' }}>{row.displayMonth}</td>
                          <td style={{ padding: '12px', textAlign: 'right', color: '#00E5A0' }}>{formatCurrency(row.totalIngresos)}</td>
                          <td style={{ padding: '12px', textAlign: 'right', color: '#7C6AFF' }}>{row.appsActivas}</td>
                          <td style={{ padding: '12px', textAlign: 'right', color: '#00E5A0' }}>{formatCurrency(row.mar)}</td>
                          <td style={{ padding: '12px', textAlign: 'right', color: deltaColor }}>{deltaSymbol} {formatCurrency(Math.abs(row.delta))} ({row.deltaPercent}%)</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB: GASTOS */}
      {activeTab === 'gastos' && (
        <div>
          {/* Header con botón */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ color: 'white', fontSize: '16px', fontWeight: '600', margin: 0 }}>
              Gastos
            </h2>
            <button
              onClick={() => setIsGastoFormOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                backgroundColor: '#00E5A0',
                border: 'none',
                color: '#0A0A0F',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
              }}
            >
              <IconPlus /> Nuevo gasto
            </button>
          </div>

          {loadingGastos ? (
            <div style={{ color: '#999', textAlign: 'center', padding: '40px 0' }}>
              Cargando gastos...
            </div>
          ) : (
            <>
              {/* Total del mes actual */}
              <div style={{ marginBottom: '20px', backgroundColor: '#13131A', padding: '16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#999', fontSize: '14px' }}>Total de gastos - {new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</span>
                  <span style={{ color: '#FF4D4F', fontSize: '20px', fontWeight: '600' }}>{formatCurrency(totalGastosMes)}</span>
                </div>
              </div>

              {/* Tabla de gastos */}
              <div style={{ backgroundColor: '#13131A', padding: '16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', overflowX: 'auto' }}>
                {gastos.length === 0 ? (
                  <div style={{ color: '#999', textAlign: 'center', padding: '40px 0' }}>
                    Sin gastos registrados
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                        <th style={{ padding: '12px', textAlign: 'left', color: '#999', fontWeight: '500' }}>Fecha</th>
                        <th style={{ padding: '12px', textAlign: 'left', color: '#999', fontWeight: '500' }}>Concepto</th>
                        <th style={{ padding: '12px', textAlign: 'left', color: '#999', fontWeight: '500' }}>Categoría</th>
                        <th style={{ padding: '12px', textAlign: 'right', color: '#999', fontWeight: '500' }}>Monto</th>
                        <th style={{ padding: '12px', textAlign: 'center', color: '#999', fontWeight: '500' }}>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gastos.map((gasto, idx) => {
                        const bgColor = idx % 2 === 0 ? '#0A0A0F' : '#1C1C26';
                        const categoryColor = CATEGORY_COLORS[gasto.categoria] || CATEGORY_COLORS.otro;
                        return (
                          <tr key={gasto.id} style={{ backgroundColor: bgColor, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                            <td style={{ padding: '12px', color: '#999' }}>{formatDate(gasto.fecha)}</td>
                            <td style={{ padding: '12px', color: 'white' }}>{gasto.concepto}</td>
                            <td style={{ padding: '12px' }}>
                              <span style={{ backgroundColor: categoryColor.bg, color: categoryColor.text, fontSize: '10px', padding: '2px 6px', borderRadius: '12px' }}>
                                {gasto.categoria}
                              </span>
                            </td>
                            <td style={{ padding: '12px', textAlign: 'right', color: '#FF4D4F', fontWeight: '500' }}>{formatCurrency(gasto.monto_usd)}</td>
                            <td style={{ padding: '12px', textAlign: 'center' }}>
                              <button
                                onClick={() => handleDeleteGasto(gasto.id)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#FF4D4F',
                                  cursor: 'pointer',
                                  padding: '0',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '4px',
                                }}
                              >
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

          <GastoForm
            isOpen={isGastoFormOpen}
            onClose={() => setIsGastoFormOpen(false)}
            onSave={handleSaveGasto}
            isLoading={isSavingGasto}
          />
        </div>
      )}

      {/* TAB: P&L */}
      {activeTab === 'pyL' && (
        <div>
          <div style={{ backgroundColor: '#13131A', padding: '16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', overflowX: 'auto' }}>
            <h2 style={{ color: 'white', fontSize: '14px', fontWeight: '600', margin: '0 0 16px 0' }}>
              Profit & Loss (P&L)
            </h2>
            {loadingFinanzas || loadingGastos ? (
              <div style={{ color: '#999', textAlign: 'center', padding: '40px 0' }}>
                Cargando datos...
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#999', fontWeight: '500' }}>Mes</th>
                    <th style={{ padding: '12px', textAlign: 'right', color: '#999', fontWeight: '500' }}>Ingresos ($)</th>
                    <th style={{ padding: '12px', textAlign: 'right', color: '#999', fontWeight: '500' }}>Gastos ($)</th>
                    <th style={{ padding: '12px', textAlign: 'right', color: '#999', fontWeight: '500' }}>Resultado ($)</th>
                    <th style={{ padding: '12px', textAlign: 'right', color: '#999', fontWeight: '500' }}>Acumulado ($)</th>
                  </tr>
                </thead>
                <tbody>
                  {pyData.map((row, idx) => {
                    const bgColor = idx % 2 === 0 ? '#0A0A0F' : '#1C1C26';
                    const resultColor = row.resultado >= 0 ? '#00E5A0' : '#FF4D4F';
                    const acumuladoColor = row.acumulado >= 0 ? '#00E5A0' : '#FF4D4F';
                    return (
                      <tr key={row.mes} style={{ backgroundColor: bgColor, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                        <td style={{ padding: '12px', color: 'white' }}>{row.displayMes}</td>
                        <td style={{ padding: '12px', textAlign: 'right', color: '#00E5A0' }}>{formatCurrency(row.ingresos)}</td>
                        <td style={{ padding: '12px', textAlign: 'right', color: '#FF4D4F' }}>{formatCurrency(row.gastosMes)}</td>
                        <td style={{ padding: '12px', textAlign: 'right', color: resultColor, fontWeight: '500' }}>{formatCurrency(row.resultado)}</td>
                        <td style={{ padding: '12px', textAlign: 'right', color: acumuladoColor, fontWeight: '600' }}>{formatCurrency(row.acumulado)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ConfirmModal para eliminar gasto */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Eliminar gasto"
        message="¿Estás seguro que deseas eliminar este gasto? Esta acción no se puede deshacer."
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmModal({ isOpen: false, gastoId: null })}
        confirmLabel="Eliminar"
        confirmColor="#FF4D4F"
      />

      {/* Toast Notification */}
      {toast && (
        <ToastNotification
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
