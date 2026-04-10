import { useEffect, useState } from 'react';
import MetricCard from '../components/ui/MetricCard';
import { useApps } from '../hooks/useApps';
import { useTareas } from '../hooks/useTareas';
import { useNotifications } from '../hooks/useNotifications';
import { supabase } from '../lib/supabase';

const IconCheck = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const IconAlert = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3.05h16.94a2 2 0 0 0 1.71-3.05L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
    <line x1="12" y1="9" x2="12" y2="13"></line>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>
);

const IconInfo = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

const IconRocket = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4.5 16.5c-1.5-1.5-2-3.5-2-5.5 0-4.5 3.5-8 8-8s8 3.5 8 8-3.5 8-8 8c-2 0-4-0.5-5.5-2"></path>
    <polyline points="12 4 12 12 9 12"></polyline>
  </svg>
);

function getInitials(name) {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatRelativeDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'hace momentos';
  if (diffMins < 60) return `hace ${diffMins}m`;
  if (diffHours < 24) return `hace ${diffHours}h`;
  if (diffDays === 1) return 'ayer';
  if (diffDays < 7) return `hace ${diffDays}d`;
  return formatDate(dateString);
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

const StatusBadge = ({ status }) => {
  const badgeConfig = {
    development: { bg: '#1C1C26', text: '#999' },
    testing: { bg: '#323200', text: '#FFEB3B' },
    published: { bg: '#003300', text: '#00E5A0' },
    deprecated: { bg: '#330000', text: '#FF4D4F' },
  };
  const config = badgeConfig[status] || badgeConfig.development;

  return (
    <span style={{ backgroundColor: config.bg, color: config.text, fontSize: '10px', padding: '4px 8px', borderRadius: '4px' }}>
      {status}
    </span>
  );
};

const RunStatusBadge = ({ estado }) => {
  const config = {
    running: { bg: 'rgba(100, 150, 255, 0.2)', color: '#6496FF' },
    completado: { bg: 'rgba(0, 229, 160, 0.2)', color: '#00E5A0' },
    error: { bg: 'rgba(255, 77, 79, 0.2)', color: '#FF4D4F' },
    ensamblando: { bg: 'rgba(255, 180, 0, 0.2)', color: '#FFB400' },
  };
  const style = config[estado] || config.running;

  return (
    <span style={{ backgroundColor: style.bg, color: style.color, fontSize: '11px', padding: '4px 8px', borderRadius: '4px', fontWeight: '600', textTransform: 'capitalize' }}>
      {estado}
    </span>
  );
};

export default function Home() {
  const { apps } = useApps();
  const { tareas, bloques } = useTareas();
  const { notifications } = useNotifications();

  // Métricas
  const [revenue, setRevenue] = useState('—');
  const [activeAppsCount, setActiveAppsCount] = useState(0);
  const [pipelineStatus, setPipelineStatus] = useState(null);
  const [pendingTareasCount, setPendingTareasCount] = useState(0);

  // Pipeline polling
  const [activeRun, setActiveRun] = useState(null);
  const [timer, setTimer] = useState(0);

  // Fetch revenue última mes (AdMob)
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data: metricsData } = await supabase
          .from('metrics')
          .select('ingresos')
          .gte('fecha', thirtyDaysAgo.toISOString());

        const totalRevenue = (metricsData || []).reduce((sum, m) => sum + (m.ingresos || 0), 0);
        setRevenue(totalRevenue > 0 ? `$${totalRevenue.toFixed(2)}` : '$0.00');

        // Apps activas
        const active = apps.filter(a => a.estado === 'published' || a.estado === 'testing' || a.status === 'published' || a.status === 'testing').length;
        setActiveAppsCount(active);
      } catch (err) {
        console.error('Error fetching metrics:', err);
      }
    };

    if (apps.length > 0) {
      fetchMetrics();
    }
  }, [apps]);

  // Tareas pendientes
  useEffect(() => {
    const pending = tareas.filter(t => !t.completada && t.estado !== 'completada').length;
    setPendingTareasCount(pending);
  }, [tareas]);

  // Polling para pipeline activo cada 10 segundos
  useEffect(() => {
    const fetchActiveRun = async () => {
      try {
        const { data, error } = await supabase
          .from('pipeline_runs')
          .select('*')
          .in('estado', ['running', 'ensamblando'])
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        setActiveRun(data || null);
        setPipelineStatus(data ? `${data.estado}` : null);
      } catch (err) {
        if (err.code !== 'PGRST116') {
          console.error('Error fetching active run:', err);
        }
        setActiveRun(null);
      }
    };

    fetchActiveRun();
    const interval = setInterval(fetchActiveRun, 10000);
    return () => clearInterval(interval);
  }, []);

  // Timer para run activo
  useEffect(() => {
    if (!activeRun) return;
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - new Date(activeRun.created_at).getTime()) / 1000);
      setTimer(elapsed);
    }, 1000);
    return () => clearInterval(interval);
  }, [activeRun]);

  return (
    <div style={{ backgroundColor: '#0A0A0F', minHeight: '100vh', padding: '24px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* FILA 1: Métricas */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
          <MetricCard
            label="Revenue (AdMob)"
            value={revenue}
            sub="último mes"
            subColor="neutral"
          />
          <MetricCard
            label="Apps activas"
            value={activeAppsCount}
            sub="published / testing"
            subColor="green"
          />
          <MetricCard
            label="Pipeline activo"
            value={pipelineStatus ? '🔄 Ejecutando' : '—'}
            sub={pipelineStatus || 'nada corriendo'}
            subColor={pipelineStatus ? 'blue' : 'neutral'}
          />
          <MetricCard
            label="Tareas pendientes"
            value={pendingTareasCount}
            sub={pendingTareasCount === 0 ? '¡Todo hecho!' : 'sin completar'}
            subColor={pendingTareasCount === 0 ? 'green' : 'neutral'}
          />
        </div>

        {/* FILA 2: Apps (izq) + Pipeline (der) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
          {/* Apps del portfolio (compacto) */}
          <div style={{ backgroundColor: '#13131A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '20px' }}>
            <h3 style={{ color: 'white', fontSize: '14px', fontWeight: '600', margin: '0 0 16px 0' }}>
              📱 Apps del Portfolio
            </h3>
            {apps.length === 0 ? (
              <div style={{ color: '#999', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>
                No hay apps aún
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                {apps.slice(0, 5).map((app) => (
                  <div
                    key={app.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      backgroundColor: '#0A0A0F',
                      borderRadius: '6px',
                      fontSize: '12px',
                    }}
                  >
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        backgroundColor: '#1C1C26',
                        color: '#00E5A0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10px',
                        fontWeight: '600',
                        flexShrink: 0,
                      }}
                    >
                      {getInitials(app.nombre || app.name || 'App')}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: 'white', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {app.nombre || app.name}
                      </div>
                      <div style={{ color: '#999', fontSize: '11px' }}>
                        {formatDate(app.created_at)}
                      </div>
                    </div>
                    <StatusBadge status={app.estado || app.status || 'development'} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pipeline activo (derecha) */}
          <div style={{ backgroundColor: '#13131A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '20px' }}>
            <h3 style={{ color: 'white', fontSize: '14px', fontWeight: '600', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IconRocket style={{ color: '#00E5A0' }} />
              Pipeline
            </h3>
            {activeRun ? (
              <div style={{ display: 'grid', gap: '12px' }}>
                <div>
                  <div style={{ color: '#999', fontSize: '11px', fontWeight: '500', marginBottom: '4px', textTransform: 'uppercase' }}>
                    App
                  </div>
                  <div style={{ color: 'white', fontSize: '13px', fontWeight: '500' }}>
                    {activeRun.nombre}
                  </div>
                </div>

                <div>
                  <div style={{ color: '#999', fontSize: '11px', fontWeight: '500', marginBottom: '4px', textTransform: 'uppercase' }}>
                    Estado
                  </div>
                  <RunStatusBadge estado={activeRun.estado} />
                </div>

                {activeRun.paso_actual && (
                  <div>
                    <div style={{ color: '#999', fontSize: '11px', fontWeight: '500', marginBottom: '4px', textTransform: 'uppercase' }}>
                      Paso
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>
                      {activeRun.paso_actual}
                    </div>
                  </div>
                )}

                <div>
                  <div style={{ color: '#999', fontSize: '11px', fontWeight: '500', marginBottom: '4px', textTransform: 'uppercase' }}>
                    Tiempo
                  </div>
                  <div style={{ color: '#00E5A0', fontSize: '16px', fontWeight: '600', fontFamily: 'DM Mono, monospace' }}>
                    {formatTime(timer)}
                  </div>
                </div>

                {activeRun.estado === 'completado' && activeRun.repo_url && (
                  <a
                    href={activeRun.repo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-block',
                      marginTop: '8px',
                      padding: '8px 12px',
                      backgroundColor: 'rgba(0, 229, 160, 0.1)',
                      border: '1px solid #00E5A0',
                      color: '#00E5A0',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600',
                      textDecoration: 'none',
                    }}
                  >
                    📦 Abrir repo
                  </a>
                )}
              </div>
            ) : (
              <div style={{ color: '#999', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>
                Nada ejecutando
              </div>
            )}
          </div>
        </div>

        {/* FILA 3: Tareas (izq) + Alertas (der) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Tareas pendientes */}
          <div style={{ backgroundColor: '#13131A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '20px' }}>
            <h3 style={{ color: 'white', fontSize: '14px', fontWeight: '600', margin: '0 0 16px 0' }}>
              ✓ Tareas Pendientes
            </h3>
            {tareas.filter(t => !t.completada && t.estado !== 'completada').length === 0 ? (
              <div style={{ color: '#00E5A0', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>
                ¡Todo completado! 🎉
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {tareas
                  .filter(t => !t.completada && t.estado !== 'completada')
                  .slice(0, 3)
                  .map((tarea) => {
                    const bloque = bloques.find(b => b.id === tarea.bloque_id);
                    return (
                      <div
                        key={tarea.id}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '12px',
                          padding: '12px',
                          backgroundColor: '#0A0A0F',
                          borderRadius: '6px',
                          fontSize: '12px',
                        }}
                      >
                        <div
                          style={{
                            width: '16px',
                            height: '16px',
                            borderRadius: '3px',
                            backgroundColor: bloque?.color || '#666',
                            flexShrink: 0,
                            marginTop: '2px',
                          }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ color: 'white', fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>
                            {tarea.titulo}
                          </div>
                          <div style={{ color: '#999', fontSize: '11px' }}>
                            {bloque?.nombre} • {tarea.tiempo_estimado ? `${tarea.tiempo_estimado}h` : '—'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Alertas */}
          <div style={{ backgroundColor: '#13131A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '20px' }}>
            <h3 style={{ color: 'white', fontSize: '14px', fontWeight: '600', margin: '0 0 16px 0' }}>
              🔔 Alertas
            </h3>
            {notifications.length === 0 ? (
              <div style={{ color: '#00E5A0', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>
                Todo en orden
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                {notifications.slice(0, 4).map((notif) => {
                  const iconColor = notif.tipo === 'error' ? '#FF4D4F' : notif.tipo === 'warning' ? '#FFEB3B' : '#6496FF';

                  return (
                    <div
                      key={notif.id}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                        padding: '12px',
                        backgroundColor: '#0A0A0F',
                        borderRadius: '6px',
                        fontSize: '12px',
                      }}
                    >
                      <div style={{ color: iconColor, flexShrink: 0, marginTop: '2px' }}>
                        {notif.tipo === 'error' || notif.tipo === 'warning' ? <IconAlert /> : <IconInfo />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ color: 'white', fontSize: '12px', marginBottom: '2px' }}>
                          {notif.titulo || notif.title}
                        </div>
                        <div style={{ color: '#999', fontSize: '11px' }}>
                          {formatRelativeDate(notif.created_at)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
