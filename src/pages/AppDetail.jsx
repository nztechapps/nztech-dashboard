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
import { useIdeas } from '../hooks/useIdeas';
import { useTareas } from '../hooks/useTareas';
import { useMetrics } from '../hooks/useMetrics';
import { useAsoTracker } from '../hooks/useAsoTracker';
import { useVersionLog } from '../hooks/useVersionLog';
import { useAppPostmortems } from '../hooks/useAppPostmortems';
import PostMortemModal from '../components/ideas/PostMortemModal'
import { useAppMetricsSnapshots } from '../hooks/useAppMetricsSnapshots';

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
    <form onSubmit={handleSubmit} style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
        <input type="text" placeholder="Keyword" value={formData.keyword} onChange={(e) => setFormData({...formData, keyword: e.target.value})} style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '6px', padding: '8px', color: 'var(--text)', fontSize: '13px', boxSizing: 'border-box' }} />
        <input type="number" placeholder="Posición" min="1" max="100" value={formData.posicion} onChange={(e) => setFormData({...formData, posicion: e.target.value})} style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '6px', padding: '8px', color: 'var(--text)', fontSize: '13px', boxSizing: 'border-box' }} />
      </div>
      <div style={{ marginBottom: '12px' }}>
        <DatePicker value={formData.fecha} onChange={(date) => setFormData({...formData, fecha: date})} label="Fecha" />
      </div>
      <div style={{ marginBottom: '12px' }}>
        <input type="text" placeholder="Notas (opcional)" value={formData.notas} onChange={(e) => setFormData({...formData, notas: e.target.value})} style={{ width: '100%', backgroundColor: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '6px', padding: '8px', color: 'var(--text)', fontSize: '13px', boxSizing: 'border-box' }} />
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button type="submit" style={{ flex: 1, padding: '8px', background: 'var(--primary)', border: 'none', color: 'var(--bg)', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>Guardar</button>
        <button type="button" onClick={onCancel} style={{ flex: 1, padding: '8px', backgroundColor: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>Cancelar</button>
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
    <form onSubmit={handleSubmit} style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
      <div style={{ marginBottom: '12px' }}>
        <input type="text" placeholder="1.0.1" value={formData.version} onChange={(e) => setFormData({...formData, version: e.target.value})} style={{ width: '100%', backgroundColor: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '6px', padding: '8px', color: 'var(--text)', fontSize: '13px', boxSizing: 'border-box' }} />
      </div>
      <div style={{ marginBottom: '12px' }}>
        <DatePicker value={formData.fecha} onChange={(date) => setFormData({...formData, fecha: date})} label="Fecha" />
      </div>
      <textarea placeholder="Cambios..." value={formData.cambios} onChange={(e) => setFormData({...formData, cambios: e.target.value})} style={{ width: '100%', backgroundColor: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '6px', padding: '8px', color: 'var(--text)', fontSize: '13px', boxSizing: 'border-box', minHeight: '80px', marginBottom: '12px', fontFamily: 'var(--font-mono)', resize: 'vertical' }} />
      <div style={{ display: 'flex', gap: '8px' }}>
        <button type="submit" style={{ flex: 1, padding: '8px', background: 'var(--primary)', border: 'none', color: 'var(--bg)', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>Guardar</button>
        <button type="button" onClick={onCancel} style={{ flex: 1, padding: '8px', backgroundColor: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>Cancelar</button>
      </div>
    </form>
  );
}

export default function AppDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { ideas, updateIdea } = useIdeas();
  const apps = ideas.filter((i) => i.publicada === true);
  const { tareas, bloques, addTarea, updateTarea, deleteTarea } = useTareas();
  const app = apps.find((a) => a.id === id);
  const appNombre = app?.titulo || app?.nombre || app?.name || '';
  const appBloqueIds = bloques.filter(b => b.nombre === appNombre).map(b => b.id);
  const tasks = tareas.filter(t => appBloqueIds.includes(t.bloque_id) || t.titulo?.includes(appNombre));
  const { keywords, addKeyword, deleteKeyword } = useAsoTracker(id);
  const { versions, addVersion, deleteVersion } = useVersionLog(id);
  const { postmortem, savePostmortem } = useAppPostmortems(id);

  // Métricas: últimos 30 días
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const { metrics, loading: metricsLoading, createMetric } = useMetrics(
    id,
    thirtyDaysAgo.toISOString().split('T')[0],
    new Date().toISOString().split('T')[0]
  );

  const { snapshots, createSnapshot } = useAppMetricsSnapshots(id);
  const [activeTab, setActiveTab] = useState('produccion');
  const [isMetricsFormOpen, setIsMetricsFormOpen] = useState(false);
  const [isMetricsSaving, setIsMetricsSaving] = useState(false);
  const [isAsoFormOpen, setIsAsoFormOpen] = useState(false);
  const [isVersionFormOpen, setIsVersionFormOpen] = useState(false);
  const [isPostMortemModalOpen, setIsPostMortemModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // Tab Info state
  const [infoForm, setInfoForm] = useState({ package: '', admob_url: '', play_console_url: '', canva_logo_url: '', canva_screenshots_url: '' });

  useEffect(() => {
    if (app) {
      setInfoForm({
        package: app.package || '',
        admob_url: app.admob_url || '',
        play_console_url: app.play_console_url || '',
        canva_logo_url: app.canva_logo_url || '',
        canva_screenshots_url: app.canva_screenshots_url || '',
      });
    }
  }, [app?.id]);
  const [isInfoSaving, setIsInfoSaving] = useState(false);

  // Tab Métricas — Stats generales
  const [statsForm, setStatsForm] = useState({
    installs: '',
    rating: '',
    reviews: '',
    revenue_mes: '',
    crashes: '',
  });
  const [isStatsSaving, setIsStatsSaving] = useState(false);

  // Snapshot form
  const emptySnapshot = {
    installs_totales: '', installs_activos: '', rating: '', reviews_totales: '',
    crashes_semana: '', anr_rate: '', revenue_mes: '', ecpm_promedio: '',
    dau: '', retencion_dia1: '', retencion_dia7: '', top_pais: '',
  };
  const [snapshotForm, setSnapshotForm] = useState(emptySnapshot);
  const [isSnapshotSaving, setIsSnapshotSaving] = useState(false);

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
      await addTarea({
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
      <div style={{ backgroundColor: 'var(--bg)', minHeight: '100%', padding: '24px' }}>
        <div style={{ color: 'var(--text-muted)' }}>App no encontrada</div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'var(--bg)', minHeight: '100%', padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <button
          onClick={() => navigate('/apps')}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--primary)',
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
          <AppIcon nombre={app.titulo || app.nombre || app.name} icono_url={app.icono_url} size={48} />
          <div>
            <h1 style={{ color: 'var(--text)', margin: '0 0 6px 0', fontSize: '24px', fontWeight: '600' }}>
              {app.titulo || app.nombre || app.name}
            </h1>
            <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '10px' }}>
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
      <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid var(--border)', marginBottom: '24px' }}>
        {[
          { key: 'produccion', label: 'Producción' },
          { key: 'metricas', label: 'Métricas' },
          { key: 'aso', label: 'ASO' },
          { key: 'versiones', label: 'Versiones' },
          { key: 'info', label: 'Info' },
          { key: 'postmortem', label: 'PostMortem' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            style={{
              background: 'none',
              border: 'none',
              color: activeTab === key ? '#00E5A0' : '#999',
              cursor: 'pointer',
              padding: '12px 0',
              fontSize: '14px',
              fontWeight: '500',
              borderBottom: activeTab === key ? '2px solid #00E5A0' : 'none',
              marginBottom: '-1px',
              transition: 'color 0.2s',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'produccion' && (
        <div>
          <h2 style={{ color: 'var(--text)', fontSize: '16px', fontWeight: '600', marginBottom: '16px', marginTop: 0 }}>
            Tareas
          </h2>
          <KanbanBoard tasks={tasks} onUpdateTask={updateTarea} onDeleteTask={deleteTarea} onAddTask={handleAddTask} />
        </div>
      )}

      {activeTab === 'metricas' && (
        <div>
          {/* Play Console Quick Links + Snapshot Form */}
          {(() => {
            const match = app.play_console_url?.match(/\/developers\/(\d+)\/app\/(\d+)/);
            const devId = match?.[1];
            const appId = match?.[2];
            const base = devId && appId ? `https://play.google.com/console/u/0/developers/${devId}/app/${appId}` : null;
            const links = base ? [
              { label: 'Installs', url: `${base}/statistics`, icon: '📥' },
              { label: 'Ratings & Reviews', url: `${base}/ratings`, icon: '⭐' },
              { label: 'Crashes & ANR', url: `${base}/crashes`, icon: '💥' },
              { label: 'Revenue', url: `${base}/monetization-overview`, icon: '💰' },
              { label: 'Retención', url: `${base}/retention`, icon: '📊' },
              { label: 'Countries', url: `${base}/statistics?metrics=STORE_LISTING_CONVERSION_RATE&dimension=COUNTRY`, icon: '🌍' },
            ] : null;

            const snapshotFields = [
              { key: 'installs_totales', label: 'Installs totales', type: 'number' },
              { key: 'installs_activos', label: 'Installs activos', type: 'number' },
              { key: 'rating', label: 'Rating (1-5)', type: 'number', min: 1, max: 5, step: 0.1 },
              { key: 'reviews_totales', label: 'Reviews totales', type: 'number' },
              { key: 'crashes_semana', label: 'Crashes última semana', type: 'number' },
              { key: 'anr_rate', label: 'ANR rate (%)', type: 'number', step: 0.01 },
              { key: 'revenue_mes', label: 'Revenue mes (USD)', type: 'number', step: 0.01 },
              { key: 'ecpm_promedio', label: 'eCPM promedio (USD)', type: 'number', step: 0.01 },
              { key: 'dau', label: 'DAU', type: 'number' },
              { key: 'retencion_dia1', label: 'Retención día 1 (%)', type: 'number', step: 0.1 },
              { key: 'retencion_dia7', label: 'Retención día 7 (%)', type: 'number', step: 0.1 },
              { key: 'top_pais', label: 'Top país', type: 'text' },
            ];

            return (
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '20px' }}>
                  {/* Quick Links */}
                  <div style={{ flex: '1 1 320px', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '16px' }}>
                    <div style={{ color: 'var(--text)', fontSize: '14px', fontWeight: '600', marginBottom: '14px' }}>Google Play Console</div>
                    {links ? (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                        {links.map(({ label, url, icon }) => (
                          <a
                            key={label}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                              padding: '12px 8px', backgroundColor: 'var(--bg)', border: '1px solid var(--border)',
                              borderRadius: '8px', textDecoration: 'none', color: 'var(--text)',
                              fontSize: '12px', textAlign: 'center', transition: 'border-color 0.15s',
                            }}
                          >
                            <span style={{ fontSize: '20px' }}>{icon}</span>
                            <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{label}</span>
                            <span style={{ color: 'var(--primary)', fontSize: '11px', fontWeight: '600' }}>Abrir →</span>
                          </a>
                        ))}
                      </div>
                    ) : (
                      <div style={{ color: 'var(--text-muted)', fontSize: '13px', padding: '20px', textAlign: 'center', backgroundColor: 'var(--bg)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                        Agregá la Play Console URL en el tab Info
                      </div>
                    )}
                  </div>

                  {/* Snapshot Form */}
                  <div style={{ flex: '1 1 320px', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '16px' }}>
                    <div style={{ color: 'var(--text)', fontSize: '14px', fontWeight: '600', marginBottom: '14px' }}>Cargar snapshot</div>
                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      try {
                        setIsSnapshotSaving(true);
                        const payload = {};
                        snapshotFields.forEach(({ key, type }) => {
                          if (snapshotForm[key] !== '') {
                            payload[key] = type === 'number' ? Number(snapshotForm[key]) : snapshotForm[key];
                          }
                        });
                        await createSnapshot(payload);
                        setSnapshotForm(emptySnapshot);
                        setToast({ message: 'Snapshot guardado', type: 'success' });
                      } catch {
                        setToast({ message: 'Error al guardar snapshot', type: 'error' });
                      } finally {
                        setIsSnapshotSaving(false);
                      }
                    }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '12px' }}>
                        {snapshotFields.map(({ key, label, type, ...rest }) => (
                          <div key={key}>
                            <div style={{ color: 'var(--text-muted)', fontSize: '10px', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
                            <input
                              type={type}
                              placeholder="—"
                              value={snapshotForm[key]}
                              onChange={(e) => setSnapshotForm(s => ({ ...s, [key]: e.target.value }))}
                              style={{ width: '100%', boxSizing: 'border-box', backgroundColor: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '6px', padding: '7px', color: 'var(--text)', fontSize: '12px' }}
                              {...rest}
                            />
                          </div>
                        ))}
                      </div>
                      <button
                        type="submit"
                        disabled={isSnapshotSaving}
                        style={{ width: '100%', padding: '9px', background: 'var(--primary)', border: 'none', color: 'var(--bg)', borderRadius: '7px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', opacity: isSnapshotSaving ? 0.6 : 1 }}
                      >
                        {isSnapshotSaving ? 'Guardando...' : 'Guardar snapshot'}
                      </button>
                    </form>
                  </div>
                </div>

                {/* Snapshot History */}
                {snapshots.length > 0 && (
                  <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '16px', marginBottom: '8px', overflowX: 'auto' }}>
                    <div style={{ color: 'var(--text)', fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>Historial de snapshots</div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)' }}>
                          {['Fecha', 'Installs activos', 'Rating', 'Revenue mes', 'DAU'].map(h => (
                            <th key={h} style={{ padding: '8px 12px', textAlign: 'center', color: 'var(--text-muted)', fontWeight: '500' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {snapshots.map((s, i) => (
                          <tr key={s.id} style={{ backgroundColor: i % 2 === 0 ? 'var(--bg)' : 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text-muted)' }}>{new Date(s.created_at).toLocaleDateString('es-ES')}</td>
                            <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)', fontFamily: 'var(--font-mono)', fontWeight: '600' }}>{s.installs_activos?.toLocaleString() ?? '—'}</td>
                            <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--primary)', fontFamily: 'var(--font-mono)', fontWeight: '600' }}>{s.rating ?? '—'}</td>
                            <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)', fontFamily: 'var(--font-mono)', fontWeight: '600' }}>{s.revenue_mes != null ? `$${s.revenue_mes}` : '—'}</td>
                            <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)', fontFamily: 'var(--font-mono)', fontWeight: '600' }}>{s.dau?.toLocaleString() ?? '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Header con botón */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ color: 'var(--text)', fontSize: '16px', fontWeight: '600', margin: 0 }}>
              Métricas
            </h2>
            <button
              onClick={() => setIsMetricsFormOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                background: 'var(--primary)',
                border: 'none',
                color: 'var(--bg)',
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
            <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0' }}>
              Cargando métricas...
            </div>
          ) : (
            <>
              {/* Revenue Chart */}
              <div style={{ marginBottom: '24px', backgroundColor: 'var(--surface)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                <h3 style={{ color: 'var(--text)', fontSize: '14px', fontWeight: '600', margin: '0 0 16px 0' }}>
                  Ingresos (últimos 30 días)
                </h3>
                <RevenueChart data={metrics} height={250} />
              </div>

              {/* DAU Chart */}
              <div style={{ marginBottom: '24px', backgroundColor: 'var(--surface)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                <h3 style={{ color: 'var(--text)', fontSize: '14px', fontWeight: '600', margin: '0 0 16px 0' }}>
                  DAU (últimos 30 días)
                </h3>
                <DAUChart data={metrics} height={250} />
              </div>

              {/* Metrics Table */}
              <div style={{ backgroundColor: 'var(--surface)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                <h3 style={{ color: 'var(--text)', fontSize: '14px', fontWeight: '600', margin: '0 0 16px 0' }}>
                  Detalle
                </h3>
                <MetricsTable metrics={metrics} />
              </div>
            </>
          )}

          {/* Stats generales */}
          {(() => {
            const lastStats = [...metrics].reverse().find(m =>
              m.installs != null || m.rating != null || m.reviews != null || m.revenue_mes != null || m.crashes != null
            );
            return (
              <div style={{ marginTop: '24px', backgroundColor: 'var(--surface)', padding: '20px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                <h3 style={{ color: 'var(--text)', fontSize: '14px', fontWeight: '600', margin: '0 0 16px 0' }}>Stats generales</h3>
                {lastStats && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '20px' }}>
                    {[
                      { label: 'Installs', value: lastStats.installs?.toLocaleString() ?? '—' },
                      { label: 'Rating', value: lastStats.rating ?? '—' },
                      { label: 'Reviews', value: lastStats.reviews?.toLocaleString() ?? '—' },
                      { label: 'Revenue mes', value: lastStats.revenue_mes != null ? `$${lastStats.revenue_mes}` : '—' },
                      { label: 'Crashes (sem)', value: lastStats.crashes ?? '—' },
                    ].map(({ label, value }) => (
                      <div key={label} style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                        <div style={{ color: 'var(--text)', fontFamily: 'var(--font-mono)', fontWeight: '700', fontSize: '18px', marginBottom: '4px' }}>{value}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
                      </div>
                    ))}
                  </div>
                )}
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  if (!statsForm.installs && !statsForm.rating && !statsForm.reviews && !statsForm.revenue_mes && !statsForm.crashes) return;
                  try {
                    setIsStatsSaving(true);
                    await createMetric({
                      fecha: new Date().toISOString().split('T')[0],
                      ...(statsForm.installs !== '' && { installs: Number(statsForm.installs) }),
                      ...(statsForm.rating !== '' && { rating: Number(statsForm.rating) }),
                      ...(statsForm.reviews !== '' && { reviews: Number(statsForm.reviews) }),
                      ...(statsForm.revenue_mes !== '' && { revenue_mes: Number(statsForm.revenue_mes) }),
                      ...(statsForm.crashes !== '' && { crashes: Number(statsForm.crashes) }),
                    });
                    setStatsForm({ installs: '', rating: '', reviews: '', revenue_mes: '', crashes: '' });
                    setToast({ message: 'Stats guardados', type: 'success' });
                  } catch {
                    setToast({ message: 'Error al guardar stats', type: 'error' });
                  } finally {
                    setIsStatsSaving(false);
                  }
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', marginBottom: '12px' }}>
                    {[
                      { key: 'installs', label: 'Installs totales', min: 0 },
                      { key: 'rating', label: 'Rating (1-5)', min: 1, max: 5, step: 0.1 },
                      { key: 'reviews', label: 'Reviews totales', min: 0 },
                      { key: 'revenue_mes', label: 'Revenue mes (USD)', min: 0, step: 0.01 },
                      { key: 'crashes', label: 'Crashes semana', min: 0 },
                    ].map(({ key, label, ...props }) => (
                      <div key={key}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
                        <input
                          type="number"
                          placeholder="—"
                          value={statsForm[key]}
                          onChange={(e) => setStatsForm(s => ({ ...s, [key]: e.target.value }))}
                          style={{ width: '100%', backgroundColor: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '6px', padding: '8px', color: 'var(--text)', fontSize: '13px', boxSizing: 'border-box' }}
                          {...props}
                        />
                      </div>
                    ))}
                  </div>
                  <button
                    type="submit"
                    disabled={isStatsSaving}
                    style={{ padding: '9px 20px', background: 'var(--primary)', border: 'none', color: 'var(--bg)', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', opacity: isStatsSaving ? 0.6 : 1 }}
                  >
                    {isStatsSaving ? 'Guardando...' : 'Guardar stats'}
                  </button>
                </form>
              </div>
            );
          })()}

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
            <h2 style={{ color: 'var(--text)', fontSize: '16px', fontWeight: '600', margin: 0 }}>
              ASO Tracker
            </h2>
            <button
              onClick={() => setIsAsoFormOpen(!isAsoFormOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                background: 'var(--primary)',
                border: 'none',
                color: 'var(--bg)',
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
            <div style={{ backgroundColor: 'var(--surface)', padding: '40px', borderRadius: '10px', textAlign: 'center', color: 'var(--text-subtle)' }}>
              No hay keywords trackeadas todavía
            </div>
          ) : (
            <div style={{ backgroundColor: 'var(--surface)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border)', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '12px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: '500' }}>Keyword</th>
                    <th style={{ padding: '12px', textAlign: 'center', color: 'var(--text-muted)', fontWeight: '500' }}>Posición</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: '500' }}>Fecha</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: '500' }}>Notas</th>
                    <th style={{ padding: '12px', textAlign: 'center', color: 'var(--text-muted)', fontWeight: '500' }}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {keywords.map((kw, idx) => {
                    const bgColor = idx % 2 === 0 ? 'var(--bg)' : 'var(--surface-2)';
                    const posColor = kw.posicion <= 10 ? '#00E5A0' : kw.posicion <= 30 ? '#FFB400' : '#666';
                    return (
                      <tr key={kw.id} style={{ backgroundColor: bgColor, borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '12px', color: 'var(--text)' }}>{kw.keyword}</td>
                        <td style={{ padding: '12px', textAlign: 'center', color: posColor, fontWeight: '600' }}>{kw.posicion}</td>
                        <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{new Date(kw.fecha).toLocaleDateString('es-ES')}</td>
                        <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{kw.notas || '-'}</td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <button
                            onClick={() => {
                              deleteKeyword(kw.id);
                              setToast({ message: 'Keyword eliminado', type: 'success' });
                            }}
                            style={{ background: 'none', border: 'none', color: 'var(--nz-danger)', cursor: 'pointer' }}
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
            <h2 style={{ color: 'var(--text)', fontSize: '16px', fontWeight: '600', margin: 0 }}>
              Version Log
            </h2>
            <button
              onClick={() => setIsVersionFormOpen(!isVersionFormOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                background: 'var(--primary)',
                border: 'none',
                color: 'var(--bg)',
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
            <div style={{ backgroundColor: 'var(--surface)', padding: '40px', borderRadius: '10px', textAlign: 'center', color: 'var(--text-subtle)' }}>
              No hay versiones registradas
            </div>
          ) : (
            <div>
              {versions.map((v, idx) => (
                <div
                  key={v.id}
                  style={{
                    backgroundColor: idx % 2 === 0 ? 'var(--bg)' : 'var(--surface-2)',
                    border: '1px solid var(--border)',
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
                        color: 'var(--text)',
                        fontSize: '12px',
                        fontWeight: '600',
                        padding: '4px 8px',
                        borderRadius: '4px',
                      }}>
                        v{v.version}
                      </span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                        {new Date(v.fecha).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {v.cambios}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      deleteVersion(v.id);
                      setToast({ message: 'Versión eliminada', type: 'success' });
                    }}
                    style={{ background: 'none', border: 'none', color: 'var(--nz-danger)', cursor: 'pointer', flexShrink: 0 }}
                  >
                    <IconTrash />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: INFO */}
      {activeTab === 'info' && (
        <div>
          <h2 style={{ color: 'var(--text)', fontSize: '16px', fontWeight: '600', margin: '0 0 24px 0' }}>Info</h2>
          <form onSubmit={async (e) => {
            e.preventDefault();
            try {
              setIsInfoSaving(true);
              await updateIdea(id, {
                package: infoForm.package || null,
                admob_url: infoForm.admob_url || null,
                play_console_url: infoForm.play_console_url || null,
                canva_logo_url: infoForm.canva_logo_url || null,
                canva_screenshots_url: infoForm.canva_screenshots_url || null,
              });
              setToast({ message: 'Links guardados', type: 'success' });
            } catch {
              setToast({ message: 'Error al guardar', type: 'error' });
            } finally {
              setIsInfoSaving(false);
            }
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
              <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>Package Name</div>
                <input
                  type="text"
                  placeholder="com.nztech.dolar"
                  value={infoForm.package}
                  onChange={(e) => setInfoForm(f => ({ ...f, package: e.target.value }))}
                  style={{ width: '100%', boxSizing: 'border-box', backgroundColor: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '6px', padding: '8px 12px', color: 'var(--text)', fontSize: '13px' }}
                />
              </div>
              {[
                { key: 'admob_url', label: 'AdMob URL' },
                { key: 'play_console_url', label: 'Play Console URL' },
                { key: 'canva_logo_url', label: 'Canva Logo URL' },
                { key: 'canva_screenshots_url', label: 'Canva Screenshots URL' },
              ].map(({ key, label }) => (
                <div key={key} style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>{label}</div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="text"
                      placeholder="https://..."
                      value={infoForm[key]}
                      onChange={(e) => setInfoForm(f => ({ ...f, [key]: e.target.value }))}
                      style={{ flex: 1, backgroundColor: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '6px', padding: '8px 12px', color: 'var(--text)', fontSize: '13px' }}
                    />
                    <button
                      type="button"
                      onClick={() => infoForm[key] && window.open(infoForm[key], '_blank')}
                      disabled={!infoForm[key]}
                      style={{
                        padding: '8px 14px',
                        background: infoForm[key] ? 'rgba(0,229,160,0.12)' : 'transparent',
                        border: '1px solid var(--border)',
                        color: infoForm[key] ? 'var(--primary)' : 'var(--text-muted)',
                        borderRadius: '6px',
                        cursor: infoForm[key] ? 'pointer' : 'not-allowed',
                        fontSize: '13px',
                        fontWeight: '500',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Abrir →
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button
              type="submit"
              disabled={isInfoSaving}
              style={{ padding: '10px 24px', background: 'var(--primary)', border: 'none', color: 'var(--bg)', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', opacity: isInfoSaving ? 0.6 : 1 }}
            >
              {isInfoSaving ? 'Guardando...' : 'Guardar'}
            </button>
          </form>
        </div>
      )}

      {/* TAB: POSTMORTEM */}
      {activeTab === 'postmortem' && (
        <div>
          <h2 style={{ color: 'var(--text)', fontSize: '16px', fontWeight: '600', margin: '0 0 24px 0' }}>PostMortem</h2>
          {!postmortem ? (
            <div style={{ backgroundColor: 'var(--surface)', padding: '40px', borderRadius: '10px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <div style={{ marginBottom: '16px' }}>Esta app aún no tiene postmortem registrado</div>
              <button
                onClick={() => setIsPostMortemModalOpen(true)}
                style={{
                  padding: '10px 20px',
                  background: 'var(--primary)',
                  border: 'none',
                  color: 'var(--bg)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                }}
              >
                Registrar PostMortem
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Score */}
              <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: '52px', fontWeight: '700', lineHeight: 1,
                  color: postmortem.puntaje >= 8 ? '#00E5A0' : postmortem.puntaje >= 5 ? '#FFB400' : '#FF5C5C',
                }}>
                  {postmortem.puntaje}
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Puntaje general</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>sobre 10</div>
                </div>
              </div>

              {/* Respuestas */}
              {[
                { label: '¿Qué fue lo más difícil de construir esta app?', value: postmortem.dificultad },
                { label: '¿Qué salió mejor de lo esperado?', value: postmortem.exito },
                { label: '¿Qué harías diferente si empezaras de cero?', value: postmortem.diferente },
              ].map(({ label, value }) => (
                <div key={label} style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '16px' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>{label}</div>
                  <div style={{ color: 'var(--text)', fontSize: '13px', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{value}</div>
                </div>
              ))}

              {/* Tiempos */}
              {postmortem.tiempos && (
                <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '16px' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>Tiempos reales</div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border)' }}>
                        {['Diseño', 'Desarrollo', 'Testing', 'Deploy'].map(h => (
                          <th key={h} style={{ padding: '8px 12px', textAlign: 'center', color: 'var(--text-muted)', fontWeight: '500' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        {[postmortem.tiempos.disenio, postmortem.tiempos.desarrollo, postmortem.tiempos.testing, postmortem.tiempos.deploy].map((val, i) => (
                          <td key={i} style={{ padding: '12px', textAlign: 'center', color: 'var(--text)', fontFamily: 'var(--font-mono)', fontWeight: '600', fontSize: '15px' }}>
                            {val}<span style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: '400' }}>h</span>
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* Insight Claude */}
              {postmortem.insight_claude && (
                <div style={{ backgroundColor: 'rgba(0, 229, 160, 0.06)', border: '1px solid rgba(0, 229, 160, 0.25)', borderRadius: '10px', padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#00E5A0"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                    <span style={{ color: '#00E5A0', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Insight de Claude</span>
                  </div>
                  <div style={{ color: 'var(--text)', fontSize: '13px', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>{postmortem.insight_claude}</div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* PostMortem Modal */}
      {isPostMortemModalOpen && (
        <PostMortemModal
          idea={app}
          onClose={() => setIsPostMortemModalOpen(false)}
          onComplete={async (data) => {
            try {
              await savePostmortem(data);
              setIsPostMortemModalOpen(false);
              setToast({ message: 'PostMortem registrado', type: 'success' });
            } catch (err) {
              setToast({ message: 'Error al guardar postmortem', type: 'error' });
            }
          }}
        />
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
