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
        } catch (e2) {
          return val;
        }
      }
      return val;
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
      return <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>Error al parsear datos: {data}</div>;
    }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : '1fr 1fr', gap: '16px' }}>
      {fields.map(({ key, label }) => {
        const value = parsedData[key];
        if (!value) return null;

        // ASO especial: {titulo, keywords[], descripcion_corta}
        if (key === 'aso' && typeof value === 'object') {
          let aso = value;
          if (typeof value === 'string') {
            try {
              aso = JSON.parse(value);
            } catch (e) {
              aso = value;
            }
          }
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
          let diseno = value;
          if (typeof value === 'string') {
            try {
              diseno = JSON.parse(value);
            } catch (e) {
              diseno = value;
            }
          }
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
          let monetizacion = value;
          if (typeof value === 'string') {
            try {
              monetizacion = JSON.parse(value);
            } catch (e) {
              monetizacion = value;
            }
          }
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
  const [lastRun, setLastRun] = useState(null);
  const [loadingRun, setLoadingRun] = useState(false);
  const [generatingGraphic, setGeneratingGraphic] = useState(false);

  const tabs = ['info', 'research', 'specs', 'pipeline', 'calidad', 'publicacion', 'screenshots'];

  const hasCompletedRun = lastRun?.estado === 'completado';
  const calidadAprobada = idea?.checklist_calidad && Object.values(idea.checklist_calidad).filter(Boolean).length === 6;

  const hasContent = {
    info: true,
    research: !!idea?.research_mercado || !!idea?.research,
    specs: !!(idea?.specs_pantallas || idea?.specs_flujos || idea?.specs_apis || idea?.complejidad),
    pipeline: true,
    calidad: hasCompletedRun,
    publicacion: calidadAprobada,
    screenshots: hasCompletedRun,
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

  useEffect(() => {
    if (idea?.id) {
      fetchLastRun();
    }
  }, [idea?.id]);

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

  const fetchLastRun = async () => {
    try {
      setLoadingRun(true);
      const { data, error } = await supabase
        .from('pipeline_runs')
        .select('*')
        .eq('idea_id', idea.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        setLastRun(data[0]);
      }
    } catch (err) {
      console.error('Error fetching last run:', err);
    } finally {
      setLoadingRun(false);
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

  const handleLanzarPipeline = async () => {
    setSendingPipeline(true);
    try {
      const r = idea.research;
      const s = idea.specs;

      const descripcionCompleta = [
        idea.descripcion,
        r ? `\nRESEARCH:\n- Propuesta de valor: ${r.propuesta_valor}\n- Público: ${r.publico_objetivo}\n- Paleta: ${r.diseno?.paleta?.join(', ')}\n- Tipografía: ${r.diseno?.tipografia_display}\n- Estilo: ${r.diseno?.estilo}\n- Monetización: ${r.monetizacion?.modelo}\n- APIs: ${r.apis_sugeridas?.map(a => a.nombre + ' (' + a.url + ')').join(', ')}` : '',
        s ? `\nSPECS:\n- Pantallas: ${s.pantallas?.map(p => p.nombre).join(', ')}\n- APIs: ${s.apis?.map(a => a.nombre + ': ' + a.endpoint).join(', ')}\n- Notas: ${s.notas_tecnicas}` : ''
      ].filter(Boolean).join('');

      const response = await fetch('http://localhost:3001/pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: idea.titulo,
          descripcion: descripcionCompleta,
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

  const handleChecklistUpdate = async (field, key, value) => {
    try {
      const currentChecklist = idea[field] || {};
      const updatedChecklist = { ...currentChecklist, [key]: value };

      const { error } = await supabase
        .from('ideas')
        .update({ [field]: updatedChecklist })
        .eq('id', idea.id);

      if (error) throw error;

      setIdea(prev => ({ ...prev, [field]: updatedChecklist }));
      setToast({ message: '✓ Guardado', type: 'success' });
    } catch (err) {
      setToast({ message: 'Error al guardar: ' + err.message, type: 'error' });
    }
  };

  const handleConvertirEnApp = async () => {
    try {
      const slug = idea.titulo.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const packageName = 'com.nztech.' + slug.replace(/-/g, '');

      const { error: insertError } = await supabase
        .from('apps')
        .insert({
          nombre: idea.titulo,
          descripcion: idea.descripcion,
          package_name: packageName,
          estado: 'published',
          idea_id: idea.id,
          repo_url: lastRun?.repo_url || '',
          categoria: idea.categoria,
        });

      if (insertError) throw insertError;

      const { error: updateError } = await supabase
        .from('ideas')
        .update({ estado: 'publicada' })
        .eq('id', idea.id);

      if (updateError) throw updateError;

      setToast({ message: '✓ App creada exitosamente', type: 'success' });
      setTimeout(() => navigate('/apps'), 1500);
    } catch (err) {
      setToast({ message: 'Error: ' + err.message, type: 'error' });
    }
  };

  const handleGenerateFeatureGraphic = async () => {
    try {
      setGeneratingGraphic(true);
      const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
      if (!apiKey) {
        throw new Error('API key no configurada. Agrega VITE_ANTHROPIC_API_KEY al .env.local');
      }

      const palette = idea.research?.diseno?.paleta || ['#00E5A0', '#0A0A0F', '#13131A'];

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1024,
          messages: [
            {
              role: 'user',
              content: `Genera un JSON con especificaciones de diseño para un feature graphic de Play Store (1024x500px) para la app "${idea.titulo}".

Requisitos:
- Usar estos colores: ${palette.join(', ')}
- El JSON debe tener: background_color, text_color, headline (máx 25 caracteres), subheadline (máx 80 caracteres), layout_description
- Sé creativo pero profesional
- El headline debe captar atención rápidamente

Devuelve SOLO el JSON válido, sin explicación.`,
            },
          ],
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || 'Error al conectar con Claude API');
      }

      const result = await response.json();
      const content = result.content[0].text;
      let graphicSpec = JSON.parse(content);

      setIdea(prev => ({ ...prev, feature_graphic_spec: graphicSpec }));
      setToast({ message: '✓ Feature graphic generado', type: 'success' });
    } catch (err) {
      console.error('Error generating feature graphic:', err);
      setToast({ message: 'Error: ' + err.message, type: 'error' });
    } finally {
      setGeneratingGraphic(false);
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

  let researchData = idea.research;
  if (!researchData && idea.research_mercado) {
    try {
      researchData = JSON.parse(idea.research_mercado);
    } catch (e) {
      researchData = null;
    }
  }
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
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px' }}>
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
              {tab === 'info' ? 'Info' : tab === 'research' ? 'Research' : tab === 'specs' ? 'Specs' : tab === 'pipeline' ? 'Pipeline' : tab === 'calidad' ? 'Calidad' : tab === 'publicacion' ? 'Publicación' : 'Screenshots'}
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
            }}
          >
            <div>
              <h3 style={{ color: 'white', fontSize: '20px', fontWeight: '600', marginBottom: '24px' }}>Pipeline</h3>

              {/* Último Run */}
              {loadingRun ? (
                <div style={{ color: '#999', padding: '20px', textAlign: 'center' }}>Cargando último run...</div>
              ) : lastRun ? (
                <div style={{ backgroundColor: '#13131A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
                  <h4 style={{ color: 'white', fontSize: '14px', fontWeight: '600', margin: '0 0 12px 0' }}>Último Run</h4>

                  <div style={{ display: 'grid', gap: '12px', marginBottom: '16px' }}>
                    <div>
                      <div style={{ color: '#999', fontSize: '11px', fontWeight: '500', marginBottom: '4px', textTransform: 'uppercase' }}>
                        Estado
                      </div>
                      <span
                        style={{
                          backgroundColor: lastRun.estado === 'completado' ? 'rgba(0, 229, 160, 0.2)' : lastRun.estado === 'running' ? 'rgba(255, 180, 0, 0.2)' : 'rgba(255, 77, 79, 0.2)',
                          color: lastRun.estado === 'completado' ? '#00E5A0' : lastRun.estado === 'running' ? '#FFB400' : '#FF4D4F',
                          fontSize: '12px',
                          fontWeight: '600',
                          padding: '6px 12px',
                          borderRadius: '4px',
                          display: 'inline-block',
                          textTransform: 'capitalize',
                        }}
                      >
                        {lastRun.estado}
                      </span>
                    </div>

                    {lastRun.paso_actual && (
                      <div>
                        <div style={{ color: '#999', fontSize: '11px', fontWeight: '500', marginBottom: '4px', textTransform: 'uppercase' }}>
                          Paso Actual
                        </div>
                        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>
                          {lastRun.paso_actual}
                        </div>
                      </div>
                    )}

                    {lastRun.created_at && (
                      <div>
                        <div style={{ color: '#999', fontSize: '11px', fontWeight: '500', marginBottom: '4px', textTransform: 'uppercase' }}>
                          Iniciado
                        </div>
                        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>
                          {new Date(lastRun.created_at).toLocaleDateString('es-ES')} a las {new Date(lastRun.created_at).toLocaleTimeString('es-ES')}
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {lastRun.repo_url && (
                      <a
                        href={lastRun.repo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '10px 16px',
                          backgroundColor: 'transparent',
                          border: '1px solid #00E5A0',
                          color: '#00E5A0',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: '600',
                          textDecoration: 'none',
                        }}
                      >
                        📦 Abrir repo en GitHub
                      </a>
                    )}

                    <button
                      onClick={() => navigate('/pipeline')}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '10px 16px',
                        backgroundColor: 'rgba(0, 229, 160, 0.1)',
                        border: '1px solid #00E5A0',
                        color: '#00E5A0',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '600',
                        transition: 'all 200ms ease',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 229, 160, 0.2)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 229, 160, 0.1)'}
                    >
                      🚀 Ver en Pipeline
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ backgroundColor: '#13131A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '20px', marginBottom: '24px', textAlign: 'center', color: '#999' }}>
                  No hay runs aún para esta idea
                </div>
              )}

              <button
                onClick={handleLanzarPipeline}
                disabled={sendingPipeline}
                style={{
                  padding: '16px 32px',
                  backgroundColor: '#00E5A0',
                  border: 'none',
                  color: '#0A0A0F',
                  borderRadius: '8px',
                  cursor: sendingPipeline ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: '600',
                  opacity: sendingPipeline ? 0.6 : 1,
                  transition: 'all 200ms ease',
                }}
              >
                {sendingPipeline ? 'Lanzando...' : '🚀 Lanzar Pipeline'}
              </button>
            </div>
          </div>

          {/* Calidad Tab */}
          <div
            style={{
              opacity: activeTab === 'calidad' ? 1 : 0,
              transform: activeTab === 'calidad' ? 'translateX(0)' : 'translateX(20px)',
              transition: 'all 200ms ease',
              pointerEvents: activeTab === 'calidad' ? 'auto' : 'none',
              position: activeTab === 'calidad' ? 'relative' : 'absolute',
              width: '100%',
            }}
          >
            <div>
              <h3 style={{ color: 'white', fontSize: '20px', fontWeight: '600', marginBottom: '24px' }}>Control de Calidad</h3>

              {!hasCompletedRun ? (
                <div style={{ backgroundColor: '#13131A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '20px', textAlign: 'center', color: '#999' }}>
                  Completa un pipeline exitosamente para desbloquear este tab
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '12px', marginBottom: '24px' }}>
                  {[
                    { key: 'html_funciona', label: 'El HTML carga sin errores en el emulador' },
                    { key: 'datos_reales', label: 'Los datos vienen de APIs reales (no mockeados)' },
                    { key: 'diseno_correcto', label: 'El diseño usa la paleta y tipografía correcta' },
                    { key: 'sin_errores_js', label: 'No hay errores de JavaScript en la consola' },
                    { key: 'navegacion_ok', label: 'Todas las tabs navegan correctamente' },
                    { key: 'error_handling', label: 'Los errores de red muestran mensaje amigable' },
                  ].map(item => (
                    <label
                      key={item.key}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        backgroundColor: '#13131A',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '8px',
                        padding: '16px',
                        cursor: 'pointer',
                        transition: 'all 200ms ease',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 229, 160, 0.08)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#13131A'}
                    >
                      <input
                        type="checkbox"
                        checked={idea.checklist_calidad?.[item.key] || false}
                        onChange={(e) => handleChecklistUpdate('checklist_calidad', item.key, e.target.checked)}
                        style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#00E5A0' }}
                      />
                      <span style={{ color: idea.checklist_calidad?.[item.key] ? '#999' : '#DDD', fontSize: '14px', textDecoration: idea.checklist_calidad?.[item.key] ? 'line-through' : 'none' }}>
                        {item.label}
                      </span>
                    </label>
                  ))}
                </div>
              )}

              {calidadAprobada && (
                <button
                  onClick={() => setActiveTab('publicacion')}
                  style={{
                    width: '100%',
                    padding: '16px 32px',
                    backgroundColor: '#00E5A0',
                    border: 'none',
                    color: '#0A0A0F',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: '600',
                    transition: 'all 200ms ease',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                  ✓ Calidad aprobada — ir a Publicación
                </button>
              )}
            </div>
          </div>

          {/* Publicación Tab */}
          <div
            style={{
              opacity: activeTab === 'publicacion' ? 1 : 0,
              transform: activeTab === 'publicacion' ? 'translateX(0)' : 'translateX(20px)',
              transition: 'all 200ms ease',
              pointerEvents: activeTab === 'publicacion' ? 'auto' : 'none',
              position: activeTab === 'publicacion' ? 'relative' : 'absolute',
              width: '100%',
            }}
          >
            <div>
              <h3 style={{ color: 'white', fontSize: '20px', fontWeight: '600', marginBottom: '24px' }}>Publicación</h3>

              {!calidadAprobada ? (
                <div style={{ backgroundColor: '#13131A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '20px', textAlign: 'center', color: '#999' }}>
                  Completa el control de calidad primero
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: '24px' }}>
                    <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                      <h4 style={{ color: 'white', margin: 0, fontSize: '14px', fontWeight: '600' }}>Setup Técnico</h4>
                      <span style={{ color: '#999', fontSize: '11px' }}>
                        {Object.values(idea.checklist_publicacion || {}).slice(0, 5).filter(Boolean).length}/5
                      </span>
                    </div>
                    <div style={{ display: 'grid', gap: '12px' }}>
                      {[
                        { key: 'google_services', label: 'google-services.json copiado a app/' },
                        { key: 'admob_app_id', label: 'App ID de AdMob en AndroidManifest.xml' },
                        { key: 'admob_unit_id', label: 'Unit ID de banner en activity_main.xml' },
                        { key: 'release_build', label: 'Build release generado sin errores' },
                        { key: 'firma_apk', label: 'APK firmado con keystore' },
                      ].map(item => (
                        <label key={item.key} style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#13131A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '12px', cursor: 'pointer' }}>
                          <input type="checkbox" checked={idea.checklist_publicacion?.[item.key] || false} onChange={(e) => handleChecklistUpdate('checklist_publicacion', item.key, e.target.checked)} style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#00E5A0' }} />
                          <span style={{ color: idea.checklist_publicacion?.[item.key] ? '#999' : '#DDD', fontSize: '12px', textDecoration: idea.checklist_publicacion?.[item.key] ? 'line-through' : 'none' }}>{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                      <h4 style={{ color: 'white', margin: 0, fontSize: '14px', fontWeight: '600' }}>Play Store</h4>
                      <span style={{ color: '#999', fontSize: '11px' }}>
                        {Object.values(idea.checklist_publicacion || {}).slice(5, 10).filter(Boolean).length}/5
                      </span>
                    </div>
                    <div style={{ display: 'grid', gap: '12px' }}>
                      {[
                        { key: 'screenshots', label: 'Screenshots subidos (mínimo 2)' },
                        { key: 'descripcion_aso', label: 'Descripción ASO cargada en Play Console' },
                        { key: 'politica_privacidad', label: 'URL de política de privacidad configurada' },
                        { key: 'clasificacion', label: 'Clasificación de contenido completada' },
                        { key: 'datos_seguridad', label: 'Cuestionario de seguridad de datos completado' },
                      ].map(item => (
                        <label key={item.key} style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#13131A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '12px', cursor: 'pointer' }}>
                          <input type="checkbox" checked={idea.checklist_publicacion?.[item.key] || false} onChange={(e) => handleChecklistUpdate('checklist_publicacion', item.key, e.target.checked)} style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#00E5A0' }} />
                          <span style={{ color: idea.checklist_publicacion?.[item.key] ? '#999' : '#DDD', fontSize: '12px', textDecoration: idea.checklist_publicacion?.[item.key] ? 'line-through' : 'none' }}>{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <div style={{ height: '4px', backgroundColor: '#1C1C26', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', backgroundColor: '#00E5A0', width: `${(Object.values(idea.checklist_publicacion || {}).filter(Boolean).length / 10) * 100}%`, transition: 'width 0.3s ease' }} />
                    </div>
                  </div>

                  {Object.values(idea.checklist_publicacion || {}).filter(Boolean).length === 10 && (
                    <button
                      onClick={handleConvertirEnApp}
                      style={{
                        width: '100%',
                        padding: '20px 32px',
                        backgroundColor: '#00E5A0',
                        border: 'none',
                        color: '#0A0A0F',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '18px',
                        fontWeight: '700',
                        transition: 'all 200ms ease',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                      onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                    >
                      🚀 Convertir en App
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Screenshots Tab */}
          <div
            style={{
              opacity: activeTab === 'screenshots' ? 1 : 0,
              transform: activeTab === 'screenshots' ? 'translateX(0)' : 'translateX(20px)',
              transition: 'all 200ms ease',
              pointerEvents: activeTab === 'screenshots' ? 'auto' : 'none',
              position: activeTab === 'screenshots' ? 'relative' : 'absolute',
              width: '100%',
            }}
          >
            <div>
              <h3 style={{ color: 'white', fontSize: '20px', fontWeight: '600', marginBottom: '24px' }}>Screenshots</h3>

              {!hasCompletedRun ? (
                <div style={{ backgroundColor: '#13131A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '20px', textAlign: 'center', color: '#999' }}>
                  Completa un pipeline exitosamente para desbloquear este tab
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: '24px' }}>
                    <h4 style={{ color: 'white', fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>Feature Graphic Generator</h4>
                    <button
                      onClick={handleGenerateFeatureGraphic}
                      disabled={generatingGraphic}
                      style={{
                        padding: '12px 24px',
                        backgroundColor: '#7C6AFF',
                        border: 'none',
                        color: 'white',
                        borderRadius: '8px',
                        cursor: generatingGraphic ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        fontWeight: '600',
                        opacity: generatingGraphic ? 0.6 : 1,
                        transition: 'all 200ms ease',
                      }}
                    >
                      {generatingGraphic ? 'Generando...' : '✨ Generar Feature Graphic (Claude)'}
                    </button>
                    {idea.feature_graphic_spec && (
                      <div style={{ marginTop: '16px', backgroundColor: '#13131A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '20px', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                        <div style={{
                          width: '100%',
                          height: '100%',
                          backgroundColor: idea.feature_graphic_spec.background_color,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          textAlign: 'center',
                          color: idea.feature_graphic_spec.text_color,
                          padding: '20px',
                          boxSizing: 'border-box',
                        }}>
                          <div style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>
                            {idea.feature_graphic_spec.headline}
                          </div>
                          <div style={{ fontSize: '14px', opacity: 0.8 }}>
                            {idea.feature_graphic_spec.subheadline}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 style={{ color: 'white', fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>Screenshots</h4>
                    <p style={{ color: '#999', fontSize: '12px', marginBottom: '12px' }}>
                      Nota: La carga de archivos requiere una solución de storage (Supabase Storage o similar)
                    </p>
                    <div style={{ backgroundColor: '#13131A', border: '2px dashed rgba(0, 229, 160, 0.3)', borderRadius: '8px', padding: '40px', textAlign: 'center', color: '#999' }}>
                      <p>📸 Sube screenshots aquí (implementar storage)</p>
                    </div>
                  </div>
                </>
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
