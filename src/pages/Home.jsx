import { useEffect, useState } from 'react';
import { useApps } from '../hooks/useApps';
import { useTareas } from '../hooks/useTareas';
import { useNotifications } from '../hooks/useNotifications';
import { supabase } from '../lib/supabase';

const card = {
  backgroundColor: '#FFFFFF',
  borderRadius: '12px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  padding: '20px',
};

const sectionTitle = {
  fontSize: '13px',
  fontWeight: '600',
  color: '#9CA3AF',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: '12px',
};

const IconRocket = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4.5 16.5c-1.5-1.5-2-3.5-2-5.5 0-4.5 3.5-8 8-8s8 3.5 8 8-3.5 8-8 8c-2 0-4-0.5-5.5-2"></path>
    <polyline points="12 4 12 12 9 12"></polyline>
  </svg>
);

const IconAlert = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3.05h16.94a2 2 0 0 0 1.71-3.05L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
    <line x1="12" y1="9" x2="12" y2="13"></line>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>
);

const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatRelativeDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor((now - date) / 86400000);
  if (diffDays === 0) return 'hoy';
  if (diffDays === 1) return 'ayer';
  if (diffDays < 7) return `hace ${diffDays}d`;
  return formatDate(dateString);
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function getDailyGreeting() {
  const date = new Date();
  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const monthNames = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  return `${dayNames[date.getDay()]}, ${date.getDate()} de ${monthNames[date.getMonth()]}`;
}

const StatusBadge = ({ status }) => {
  const config = {
    development: { bg: '#F3F4F6', text: '#6B7280' },
    testing: { bg: '#FEFCE8', text: '#92400E' },
    published: { bg: '#ECFDF5', text: '#065F46' },
    deprecated: { bg: '#FEF2F2', text: '#991B1B' },
  };
  const c = config[status] || config.development;
  return (
    <span style={{ backgroundColor: c.bg, color: c.text, fontSize: '10px', padding: '3px 7px', borderRadius: '4px', fontWeight: '500' }}>
      {status}
    </span>
  );
};

const RunStatusBadge = ({ estado }) => {
  const config = {
    running: { bg: '#EEF2FF', color: '#4F46E5' },
    completado: { bg: '#ECFDF5', color: '#059669' },
    error: { bg: '#FEF2F2', color: '#DC2626' },
    ensamblando: { bg: '#FFFBEB', color: '#D97706' },
  };
  const c = config[estado] || config.running;
  return (
    <span style={{ backgroundColor: c.bg, color: c.color, fontSize: '11px', padding: '3px 8px', borderRadius: '4px', fontWeight: '600', textTransform: 'capitalize' }}>
      {estado}
    </span>
  );
};

function KpiCard({ label, value, sub, accent }) {
  return (
    <div style={{ ...card, padding: '20px' }}>
      <div style={{ fontSize: '13px', color: '#9CA3AF', marginBottom: '8px' }}>{label}</div>
      <div style={{ fontSize: '26px', fontWeight: '700', color: accent || '#111827', lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '6px' }}>{sub}</div>}
    </div>
  );
}

export default function Home() {
  const { apps } = useApps();
  const { tareas } = useTareas();
  const { notifications } = useNotifications();

  const [revenue, setRevenue] = useState('—');
  const [ideasCount, setIdeasCount] = useState(0);
  const [latestIdeas, setLatestIdeas] = useState([]);
  const [activeRun, setActiveRun] = useState(null);
  const [timer, setTimer] = useState(0);

  const pendingTareas = tareas.filter(t => !t.completada && t.estado !== 'completada');
  const urgentTarea = pendingTareas[0];
  const publishedApps = apps.filter(a => a.publicada || a.estado === 'published' || a.status === 'published');
  const appsWithIssues = notifications.filter(n => n.tipo === 'error').length > 0;

  useEffect(() => {
    const fetchMetrics = async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const { data } = await supabase.from('metrics').select('ingresos').gte('fecha', thirtyDaysAgo.toISOString());
      const total = (data || []).reduce((sum, m) => sum + (m.ingresos || 0), 0);
      setRevenue(total > 0 ? `$${total.toFixed(2)}` : '$0.00');
    };
    fetchMetrics();
  }, []);

  useEffect(() => {
    const fetchIdeas = async () => {
      const { data } = await supabase.from('apps').select('id, nombre, updated_at').eq('publicada', false).order('updated_at', { ascending: false }).limit(5);
      setLatestIdeas(data || []);
      const { count } = await supabase.from('apps').select('id', { count: 'exact', head: true }).eq('publicada', false);
      setIdeasCount(count || 0);
    };
    fetchIdeas();
  }, []);

  useEffect(() => {
    const fetchRun = async () => {
      const { data } = await supabase
        .from('pipeline_runs')
        .select('*')
        .in('estado', ['running', 'ensamblando'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      setActiveRun(data || null);
    };
    fetchRun();
    const interval = setInterval(fetchRun, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!activeRun) return;
    const interval = setInterval(() => {
      setTimer(Math.floor((Date.now() - new Date(activeRun.created_at).getTime()) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [activeRun]);

  return (
    <div style={{ backgroundColor: '#F9FAFB', padding: '28px', minHeight: '100%' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* ZONA 1 — Daily Brief */}
        <div style={card}>
          <div style={{ fontSize: '13px', color: '#9CA3AF', marginBottom: '4px' }}>{getDailyGreeting()}</div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>Buenos días, Fede.</div>
          <div style={{ fontSize: '15px', color: '#6B7280', marginBottom: '20px' }}>
            {urgentTarea ? `Hoy toca: ${urgentTarea.titulo}` : 'Nada pendiente por hoy. ¡Gran día!'}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
            <div style={{ backgroundColor: '#F9FAFB', borderRadius: '8px', padding: '12px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <span style={{ color: activeRun ? '#4F46E5' : '#9CA3AF' }}><IconRocket /></span>
                <span style={{ fontSize: '11px', fontWeight: '600', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pipeline</span>
              </div>
              <div style={{ fontSize: '13px', fontWeight: '500', color: '#374151' }}>
                {activeRun ? `${activeRun.estado} — ${formatTime(timer)}` : 'Sin actividad'}
              </div>
            </div>
            <div style={{ backgroundColor: '#F9FAFB', borderRadius: '8px', padding: '12px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <span style={{ color: pendingTareas.length === 0 ? '#059669' : '#9CA3AF' }}><IconCheck /></span>
                <span style={{ fontSize: '11px', fontWeight: '600', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tareas</span>
              </div>
              <div style={{ fontSize: '13px', fontWeight: '500', color: '#374151' }}>
                {pendingTareas.length === 0 ? '¡Todo hecho!' : `${pendingTareas.length} sin completar`}
              </div>
            </div>
            <div style={{ backgroundColor: '#F9FAFB', borderRadius: '8px', padding: '12px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <span style={{ color: appsWithIssues ? '#DC2626' : '#9CA3AF' }}><IconAlert /></span>
                <span style={{ fontSize: '11px', fontWeight: '600', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Alertas</span>
              </div>
              <div style={{ fontSize: '13px', fontWeight: '500', color: '#374151' }}>
                {appsWithIssues ? 'Hay issues activos' : 'Todo en orden'}
              </div>
            </div>
          </div>
        </div>

        {/* ZONA 2 — KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          <KpiCard label="Revenue AdMob" value={revenue} sub="último mes" />
          <KpiCard label="Apps publicadas" value={`${publishedApps.length}/50`} sub="en el portfolio" accent="#059669" />
          <KpiCard label="Ideas en desarrollo" value={ideasCount} sub="sin publicar" />
          <KpiCard label="Tareas pendientes" value={pendingTareas.length} sub={pendingTareas.length === 0 ? '¡Todo hecho!' : 'sin completar'} accent={pendingTareas.length === 0 ? '#059669' : '#111827'} />
        </div>

        {/* ZONA 3 — Apps del Portfolio */}
        <div style={card}>
          <div style={sectionTitle}>Apps del Portfolio</div>
          {publishedApps.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: '#9CA3AF', fontSize: '14px' }}>
              Publicá tu primera app
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '10px' }}>
              {publishedApps.slice(0, 6).map(app => (
                <div key={app.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', backgroundColor: '#F9FAFB', borderRadius: '8px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: '#00E5A0', flexShrink: 0 }}>
                    {(app.nombre || app.name || 'A').slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: '500', color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{app.nombre || app.name}</div>
                    <div style={{ fontSize: '11px', color: '#9CA3AF' }}>{formatDate(app.created_at)}</div>
                  </div>
                  <StatusBadge status={app.estado || app.status || 'published'} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ZONA 4 + 5 — Pipeline y Actividad Reciente */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>

          {/* Pipeline */}
          <div style={card}>
            <div style={sectionTitle}>Pipeline</div>
            {activeRun ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '4px', fontWeight: '600', textTransform: 'uppercase' }}>App</div>
                  <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>{activeRun.nombre}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '4px', fontWeight: '600', textTransform: 'uppercase' }}>Estado</div>
                  <RunStatusBadge estado={activeRun.estado} />
                </div>
                {activeRun.paso_actual && (
                  <div>
                    <div style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '4px', fontWeight: '600', textTransform: 'uppercase' }}>Paso actual</div>
                    <div style={{ fontSize: '13px', color: '#374151' }}>{activeRun.paso_actual}</div>
                  </div>
                )}
                <div>
                  <div style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '4px', fontWeight: '600', textTransform: 'uppercase' }}>Tiempo</div>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: '#00E5A0', fontFamily: 'DM Mono, monospace' }}>{formatTime(timer)}</div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '24px 0', color: '#9CA3AF', fontSize: '13px' }}>Nada ejecutando</div>
            )}
            <a href="/pipeline" style={{ display: 'block', marginTop: '16px', textAlign: 'center', fontSize: '12px', color: '#059669', fontWeight: '500', textDecoration: 'none' }}>
              Ver todos los runs →
            </a>
          </div>

          {/* Actividad reciente — últimas 5 ideas modificadas */}
          <div style={card}>
            <div style={sectionTitle}>Actividad Reciente</div>
            {latestIdeas.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: '#9CA3AF', fontSize: '13px' }}>Sin actividad reciente</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {latestIdeas.map(idea => (
                  <div key={idea.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                    <span style={{ fontSize: '13px', color: '#374151', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{idea.nombre}</span>
                    <span style={{ fontSize: '11px', color: '#9CA3AF', marginLeft: '12px', flexShrink: 0 }}>{formatRelativeDate(idea.updated_at)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
