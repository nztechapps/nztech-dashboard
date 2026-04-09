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
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', lineHeight: '1.5' }}>
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
  const [editingFields, setEditingFields] = useState({});

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

  const hasResearch = !!idea.research_mercado || !!idea.research;
  const hasSpecs = !!(idea.specs_pantallas || idea.specs_flujos || idea.specs_apis || idea.complejidad);

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
          {editingFields.titulo !== undefined ? (
            <input
              autoFocus
              value={editingFields.titulo}
              onChange={(e) => handleFieldChange('titulo', e.target.value)}
              onBlur={(e) => handleFieldBlur('titulo', e.target.value)}
              style={{
                fontSize: '28px',
                fontWeight: '700',
                color: 'white',
                backgroundColor: 'transparent',
                border: '1px solid #00E5A0',
                borderRadius: '4px',
                padding: '4px 8px',
                width: '100%',
                fontFamily: 'inherit',
              }}
            />
          ) : (
            <span
              onClick={() => setEditingFields({ ...editingFields, titulo: idea.titulo })}
              style={{ cursor: 'pointer', paddingBottom: '4px' }}
              title="Click para editar"
            >
              {idea.titulo}
            </span>
          )}
        </h1>
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        maxWidth: '900px',
        width: '100%',
        margin: '0 auto',
        padding: '24px',
        boxSizing: 'border-box',
        gap: '32px',
        overflowX: 'hidden',
      }}>

        {/* Info Section */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ color: '#00E5A0', fontSize: '16px', fontWeight: '700', margin: 0, textTransform: 'uppercase' }}>
            Información
          </h2>

          {/* Status & Tags */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
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
              <span style={{
                backgroundColor: 'rgba(100,150,255,0.12)',
                color: '#6496FF',
                fontSize: '12px',
                fontWeight: '600',
                padding: '6px 12px',
                borderRadius: '6px',
              }}>
                {idea.mercado}
              </span>
            )}
            {idea.categoria && (
              <span style={{
                backgroundColor: 'rgba(124,106,255,0.12)',
                color: '#7C6AFF',
                fontSize: '12px',
                fontWeight: '600',
                padding: '6px 12px',
                borderRadius: '6px',
              }}>
                {idea.categoria}
              </span>
            )}
          </div>

          {/* Prioridad */}
          {idea.prioridad && (
            <div>
              <div style={{ color: '#999', fontSize: '12px', marginBottom: '8px', fontWeight: '500' }}>Prioridad</div>
              <StarRating value={idea.prioridad} />
            </div>
          )}

          {/* Descripción */}
          <div>
            <div style={{ color: '#999', fontSize: '12px', marginBottom: '8px', fontWeight: '500', textTransform: 'uppercase' }}>
              Descripción
            </div>
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
                onClick={() => setEditingFields({ ...editingFields, descripcion: idea.descripcion || '' })}
                style={{
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  margin: 0,
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '4px',
                }}
                title="Click para editar"
              >
                {idea.descripcion || 'Sin descripción'}
              </p>
            )}
          </div>

          {/* Público */}
          <div>
            <div style={{ color: '#999', fontSize: '12px', marginBottom: '8px', fontWeight: '500', textTransform: 'uppercase' }}>
              Público Objetivo
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

          {/* Categoría */}
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

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '12px' }}>
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
        </section>

        {/* Research Section */}
        {hasResearch && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ color: '#00E5A0', fontSize: '16px', fontWeight: '700', margin: 0, textTransform: 'uppercase' }}>
              Research
            </h2>
            <ResearchSection data={idea.research || idea.research_mercado} />
          </section>
        )}

        {/* Specs Section */}
        {hasSpecs && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ color: '#00E5A0', fontSize: '16px', fontWeight: '700', margin: 0, textTransform: 'uppercase' }}>
              Especificaciones
            </h2>
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
                  <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', lineHeight: '1.5', whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                    {renderSpecField(idea.specs_flujos)}
                  </div>
                </div>
              )}

              {idea.specs_apis && (
                <div style={{ backgroundColor: '#13131A', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <h3 style={{ color: '#999', fontSize: '11px', fontWeight: '600', margin: '0 0 8px 0', textTransform: 'uppercase' }}>
                    APIs / Integraciones
                  </h3>
                  <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', lineHeight: '1.5', whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
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
          </section>
        )}

        {/* Pipeline Section */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ color: '#00E5A0', fontSize: '16px', fontWeight: '700', margin: 0, textTransform: 'uppercase' }}>
            Pipeline
          </h2>

          <div style={{ backgroundColor: '#13131A', padding: '20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', lineHeight: '1.6' }}>
              {idea.estado === 'aprobada' ? (
                <p style={{ color: '#00E5A0', margin: 0 }}>✓ Idea ya enviada al pipeline</p>
              ) : hasResearch && hasSpecs ? (
                <p style={{ margin: 0 }}>Listo para enviar al pipeline. Research y Specs completados.</p>
              ) : (
                <p style={{ margin: 0 }}>Completa el Research y los Specs para poder enviar al pipeline.</p>
              )}
            </div>
          </div>

          {hasResearch && hasSpecs && idea.estado !== 'aprobada' && (
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
                transition: 'all 200ms ease',
              }}
            >
              <IconRocket />
              {sendingPipeline ? 'Enviando...' : 'Enviar a Pipeline →'}
            </button>
          )}
        </section>

      </div>

      {toast && (
        <ToastNotification message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
