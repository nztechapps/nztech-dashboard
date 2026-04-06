import { useState } from 'react';
import { useApps } from '../hooks/useApps';
import { useAgentInbox } from '../hooks/useAgentInbox';
import ToastNotification from '../components/ui/ToastNotification';

const N8N_BASE_URL = import.meta.env.VITE_N8N_URL || 'http://localhost:5678';

const AGENTS = [
  {
    id: 'legal',
    name: 'Agente Legal',
    description: 'Genera política de privacidad y textos legales para Play Store',
    status: 'activo',
    webhook: `${N8N_BASE_URL}/webhook/agente-legal`,
    icon: 'shield',
  },
  {
    id: 'research',
    name: 'Investigar tema',
    description: 'Investiga keywords, competidores, income reports y tendencias',
    status: 'no construido',
    webhook: `${N8N_BASE_URL}/webhook/agente-investigacion`,
    icon: 'search',
  },
  {
    id: 'screenshots',
    name: 'Generar screenshots',
    description: 'Genera prompts optimizados para screenshots de Play Store',
    status: 'no construido',
    webhook: `${N8N_BASE_URL}/webhook/agente-screenshots`,
    icon: 'image',
  },
  {
    id: 'content',
    name: 'Contenido TikTok/YouTube',
    description: 'Genera guiones y copy para redes sociales',
    status: 'no construido',
    webhook: `${N8N_BASE_URL}/webhook/agente-contenido`,
    icon: 'play',
  },
  {
    id: 'update',
    name: 'Agente de Update',
    description: 'Prepara el prompt de actualización para Claude Code',
    status: 'no construido',
    webhook: `${N8N_BASE_URL}/webhook/agente-update`,
    icon: 'refresh',
  },
];

const IconShield = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
  </svg>
);

const IconSearch = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"></circle>
    <path d="m21 21-4.35-4.35"></path>
  </svg>
);

const IconImage = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <circle cx="8.5" cy="8.5" r="1.5"></circle>
    <path d="m21 15-5-5L5 21"></path>
  </svg>
);

const IconPlay = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="5 3 19 12 5 21 5 3"></polygon>
  </svg>
);

const IconRefresh = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="23 4 23 10 17 10"></polyline>
    <polyline points="1 20 1 14 7 14"></polyline>
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36M20.49 15a9 9 0 0 1-14.85 3.36"></path>
  </svg>
);

const IconChevronDown = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

const IconSpinner = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
    <circle cx="12" cy="12" r="10"></circle>
    <path d="M12 2a10 10 0 0 1 10 10"></path>
  </svg>
);

const getAgentIcon = (iconName) => {
  switch (iconName) {
    case 'shield':
      return <IconShield />;
    case 'search':
      return <IconSearch />;
    case 'image':
      return <IconImage />;
    case 'play':
      return <IconPlay />;
    case 'refresh':
      return <IconRefresh />;
    default:
      return null;
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case 'activo':
      return '#00E5A0';
    case 'inactivo':
      return '#FFB400';
    case 'no construido':
      return '#999';
    default:
      return '#999';
  }
};

function AgentCard({ agent, isSelected, onSelect }) {
  const isDisabled = agent.status === 'no construido';

  return (
    <button
      onClick={() => !isDisabled && onSelect(agent)}
      disabled={isDisabled}
      style={{
        background: 'none',
        border: `1px solid ${isSelected ? '#00E5A0' : 'rgba(255,255,255,0.08)'}`,
        borderRadius: '10px',
        padding: '20px',
        backgroundColor: isSelected ? 'rgba(0,229,160,0.08)' : '#13131A',
        cursor: isDisabled ? 'default' : 'pointer',
        opacity: isDisabled ? 0.5 : 1,
        transition: 'all 0.2s',
        textAlign: 'left',
      }}
      onMouseEnter={(e) => {
        if (!isDisabled && !isSelected) {
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
          e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isDisabled && !isSelected) {
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
          e.currentTarget.style.backgroundColor = '#13131A';
        }
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', color: getStatusColor(agent.status) }}>
        {getAgentIcon(agent.icon)}
        <h3 style={{ color: 'white', margin: 0, fontSize: '15px', fontWeight: '600', flex: 1 }}>
          {agent.name}
        </h3>
      </div>
      <p style={{ color: 'rgba(255,255,255,0.6)', margin: '0 0 12px 0', fontSize: '12px', lineHeight: '1.4' }}>
        {agent.description}
      </p>
      <div
        style={{
          backgroundColor: 'rgba(0,229,160,0.12)',
          color: getStatusColor(agent.status),
          fontSize: '10px',
          fontWeight: '600',
          padding: '4px 8px',
          borderRadius: '4px',
          display: 'inline-block',
          textTransform: 'capitalize',
        }}
      >
        {agent.status === 'no construido' ? 'Próximamente' : agent.status}
      </div>
    </button>
  );
}

function LegalAgentPanel({ agent, apps, onSubmit, isLoading, recentExecutions }) {
  const [formData, setFormData] = useState({
    app_id: '',
    descripcion: '',
  });

  const selectedApp = apps.find((a) => a.id === formData.app_id);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.app_id.trim() || !formData.descripcion.trim()) return;
    await onSubmit({
      app_id: formData.app_id,
      package_name: selectedApp?.package_name || '',
      descripcion: formData.descripcion,
    });
    setFormData({ app_id: '', descripcion: '' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', height: '100%' }}>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* Agent Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div style={{ color: '#00E5A0', fontSize: '24px' }}>
            {getAgentIcon(agent.icon)}
          </div>
          <div>
            <h2 style={{ color: 'white', margin: 0, fontSize: '18px', fontWeight: '600' }}>
              {agent.name}
            </h2>
          </div>
        </div>
        <span
          style={{
            backgroundColor: 'rgba(0,229,160,0.12)',
            color: '#00E5A0',
            fontSize: '11px',
            fontWeight: '600',
            padding: '4px 8px',
            borderRadius: '4px',
            display: 'inline-block',
            textTransform: 'capitalize',
          }}
        >
          {agent.status}
        </span>
        <p style={{ color: 'rgba(255,255,255,0.6)', margin: '12px 0 0 0', fontSize: '13px' }}>
          {agent.description}
        </p>
      </div>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }} />

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', color: '#999', fontSize: '11px', marginBottom: '6px', fontWeight: '500' }}>
            App *
          </label>
          <select
            value={formData.app_id}
            onChange={(e) => setFormData({ ...formData, app_id: e.target.value })}
            required
            style={{
              width: '100%',
              backgroundColor: '#0A0A0F',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '6px',
              padding: '10px 12px',
              color: 'white',
              fontSize: '13px',
              boxSizing: 'border-box',
            }}
          >
            <option value="">Seleccionar app...</option>
            {apps.map((app) => (
              <option key={app.id} value={app.id}>
                {app.nombre || app.name}
              </option>
            ))}
          </select>
        </div>

        {selectedApp && (
          <div>
            <label style={{ display: 'block', color: '#999', fontSize: '11px', marginBottom: '6px', fontWeight: '500' }}>
              Package
            </label>
            <input
              type="text"
              value={selectedApp.package_name || ''}
              disabled
              style={{
                width: '100%',
                backgroundColor: '#0A0A0F',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '6px',
                padding: '10px 12px',
                color: '#999',
                fontSize: '13px',
                boxSizing: 'border-box',
              }}
            />
          </div>
        )}

        <div>
          <label style={{ display: 'block', color: '#999', fontSize: '11px', marginBottom: '6px', fontWeight: '500' }}>
            Descripción del problema o solicitud *
          </label>
          <textarea
            value={formData.descripcion}
            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            placeholder="Describe qué necesitas..."
            required
            style={{
              width: '100%',
              backgroundColor: '#0A0A0F',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '6px',
              padding: '10px 12px',
              color: 'white',
              fontSize: '13px',
              boxSizing: 'border-box',
              minHeight: '100px',
              fontFamily: 'DM Mono, monospace',
              resize: 'vertical',
            }}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !formData.app_id || !formData.descripcion}
          style={{
            padding: '10px 16px',
            backgroundColor: isLoading || !formData.app_id || !formData.descripcion ? '#999' : '#00E5A0',
            border: 'none',
            color: '#0A0A0F',
            borderRadius: '6px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontSize: '13px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          {isLoading && <IconSpinner />}
          {isLoading ? 'Ejecutando...' : 'Ejecutar agente'}
        </button>
      </form>

      {/* Recent Executions */}
      {recentExecutions.length > 0 && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ color: 'white', margin: '0 0 12px 0', fontSize: '13px', fontWeight: '600' }}>
            Últimas ejecuciones
          </h3>
          <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recentExecutions.slice(0, 5).map((exec, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: '#0A0A0F',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  fontSize: '11px',
                }}
              >
                <div style={{ color: 'white', fontWeight: '600', marginBottom: '4px' }}>
                  {exec.titulo || 'Sin título'}
                </div>
                <div style={{ color: '#999', fontSize: '10px' }}>
                  {exec.created_at && !isNaN(new Date(exec.created_at))
                    ? new Date(exec.created_at).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '—'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.3 }}>
        🤖
      </div>
      <p style={{ color: '#666', fontSize: '13px', margin: 0 }}>
        Seleccioná un agente para interactuar
      </p>
    </div>
  );
}

function InboxSection() {
  const { items, pendingCount } = useAgentInbox();
  const [filterType, setFilterType] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const filterTypes = [
    { value: '', label: 'Todos', count: items.length },
    { value: 'legal', label: 'Legal', count: items.filter((i) => i.tipo === 'legal').length },
    { value: 'investigacion', label: 'Investigación', count: items.filter((i) => i.tipo === 'investigacion').length },
    { value: 'screenshots', label: 'Screenshots', count: items.filter((i) => i.tipo === 'screenshots').length },
    { value: 'contenido', label: 'Contenido', count: items.filter((i) => i.tipo === 'contenido').length },
    { value: 'update', label: 'Update', count: items.filter((i) => i.tipo === 'update').length },
  ];

  const filteredItems = filterType ? items.filter((i) => i.tipo === filterType) : items;

  return (
    <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '24px' }}>
      <h2 style={{ color: 'white', fontSize: '18px', fontWeight: '600', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
        Inbox de agentes
        {pendingCount > 0 && (
          <span
            style={{
              backgroundColor: '#FF4D4F',
              color: 'white',
              fontSize: '10px',
              fontWeight: '600',
              padding: '2px 6px',
              borderRadius: '10px',
            }}
          >
            {pendingCount}
          </span>
        )}
      </h2>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {filterTypes.map((type) => (
          <button
            key={type.value || 'all'}
            onClick={() => setFilterType(type.value)}
            style={{
              padding: '6px 12px',
              backgroundColor: filterType === type.value ? '#00E5A0' : 'transparent',
              border: `1px solid ${filterType === type.value ? '#00E5A0' : 'rgba(255,255,255,0.12)'}`,
              color: filterType === type.value ? '#0A0A0F' : '#999',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: '600',
              transition: 'all 0.2s',
            }}
          >
            {type.label}
            <span style={{ marginLeft: '4px', opacity: 0.7 }}>({type.count})</span>
          </button>
        ))}
      </div>

      {/* Items */}
      {filteredItems.length === 0 ? (
        <div style={{ backgroundColor: '#13131A', border: '1px dashed rgba(255,255,255,0.12)', borderRadius: '8px', padding: '24px', textAlign: 'center', color: '#666', fontSize: '12px' }}>
          No hay items {filterType ? `en esta categoría` : 'aún'}
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '8px' }}>
          {filteredItems.map((item) => (
            <div
              key={item.id}
              style={{
                backgroundColor: '#13131A',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px',
                overflow: 'hidden',
              }}
            >
              <button
                onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                style={{
                  width: '100%',
                  background: 'none',
                  border: 'none',
                  padding: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div style={{ textAlign: 'left', flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                    <span
                      style={{
                        backgroundColor: 'rgba(0,229,160,0.12)',
                        color: '#00E5A0',
                        fontSize: '10px',
                        fontWeight: '600',
                        padding: '2px 6px',
                        borderRadius: '3px',
                        textTransform: 'capitalize',
                      }}
                    >
                      {item.tipo || 'inbox'}
                    </span>
                    <h4 style={{ color: 'white', margin: 0, fontSize: '13px', fontWeight: '600', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.titulo || 'Sin título'}
                    </h4>
                  </div>
                  <p
                    style={{
                      color: '#999',
                      margin: 0,
                      fontSize: '11px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '100%',
                    }}
                  >
                    {item.contenido || 'Sin contenido'}
                  </p>
                  <div style={{ color: '#666', fontSize: '10px', marginTop: '4px' }}>
                    {item.created_at && !isNaN(new Date(item.created_at))
                      ? new Date(item.created_at).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : '—'}
                  </div>
                </div>
                <IconChevronDown
                  style={{
                    marginLeft: '12px',
                    transform: expandedId === item.id ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s',
                    color: '#999',
                    flexShrink: 0,
                  }}
                />
              </button>

              {expandedId === item.id && (
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '12px', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                  <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', fontFamily: 'DM Mono, monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {item.contenido || 'Sin contenido'}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Agentes() {
  const { apps } = useApps();
  const { items } = useAgentInbox();
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const recentExecutions = items.filter((i) => i.tipo === 'legal');

  const handleExecuteAgent = async (data) => {
    try {
      setIsLoading(true);
      const response = await fetch(selectedAgent.webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }

      setToast({ message: 'Agente ejecutado correctamente', type: 'success' });
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#0A0A0F', minHeight: '100vh', padding: '24px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ color: 'white', fontSize: '28px', fontWeight: '600', margin: 0 }}>
            Agentes
          </h1>
          <p style={{ color: '#999', fontSize: '13px', margin: '8px 0 0 0' }}>
            Plataforma de agentes autónomos para automatizar tareas
          </p>
        </div>

        {/* Two Column Layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1.5fr',
            gap: '24px',
            marginBottom: '32px',
            alignItems: 'start',
          }}
        >
          {/* Left Column - Agents Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px', paddingRight: '8px' }}>
            {AGENTS.map((agent) => (
              <AgentCard key={agent.id} agent={agent} isSelected={selectedAgent?.id === agent.id} onSelect={setSelectedAgent} />
            ))}
          </div>

          {/* Right Column - Interaction Panel */}
          <div
            style={{
              backgroundColor: '#13131A',
              border: `1px solid ${selectedAgent ? '#00E5A0' : 'rgba(255,255,255,0.08)'}`,
              borderRadius: '10px',
              padding: '24px',
              transition: 'border-color 0.2s',
            }}
          >
            {selectedAgent ? (
              <LegalAgentPanel agent={selectedAgent} apps={apps} onSubmit={handleExecuteAgent} isLoading={isLoading} recentExecutions={recentExecutions} />
            ) : (
              <EmptyState />
            )}
          </div>
        </div>

        {/* Inbox Section */}
        <div>
          <InboxSection />
        </div>
      </div>

      {toast && (
        <ToastNotification message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
