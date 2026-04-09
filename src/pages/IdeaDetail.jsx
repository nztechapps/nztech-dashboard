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

const IconSpinner = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
    <circle cx="12" cy="12" r="1"></circle>
    <path d="M12 2a10 10 0 0 0 0 20"></path>
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
    // Intentar parsear como JSON
    try {
      return JSON.parse(text);
    } catch (e1) {
      // Intentar buscar un JSON dentro del texto
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

const cleanField = (val) => {
  if (!val) return 'Sin datos aún';

  const parsed = parseField(val);
  if (parsed === null) return 'Sin datos aún';

  // Si es un array, renderizar con renderField
  if (Array.isArray(parsed)) {
    return renderField(parsed);
  }

  // Si es un objeto, convertir a JSON string formateado
  if (typeof parsed === 'object') {
    return JSON.stringify(parsed, null, 2);
  }

  return String(parsed);
};

const renderSpecField = (val) => {
  if (!val) return null;

  const parsed = parseField(val);
  if (parsed === null) return null;

  if (Array.isArray(parsed)) {
    return renderField(parsed);
  }

  if (typeof parsed === 'object') {
    return JSON.stringify(parsed, null, 2);
  }

  return String(parsed);
};

const renderField = (value) => {
  // Si es un array de objetos, renderizar cada uno
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

  // Si es string o número, renderizar directamente
  if (typeof value === 'string' || typeof value === 'number') {
    return value;
  }

  // Si es un objeto, convertir a JSON formateado
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
      {fields.map(({ key, label }) =>
        parsedData[key] ? (
          <div key={key} style={{ backgroundColor: '#13131A', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h3 style={{ color: '#999', fontSize: '11px', fontWeight: '600', margin: '0 0 8px 0', textTransform: 'uppercase' }}>
              {label}
            </h3>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
              {renderField(parsedData[key])}
            </div>
          </div>
        ) : null
      )}
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
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const tabs = ['info', 'research', 'specs', 'pipeline'];

  const hasContent = {
    info: true,
    research: !!idea?.research_mercado,
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

      // Guardar en Supabase
      const { error: updateError } = await supabase
        .from('ideas')
        .update({
          research: result,
          research_mercado: JSON.stringify(result, null, 2),
          estado: 'investigando'
        })
        .eq('id', idea.id);

      if (updateError) throw updateError;

      // Actualizar estado local
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

      // Guardar en Supabase
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

      // Actualizar estado local
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

      // Actualizar estado en Supabase
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
        {/* Back Button */}
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

        {/* Title Section */}
        <div style={{ marginBottom: '0' }}>
          <h1 style={{ color: 'white', fontSize: '28px', fontWeight: '700', margin: 0 }}>
            {idea.titulo}
          </h1>
        </div>
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

            {idea.descripcion && (
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ color: '#00E5A0', fontSize: '14px', fontWeight: '600', marginBottom: '12px', textTransform: 'uppercase' }}>
                  Descripción
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', lineHeight: '1.6', margin: 0, whiteSpace: 'pre-wrap' }}>
                  {idea.descripcion}
                </p>
              </div>
            )}

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
            {idea.research_mercado || idea.research ? (
              <ResearchSection data={idea.research || idea.research_mercado} />
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
                {idea.specs_pantallas && (
                  <div style={{ backgroundColor: '#13131A', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <h3 style={{ color: '#999', fontSize: '11px', fontWeight: '600', margin: '0 0 8px 0', textTransform: 'uppercase' }}>
                      Pantallas
                    </h3>
                    <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', lineHeight: '1.5' }}>
                      {renderSpecField(idea.specs_pantallas)}
                    </div>
                  </div>
                )}

                {idea.specs_flujos && (
                  <div style={{ backgroundColor: '#13131A', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <h3 style={{ color: '#999', fontSize: '11px', fontWeight: '600', margin: '0 0 8px 0', textTransform: 'uppercase' }}>
                      Flujos
                    </h3>
                    <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                      {renderSpecField(idea.specs_flujos)}
                    </div>
                  </div>
                )}

                {idea.specs_apis && (
                  <div style={{ backgroundColor: '#13131A', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <h3 style={{ color: '#999', fontSize: '11px', fontWeight: '600', margin: '0 0 8px 0', textTransform: 'uppercase' }}>
                      APIs / Integraciones
                    </h3>
                    <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                      {renderSpecField(idea.specs_apis)}
                    </div>
                  </div>
                )}

                {idea.complejidad && (
                  <div style={{ backgroundColor: '#13131A', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <h3 style={{ color: '#999', fontSize: '11px', fontWeight: '600', margin: '0 0 8px 0', textTransform: 'uppercase' }}>
                      Complejidad
                    </h3>
                    <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', fontWeight: '600', textTransform: 'capitalize' }}>
                      {renderSpecField(idea.complejidad)}
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
