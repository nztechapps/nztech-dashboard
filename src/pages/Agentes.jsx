import { useState, useRef, useEffect } from 'react';
import { useApps } from '../hooks/useApps';
import { useIdeas } from '../hooks/useIdeas';
import { useAgentInbox } from '../hooks/useAgentInbox';
import ToastNotification from '../components/ui/ToastNotification';

const N8N_BASE_URL = import.meta.env.VITE_N8N_URL || 'http://localhost:5678';
const N8N_WEBHOOK_PATH = import.meta.env.VITE_N8N_WEBHOOK_PATH || 'webhook-test';
const IS_LOCAL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

const AGENTS = [
  {
    id: 'legal',
    name: 'Agente Legal',
    description: 'Genera política de privacidad y textos legales para Play Store',
    status: 'activo',
    webhook: IS_LOCAL
      ? `${N8N_BASE_URL}/${N8N_WEBHOOK_PATH}/agente-legal`
      : '/run-legal-agent',
    icon: 'shield',
  },
  {
    id: 'validator',
    name: 'Validar idea',
    description: 'Evalúa una idea de app con 6 criterios específicos de NZTech y da un score de viabilidad',
    status: 'activo',
    webhook: IS_LOCAL
      ? `${N8N_BASE_URL}/${N8N_WEBHOOK_PATH}/agente-validador`
      : '/run-validator-agent',
    icon: 'star',
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

const IconStar = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
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
    case 'star':
      return <IconStar />;
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
        backgroundColor: isSelected ? 'rgba(0,229,160,0.08)' : 'var(--surface)',
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
          e.currentTarget.style.backgroundColor = 'var(--surface)';
        }
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', color: getStatusColor(agent.status) }}>
        {getAgentIcon(agent.icon)}
        <h3 style={{ color: 'var(--text)', margin: 0, fontSize: '15px', fontWeight: '600', flex: 1 }}>
          {agent.name}
        </h3>
      </div>
      <p style={{ color: 'var(--text-muted)', margin: '0 0 12px 0', fontSize: '12px', lineHeight: '1.4' }}>
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

function AppIdeaAutocomplete({ items, selectedItem, onSelect }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  const filtered = query.length === 0
    ? items
    : items.filter((i) => i.label.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    const handleClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSelect = (item) => {
    onSelect(item);
    setQuery(item.label);
    setOpen(false);
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    setOpen(true);
    if (!e.target.value) onSelect(null);
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        onFocus={() => setOpen(true)}
        placeholder="Buscar app o idea..."
        autoComplete="off"
        style={{
          width: '100%',
          backgroundColor: 'var(--bg)',
          border: '1px solid var(--border)',
          borderRadius: '6px',
          padding: '10px 12px',
          color: 'var(--text)',
          fontSize: '13px',
          boxSizing: 'border-box',
          outline: 'none',
        }}
      />
      {open && filtered.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 100,
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            marginTop: '4px',
            maxHeight: '200px',
            overflowY: 'auto',
          }}
        >
          {filtered.map((item) => (
            <button
              key={item.key}
              type="button"
              onMouseDown={() => handleSelect(item)}
              style={{
                display: 'block',
                width: '100%',
                padding: '8px 12px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                color: 'var(--text)',
                fontSize: '13px',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: '600',
                  marginRight: '6px',
                  padding: '2px 5px',
                  borderRadius: '3px',
                  backgroundColor: item.source === 'app' ? 'rgba(0,229,160,0.15)' : 'rgba(100,100,255,0.15)',
                  color: item.source === 'app' ? 'var(--primary)' : '#8888ff',
                }}
              >
                {item.source === 'app' ? 'App' : 'Idea'}
              </span>
              {item.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function LegalAgentPanel({ agent, allItems, onSubmit, isLoading, recentExecutions }) {
  const [selectedItem, setSelectedItem] = useState(null);
  const [descripcion, setDescripcion] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedItem || !descripcion.trim()) return;
    const isIdea = selectedItem.source === 'idea';
    await onSubmit({
      app_id: isIdea ? null : selectedItem.id,
      idea_id: isIdea ? selectedItem.id : null,
      app_name: selectedItem.name,
      package_name: selectedItem.package_name || '',
      descripcion_app: selectedItem.descripcion || '',
      descripcion,
      source: selectedItem.source,
    });
    setSelectedItem(null);
    setDescripcion('');
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
          <div style={{ color: 'var(--primary)', fontSize: '24px' }}>
            {getAgentIcon(agent.icon)}
          </div>
          <div>
            <h2 style={{ color: 'var(--text)', margin: 0, fontSize: '18px', fontWeight: '600' }}>
              {agent.name}
            </h2>
          </div>
        </div>
        <span
          style={{
            backgroundColor: 'rgba(0,229,160,0.12)',
            color: 'var(--primary)',
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
        <p style={{ color: 'var(--text-muted)', margin: '12px 0 0 0', fontSize: '13px' }}>
          {agent.description}
        </p>
      </div>

      <div style={{ borderTop: '1px solid var(--border)' }} />

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '11px', marginBottom: '6px', fontWeight: '500' }}>
            App o Idea *
          </label>
          <AppIdeaAutocomplete
            items={allItems}
            selectedItem={selectedItem}
            onSelect={setSelectedItem}
          />
        </div>

        {selectedItem?.package_name && (
          <div>
            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '11px', marginBottom: '6px', fontWeight: '500' }}>
              Package
            </label>
            <input
              type="text"
              value={selectedItem.package_name}
              disabled
              style={{
                width: '100%',
                backgroundColor: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                padding: '10px 12px',
                color: 'var(--text-muted)',
                fontSize: '13px',
                boxSizing: 'border-box',
              }}
            />
          </div>
        )}

        <div>
          <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '11px', marginBottom: '6px', fontWeight: '500' }}>
            Descripción del problema o solicitud *
          </label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Describe qué necesitas..."
            required
            style={{
              width: '100%',
              backgroundColor: 'var(--bg)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              padding: '10px 12px',
              color: 'var(--text)',
              fontSize: '13px',
              boxSizing: 'border-box',
              minHeight: '100px',
              fontFamily: 'var(--font-mono)',
              resize: 'vertical',
            }}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !selectedItem || !descripcion}
          style={{
            padding: '10px 16px',
            backgroundColor: isLoading || !selectedItem || !descripcion ? '#999' : '#00E5A0',
            border: 'none',
            color: 'var(--bg)',
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
        <div style={{ borderTop: '1px solid var(--border)', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ color: 'var(--text)', margin: '0 0 12px 0', fontSize: '13px', fontWeight: '600' }}>
            Últimas ejecuciones
          </h3>
          <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recentExecutions.slice(0, 5).map((exec, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  fontSize: '11px',
                }}
              >
                <div style={{ color: 'var(--text)', fontWeight: '600', marginBottom: '4px' }}>
                  {exec.titulo || 'Sin título'}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '10px' }}>
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

const RECOMENDACION_COLOR = {
  publicar: '#00E5A0',
  esperar: '#FFB400',
  descartar: '#FF4D4F',
};

function ValidatorAgentPanel({ agent }) {
  const { ideas } = useIdeas();
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [form, setForm] = useState({ titulo: '', descripcion: '', mercado: '', categoria: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const wrapperRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const filtered = query.length === 0
    ? ideas
    : ideas.filter((i) => i.titulo?.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    const handleClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSelectIdea = (idea) => {
    setSelectedIdea(idea);
    setQuery(idea.titulo || '');
    setOpen(false);
    setForm({
      titulo: idea.titulo || '',
      descripcion: idea.descripcion || '',
      mercado: idea.mercado || '',
      categoria: idea.categoria || '',
    });
    setResult(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.titulo.trim()) return;
    try {
      setIsLoading(true);
      setError(null);
      setResult(null);
      const response = await fetch(agent.webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const text = await response.text();
      if (!response.ok) throw new Error(`Error ${response.status}: ${text || response.statusText}`);
      if (!text || !text.trim()) throw new Error('El agente no devolvió ninguna respuesta. Revisá que el workflow de n8n esté activo y retorne datos.');
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`Respuesta inválida del agente: ${text.slice(0, 200)}`);
      }
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    backgroundColor: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: '6px',
    padding: '10px 12px',
    color: 'var(--text)',
    fontSize: '13px',
    boxSizing: 'border-box',
    outline: 'none',
  };

  const labelStyle = {
    display: 'block',
    color: 'var(--text-muted)',
    fontSize: '11px',
    marginBottom: '6px',
    fontWeight: '500',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div style={{ color: 'var(--primary)' }}>{getAgentIcon(agent.icon)}</div>
          <h2 style={{ color: 'var(--text)', margin: 0, fontSize: '18px', fontWeight: '600' }}>{agent.name}</h2>
        </div>
        <span style={{ backgroundColor: 'rgba(0,229,160,0.12)', color: 'var(--primary)', fontSize: '11px', fontWeight: '600', padding: '4px 8px', borderRadius: '4px', display: 'inline-block' }}>
          {agent.status}
        </span>
        <p style={{ color: 'var(--text-muted)', margin: '12px 0 0 0', fontSize: '13px' }}>{agent.description}</p>
      </div>

      <div style={{ borderTop: '1px solid var(--border)' }} />

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Idea autocomplete */}
        <div>
          <label style={labelStyle}>Idea del portfolio (opcional)</label>
          <div ref={wrapperRef} style={{ position: 'relative' }}>
            <input
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
              onFocus={() => setOpen(true)}
              placeholder="Buscar idea guardada..."
              autoComplete="off"
              style={inputStyle}
            />
            {open && filtered.length > 0 && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100, backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', marginTop: '4px', maxHeight: '180px', overflowY: 'auto' }}>
                {filtered.map((idea) => (
                  <button
                    key={idea.id}
                    type="button"
                    onMouseDown={() => handleSelectIdea(idea)}
                    style={{ display: 'block', width: '100%', padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', color: 'var(--text)', fontSize: '13px' }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    {idea.titulo}
                    {idea.categoria && <span style={{ marginLeft: '6px', fontSize: '10px', color: 'var(--text-muted)' }}>{idea.categoria}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <label style={labelStyle}>Título de la idea *</label>
          <input type="text" value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} placeholder="ej. Calculadora de propinas" required style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Descripción</label>
          <textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} placeholder="Describe qué hace la app..." style={{ ...inputStyle, minHeight: '80px', fontFamily: 'var(--font-mono)', resize: 'vertical' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={labelStyle}>Mercado</label>
            <input type="text" value={form.mercado} onChange={(e) => setForm({ ...form, mercado: e.target.value })} placeholder="ej. Global, LATAM" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Categoría</label>
            <input type="text" value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} placeholder="ej. Utilities, Finance" style={inputStyle} />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !form.titulo.trim()}
          style={{ padding: '10px 16px', backgroundColor: isLoading || !form.titulo.trim() ? '#999' : '#00E5A0', border: 'none', color: 'var(--bg)', borderRadius: '6px', cursor: isLoading ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          {isLoading && <IconSpinner />}
          {isLoading ? 'Evaluando...' : 'Evaluar idea'}
        </button>
      </form>

      {error && (
        <div style={{ backgroundColor: 'rgba(255,77,79,0.1)', border: '1px solid rgba(255,77,79,0.3)', borderRadius: '6px', padding: '10px 12px', color: '#FF4D4F', fontSize: '12px' }}>
          {error}
        </div>
      )}

      {result && (
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Score + Veredicto */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ textAlign: 'center', minWidth: '64px' }}>
              <div style={{ fontSize: '36px', fontWeight: '700', color: result.score >= 7 ? '#00E5A0' : result.score >= 4 ? '#FFB400' : '#FF4D4F', fontFamily: 'var(--font-mono)' }}>
                {result.score}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>/ 10</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ marginBottom: '6px' }}>
                <span style={{ backgroundColor: `${RECOMENDACION_COLOR[result.recomendacion] || '#999'}22`, color: RECOMENDACION_COLOR[result.recomendacion] || '#999', fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                  {result.recomendacion}
                </span>
              </div>
              <p style={{ color: 'var(--text)', fontSize: '13px', margin: 0, lineHeight: '1.5' }}>{result.veredicto}</p>
            </div>
          </div>

          {/* Análisis por criterio */}
          {result.analisis?.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {result.analisis.map((item) => (
                <div key={item.criterio} style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '6px', padding: '10px 12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--text)', fontSize: '12px', fontWeight: '600' }}>{item.criterio}</span>
                    <span style={{ color: item.puntaje >= 7 ? '#00E5A0' : item.puntaje >= 4 ? '#FFB400' : '#FF4D4F', fontSize: '13px', fontWeight: '700', fontFamily: 'var(--font-mono)' }}>{item.puntaje}/10</span>
                  </div>
                  <div style={{ width: '100%', height: '3px', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '2px', marginBottom: '6px' }}>
                    <div style={{ width: `${item.puntaje * 10}%`, height: '100%', backgroundColor: item.puntaje >= 7 ? '#00E5A0' : item.puntaje >= 4 ? '#FFB400' : '#FF4D4F', borderRadius: '2px', transition: 'width 0.4s' }} />
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '11px', margin: 0, lineHeight: '1.4' }}>{item.texto}</p>
                </div>
              ))}
            </div>
          )}
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
      <p style={{ color: 'var(--text-subtle)', fontSize: '13px', margin: 0 }}>
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
    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
      <h2 style={{ color: 'var(--text)', fontSize: '18px', fontWeight: '600', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
        Inbox de agentes
        {pendingCount > 0 && (
          <span
            style={{
              backgroundColor: '#FF4D4F',
              color: 'var(--text)',
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
              color: filterType === type.value ? 'var(--bg)' : '#999',
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
        <div style={{ backgroundColor: 'var(--surface)', border: '1px dashed rgba(255,255,255,0.12)', borderRadius: '8px', padding: '24px', textAlign: 'center', color: 'var(--text-subtle)', fontSize: '12px' }}>
          No hay items {filterType ? `en esta categoría` : 'aún'}
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '8px' }}>
          {filteredItems.map((item) => (
            <div
              key={item.id}
              style={{
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
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
                        color: 'var(--primary)',
                        fontSize: '10px',
                        fontWeight: '600',
                        padding: '2px 6px',
                        borderRadius: '3px',
                        textTransform: 'capitalize',
                      }}
                    >
                      {item.tipo || 'inbox'}
                    </span>
                    <h4 style={{ color: 'var(--text)', margin: 0, fontSize: '13px', fontWeight: '600', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.titulo || 'Sin título'}
                    </h4>
                  </div>
                  <p
                    style={{
                      color: 'var(--text-muted)',
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
                  <div style={{ color: 'var(--text-subtle)', fontSize: '10px', marginTop: '4px' }}>
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
                    color: 'var(--text-muted)',
                    flexShrink: 0,
                  }}
                />
              </button>

              {expandedId === item.id && (
                <div style={{ borderTop: '1px solid var(--border)', padding: '12px', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '12px', fontFamily: 'var(--font-mono)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
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
  const { ideas } = useIdeas();
  const { items } = useAgentInbox();

  const allItems = [
    ...(apps || []).map((a) => ({
      key: `app-${a.id}`,
      id: a.id,
      source: 'app',
      name: a.nombre || a.name,
      label: `[App] ${a.nombre || a.name}`,
      package_name: a.package_name || '',
      descripcion: a.descripcion || '',
    })),
    ...(ideas || []).map((i) => ({
      key: `idea-${i.id}`,
      id: i.id,
      source: 'idea',
      name: i.titulo,
      label: `[Idea] ${i.titulo}`,
      package_name: i.package_name || '',
      descripcion: i.descripcion || '',
    })),
  ];
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
    <div style={{ backgroundColor: 'var(--bg)', minHeight: '100%', padding: '24px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ color: 'var(--text)', fontSize: '28px', fontWeight: '600', margin: 0 }}>
            Agentes
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '8px 0 0 0' }}>
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
              backgroundColor: 'var(--surface)',
              border: `1px solid ${selectedAgent ? '#00E5A0' : 'rgba(255,255,255,0.08)'}`,
              borderRadius: '10px',
              padding: '24px',
              transition: 'border-color 0.2s',
            }}
          >
            {selectedAgent?.id === 'legal' ? (
              <LegalAgentPanel agent={selectedAgent} allItems={allItems} onSubmit={handleExecuteAgent} isLoading={isLoading} recentExecutions={recentExecutions} />
            ) : selectedAgent?.id === 'validator' ? (
              <ValidatorAgentPanel agent={selectedAgent} />
            ) : selectedAgent ? (
              <EmptyState />
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
