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
import { useAppExperimentos } from '../hooks/useAppExperimentos';

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
  const { experimentos, createExperimento, updateExperimento, deleteExperimento } = useAppExperimentos(id);
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
  const [isCsvProcessing, setIsCsvProcessing] = useState(false);

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

  // --- Estrategia state ---
  const [planAccion, setPlanAccion] = useState(null);
  const [planLoading, setPlanLoading] = useState(false);

  const [asoMiApp, setAsoMiApp] = useState({ titulo: '', desc_corta: '', desc_larga: '', keywords: '', screenshots: '', video: false });
  const [asoComp, setAsoComp] = useState({ nombre: '', package: '', titulo: '', desc_corta: '', desc_larga: '', keywords: '', screenshots: '', video: false });
  const [asoAnalisis, setAsoAnalisis] = useState(null);
  const [asoAnalisisComp, setAsoAnalisisComp] = useState(null);
  const [asoLoading, setAsoLoading] = useState(false);

  const [abElemento, setAbElemento] = useState('Título');
  const [abVarianteA, setAbVarianteA] = useState('');
  const [abContexto, setAbContexto] = useState('');
  const [abResult, setAbResult] = useState(null);
  const [abLoading, setAbLoading] = useState(false);
  const [abSaving, setAbSaving] = useState(false);

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
          { key: 'estrategia', label: 'Estrategia' },
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
              { label: 'Usuarios activos', desc: 'Installs y usuarios activos', url: `${base}/statistics`, icon: '📥' },
              { label: 'Adquisición', desc: 'De dónde vienen los installs', url: `${base}/reporting/acquisition/overview`, icon: '🎯' },
              { label: 'Grow Overview', desc: 'Conversión y ficha de Play Store', url: `${base}/grow-overview`, icon: '📈' },
              { label: 'Monitor', desc: 'Crashes, ANR y vitals', url: `${base}/monitor`, icon: '💥' },
              { label: 'Ratings & Reviews', desc: 'Rating y reseñas de usuarios', url: `${base}/ratings`, icon: '⭐' },
              { label: 'Monetización', desc: 'Revenue y AdMob', url: `${base}/monetization/monetization-overview`, icon: '💰' },
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
                        {links.map(({ label, desc, url, icon }) => (
                          <a
                            key={label}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                              padding: '12px 8px', backgroundColor: 'var(--bg)', border: '1px solid var(--border)',
                              borderRadius: '8px', textDecoration: 'none', color: 'var(--text)',
                              fontSize: '12px', textAlign: 'center', transition: 'border-color 0.15s',
                            }}
                          >
                            <span style={{ fontSize: '20px' }}>{icon}</span>
                            <span style={{ color: 'var(--text)', fontSize: '11px', fontWeight: '600' }}>{label}</span>
                            <span style={{ color: 'var(--text-muted)', fontSize: '10px', lineHeight: '1.3' }}>{desc}</span>
                            <span style={{ color: 'var(--primary)', fontSize: '11px', fontWeight: '600', marginTop: '2px' }}>Abrir →</span>
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                      <div style={{ color: 'var(--text)', fontSize: '14px', fontWeight: '600' }}>Cargar snapshot</div>
                      <label style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '6px 12px', backgroundColor: 'rgba(0,229,160,0.1)', border: '1px solid rgba(0,229,160,0.3)',
                        borderRadius: '6px', cursor: isCsvProcessing ? 'not-allowed' : 'pointer',
                        color: 'var(--primary)', fontSize: '12px', fontWeight: '600',
                        opacity: isCsvProcessing ? 0.6 : 1,
                      }}>
                        {isCsvProcessing ? 'Procesando...' : '📂 Importar CSV'}
                        <input
                          type="file"
                          accept=".csv"
                          style={{ display: 'none' }}
                          disabled={isCsvProcessing}
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            e.target.value = '';
                            setIsCsvProcessing(true);
                            try {
                              const csvText = await new Promise((resolve, reject) => {
                                const reader = new FileReader();
                                reader.onload = (ev) => resolve(ev.target.result);
                                reader.onerror = reject;
                                reader.readAsText(file);
                              });
                              const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
                              const res = await fetch('https://api.anthropic.com/v1/messages', {
                                method: 'POST',
                                headers: {
                                  'x-api-key': apiKey,
                                  'anthropic-version': '2023-06-01',
                                  'content-type': 'application/json',
                                  'anthropic-dangerous-direct-browser-access': 'true',
                                },
                                body: JSON.stringify({
                                  model: 'claude-haiku-4-5-20251001',
                                  max_tokens: 512,
                                  messages: [{
                                    role: 'user',
                                    content: `Analizá este CSV exportado de Google Play Console y extraé los datos más recientes disponibles.\n\nCSV:\n${csvText}\n\nDevolvé ÚNICAMENTE este JSON sin markdown:\n{"installs_activos": number | null, "installs_totales": number | null, "dau": number | null, "top_pais": string | null, "fecha": "YYYY-MM-DD"}\n\nSi el CSV tiene datos de retención, rating, revenue o crashes, incluílos también con sus keys correspondientes: retencion_dia1, retencion_dia7, rating, reviews_totales, crashes_semana, anr_rate, revenue_mes, ecpm_promedio.\nSolo incluí los campos que realmente estén en el CSV.`,
                                  }],
                                }),
                              });
                              const data = await res.json();
                              const raw = data.content?.[0]?.text?.trim() ?? '{}';
                              const parsed = JSON.parse(raw);
                              setSnapshotForm(s => {
                                const next = { ...s };
                                Object.entries(parsed).forEach(([k, v]) => {
                                  if (k in next && v != null) next[k] = String(v);
                                });
                                return next;
                              });
                              setToast({ message: 'CSV procesado — revisá los datos y guardá', type: 'success' });
                            } catch {
                              setToast({ message: 'Error al procesar CSV', type: 'error' });
                            } finally {
                              setIsCsvProcessing(false);
                            }
                          }}
                        />
                      </label>
                    </div>
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

      {/* TAB: ESTRATEGIA */}
      {activeTab === 'estrategia' && (() => {
        const callClaude = async (prompt) => {
          const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
          const res = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'x-api-key': apiKey,
              'anthropic-version': '2023-06-01',
              'content-type': 'application/json',
              'anthropic-dangerous-direct-browser-access': 'true',
            },
            body: JSON.stringify({
              model: 'claude-haiku-4-5-20251001',
              max_tokens: 2000,
              messages: [{ role: 'user', content: prompt }],
            }),
          });
          const data = await res.json();
          if (data.error) throw new Error(data.error.message);
          const raw = data.content?.[0]?.text?.trim() ?? '{}';
          const clean = raw.replace(/```json|```/g, '').trim();
          return JSON.parse(clean);
        };

        const latestSnapshot = snapshots[0];

        const handleGenerarPlan = async () => {
          if (!latestSnapshot) return;
          setPlanLoading(true);
          try {
            const prompt = `Sos un experto en growth de apps móviles Android. Analizá estas métricas y generá un plan de acción priorizado.

App: ${appNombre}
Métricas más recientes:
- Installs activos: ${latestSnapshot.installs_activos ?? 'N/A'}
- Installs totales: ${latestSnapshot.installs_totales ?? 'N/A'}
- Rating: ${latestSnapshot.rating ?? 'N/A'} (${latestSnapshot.reviews_totales ?? 'N/A'} reviews)
- DAU: ${latestSnapshot.dau ?? 'N/A'}
- Retención día 1: ${latestSnapshot.retencion_dia1 ?? 'N/A'}%
- Retención día 7: ${latestSnapshot.retencion_dia7 ?? 'N/A'}%
- Revenue mes: $${latestSnapshot.revenue_mes ?? 'N/A'}
- Crashes última semana: ${latestSnapshot.crashes_semana ?? 'N/A'}
- Top país: ${latestSnapshot.top_pais ?? 'N/A'}

Devolvé ÚNICAMENTE este JSON sin markdown:
{"resumen":"2-3 oraciones sobre el estado actual de la app","acciones":[{"prioridad":"urgente|esta_semana|proximo_mes","accion":"qué hacer exactamente","razon":"por qué es importante","metrica_objetivo":"qué número querés mover y a cuánto"}]}`;
            const result = await callClaude(prompt);
            setPlanAccion(result);
            // persist in ideas.plan_accion
            await updateIdea(id, { plan_accion: result });
            setToast({ message: 'Plan generado y guardado', type: 'success' });
          } catch {
            setToast({ message: 'Error al generar plan', type: 'error' });
          } finally {
            setPlanLoading(false);
          }
        };

        const handleAnalizarAso = async (tipo) => {
          setAsoLoading(true);
          try {
            const datos = tipo === 'mi_app' ? asoMiApp : asoComp;
            const nombre = tipo === 'mi_app' ? appNombre : (asoComp.nombre || 'Competidor');
            const prompt = `Sos un experto en ASO para Google Play. Analizá esta ficha y devolvé un score detallado.

App analizada: ${nombre}
Título: ${datos.titulo}
Descripción corta: ${datos.desc_corta}
Descripción larga: ${datos.desc_larga}
Keywords objetivo: ${datos.keywords}
Screenshots: ${datos.screenshots}
Video: ${datos.video ? 'sí' : 'no'}

Devolvé ÚNICAMENTE este JSON sin markdown:
{"score_total":0,"categorias":[{"nombre":"Título","score":0,"observacion":"","sugerencia":""},{"nombre":"Descripción corta","score":0,"observacion":"","sugerencia":""},{"nombre":"Descripción larga","score":0,"observacion":"","sugerencia":""},{"nombre":"Keywords","score":0,"observacion":"","sugerencia":""},{"nombre":"Assets visuales","score":0,"observacion":"","sugerencia":""}],"recomendacion_principal":""}`;
            const result = await callClaude(prompt);
            if (tipo === 'mi_app') setAsoAnalisis(result);
            else setAsoAnalisisComp(result);
            setToast({ message: 'Análisis completado', type: 'success' });
          } catch {
            setToast({ message: 'Error al analizar ficha', type: 'error' });
          } finally {
            setAsoLoading(false);
          }
        };

        const handleGenerarAB = async () => {
          setAbLoading(true);
          try {
            const prompt = `Sos un experto en CRO para apps móviles. Generá un test A/B para mejorar la conversión en Play Store.

App: ${appNombre}
Elemento a testear: ${abElemento}
Variante A: ${abVarianteA}
Contexto adicional: ${abContexto}

Devolvé ÚNICAMENTE este JSON sin markdown:
{"variante_a":{"descripcion":"","hipotesis":""},"variante_b":{"descripcion":"","hipotesis":""},"metrica_principal":"","duracion_sugerida":"","como_medir":""}`;
            const result = await callClaude(prompt);
            setAbResult(result);
          } catch {
            setToast({ message: 'Error al generar test A/B', type: 'error' });
          } finally {
            setAbLoading(false);
          }
        };

        const handleGuardarExp = async () => {
          if (!abResult) return;
          setAbSaving(true);
          try {
            await createExperimento({
              elemento: abElemento,
              variante_a: abResult.variante_a?.descripcion,
              variante_b: abResult.variante_b?.descripcion,
              hipotesis: abResult.variante_b?.hipotesis,
              metrica: abResult.metrica_principal,
              duracion: abResult.duracion_sugerida,
              resultado: 'en_curso',
            });
            setToast({ message: 'Experimento guardado', type: 'success' });
            setAbResult(null);
            setAbVarianteA('');
            setAbContexto('');
          } catch {
            setToast({ message: 'Error al guardar experimento', type: 'error' });
          } finally {
            setAbSaving(false);
          }
        };

        const prioridadConfig = {
          urgente: { icon: '🔴', label: 'Urgente', color: '#FF5C5C' },
          esta_semana: { icon: '🟡', label: 'Esta semana', color: '#FFB400' },
          proximo_mes: { icon: '🟢', label: 'Próximo mes', color: '#00E5A0' },
        };

        const scoreColor = (s) => s >= 75 ? '#00E5A0' : s >= 50 ? '#FFB400' : '#FF5C5C';

        const AsoScoreCard = ({ analisis, titulo }) => {
          if (!analisis) return null;
          return (
            <div style={{ flex: '1 1 280px', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ color: 'var(--text)', fontSize: '13px', fontWeight: '600' }}>{titulo}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '28px', fontWeight: '700', color: scoreColor(analisis.score_total) }}>{analisis.score_total}</div>
              </div>
              {analisis.categorias?.map(c => (
                <div key={c.nombre} style={{ marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{c.nombre}</span>
                    <span style={{ color: scoreColor(c.score), fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: '600' }}>{c.score}</span>
                  </div>
                  <div style={{ height: '4px', backgroundColor: 'var(--border)', borderRadius: '2px' }}>
                    <div style={{ height: '100%', width: `${c.score}%`, backgroundColor: scoreColor(c.score), borderRadius: '2px' }} />
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '3px' }}>{c.observacion}</div>
                  {c.sugerencia && <div style={{ color: 'var(--primary)', fontSize: '11px', marginTop: '2px' }}>→ {c.sugerencia}</div>}
                </div>
              ))}
              {analisis.recomendacion_principal && (
                <div style={{ backgroundColor: 'rgba(0,229,160,0.08)', border: '1px solid rgba(0,229,160,0.2)', borderRadius: '7px', padding: '10px', marginTop: '10px', color: 'var(--text)', fontSize: '12px', lineHeight: '1.5' }}>
                  <span style={{ color: 'var(--primary)', fontWeight: '600' }}>Prioridad: </span>{analisis.recomendacion_principal}
                </div>
              )}
            </div>
          );
        };

        const inputStyle = { width: '100%', boxSizing: 'border-box', backgroundColor: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '6px', padding: '8px 10px', color: 'var(--text)', fontSize: '12px' };
        const labelStyle = { color: 'var(--text-muted)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' };
        const sectionStyle = { backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '20px', marginBottom: '20px' };

        return (
          <div>
            {/* SECCIÓN 1: Plan de Acción IA */}
            <div style={sectionStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <div style={{ color: 'var(--text)', fontSize: '15px', fontWeight: '600' }}>Plan de Acción IA</div>
                  {!latestSnapshot && <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' }}>Necesitás un snapshot en Métricas para generar el plan</div>}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {(planAccion || app.plan_accion) && (
                    <button
                      onClick={handleGenerarPlan}
                      disabled={planLoading || !latestSnapshot}
                      style={{ padding: '8px 14px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)', borderRadius: '7px', cursor: 'pointer', fontSize: '12px', opacity: planLoading ? 0.6 : 1 }}
                    >
                      {planLoading ? 'Generando...' : 'Regenerar'}
                    </button>
                  )}
                  <button
                    onClick={handleGenerarPlan}
                    disabled={planLoading || !latestSnapshot}
                    style={{ padding: '8px 16px', background: 'var(--primary)', border: 'none', color: 'var(--bg)', borderRadius: '7px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', opacity: (planLoading || !latestSnapshot) ? 0.5 : 1 }}
                  >
                    {planLoading ? 'Generando...' : 'Generar Plan de Acción'}
                  </button>
                </div>
              </div>

              {(() => {
                const plan = planAccion || app.plan_accion;
                if (!plan) return null;
                const grouped = { urgente: [], esta_semana: [], proximo_mes: [] };
                plan.acciones?.forEach(a => { if (grouped[a.prioridad]) grouped[a.prioridad].push(a); });
                return (
                  <div>
                    {plan.resumen && (
                      <div style={{ backgroundColor: 'rgba(0,229,160,0.08)', border: '1px solid rgba(0,229,160,0.2)', borderRadius: '8px', padding: '14px', marginBottom: '16px', color: 'var(--text)', fontSize: '13px', lineHeight: '1.6' }}>
                        {plan.resumen}
                      </div>
                    )}
                    {Object.entries(grouped).map(([prio, acciones]) => {
                      if (!acciones.length) return null;
                      const cfg = prioridadConfig[prio];
                      return (
                        <div key={prio} style={{ marginBottom: '14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                            <span>{cfg.icon}</span>
                            <span style={{ color: cfg.color, fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{cfg.label}</span>
                          </div>
                          {acciones.map((a, i) => (
                            <details key={i} style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '7px', padding: '12px', marginBottom: '6px' }}>
                              <summary style={{ color: 'var(--text)', fontSize: '13px', fontWeight: '500', cursor: 'pointer', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span>{a.accion}</span>
                                <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>▼</span>
                              </summary>
                              <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}><span style={{ color: 'var(--text)', fontWeight: '500' }}>Por qué: </span>{a.razon}</div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}><span style={{ color: 'var(--primary)', fontWeight: '500' }}>Objetivo: </span>{a.metrica_objetivo}</div>
                              </div>
                            </details>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* SECCIÓN 2: Análisis de Ficha ASO */}
            <div style={sectionStyle}>
              <div style={{ color: 'var(--text)', fontSize: '15px', fontWeight: '600', marginBottom: '16px' }}>Análisis de Ficha ASO</div>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                {/* Mi App */}
                <div style={{ flex: '1 1 260px', backgroundColor: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', padding: '14px' }}>
                  <div style={{ color: 'var(--text)', fontSize: '13px', fontWeight: '600', marginBottom: '12px' }}>Mi App</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {[
                      { key: 'titulo', label: 'Título', max: 30 },
                      { key: 'desc_corta', label: 'Descripción corta', max: 80 },
                    ].map(({ key, label, max }) => (
                      <div key={key}>
                        <div style={labelStyle}>{label} <span style={{ color: asoMiApp[key].length > max ? '#FF5C5C' : 'var(--text-muted)' }}>{asoMiApp[key].length}/{max}</span></div>
                        <input type="text" value={asoMiApp[key]} onChange={e => setAsoMiApp(s => ({ ...s, [key]: e.target.value }))} style={inputStyle} maxLength={max + 20} />
                      </div>
                    ))}
                    <div>
                      <div style={labelStyle}>Descripción larga <span style={{ color: asoMiApp.desc_larga.length > 4000 ? '#FF5C5C' : 'var(--text-muted)' }}>{asoMiApp.desc_larga.length}/4000</span></div>
                      <textarea value={asoMiApp.desc_larga} onChange={e => setAsoMiApp(s => ({ ...s, desc_larga: e.target.value }))} style={{ ...inputStyle, minHeight: '70px', resize: 'vertical', fontFamily: 'inherit' }} />
                    </div>
                    <div>
                      <div style={labelStyle}>Keywords (separadas por coma)</div>
                      <input type="text" value={asoMiApp.keywords} onChange={e => setAsoMiApp(s => ({ ...s, keywords: e.target.value }))} style={inputStyle} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <div>
                        <div style={labelStyle}>Screenshots</div>
                        <input type="number" min="0" max="8" value={asoMiApp.screenshots} onChange={e => setAsoMiApp(s => ({ ...s, screenshots: e.target.value }))} style={inputStyle} />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingTop: '14px' }}>
                        <input type="checkbox" id="video-mi" checked={asoMiApp.video} onChange={e => setAsoMiApp(s => ({ ...s, video: e.target.checked }))} />
                        <label htmlFor="video-mi" style={{ color: 'var(--text-muted)', fontSize: '12px', cursor: 'pointer' }}>¿Tiene video?</label>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => handleAnalizarAso('mi_app')} disabled={asoLoading} style={{ marginTop: '12px', width: '100%', padding: '8px', background: 'var(--primary)', border: 'none', color: 'var(--bg)', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', opacity: asoLoading ? 0.6 : 1 }}>
                    {asoLoading ? 'Analizando...' : 'Analizar ficha'}
                  </button>
                </div>
                {/* Competidor */}
                <div style={{ flex: '1 1 260px', backgroundColor: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', padding: '14px' }}>
                  <div style={{ color: 'var(--text)', fontSize: '13px', fontWeight: '600', marginBottom: '12px' }}>Competidor</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {[
                      { key: 'nombre', label: 'Nombre del competidor' },
                      { key: 'package', label: 'Package name o URL' },
                    ].map(({ key, label }) => (
                      <div key={key}>
                        <div style={labelStyle}>{label}</div>
                        <input type="text" value={asoComp[key]} onChange={e => setAsoComp(s => ({ ...s, [key]: e.target.value }))} style={inputStyle} />
                      </div>
                    ))}
                    {[
                      { key: 'titulo', label: 'Título', max: 30 },
                      { key: 'desc_corta', label: 'Descripción corta', max: 80 },
                    ].map(({ key, label, max }) => (
                      <div key={key}>
                        <div style={labelStyle}>{label} <span style={{ color: asoComp[key].length > max ? '#FF5C5C' : 'var(--text-muted)' }}>{asoComp[key].length}/{max}</span></div>
                        <input type="text" value={asoComp[key]} onChange={e => setAsoComp(s => ({ ...s, [key]: e.target.value }))} style={inputStyle} maxLength={max + 20} />
                      </div>
                    ))}
                    <div>
                      <div style={labelStyle}>Descripción larga <span style={{ color: asoComp.desc_larga.length > 4000 ? '#FF5C5C' : 'var(--text-muted)' }}>{asoComp.desc_larga.length}/4000</span></div>
                      <textarea value={asoComp.desc_larga} onChange={e => setAsoComp(s => ({ ...s, desc_larga: e.target.value }))} style={{ ...inputStyle, minHeight: '70px', resize: 'vertical', fontFamily: 'inherit' }} />
                    </div>
                    <div>
                      <div style={labelStyle}>Keywords</div>
                      <input type="text" value={asoComp.keywords} onChange={e => setAsoComp(s => ({ ...s, keywords: e.target.value }))} style={inputStyle} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <div>
                        <div style={labelStyle}>Screenshots</div>
                        <input type="number" min="0" max="8" value={asoComp.screenshots} onChange={e => setAsoComp(s => ({ ...s, screenshots: e.target.value }))} style={inputStyle} />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingTop: '14px' }}>
                        <input type="checkbox" id="video-comp" checked={asoComp.video} onChange={e => setAsoComp(s => ({ ...s, video: e.target.checked }))} />
                        <label htmlFor="video-comp" style={{ color: 'var(--text-muted)', fontSize: '12px', cursor: 'pointer' }}>¿Tiene video?</label>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => handleAnalizarAso('competidor')} disabled={asoLoading} style={{ marginTop: '12px', width: '100%', padding: '8px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', opacity: asoLoading ? 0.6 : 1 }}>
                    {asoLoading ? 'Analizando...' : 'Analizar competidor'}
                  </button>
                </div>
              </div>

              {/* Resultados ASO */}
              {(asoAnalisis || asoAnalisisComp) && (
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '16px' }}>
                  {asoAnalisis && <AsoScoreCard analisis={asoAnalisis} titulo={`Mi App — ${appNombre}`} />}
                  {asoAnalisisComp && <AsoScoreCard analisis={asoAnalisisComp} titulo={`Competidor — ${asoComp.nombre || 'Competidor'}`} />}
                </div>
              )}
            </div>

            {/* SECCIÓN 3: Generador de Test A/B */}
            <div style={sectionStyle}>
              <div style={{ color: 'var(--text)', fontSize: '15px', fontWeight: '600', marginBottom: '16px' }}>Generador de Test A/B</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <div style={labelStyle}>Elemento a testear</div>
                  <select value={abElemento} onChange={e => setAbElemento(e.target.value)} style={{ ...inputStyle }}>
                    {['Ícono', 'Título', 'Descripción corta', 'Screenshots', 'Feature graphic'].map(o => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <div style={labelStyle}>{['Ícono', 'Screenshots', 'Feature graphic'].includes(abElemento) ? 'Concepto visual Variante A' : 'Variante A (texto actual)'}</div>
                  <input type="text" value={abVarianteA} onChange={e => setAbVarianteA(e.target.value)} placeholder={['Ícono', 'Screenshots', 'Feature graphic'].includes(abElemento) ? 'Describe el concepto visual...' : 'Texto actual...'} style={inputStyle} />
                </div>
              </div>
              <div style={{ marginBottom: '14px' }}>
                <div style={labelStyle}>Contexto adicional (opcional)</div>
                <input type="text" value={abContexto} onChange={e => setAbContexto(e.target.value)} placeholder="Público objetivo, tono, estilo..." style={inputStyle} />
              </div>
              <button onClick={handleGenerarAB} disabled={abLoading || !abVarianteA.trim()} style={{ padding: '9px 18px', background: 'var(--primary)', border: 'none', color: 'var(--bg)', borderRadius: '7px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', opacity: (abLoading || !abVarianteA.trim()) ? 0.5 : 1 }}>
                {abLoading ? 'Generando...' : 'Generar Test A/B'}
              </button>

              {abResult && (
                <div style={{ marginTop: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                    {[{ label: 'Variante A', data: abResult.variante_a }, { label: 'Variante B', data: abResult.variante_b }].map(({ label, data }) => (
                      <div key={label} style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', padding: '14px' }}>
                        <div style={{ color: 'var(--primary)', fontSize: '12px', fontWeight: '700', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
                        <div style={{ color: 'var(--text)', fontSize: '13px', marginBottom: '8px', lineHeight: '1.5' }}>{data?.descripcion}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '11px', fontStyle: 'italic', lineHeight: '1.5' }}>{data?.hipotesis}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '14px' }}>
                    {[
                      { label: 'Métrica principal', value: abResult.metrica_principal },
                      { label: 'Duración sugerida', value: abResult.duracion_sugerida },
                      { label: 'Cómo medir', value: abResult.como_medir },
                    ].map(({ label, value }) => value ? (
                      <div key={label} style={{ flex: '1 1 160px', backgroundColor: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '7px', padding: '10px' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>{label}</div>
                        <div style={{ color: 'var(--text)', fontSize: '12px' }}>{value}</div>
                      </div>
                    ) : null)}
                  </div>
                  <button onClick={handleGuardarExp} disabled={abSaving} style={{ padding: '9px 18px', background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)', borderRadius: '7px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', opacity: abSaving ? 0.6 : 1 }}>
                    {abSaving ? 'Guardando...' : 'Guardar experimento'}
                  </button>
                </div>
              )}
            </div>

            {/* SECCIÓN 4: Historial de experimentos */}
            <div style={sectionStyle}>
              <div style={{ color: 'var(--text)', fontSize: '15px', fontWeight: '600', marginBottom: '16px' }}>Historial de experimentos</div>
              {experimentos.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '30px', backgroundColor: 'var(--bg)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  No hay experimentos registrados
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border)' }}>
                        {['Elemento', 'Variante A', 'Variante B', 'Estado', 'Aprendizaje', ''].map(h => (
                          <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: '500', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {experimentos.map((exp, i) => {
                        const estadoOpts = ['en_curso', 'ganó_a', 'ganó_b', 'sin_diferencia'];
                        const estadoColor = { en_curso: '#FFB400', 'ganó_a': '#00E5A0', 'ganó_b': '#00E5A0', sin_diferencia: '#888' };
                        return (
                          <tr key={exp.id} style={{ backgroundColor: i % 2 === 0 ? 'var(--bg)' : 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: '500', whiteSpace: 'nowrap' }}>{exp.elemento}</td>
                            <td style={{ padding: '10px 12px', color: 'var(--text-muted)', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={exp.variante_a}>{exp.variante_a || '—'}</td>
                            <td style={{ padding: '10px 12px', color: 'var(--text-muted)', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={exp.variante_b}>{exp.variante_b || '—'}</td>
                            <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                              <select
                                value={exp.resultado}
                                onChange={async (e) => {
                                  try { await updateExperimento(exp.id, { resultado: e.target.value }); }
                                  catch { setToast({ message: 'Error al actualizar estado', type: 'error' }); }
                                }}
                                style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '5px', padding: '4px 8px', color: estadoColor[exp.resultado] || 'var(--text)', fontSize: '11px', cursor: 'pointer' }}
                              >
                                {estadoOpts.map(o => <option key={o} value={o}>{o.replace('_', ' ')}</option>)}
                              </select>
                            </td>
                            <td style={{ padding: '10px 12px', minWidth: '180px' }}>
                              <input
                                type="text"
                                defaultValue={exp.aprendizaje || ''}
                                placeholder="Anotá el aprendizaje..."
                                onBlur={async (e) => {
                                  if (e.target.value !== (exp.aprendizaje || '')) {
                                    try { await updateExperimento(exp.id, { aprendizaje: e.target.value }); }
                                    catch { setToast({ message: 'Error al guardar aprendizaje', type: 'error' }); }
                                  }
                                }}
                                style={{ width: '100%', boxSizing: 'border-box', backgroundColor: 'transparent', border: '1px solid transparent', borderRadius: '4px', padding: '4px 6px', color: 'var(--text)', fontSize: '11px', outline: 'none' }}
                                onFocus={e => e.target.style.borderColor = 'var(--border)'}
                                onBlurCapture={e => e.target.style.borderColor = 'transparent'}
                              />
                            </td>
                            <td style={{ padding: '10px 12px' }}>
                              <button
                                onClick={async () => {
                                  try { await deleteExperimento(exp.id); setToast({ message: 'Experimento eliminado', type: 'success' }); }
                                  catch { setToast({ message: 'Error al eliminar', type: 'error' }); }
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
          </div>
        );
      })()}

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
