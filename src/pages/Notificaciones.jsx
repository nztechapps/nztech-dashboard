import { useState } from 'react';
import { useNotifications } from '../hooks/useNotifications';

const IconAlerta = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3.05h16.94a2 2 0 0 0 1.71-3.05L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
    <line x1="12" y1="9" x2="12" y2="13"></line>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>
);

const IconCrash = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
  </svg>
);

const IconResena = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="12 2 15.09 10.26 24 10.27 17.18 16.70 19.36 25.07 12 19.54 4.64 25.07 6.82 16.70 0 10.27 8.91 10.26 12 2"></polygon>
  </svg>
);

const IconTarea = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const IconInfo = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

const IconIngreso = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"></circle>
    <path d="M12 6v12M9 9h6"></path>
  </svg>
);

function getIconForType(tipo) {
  switch (tipo) {
    case 'alerta':
      return <IconAlerta />;
    case 'crash':
      return <IconCrash />;
    case 'resena':
      return <IconResena />;
    case 'tarea':
      return <IconTarea />;
    case 'info':
      return <IconInfo />;
    case 'ingreso':
      return <IconIngreso />;
    default:
      return <IconInfo />;
  }
}

function getIconColor(tipo) {
  switch (tipo) {
    case 'alerta':
      return '#FFB400';
    case 'crash':
      return '#FF4D4F';
    case 'resena':
      return '#6496FF';
    case 'tarea':
      return '#999';
    case 'info':
      return '#00E5A0';
    case 'ingreso':
      return '#00E5A0';
    default:
      return '#999';
  }
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
  return date.toLocaleDateString('es-ES');
}

const NOTIFICATION_TYPES = [
  { id: 'todas', label: 'Todas' },
  { id: 'alerta', label: 'Alertas' },
  { id: 'crash', label: 'Crashes' },
  { id: 'resena', label: 'Reseñas' },
  { id: 'tarea', label: 'Tareas' },
];

export default function Notificaciones() {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications(true);
  const [selectedFilter, setSelectedFilter] = useState('todas');

  const filteredNotifications =
    selectedFilter === 'todas'
      ? notifications
      : notifications.filter((n) => n.tipo === selectedFilter);

  return (
    <div style={{ backgroundColor: '#0A0A0F', minHeight: '100vh', padding: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ color: 'white', margin: 0, fontSize: '24px', fontWeight: '600' }}>
          Notificaciones
        </h1>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            style={{
              padding: '10px 16px',
              backgroundColor: 'transparent',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#00E5A0',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500',
            }}
          >
            Marcar todas como leídas
          </button>
        )}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', overflow: 'auto', paddingBottom: '8px' }}>
        {NOTIFICATION_TYPES.map((filter) => (
          <button
            key={filter.id}
            onClick={() => setSelectedFilter(filter.id)}
            style={{
              padding: '8px 16px',
              backgroundColor: selectedFilter === filter.id ? '#00E5A0' : 'transparent',
              color: selectedFilter === filter.id ? '#0A0A0F' : '#999',
              border: selectedFilter === filter.id ? 'none' : '1px solid rgba(255,255,255,0.08)',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500',
              whiteSpace: 'nowrap',
            }}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {loading ? (
        <div style={{ color: '#999', textAlign: 'center', padding: '40px 0' }}>
          Cargando notificaciones...
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div
          style={{
            padding: '60px 24px',
            backgroundColor: '#13131A',
            borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.08)',
            textAlign: 'center',
          }}
        >
          <div style={{ color: '#999', fontSize: '15px' }}>
            {selectedFilter === 'todas' && 'No hay notificaciones'}
            {selectedFilter === 'crash' && 'Sin crashes registrados'}
            {selectedFilter !== 'todas' && selectedFilter !== 'crash' && 'No hay notificaciones de este tipo'}
          </div>
          {selectedFilter === 'crash' && (
            <div style={{ color: '#00E5A0', fontSize: '14px', marginTop: '8px' }}>
              ¡Tu app está funcionando perfectamente!
            </div>
          )}
        </div>
      ) : (
        <div style={{ space: '8px' }}>
          {filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => {
                if (!notif.leida) {
                  markAsRead(notif.id);
                }
              }}
              data-unread={!notif.leida}
              style={{
                display: 'flex',
                gap: '12px',
                padding: '16px',
                backgroundColor: notif.leida ? '#13131A' : 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '10px',
                marginBottom: '8px',
                cursor: notif.leida ? 'default' : 'pointer',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => {
                if (!notif.leida) {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (!notif.leida) {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)';
                }
              }}
            >
              {/* Icon */}
              <div
                style={{
                  color: getIconColor(notif.tipo),
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {getIconForType(notif.tipo)}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    color: 'white',
                    fontWeight: '500',
                    fontSize: '14px',
                    marginBottom: '4px',
                  }}
                >
                  {notif.titulo}
                </div>
                {notif.cuerpo && (
                  <div
                    style={{
                      color: 'rgba(255,255,255,0.45)',
                      fontSize: '12px',
                      marginBottom: '6px',
                      wordBreak: 'break-word',
                    }}
                  >
                    {notif.cuerpo}
                  </div>
                )}
                <div style={{ color: '#999', fontSize: '11px' }}>
                  {formatRelativeDate(notif.created_at)}
                </div>
              </div>

              {/* Unread indicator */}
              {!notif.leida && (
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#00E5A0',
                    flexShrink: 0,
                    marginTop: '3px',
                  }}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
