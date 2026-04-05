import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppIcon from '../components/ui/AppIcon';
import StatusBadge from '../components/ui/StatusBadge';
import KanbanBoard from '../components/apps/KanbanBoard';
import RevenueChart from '../components/metrics/RevenueChart';
import DAUChart from '../components/metrics/DAUChart';
import MetricsForm from '../components/metrics/MetricsForm';
import MetricsTable from '../components/metrics/MetricsTable';
import ToastNotification from '../components/ui/ToastNotification';
import DatePicker from '../components/ui/DatePicker';
import { useApps } from '../hooks/useApps';
import { useTasksForApp } from '../hooks/useTasksForApp';
import { useMetrics } from '../hooks/useMetrics';
import { useAsoTracker } from '../hooks/useAsoTracker';
import { useVersionLog } from '../hooks/useVersionLog';

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

const IconTrash = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);

function AsoForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    keyword: '',
    posicion: '',
    fecha: new Date().toISOString().split('T')[0],
    notas: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.keyword.trim() || !formData.posicion) return;
    onSubmit(formData);
    setFormData({ keyword: '', posicion: '', fecha: new Date().toISOString().split('T')[0], notas: '' });
  };

  return (
    <form onSubmit={handleSubmit} style={{ backgroundColor: '#13131A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
        <input type="text" placeholder="Keyword" value={formData.keyword} onChange={(e) => setFormData({...formData, keyword: e.target.value})} style={{ backgroundColor: '#0A0A0F', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '8px', color: 'white', fontSize: '13px', boxSizing: 'border-box' }} />
        <input type="number" placeholder="Posición" min="1" max="100" value={formData.posicion} onChange={(e) => setFormData({...formData, posicion: e.target.value})} style={{ backgroundColor: '#0A0A0F', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '8px', color: 'white', fontSize: '13px', boxSizing: 'border-box' }} />
      </div>
      <div style={{ marginBottom: '12px' }}>
        <DatePicker value={formData.fecha} onChange={(date) => setFormData({...formData, fecha: date})} label="Fecha" />
      </div>
      <div style={{ marginBottom: '12px' }}>
        <input type="text" placeholder="Notas (opcional)" value={formData.notas} onChange={(e) => setFormData({...formData, notas: e.target.value})} style={{ width: '100%', backgroundColor: '#0A0A0F', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '8px', color: 'white', fontSize: '13px', boxSizing: 'border-box' }} />
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button type="submit" style={{ flex: 1, padding: '8px', backgroundColor: '#00E5A0', border: 'none', color: '#0A0A0F', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>Guardar</button>
        <button type="button" onClick={onCancel} style={{ flex: 1, padding: '8px', backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.08)', color: '#999', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>Cancelar</button>
      </div>
    </form>
  );
}

function VersionForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    version: '',
    fecha: new Date().toISOString().split('T')[0],
    cambios: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.version.trim() || !formData.cambios.trim()) return;
    onSubmit(formData);
    setFormData({ version: '', fecha: new Date().toISOString().split('T')[0], cambios: '' });
  };

  return (
    <form onSubmit={handleSubmit} style={{ backgroundColor: '#13131A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
      <div style={{ marginBottom: '12px' }}>
        <input type="text" placeholder="1.0.1" value={formData.version} onChange={(e) => setFormData({...formData, version: e.target.value})} style={{ width: '100%', backgroundColor: '#0A0A0F', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '8px', color: 'white', fontSize: '13px', boxSizing: 'border-box' }} />
      </div>
      <div style={{ marginBottom: '12px' }}>
        <DatePicker value={formData.fecha} onChange={(date) => setFormData({...formData, fecha: date})} label="Fecha" />
      </div>
      <textarea placeholder="Cambios..." value={formData.cambios} onChange={(e) => setFormData({...formData, cambios: e.target.value})} style={{ width: '100%', backgroundColor: '#0A0A0F', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '8px', color: 'white', fontSize: '13px', boxSizing: 'border-box', minHeight: '80px', marginBottom: '12px', fontFamily: 'DM Mono, monospace', resize: 'vertical' }} />
      <div style={{ display: 'flex', gap: '8px' }}>
        <button type="submit" style={{ flex: 1, padding: '8px', backgroundColor: '#00E5A0', border: 'none', color: '#0A0A0F', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>Guardar</button>
        <button type="button" onClick={onCancel} style={{ flex: 1, padding: '8px', backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.08)', color: '#999', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>Cancelar</button>
      </div>
    </form>
  );
}

export default function AppDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { apps } = useApps();
  const { tasks, deleteTask, updateTask, createTask } = useTasksForApp(id);
  const { keywords, addKeyword, deleteKeyword } = useAsoTracker(id);
  const { versions, addVersion, deleteVersion } = useVersionLog(id);

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
  const [isAsoFormOpen, setIsAsoFormOpen] = useState(false);
  const [isVersionFormOpen, setIsVersionFormOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const app = apps.find((a) => a.id === id);

  const handleSaveMetric = async (metricData) => {
    try {
      setIsMetricsSaving(true);
      await createMetric(metricData);
      setToast({ message: 'Métrica guardada correctamente', type: 'success' });
    } catch (err) {
      setToast({ message: 'Error al guardar métrica', type: 'error' });
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
        due_date: taskData.due_date || null,
      });
      setToast({ message: 'Tarea creada correctamente', type: 'success' });
    } catch (err) {
      setToast({ message: 'Error al crear tarea', type: 'error' });
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
        {['produccion', 'metricas', 'aso', 'versiones'].map((tab) => (
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
            {tab === 'produccion' ? 'Producción' : tab === 'metricas' ? 'Métricas' : tab === 'aso' ? 'ASO' : 'Versiones'}
          </button>
        ))}
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

      {/* TAB: ASO */}
      {activeTab === 'aso' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ color: 'white', fontSize: '16px', fontWeight: '600', margin: 0 }}>
              ASO Tracker
            </h2>
            <button
              onClick={() => setIsAsoFormOpen(!isAsoFormOpen)}
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
              <IconPlus /> Agregar keyword
            </button>
          </div>

          {isAsoFormOpen && (
            <AsoForm
              onSubmit={async (data) => {
                try {
                  await addKeyword(data);
                  setToast({ message: 'Keyword agregado', type: 'success' });
                  setIsAsoFormOpen(false);
                } catch (err) {
                  setToast({ message: 'Error al agregar keyword', type: 'error' });
                }
              }}
              onCancel={() => setIsAsoFormOpen(false)}
            />
          )}

          {keywords.length === 0 ? (
            <div style={{ backgroundColor: '#13131A', padding: '40px', borderRadius: '10px', textAlign: 'center', color: '#666' }}>
              No hay keywords trackeadas todavía
            </div>
          ) : (
            <div style={{ backgroundColor: '#13131A', padding: '16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#999', fontWeight: '500' }}>Keyword</th>
                    <th style={{ padding: '12px', textAlign: 'center', color: '#999', fontWeight: '500' }}>Posición</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#999', fontWeight: '500' }}>Fecha</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#999', fontWeight: '500' }}>Notas</th>
                    <th style={{ padding: '12px', textAlign: 'center', color: '#999', fontWeight: '500' }}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {keywords.map((kw, idx) => {
                    const bgColor = idx % 2 === 0 ? '#0A0A0F' : '#1C1C26';
                    const posColor = kw.posicion <= 10 ? '#00E5A0' : kw.posicion <= 30 ? '#FFB400' : '#666';
                    return (
                      <tr key={kw.id} style={{ backgroundColor: bgColor, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                        <td style={{ padding: '12px', color: 'white' }}>{kw.keyword}</td>
                        <td style={{ padding: '12px', textAlign: 'center', color: posColor, fontWeight: '600' }}>{kw.posicion}</td>
                        <td style={{ padding: '12px', color: '#999' }}>{new Date(kw.fecha).toLocaleDateString('es-ES')}</td>
                        <td style={{ padding: '12px', color: '#999' }}>{kw.notas || '-'}</td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <button
                            onClick={() => {
                              deleteKeyword(kw.id);
                              setToast({ message: 'Keyword eliminado', type: 'success' });
                            }}
                            style={{ background: 'none', border: 'none', color: '#FF4D4F', cursor: 'pointer' }}
                          >
                            <IconTrash />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB: VERSIONES */}
      {activeTab === 'versiones' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ color: 'white', fontSize: '16px', fontWeight: '600', margin: 0 }}>
              Version Log
            </h2>
            <button
              onClick={() => setIsVersionFormOpen(!isVersionFormOpen)}
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
              <IconPlus /> Registrar update
            </button>
          </div>

          {isVersionFormOpen && (
            <VersionForm
              onSubmit={async (data) => {
                try {
                  await addVersion(data);
                  setToast({ message: 'Versión registrada', type: 'success' });
                  setIsVersionFormOpen(false);
                } catch (err) {
                  setToast({ message: 'Error al registrar versión', type: 'error' });
                }
              }}
              onCancel={() => setIsVersionFormOpen(false)}
            />
          )}

          {versions.length === 0 ? (
            <div style={{ backgroundColor: '#13131A', padding: '40px', borderRadius: '10px', textAlign: 'center', color: '#666' }}>
              No hay versiones registradas
            </div>
          ) : (
            <div>
              {versions.map((v, idx) => (
                <div
                  key={v.id}
                  style={{
                    backgroundColor: idx % 2 === 0 ? '#0A0A0F' : '#1C1C26',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '8px',
                    padding: '16px',
                    marginBottom: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '12px',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{
                        backgroundColor: '#7C6AFF',
                        color: 'white',
                        fontSize: '12px',
                        fontWeight: '600',
                        padding: '4px 8px',
                        borderRadius: '4px',
                      }}>
                        v{v.version}
                      </span>
                      <span style={{ color: '#999', fontSize: '12px' }}>
                        {new Date(v.fecha).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {v.cambios}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      deleteVersion(v.id);
                      setToast({ message: 'Versión eliminada', type: 'success' });
                    }}
                    style={{ background: 'none', border: 'none', color: '#FF4D4F', cursor: 'pointer', flexShrink: 0 }}
                  >
                    <IconTrash />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

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
