import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppIcon from '../components/ui/AppIcon';
import StatusBadge from '../components/ui/StatusBadge';
import KanbanBoard from '../components/apps/KanbanBoard';
import RevenueChart from '../components/metrics/RevenueChart';
import DAUChart from '../components/metrics/DAUChart';
import MetricsForm from '../components/metrics/MetricsForm';
import MetricsTable from '../components/metrics/MetricsTable';
import { useApps } from '../hooks/useApps';
import { useTasksForApp } from '../hooks/useTasksForApp';
import { useMetrics } from '../hooks/useMetrics';

const IconArrowLeft = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
);

const IconPlus = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

export default function AppDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { apps } = useApps();
  const { tasks, deleteTask, updateTask, createTask } = useTasksForApp(id);

  // Métricas: últimos 30 días
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const { metrics, loading: metricsLoading, createMetric } = useMetrics(
    id,
    thirtyDaysAgo.toISOString().split('T')[0],
    new Date().toISOString().split('T')[0]
  );

  const [activeTab, setActiveTab] = useState('produccion');
  const [isMetricsFormOpen, setIsMetricsFormOpen] = useState(false);
  const [isMetricsSaving, setIsMetricsSaving] = useState(false);
  const app = apps.find((a) => a.id === id);

  const handleSaveMetric = async (metricData) => {
    try {
      setIsMetricsSaving(true);
      await createMetric(metricData);
    } catch (err) {
      alert('Error al guardar métrica');
    } finally {
      setIsMetricsSaving(false);
    }
  };

  const handleAddTask = async (estado, taskData) => {
    try {
      await createTask({
        titulo: taskData.titulo,
        tipo: taskData.tipo || 'pipeline',
        prioridad: taskData.prioridad || 3,
        estado,
        notas: taskData.notas || null,
      });
    } catch (err) {
      alert('Error al crear tarea');
    }
  };

  if (!app) {
    return (
      <div style={{ backgroundColor: '#0A0A0F', minHeight: '100vh', padding: '24px' }}>
        <div style={{ color: '#999' }}>App no encontrada</div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#0A0A0F', minHeight: '100vh', padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <button
          onClick={() => navigate('/apps')}
          style={{
            background: 'none',
            border: 'none',
            color: '#00E5A0',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            marginBottom: '16px',
            padding: '0',
          }}
        >
          <IconArrowLeft /> Volver a Apps
        </button>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '20px' }}>
          <AppIcon nombre={app.nombre || app.name} icono_url={app.icono_url} size={48} />
          <div>
            <h1 style={{ color: 'white', margin: '0 0 6px 0', fontSize: '24px', fontWeight: '600' }}>
              {app.nombre || app.name}
            </h1>
            <div style={{ color: '#999', fontSize: '13px', marginBottom: '10px' }}>
              {app.package}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <StatusBadge status={app.status || 'development'} />
              {app.mercado && (
                <span
                  style={{
                    backgroundColor: 'rgba(100, 150, 255, 0.2)',
                    color: '#6496FF',
                    fontSize: '11px',
                    padding: '4px 8px',
                    borderRadius: '20px',
                  }}
                >
                  {app.mercado}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '24px' }}>
        <button
          onClick={() => setActiveTab('produccion')}
          style={{
            background: 'none',
            border: 'none',
            color: activeTab === 'produccion' ? '#00E5A0' : '#999',
            cursor: 'pointer',
            padding: '12px 0',
            fontSize: '14px',
            fontWeight: '500',
            borderBottom: activeTab === 'produccion' ? '2px solid #00E5A0' : 'none',
            marginBottom: '-1px',
            transition: 'color 0.2s',
          }}
        >
          Producción
        </button>
        <button
          onClick={() => setActiveTab('metricas')}
          style={{
            background: 'none',
            border: 'none',
            color: activeTab === 'metricas' ? '#00E5A0' : '#999',
            cursor: 'pointer',
            padding: '12px 0',
            fontSize: '14px',
            fontWeight: '500',
            borderBottom: activeTab === 'metricas' ? '2px solid #00E5A0' : 'none',
            marginBottom: '-1px',
            transition: 'color 0.2s',
          }}
        >
          Métricas
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'produccion' && (
        <div>
          <h2 style={{ color: 'white', fontSize: '16px', fontWeight: '600', marginBottom: '16px', marginTop: 0 }}>
            Tareas
          </h2>
          <KanbanBoard tasks={tasks} onUpdateTask={updateTask} onDeleteTask={deleteTask} onAddTask={handleAddTask} />
        </div>
      )}

      {activeTab === 'metricas' && (
        <div>
          {/* Header con botón */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ color: 'white', fontSize: '16px', fontWeight: '600', margin: 0 }}>
              Métricas
            </h2>
            <button
              onClick={() => setIsMetricsFormOpen(true)}
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
              <IconPlus /> Cargar métricas
            </button>
          </div>

          {metricsLoading ? (
            <div style={{ color: '#999', textAlign: 'center', padding: '40px 0' }}>
              Cargando métricas...
            </div>
          ) : (
            <>
              {/* Revenue Chart */}
              <div style={{ marginBottom: '24px', backgroundColor: '#13131A', padding: '16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <h3 style={{ color: 'white', fontSize: '14px', fontWeight: '600', margin: '0 0 16px 0' }}>
                  Ingresos (últimos 30 días)
                </h3>
                <RevenueChart data={metrics} height={250} />
              </div>

              {/* DAU Chart */}
              <div style={{ marginBottom: '24px', backgroundColor: '#13131A', padding: '16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <h3 style={{ color: 'white', fontSize: '14px', fontWeight: '600', margin: '0 0 16px 0' }}>
                  DAU (últimos 30 días)
                </h3>
                <DAUChart data={metrics} height={250} />
              </div>

              {/* Metrics Table */}
              <div style={{ backgroundColor: '#13131A', padding: '16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <h3 style={{ color: 'white', fontSize: '14px', fontWeight: '600', margin: '0 0 16px 0' }}>
                  Detalle
                </h3>
                <MetricsTable metrics={metrics} />
              </div>
            </>
          )}

          {/* Form */}
          <MetricsForm
            isOpen={isMetricsFormOpen}
            onClose={() => setIsMetricsFormOpen(false)}
            onSave={handleSaveMetric}
            appId={id}
            isLoading={isMetricsSaving}
          />
        </div>
      )}
    </div>
  );
}
