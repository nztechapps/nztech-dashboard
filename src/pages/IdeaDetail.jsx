import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import ToastNotification from '../components/ui/ToastNotification';

const IconArrowLeft = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
);

const IconRocket = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4.5 16.5c-1.5-1.5-2-3.5-2-5.5 0-4.5 3.5-8 8-8s8 3.5 8 8-3.5 8-8 8c-2 0-4-0.5-5.5-2"></path>
    <polyline points="12 4 12 12 9 12"></polyline>
  </svg>
);

const IconBeaker = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 3h16v7c0 1.657-1.343 3-3 3h-10c-1.657 0-3-1.343-3-3v-7z"></path>
    <line x1="9" y1="16" x2="15" y2="16"></line>
    <line x1="8" y1="20" x2="16" y2="20"></line>
  </svg>
);

const IconFileText = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="12" y1="13" x2="8" y2="13"></line>
    <line x1="12" y1="17" x2="8" y2="17"></line>
  </svg>
);

const getStatusColor = (estado) => {
  switch (estado) {
    case 'idea':
      return '#999';
    case 'investigando':
      return '#6496FF';
    case 'aprobada':
      return '#00E5A0';
    case 'descartada':
      return '#FF4D4F';
    default:
      return '#999';
  }
};

const StarRating = ({ value }) => (
  <div style={{ display: 'flex', gap: '4px' }}>
    {[1, 2, 3, 4, 5].map((star) => (
      <span key={star} style={{ fontSize: '20px', opacity: star <= value ? 1 : 0.3 }}>
        ★
      </span>
    ))}
  </div>
);

const parseField = (val) => {
  if (!val) return null;

  if (typeof val === 'string') {
    let text = val.replace(/```json/g, '').replace(/```/g, '').trim();
    try {
      return JSON.parse(text);
    } catch (e1) {
      const match = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      if (match) {
        try {
          return JSON.parse(match[0]);
        } catch (e2) {}
      }
    }
  }

  return val;
};

const renderField = (value) => {
  if (Array.isArray(value)) {
    if (value.length === 0) return 'Sin datos';

    // Competidores: {nombre, debilidad}
    if (value[0]?.nombre && value[0]?.debilidad !== undefined && !value[0]?.url) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {value.map((item, i) => (
            <div key={i} style={{ paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <strong style={{ color: '#00E5A0' }}>{item.nombre}</strong>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', marginTop: '4px' }}>
                {item.debilidad}
              </div>
            </div>
          ))}
        </div>
      );
    }

    // APIs sugeridas: {nombre, url, gratuita, uso}
    if (value[0]?.nombre && value[0]?.url !== undefined) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {value.map((item, i) => (
            <div key={i} style={{ paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <strong style={{ color: '#00E5A0' }}>{item.nombre}</strong>
              {item.url && (
                <div style={{ color: '#6496FF', fontSize: '11px', marginTop: '2px' }}>
                  {item.url}
                </div>
              )}
              {item.gratuita !== undefined && (
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', marginTop: '2px' }}>
                  {item.gratuita ? '✓ Gratuita' : '💰 De pago'}
                </div>
              )}
              {item.uso && (
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px', marginTop: '4px' }}>
                  {item.uso}
                </div>
              )}
            </div>
          ))}
        </div>
      );
    }

    // Pantallas de specs: {nombre, descripcion, elementos, tab}
    if (value[0]?.nombre && value[0]?.descripcion !== undefined && value[0]?.elementos) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {value.map((item, i) => (
            <div key={i} style={{ paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <strong style={{ color: '#00E5A0' }}>{item.nombre}</strong>
              {item.tab && (
                <div style={{ color: '#7C6AFF', fontSize: '10px', marginTop: '2px', fontFamily: 'DM Mono, monospace' }}>
                  [{item.tab}]
                </div>
              )}
              {item.descripcion && (
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px', marginTop: '4px' }}>
                  {item.descripcion}
                </div>
              )}
              {item.elementos && (
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', marginTop: '4px' }}>
                  <div style={{ fontWeight: '500', marginBottom: '2px' }}>Elementos:</div>
                  {item.elementos}
                </div>
              )}
            </div>
          ))}
        </div>
      );
    }

    // Por defecto, renderizar como lista simple
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {value.map((item, i) => (
          <div key={i} style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>
            {typeof item === 'object' ? JSON.stringify(item) : String(item)}
          </div>
        ))}
      </div>
    );
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return value;
  }

  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2);
  }

  return String(value);
};

const ResearchSection = ({ data }) => {
  if (!data) return null;

  const fields = [
    { key: 'resumen', label: 'Resumen' },
    { key: 'competidores', label: 'Competidores' },
    { key: 'publico_objetivo', label: 'Público Objetivo' },
    { key: 'propuesta_valor', label: 'Propuesta de Valor' },
    { key: 'aso', label: 'ASO (Estrategia)' },
    { key: 'monetizacion', label: 'Monetización' },
    { key: 'diseno', label: 'Diseño' },
    { key: 'apis_sugeridas', label: 'APIs Sugeridas' },
    { key: 'riesgos', label: 'Riesgos' },
  ];

  let parsedData = data;
  if (typeof data === 'string') {
    try {
      parsedData = JSON.parse(data);
    } catch (e) {
      return <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>{data}</div>;
    }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : '1fr 1fr', gap: '16px' }}>
      {fields.map(({ key, label }) => {
        const value = parsedData[key];
        if (!value) return null;

        // ASO especial: {titulo, keywords[], descripcion_corta}
        if (key === 'aso' && typeof value === 'object') {
          const aso = typeof value === 'string' ? JSON.parse(value) : value;
          return (
            <div key={key} style={{ backgroundColor: '#13131A', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h3 style={{ color: '#999', fontSize: '11px', fontWeight: '600', margin: '0 0 8px 0', textTransform: 'uppercase' }}>
                {label}
              </h3>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', lineHeight: '1.5' }}>
                {aso.titulo && <p style={{ margin: '0 0 8px 0', fontWeight: '600', color: '#00E5A0' }}>{aso.titulo}</p>}
                {aso.descripcion_corta && <p style={{ margin: '0 0 8px 0' }}>{aso.descripcion_corta}</p>}
                {aso.keywords && Array.isArray(aso.keywords) && (
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {aso.keywords.map((k, i) => (
                      <span key={i} style={{ backgroundColor: 'rgba(100,150,255,0.2)', color: '#6496FF', padding: '4px 8px', borderRadius: '4px', fontSize: '11px' }}>
                        {k}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        }

        // DISEÑO especial: {paleta[], tipografia_display, estilo}
        if (key === 'diseno' && typeof value === 'object') {
          const diseno = typeof value === 'string' ? JSON.parse(value) : value;
          return (
            <div key={key} style={{ backgroundColor: '#13131A', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h3 style={{ color: '#999', fontSize: '11px', fontWeight: '600', margin: '0 0 8px 0', textTransform: 'uppercase' }}>
                {label}
              </h3>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', lineHeight: '1.5' }}>
                {diseno.paleta && Array.isArray(diseno.paleta) && (
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '11px', fontWeight: '500', marginBottom: '6px', color: '#999' }}>Paleta de Colores</div>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      {diseno.paleta.map((color, i) => (
                        <div key={i} style={{ textAlign: 'center' }}>
                          <div style={{ width: '40px', height: '40px', backgroundColor: color, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '4px' }}></div>
                          <div style={{ fontSize: '10px', color: '#999' }}>{color}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {diseno.tipografia_display && <p style={{ margin: '8px 0' }}><strong>Tipografía:</strong> {diseno.tipografia_display}</p>}
                {diseno.estilo && <p style={{ margin: '8px 0' }}><strong>Estilo:</strong> {diseno.estilo}</p>}
              </div>
            </div>
          );
        }

        // MONETIZACIÓN especial: {modelo, revenue_estimado_mensual_usd}
        if (key === 'monetizacion' && typeof value === 'object') {
          const monetizacion = typeof value === 'string' ? JSON.parse(value) : value;
          return (
            <div key={key} style={{ backgroundColor: '#13131A', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h3 style={{ color: '#999', fontSize: '11px', fontWeight: '600', margin: '0 0 8px 0', textTransform: 'uppercase' }}>
                {label}
              </h3>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', lineHeight: '1.5' }}>
                {monetizacion.modelo && <p style={{ margin: '0 0 8px 0' }}><strong>{monetizacion.modelo}</strong></p>}
                {monetizacion.revenue_estimado_mensual_usd && (
                  <p style={{ margin: 0, fontSize: '14px', color: '#00E5A0', fontWeight: '600' }}>
                    ${monetizacion.revenue_estimado_mensual_usd}/mes
                  </p>
                )}
              </div>
            </div>
          );
        }

        // Renderizado por defecto con renderField
        return (
          <div key={key} style={{ backgroundColor: '#13131A', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h3 style={{ color: '#999', fontSize: '11px', fontWeight: '600', margin: '0 0 8px 0', textTransform: 'uppercase' }}>
              {label}
            </h3>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', lineHeight: '1.5' }}>
              {renderField(value)}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default function IdeaDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [idea, setIdea] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sendingPipeline, setSendingPipeline] = useState(false);
  const [generatingResearch, setGeneratingResearch] = useState(false);
  const [generatingSpecs, setGeneratingSpecs] = useState(false);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState('info');
  const [editingFields, setEditingFields] = useState({});
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const tabs = ['info', 'research', 'specs', 'pipeline'];

  const hasContent = {
    info: true,
    research: !!idea?.research_mercado || !!idea?.research,
    specs: !!(idea?.specs_pantallas || idea?.specs_flujos || idea?.specs_apis || idea?.complejidad),
    pipeline: !!idea?.paso_agente >= 2,
  };

  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    setTouchEnd(e.changedTouches[0].clientX);
    handleSwipe();
  };

  const handleSwipe = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      const currentIndex = tabs.indexOf(activeTab);
      if (currentIndex < tabs.length - 1) {
        setActiveTab(tabs[currentIndex + 1]);
      }
    }
    if (isRightSwipe) {
      const currentIndex = tabs.indexOf(activeTab);
      if (currentIndex > 0) {
        setActiveTab(tabs[currentIndex - 1]);
      }
    }
  };

  useEffect(() => {
    fetchIdea();
  }, [id]);

  const fetchIdea = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        throw new Error('Idea no encontrada');
      }

      setIdea(data);
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
      setTimeout(() => navigate('/ideas'), 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (field, value) => {
    setEditingFields(prev => ({ ...prev, [field]: value }));
  };

  const handleFieldBlur = async (field, newValue) => {
    if (newValue !== idea[field]) {
      try {
        const { error } = await supabase
          .from('ideas')
          .update({ [field]: newValue })
          .eq('id', idea.id);
        if (error) throw error;
        setIdea(prev => ({ ...prev, [field]: newValue }));
        setToast({ message: '✓ Guardado', type: 'success' });
      } catch (err) {
        setToast({ message: err.message, type: 'error' });
      }
    }
    setEditingFields(prev => ({ ...prev, [field]: undefined }));
  };

  const handleGenerateResearch = async () => {
    setGeneratingResearch(true);
    try {
      const response = await fetch('http://localhost:5678/webhook/idea-research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea: {
            titulo: idea.titulo,
            descripcion: idea.descripcion,
            mercado: idea.mercado || '',
            categoria: idea.categoria || '',
            publico: idea.publico || '',
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Error al conectar con n8n. Verifica que esté corriendo en http://localhost:5678');
      }

      const result = await response.json();

      const { error: updateError } = await supabase
        .from('ideas')
        .update({
          research: result,
          research_mercado: JSON.stringify(result, null, 2),
          estado: 'investigando'
        })
        .eq('id', idea.id);

      if (updateError) throw updateError;

      setIdea(prev => ({
        ...prev,
        research: result,
        research_mercado: JSON.stringify(result, null, 2),
        estado: 'investigando'
      }));

      setToast({ message: '✓ Research generado exitosamente', type: 'success' });
    } catch (err) {
      console.error('Error generating research:', err);
      const errorMsg = err.message.includes('Failed to fetch') || err.message.includes('localhost')
        ? '⚠️ n8n no está corriendo. Ejecutá: npm start en la carpeta de n8n'
        : err.message;
      setToast({ message: errorMsg, type: 'error' });
    } finally {
      setGeneratingResearch(false);
    }
  };

  const handleGenerateSpecs = async () => {
    setGeneratingSpecs(true);
    try {
      const response = await fetch('http://localhost:5678/webhook/idea-specs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea: {
            titulo: idea.titulo,
            descripcion: idea.descripcion,
            mercado: idea.mercado || '',
            categoria: idea.categoria || '',
            publico: idea.publico || '',
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Error al conectar con n8n. Verifica que esté corriendo en http://localhost:5678');
      }

      const result = await response.json();

      const { error: updateError } = await supabase
        .from('ideas')
        .update({
          specs: result,
          specs_pantallas: result.pantallas || '',
          specs_flujos: result.flujos || '',
          specs_apis: result.apis || '',
          complejidad: result.complejidad || '',
        })
        .eq('id', idea.id);

      if (updateError) throw updateError;

      setIdea(prev => ({
        ...prev,
        specs: result,
        specs_pantallas: result.pantallas || '',
        specs_flujos: result.flujos || '',
        specs_apis: result.apis || '',
        complejidad: result.complejidad || '',
      }));

      setToast({ message: '✓ Specs generados exitosamente', type: 'success' });
    } catch (err) {
      console.error('Error generating specs:', err);
      const errorMsg = err.message.includes('Failed to fetch') || err.message.includes('localhost')
        ? '⚠️ n8n no está corriendo. Ejecutá: npm start en la carpeta de n8n'
        : err.message;
      setToast({ message: errorMsg, type: 'error' });
    } finally {
      setGeneratingSpecs(false);
    }
  };

  const handleSendToPipeline = async () => {
    setSendingPipeline(true);
    try {
      const response = await fetch('http://localhost:3001/pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: idea.titulo,
          descripcion: idea.descripcion,
          publico: idea.publico || 'Usuarios argentinos',
          categoria: idea.categoria || 'utilidad-global',
          mercado: idea.mercado || '',
          idea_id: idea.id,
        }),
      });

      if (!response.ok) {
        throw new Error('El servidor local no está corriendo. Ejecutá: node server.js en la carpeta del pipeline');
      }

      const result = await response.json();
      const { runId } = result;

      const { error: updateError } = await supabase
        .from('ideas')
        .update({ estado: 'aprobada' })
        .eq('id', idea.id);

      if (updateError) throw updateError;

      setToast({ message: '✓ Pipeline iniciado', type: 'success' });
      setTimeout(() => navigate(`/pipeline?runId=${runId}`), 1500);
    } catch (err) {
      console.error('Error sending to pipeline:', err);
      const errorMsg = err.message.includes('Failed to fetch') || err.message.includes('localhost')
        ? '⚠️ El servidor local no está corriendo. Ejecutá: node server.js en la carpeta del pipeline'
        : err.message;
      setToast({ message: errorMsg, type: 'error' });
    } finally {
      setSendingPipeline(false);
    }
  };

  if (loading) {
    return (
      <div style={{ backgroundColor: '#0A0A0F', minHeight: '100vh', padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#999', fontSize: '16px' }}>Cargando...</div>
      </div>
    );
  }

  if (!idea) {
    return (
      <div style={{ backgroundColor: '#0A0A0F', minHeight: '100vh', padding: '24px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', color: '#999', textAlign: 'center' }}>
          Idea no encontrada
        </div>
      </div>
    );
  }

  const researchData = idea.research || (idea.research_mercado ? JSON.parse(idea.research_mercado) : null);
  const specsData = idea.specs || {
    pantallas: parseField(idea.specs_pantallas),
    flujos: parseField(idea.specs_flujos),
    apis: parseField(idea.specs_apis),
    complejidad: idea.complejidad,
  };

  return (
    <div style={{
      backgroundColor: '#0A0A0F',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      padding: 0
    }}>
      {/* Sticky Header */}
      <div style={{
        backgroundColor: '#0A0A0F',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '16px 24px',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <button
          onClick={() => navigate('/ideas')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'transparent',
            border: 'none',
            color: '#00E5A0',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            padding: '0',
            marginBottom: '12px',
          }}
        >
          <IconArrowLeft /> Volver a Ideas
        </button>

        <h1 style={{ color: 'white', fontSize: '28px', fontWeight: '700', margin: 0 }}>
          {idea.titulo}
        </h1>
      </div>

      {/* Main Content Container */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        maxWidth: '900px',
        width: '100%',
        margin: '0 auto',
        padding: '20px 24px',
        boxSizing: 'border-box',
      }}>
        {/* Tabs Navigation */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px', overflow: 'auto' }}>
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              disabled={!hasContent[tab]}
              style={{
                padding: '8px 16px',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: activeTab === tab ? '#00E5A0' : 'transparent',
                color: activeTab === tab ? '#0A0A0F' : hasContent[tab] ? 'rgba(255,255,255,0.7)' : '#666',
                fontSize: '13px',
                fontWeight: '600',
                cursor: hasContent[tab] ? 'pointer' : 'not-allowed',
                textTransform: 'capitalize',
                transition: 'all 200ms ease',
                opacity: hasContent[tab] ? 1 : 0.5,
                whiteSpace: 'nowrap',
              }}
            >
              {tab === 'info' ? 'Info' : tab === 'research' ? 'Research' : tab === 'specs' ? 'Specs' : 'Pipeline'}
            </button>
          ))}
        </div>

        {/* Content Area with Touch Events */}
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          style={{
            position: 'relative',
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            overflowX: 'hidden',
            paddingRight: '4px',
          }}
        >
          {/* Info Tab */}
          <div
            style={{
              opacity: activeTab === 'info' ? 1 : 0,
              transform: activeTab === 'info' ? 'translateX(0)' : 'translateX(20px)',
              transition: 'all 200ms ease',
              pointerEvents: activeTab === 'info' ? 'auto' : 'none',
              position: activeTab === 'info' ? 'relative' : 'absolute',
              width: '100%',
              maxHeight: '100%',
            }}
          >
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px' }}>
              <span
                style={{
                  backgroundColor: 'rgba(0,229,160,0.12)',
                  color: getStatusColor(idea.estado),
                  fontSize: '12px',
                  fontWeight: '600',
                  padding: '6px 12px',
                  borderRadius: '6px',
                }}
              >
                {idea.estado || 'idea'}
              </span>
              {idea.mercado && (
                <span
                  style={{
                    backgroundColor: 'rgba(100,150,255,0.12)',
                    color: '#6496FF',
                    fontSize: '12px',
                    fontWeight: '600',
                    padding: '6px 12px',
                    borderRadius: '6px',
                  }}
                >
                  {idea.mercado}
                </span>
              )}
              {idea.categoria && (
                <span
                  style={{
                    backgroundColor: 'rgba(124,106,255,0.12)',
                    color: '#7C6AFF',
                    fontSize: '12px',
                    fontWeight: '600',
                    padding: '6px 12px',
                    borderRadius: '6px',
                  }}
                >
                  {idea.categoria}
                </span>
              )}
            </div>

            {idea.prioridad && (
              <div style={{ marginBottom: '24px' }}>
                <div style={{ color: '#999', fontSize: '12px', marginBottom: '8px', fontWeight: '500' }}>Prioridad</div>
                <StarRating value={idea.prioridad} />
              </div>
            )}

            {/* Editable Descripción */}
            {idea.descripcion && (
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ color: '#00E5A0', fontSize: '14px', fontWeight: '600', marginBottom: '12px', textTransform: 'uppercase' }}>
                  Descripción
                </h2>
                {editingFields.descripcion !== undefined ? (
                  <textarea
                    autoFocus
                    value={editingFields.descripcion}
                    onChange={(e) => handleFieldChange('descripcion', e.target.value)}
                    onBlur={(e) => handleFieldBlur('descripcion', e.target.value)}
                    style={{
                      width: '100%',
                      minHeight: '100px',
                      padding: '12px',
                      backgroundColor: '#13131A',
                      border: '1px solid #00E5A0',
                      borderRadius: '6px',
                      color: 'white',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                      boxSizing: 'border-box',
                    }}
                  />
                ) : (
                  <p
                    onClick={() => setEditingFields({ ...editingFields, descripcion: idea.descripcion })}
                    style={{
                      color: 'rgba(255,255,255,0.7)',
                      fontSize: '14px',
                      lineHeight: '1.6',
                      margin: 0,
                      whiteSpace: 'pre-wrap',
                      cursor: 'pointer',
                      padding: '8px',
                      borderRadius: '4px',
                    }}
                    title="Click para editar"
                  >
                    {idea.descripcion}
                  </p>
                )}
              </div>
            )}

            {/* Público y Categoría editables */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <div>
                <div style={{ color: '#999', fontSize: '12px', marginBottom: '8px', fontWeight: '500', textTransform: 'uppercase' }}>
                  Público
                </div>
                {editingFields.publico !== undefined ? (
                  <input
                    autoFocus
                    type="text"
                    value={editingFields.publico}
                    onChange={(e) => handleFieldChange('publico', e.target.value)}
                    onBlur={(e) => handleFieldBlur('publico', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      backgroundColor: '#13131A',
                      border: '1px solid #00E5A0',
                      borderRadius: '6px',
                      color: 'white',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box',
                    }}
                  />
                ) : (
                  <div
                    onClick={() => setEditingFields({ ...editingFields, publico: idea.publico || '' })}
                    style={{
                      padding: '10px 12px',
                      backgroundColor: '#13131A',
                      borderRadius: '6px',
                      color: 'rgba(255,255,255,0.7)',
                      fontSize: '14px',
                      cursor: 'pointer',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                    title="Click para editar"
                  >
                    {idea.publico || 'Sin especificar'}
                  </div>
                )}
              </div>

              <div>
                <div style={{ color: '#999', fontSize: '12px', marginBottom: '8px', fontWeight: '500', textTransform: 'uppercase' }}>
                  Categoría
                </div>
                {editingFields.categoria !== undefined ? (
                  <input
                    autoFocus
                    type="text"
                    value={editingFields.categoria}
                    onChange={(e) => handleFieldChange('categoria', e.target.value)}
                    onBlur={(e) => handleFieldBlur('categoria', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      backgroundColor: '#13131A',
                      border: '1px solid #00E5A0',
                      borderRadius: '6px',
                      color: 'white',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box',
                    }}
                  />
                ) : (
                  <div
                    onClick={() => setEditingFields({ ...editingFields, categoria: idea.categoria || '' })}
                    style={{
                      padding: '10px 12px',
                      backgroundColor: '#13131A',
                      borderRadius: '6px',
                      color: 'rgba(255,255,255,0.7)',
                      fontSize: '14px',
                      cursor: 'pointer',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                    title="Click para editar"
                  >
                    {idea.categoria || 'Sin especificar'}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                onClick={handleGenerateResearch}
                disabled={generatingResearch}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  backgroundColor: idea.research_mercado ? '#6496FF' : '#00E5A0',
                  border: 'none',
                  color: '#0A0A0F',
                  borderRadius: '6px',
                  cursor: generatingResearch ? 'not-allowed' : 'pointer',
                  fontSize: '13px',
                  fontWeight: '600',
                  opacity: generatingResearch ? 0.6 : 1,
                  transition: 'all 200ms ease',
                }}
              >
                <IconBeaker />
                {generatingResearch ? 'Generando research...' : (idea.research_mercado ? 'Actualizar Research' : 'Generar Research')}
              </button>

              <button
                onClick={handleGenerateSpecs}
                disabled={generatingSpecs || !idea.research_mercado}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  backgroundColor: idea.specs_pantallas ? '#7C6AFF' : '#00E5A0',
                  border: 'none',
                  color: '#0A0A0F',
                  borderRadius: '6px',
                  cursor: generatingSpecs || !idea.research_mercado ? 'not-allowed' : 'pointer',
                  fontSize: '13px',
                  fontWeight: '600',
                  opacity: (generatingSpecs || !idea.research_mercado) ? 0.5 : 1,
                  transition: 'all 200ms ease',
                }}
                title={!idea.research_mercado ? 'Primero genera el Research' : ''}
              >
                <IconFileText />
                {generatingSpecs ? 'Generando specs...' : (idea.specs_pantallas ? 'Actualizar Specs' : 'Generar Specs')}
              </button>
            </div>
          </div>

          {/* Research Tab */}
          <div
            style={{
              opacity: activeTab === 'research' ? 1 : 0,
              transform: activeTab === 'research' ? 'translateX(0)' : 'translateX(20px)',
              transition: 'all 200ms ease',
              pointerEvents: activeTab === 'research' ? 'auto' : 'none',
              position: activeTab === 'research' ? 'relative' : 'absolute',
              width: '100%',
              maxHeight: '100%',
            }}
          >
            {researchData ? (
              <ResearchSection data={researchData} />
            ) : (
              <div style={{ backgroundColor: '#13131A', padding: '20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
                <p style={{ color: '#999', margin: 0 }}>No hay research aún. Genera uno con el botón en Info.</p>
              </div>
            )}
          </div>

          {/* Specs Tab */}
          <div
            style={{
              opacity: activeTab === 'specs' ? 1 : 0,
              transform: activeTab === 'specs' ? 'translateX(0)' : 'translateX(20px)',
              transition: 'all 200ms ease',
              pointerEvents: activeTab === 'specs' ? 'auto' : 'none',
              position: activeTab === 'specs' ? 'relative' : 'absolute',
              width: '100%',
              maxHeight: '100%',
            }}
          >
            {idea.specs_pantallas || idea.specs_flujos || idea.specs_apis || idea.complejidad ? (
              <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : '1fr 1fr', gap: '16px' }}>
                {/* Pantallas */}
                {idea.specs_pantallas && (
                  <div style={{ backgroundColor: '#13131A', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <h3 style={{ color: '#999', fontSize: '11px', fontWeight: '600', margin: '0 0 8px 0', textTransform: 'uppercase' }}>
                      Pantallas
                    </h3>
                    <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', lineHeight: '1.5' }}>
                      {renderField(parseField(idea.specs_pantallas))}
                    </div>
                  </div>
                )}

                {/* Flujos */}
                {idea.specs_flujos && (
                  <div style={{ backgroundColor: '#13131A', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <h3 style={{ color: '#999', fontSize: '11px', fontWeight: '600', margin: '0 0 8px 0', textTransform: 'uppercase' }}>
                      Flujos
                    </h3>
                    <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', lineHeight: '1.5' }}>
                      {Array.isArray(specsData.flujos) ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {specsData.flujos.map((flujo, i) => (
                            <div key={i} style={{ paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                              <strong style={{ color: '#00E5A0' }}>{flujo.nombre}</strong>
                              {Array.isArray(flujo.pasos) && (
                                <ol style={{ margin: '8px 0 0 0', paddingLeft: '20px', color: 'rgba(255,255,255,0.7)' }}>
                                  {flujo.pasos.map((paso, j) => (
                                    <li key={j} style={{ margin: '4px 0', fontSize: '11px' }}>
                                      {paso}
                                    </li>
                                  ))}
                                </ol>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        specsData.flujos ? String(specsData.flujos) : 'Sin datos'
                      )}
                    </div>
                  </div>
                )}

                {/* APIs */}
                {idea.specs_apis && (
                  <div style={{ backgroundColor: '#13131A', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <h3 style={{ color: '#999', fontSize: '11px', fontWeight: '600', margin: '0 0 8px 0', textTransform: 'uppercase' }}>
                      APIs / Integraciones
                    </h3>
                    <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', lineHeight: '1.5' }}>
                      {Array.isArray(specsData.apis) ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {specsData.apis.map((api, i) => (
                            <div key={i} style={{ paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                              <strong style={{ color: '#00E5A0' }}>{api.nombre}</strong>
                              {api.endpoint && (
                                <div style={{ marginTop: '4px' }}>
                                  <a
                                    href={api.endpoint}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                      color: '#6496FF',
                                      fontSize: '11px',
                                      textDecoration: 'none',
                                      wordBreak: 'break-all',
                                    }}
                                  >
                                    {api.endpoint}
                                  </a>
                                </div>
                              )}
                              {api.uso && (
                                <div style={{ marginTop: '4px', fontSize: '11px' }}>
                                  <span>{api.uso}</span>
                                </div>
                              )}
                              {api.auth && (
                                <div style={{ marginTop: '4px', fontSize: '10px', color: '#7C6AFF' }}>
                                  <span>Auth: {api.auth}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        specsData.apis ? String(specsData.apis) : 'Sin datos'
                      )}
                    </div>
                  </div>
                )}

                {/* Complejidad */}
                {idea.complejidad && (
                  <div style={{ backgroundColor: '#13131A', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <h3 style={{ color: '#999', fontSize: '11px', fontWeight: '600', margin: '0 0 8px 0', textTransform: 'uppercase' }}>
                      Complejidad
                    </h3>
                    <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', fontWeight: '600', textTransform: 'capitalize' }}>
                      {idea.complejidad}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ backgroundColor: '#13131A', padding: '20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
                <p style={{ color: '#999', margin: 0 }}>No hay specs aún. Primero genera el Research, luego los Specs.</p>
              </div>
            )}
          </div>

          {/* Pipeline Tab */}
          <div
            style={{
              opacity: activeTab === 'pipeline' ? 1 : 0,
              transform: activeTab === 'pipeline' ? 'translateX(0)' : 'translateX(20px)',
              transition: 'all 200ms ease',
              pointerEvents: activeTab === 'pipeline' ? 'auto' : 'none',
              position: activeTab === 'pipeline' ? 'relative' : 'absolute',
              width: '100%',
              maxHeight: '100%',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ backgroundColor: '#13131A', padding: '20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <h2 style={{ color: '#7C6AFF', fontSize: '14px', fontWeight: '600', marginBottom: '12px', margin: '0 0 12px 0', textTransform: 'uppercase' }}>
                  Estado del pipeline
                </h2>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', lineHeight: '1.6' }}>
                  {idea.estado === 'aprobada' ? (
                    <p style={{ color: '#00E5A0', margin: 0 }}>✓ Idea ya enviada al pipeline</p>
                  ) : (
                    <p style={{ margin: 0 }}>Listo para enviar al pipeline cuando se complete el análisis</p>
                  )}
                </div>
              </div>

              {idea.paso_agente >= 2 && idea.estado !== 'aprobada' && (
                <button
                  onClick={handleSendToPipeline}
                  disabled={sendingPipeline}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '12px 32px',
                    backgroundColor: '#00E5A0',
                    border: 'none',
                    color: '#0A0A0F',
                    borderRadius: '8px',
                    cursor: sendingPipeline ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    opacity: sendingPipeline ? 0.6 : 1,
                  }}
                >
                  <IconRocket />
                  {sendingPipeline ? 'Enviando...' : 'Enviar a Pipeline →'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <ToastNotification message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
