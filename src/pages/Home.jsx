import { useEffect, useState } from 'react';
import MetricCard from '../components/ui/MetricCard';
import { useApps } from '../hooks/useApps';
import { useTasks } from '../hooks/useTasks';
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

const StatusBadge = ({ status }) => {
  const badgeConfig = {
    development: { bg: '#1C1C26', text: '#999' },
    testing: { bg: '#323200', text: '#FFEB3B' },
    published: { bg: '#003300', text: '#00E5A0' },
    deprecated: { bg: '#330000', text: '#FF4D4F' },
  };
  const config = badgeConfig[status] || badgeConfig.development;

  return (
    <span
      className="text-xs px-2 py-1 rounded"
      style={{ backgroundColor: config.bg, color: config.text }}
    >
      {status}
    </span>
  );
};

const MarketBadge = ({ market }) => (
  <span
    className="text-xs px-2 py-1 rounded"
    style={{ backgroundColor: 'rgba(100, 150, 255, 0.2)', color: '#6496FF' }}
  >
    {market}
  </span>
);

export default function Home() {
  const { apps, loading: appsLoading } = useApps();
  const { tasks, loading: tasksLoading } = useTasks();
  const { notifications, unreadCount } = useNotifications();

  // Métricas
  const [mar, setMar] = useState('—');
  const [activeAppsCount, setActiveAppsCount] = useState(0);
  const [pendingTasksCount, setPendingTasksCount] = useState(0);
  const [worstCrashRate, setWorstCrashRate] = useState('—');

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        // MAR: ingresos último mes / apps activas
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data: metricsData } = await supabase
          .from('metrics')
          .select('ingresos, app_id')
          .gte('fecha', thirtyDaysAgo.toISOString());

        const totalIngresos = (metricsData || []).reduce((sum, m) => sum + (m.ingresos || 0), 0);
        const activeApps = apps.filter(a => a.status === 'published' || a.status === 'testing').length;
        const mar_value = activeApps > 0 ? (totalIngresos / activeApps).toFixed(2) : '0.00';
        setMar(`$${mar_value}`);

        // Apps activas
        setActiveAppsCount(activeApps);

        // Tareas pendientes
        setPendingTasksCount(tasks.length);

        // Worst crash rate
        const { data: crashData } = await supabase
          .from('metrics')
          .select('crash_rate')
          .gte('fecha', thirtyDaysAgo.toISOString())
          .order('crash_rate', { ascending: false })
          .limit(1);

        if (crashData && crashData.length > 0) {
          const crashRate = (crashData[0].crash_rate * 100).toFixed(2);
          setWorstCrashRate(`${crashRate}%`);
        } else {
          setWorstCrashRate('—');
        }
      } catch (err) {
        console.error('Error fetching metrics:', err);
      }
    };

    if (apps.length > 0 || tasks.length >= 0) {
      fetchMetrics();
    }
  }, [apps, tasks]);

  return (
    <div className="p-6" style={{ backgroundColor: '#0A0A0F', minHeight: '100vh' }}>
      {/* Sección 1: Métricas */}
      <section className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            label="MAR"
            value={mar}
            sub={`${activeAppsCount} apps`}
            subColor="neutral"
          />
          <MetricCard
            label="Apps activas"
            value={activeAppsCount}
            sub="published / testing"
            subColor="green"
          />
          <MetricCard
            label="Tareas pendientes"
            value={pendingTasksCount}
            sub={pendingTasksCount === 0 ? '¡Todo hecho!' : 'sin completar'}
            subColor={pendingTasksCount === 0 ? 'green' : 'neutral'}
          />
          <MetricCard
            label="Crash rate peor"
            value={worstCrashRate}
            sub="últimos 7 días"
            subColor={worstCrashRate !== '—' && parseFloat(worstCrashRate) > 1 ? 'red' : 'neutral'}
          />
        </div>
      </section>

      {/* Sección 2: Apps del portfolio */}
      <section className="mb-6">
        <h2 className="text-lg font-medium text-white mb-4">Apps del portfolio</h2>
        {appsLoading ? (
          <div style={{ color: '#999' }}>Cargando...</div>
        ) : apps.length === 0 ? (
          <div
            className="text-center py-8 rounded-[10px] border"
            style={{
              backgroundColor: '#13131A',
              borderColor: 'rgba(255,255,255,0.08)',
            }}
          >
            <div style={{ color: '#999' }} className="mb-4">
              No hay apps todavía
            </div>
            <button
              className="px-4 py-2 rounded-lg transition-colors"
              style={{
                backgroundColor: '#00E5A0',
                color: '#0A0A0F',
                fontWeight: '500',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
            >
              Agregar app
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {apps.map((app) => (
              <div
                key={app.id}
                className="flex items-center gap-4 p-4 rounded-[10px] border"
                style={{
                  backgroundColor: '#13131A',
                  borderColor: 'rgba(255,255,255,0.08)',
                }}
              >
                {/* Ícono con iniciales */}
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: '#1C1C26',
                    color: '#00E5A0',
                    fontSize: '12px',
                    fontWeight: '600',
                  }}
                >
                  {getInitials(app.nombre || app.name || 'App')}
                </div>

                {/* Nombre */}
                <div className="flex-1">
                  <div className="text-white font-medium">{app.nombre || app.name}</div>
                </div>

                {/* Status badge */}
                <StatusBadge status={app.status || 'development'} />

                {/* Market badge */}
                {app.mercado && <MarketBadge market={app.mercado} />}

                {/* Fecha */}
                <div style={{ color: '#999', fontSize: '14px' }}>
                  {formatDate(app.created_at)}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Sección 3: Alertas */}
      <section>
        <h2 className="text-lg font-medium text-white mb-4">Alertas</h2>
        {unreadCount === 0 && notifications.length === 0 ? (
          <div
            className="text-center py-8 rounded-[10px] border"
            style={{
              backgroundColor: '#13131A',
              borderColor: 'rgba(255,255,255,0.08)',
              color: '#00E5A0',
            }}
          >
            Todo en orden
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notif) => {
              const iconColor =
                notif.tipo === 'error'
                  ? '#FF4D4F'
                  : notif.tipo === 'warning'
                    ? '#FFEB3B'
                    : '#6496FF';

              return (
                <div
                  key={notif.id}
                  className="flex items-center gap-3 p-4 rounded-[10px] border"
                  style={{
                    backgroundColor: '#13131A',
                    borderColor: 'rgba(255,255,255,0.08)',
                  }}
                >
                  <div style={{ color: iconColor, flexShrink: 0 }}>
                    {notif.tipo === 'error' ? (
                      <IconAlert />
                    ) : notif.tipo === 'warning' ? (
                      <IconAlert />
                    ) : (
                      <IconInfo />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-white">{notif.titulo || notif.title}</div>
                  </div>
                  <div style={{ color: '#999', fontSize: '12px', flexShrink: 0 }}>
                    {formatRelativeDate(notif.created_at)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
