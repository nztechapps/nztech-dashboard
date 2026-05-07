import { useState } from 'react';
import { useNotifications } from '../hooks/useNotifications';

const Icon = (d) => () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const ICONS = {
  alerta:  Icon("M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3.05h16.94a2 2 0 0 0 1.71-3.05L13.71 3.86a2 2 0 0 0-3.42 0z"),
  crash:   Icon("M13 2L3 14h9l-1 8 10-12h-9l1-8z"),
  tarea:   Icon("M20 6 9 17 4 12"),
  info:    Icon("M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 14v-4m0-4h.01"),
  ingreso: Icon("M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 6v12M9 9h6"),
};

const COLORS = {
  alerta:  'var(--nz-warning)',
  crash:   'var(--nz-danger)',
  resena:  'oklch(0.62 0.14 235)',
  tarea:   'var(--text-muted)',
  info:    'var(--primary)',
  ingreso: 'var(--nz-success)',
};

const getIcon  = (tipo) => { const I = ICONS[tipo] || ICONS.info; return <I />; };
const getColor = (tipo) => COLORS[tipo] || 'var(--text-muted)';

const relDate = (s) => {
  const d = Date.now() - new Date(s).getTime();
  const m = Math.floor(d / 60000);
  if (m < 1) return 'hace momentos';
  if (m < 60) return `hace ${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `hace ${h}h`;
  const days = Math.floor(h / 24);
  if (days === 1) return 'ayer';
  if (days < 7) return `hace ${days}d`;
  return new Date(s).toLocaleDateString('es-ES');
};

const FILTERS = [
  { id: 'todas', label: 'Todas' },
  { id: 'alerta', label: 'Alertas' },
  { id: 'crash', label: 'Crashes' },
  { id: 'resena', label: 'Reseñas' },
  { id: 'tarea', label: 'Tareas' },
];

export default function Notificaciones() {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications(true);
  const [filter, setFilter] = useState('todas');

  const filtered = filter === 'todas' ? notifications : notifications.filter(n => n.tipo === filter);

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100%', padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ color: 'var(--text)', margin: 0, fontSize: 20, fontWeight: 600 }}>Notificaciones</h1>
        {unreadCount > 0 && (
          <button onClick={markAllAsRead} className="nz-btn nz-btn-ghost">
            Marcar todas como leídas
          </button>
        )}
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24, overflow: 'auto', paddingBottom: 8 }}>
        {FILTERS.map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)}
            className={filter === f.id ? 'nz-btn nz-btn-primary' : 'nz-btn nz-btn-ghost'}
            style={{ borderRadius: 'var(--radius-pill)', padding: '6px 16px', fontSize: 13, whiteSpace: 'nowrap' }}>
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0' }}>Cargando...</div>
      ) : filtered.length === 0 ? (
        <div className="nz-card" style={{ textAlign: 'center', padding: '60px 24px' }}>
          <div style={{ color: 'var(--text-subtle)', fontSize: 15 }}>
            {filter === 'todas' ? 'No hay notificaciones' : filter === 'crash' ? 'Sin crashes registrados' : 'No hay notificaciones de este tipo'}
          </div>
          {filter === 'crash' && (
            <div style={{ color: 'var(--nz-success)', fontSize: 14, marginTop: 8 }}>¡Tu app está funcionando perfectamente!</div>
          )}
        </div>
      ) : (
        <div>
          {filtered.map(n => (
            <div
              key={n.id}
              onClick={() => !n.leida && markAsRead(n.id)}
              className="nz-card"
              style={{
                display: 'flex', gap: 12, padding: 16, marginBottom: 8,
                cursor: n.leida ? 'default' : 'pointer',
                background: n.leida ? 'var(--surface)' : 'var(--surface-2)',
                transition: 'background var(--dur-fast)',
              }}
              onMouseEnter={e => { if (!n.leida) e.currentTarget.style.background = 'var(--surface-hover)'; }}
              onMouseLeave={e => { if (!n.leida) e.currentTarget.style.background = 'var(--surface-2)'; }}
            >
              <div style={{ color: getColor(n.tipo), flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                {getIcon(n.tipo)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: 'var(--text)', fontWeight: 500, fontSize: 14, marginBottom: 4 }}>{n.titulo}</div>
                {n.cuerpo && <div style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 6, wordBreak: 'break-word' }}>{n.cuerpo}</div>}
                <div style={{ color: 'var(--text-subtle)', fontSize: 11 }}>{relDate(n.created_at)}</div>
              </div>
              {!n.leida && (
                <div style={{ width: 8, height: 8, borderRadius: 999, background: 'var(--primary)', flexShrink: 0, marginTop: 3 }} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
