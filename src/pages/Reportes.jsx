import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const IconDocument = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
  </svg>
);

const IconChevronDown = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

export default function Reportes() {
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [agents, setAgents] = useState([]);

  useEffect(() => {
    fetchReportes();
  }, []);

  const fetchReportes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('agent_inbox')
        .select('*')
        .eq('tipo', 'reporte')
        .order('created_at', { ascending: false });

      if (error) {
        // Tabla might not exist yet
        console.log('Note: agent_inbox table not found or no reportes yet');
        setReportes([]);
      } else {
        setReportes(data || []);
        // Extract unique agents
        const uniqueAgents = [...new Set(data?.map((r) => r.agent) || [])];
        setAgents(uniqueAgents.filter(Boolean));
      }
    } catch (err) {
      console.error('Error fetching reportes:', err);
      setReportes([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredReportes = selectedAgent
    ? reportes.filter((r) => r.agent === selectedAgent)
    : reportes;

  return (
    <div style={{ backgroundColor: '#0A0A0F', minHeight: '100vh', padding: '24px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <IconDocument style={{ color: '#00E5A0' }} />
            <h1 style={{ color: 'white', fontSize: '28px', fontWeight: '600', margin: 0 }}>
              Reportes
            </h1>
          </div>
          <p style={{ color: '#999', fontSize: '13px', margin: 0 }}>
            Los agentes depositarán reportes automáticamente aquí
          </p>
        </div>

        {/* Filtro por agente */}
        {agents.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#999', fontSize: '11px', marginBottom: '6px', fontWeight: '500' }}>
              Filtrar por agente
            </label>
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              style={{
                backgroundColor: '#13131A',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '6px',
                padding: '10px 12px',
                color: 'white',
                fontSize: '13px',
              }}
            >
              <option value="">Todos los agentes</option>
              {agents.map((agent) => (
                <option key={agent} value={agent}>
                  {agent}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Contenido */}
        {loading ? (
          <div style={{ color: '#999', textAlign: 'center', padding: '40px 0' }}>
            Cargando...
          </div>
        ) : filteredReportes.length === 0 ? (
          <div
            style={{
              backgroundColor: '#13131A',
              border: '1px dashed rgba(255,255,255,0.12)',
              borderRadius: '10px',
              padding: '40px 20px',
              textAlign: 'center',
            }}
          >
            <p style={{ color: '#666', margin: 0, fontSize: '13px' }}>
              Los agentes depositarán reportes automáticamente aquí
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '12px' }}>
            {filteredReportes.map((reporte) => (
              <div
                key={reporte.id}
                style={{
                  backgroundColor: '#13131A',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '8px',
                  overflow: 'hidden',
                }}
              >
                <button
                  onClick={() => setExpandedId(expandedId === reporte.id ? null : reporte.id)}
                  style={{
                    width: '100%',
                    background: 'none',
                    border: 'none',
                    padding: '16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div style={{ textAlign: 'left', flex: 1 }}>
                    <h3 style={{ color: 'white', margin: '0 0 6px 0', fontSize: '14px', fontWeight: '600' }}>
                      {reporte.titulo || 'Reporte sin título'}
                    </h3>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      {reporte.agent && (
                        <span
                          style={{
                            backgroundColor: 'rgba(0,229,160,0.12)',
                            color: '#00E5A0',
                            fontSize: '10px',
                            fontWeight: '600',
                            padding: '4px 8px',
                            borderRadius: '4px',
                          }}
                        >
                          {reporte.agent}
                        </span>
                      )}
                      <span style={{ color: '#999', fontSize: '12px' }}>
                        {new Date(reporte.created_at).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                  <IconChevronDown
                    style={{
                      transform: expandedId === reporte.id ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s',
                      color: '#999',
                    }}
                  />
                </button>

                {expandedId === reporte.id && (
                  <div
                    style={{
                      borderTop: '1px solid rgba(255,255,255,0.08)',
                      padding: '16px',
                      backgroundColor: 'rgba(255,255,255,0.02)',
                    }}
                  >
                    <div
                      style={{
                        color: 'rgba(255,255,255,0.7)',
                        fontSize: '13px',
                        fontFamily: 'DM Mono, monospace',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      }}
                    >
                      {reporte.contenido || 'Sin contenido'}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
