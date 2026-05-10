import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import ToastNotification from '../components/ui/ToastNotification';
import PostMortemModal from '../components/ideas/PostMortemModal';
import { useAppPostmortems } from '../hooks/useAppPostmortems';

// ─── Icons ────────────────────────────────────────────────────────────────────

const IconArrowLeft = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
  </svg>
);

const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

const parseField = (val) => {
  if (!val) return null;
  if (typeof val === 'string') {
    let text = val.replace(/```json/g, '').replace(/```/g, '').trim();
    try { return JSON.parse(text); } catch {
      const match = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      if (match) { try { return JSON.parse(match[0]); } catch { return val; } }
      return val;
    }
  }
  return val;
};

const renderField = (value) => {
  if (Array.isArray(value)) {
    if (value.length === 0) return 'Sin datos';
    if (value[0]?.nombre && value[0]?.debilidad !== undefined && !value[0]?.url) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {value.map((item, i) => (
            <div key={i} style={{ paddingBottom: '8px', borderBottom: '1px solid var(--border)' }}>
              <strong style={{ color: 'var(--primary)' }}>{item.nombre}</strong>
              <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '4px' }}>{item.debilidad}</div>
            </div>
          ))}
        </div>
      );
    }
    if (value[0]?.nombre && value[0]?.url !== undefined) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {value.map((item, i) => (
            <div key={i} style={{ paddingBottom: '8px', borderBottom: '1px solid var(--border)' }}>
              <strong style={{ color: 'var(--primary)' }}>{item.nombre}</strong>
              {item.url && <div style={{ color: 'var(--nz-info)', fontSize: '11px', marginTop: '2px' }}>{item.url}</div>}
              {item.gratuita !== undefined && <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '2px' }}>{item.gratuita ? '✓ Gratuita' : '💰 De pago'}</div>}
              {item.uso && <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '4px' }}>{item.uso}</div>}
            </div>
          ))}
        </div>
      );
    }
    if (value[0]?.nombre && value[0]?.descripcion !== undefined && value[0]?.elementos) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {value.map((item, i) => (
            <div key={i} style={{ paddingBottom: '8px', borderBottom: '1px solid var(--border)' }}>
              <strong style={{ color: 'var(--primary)' }}>{item.nombre}</strong>
              {item.tab && <div style={{ color: 'var(--primary)', fontSize: '10px', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>[{item.tab}]</div>}
              {item.descripcion && <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '4px' }}>{item.descripcion}</div>}
              {item.elementos && <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '4px' }}><div style={{ fontWeight: '500', marginBottom: '2px' }}>Elementos:</div>{item.elementos}</div>}
            </div>
          ))}
        </div>
      );
    }
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {value.map((item, i) => (
          <div key={i} style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
            {typeof item === 'object' ? JSON.stringify(item) : String(item)}
          </div>
        ))}
      </div>
    );
  }
  if (typeof value === 'string' || typeof value === 'number') return value;
  if (typeof value === 'object') return JSON.stringify(value, null, 2);
  return String(value);
};

// ─── ResearchSection ──────────────────────────────────────────────────────────

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
    try { parsedData = JSON.parse(data); } catch { return <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Error al parsear datos: {data}</div>; }
  }
  return (
    <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : '1fr 1fr', gap: '16px' }}>
      {fields.map(({ key, label }) => {
        const value = parsedData[key];
        if (!value) return null;
        if (key === 'aso' && typeof value === 'object') {
          const aso = value;
          return (
            <div key={key} style={{ background: 'var(--surface)', padding: '16px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
              <h3 style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: '600', margin: '0 0 8px 0', textTransform: 'uppercase' }}>{label}</h3>
              <div style={{ color: 'var(--text-muted)', fontSize: '12px', lineHeight: '1.5' }}>
                {aso.titulo && <p style={{ margin: '0 0 8px 0', fontWeight: '600', color: 'var(--primary)' }}>{aso.titulo}</p>}
                {aso.descripcion_corta && <p style={{ margin: '0 0 8px 0' }}>{aso.descripcion_corta}</p>}
                {aso.keywords && Array.isArray(aso.keywords) && (
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {aso.keywords.map((k, i) => (
                      <span key={i} style={{ backgroundColor: 'var(--primary-soft)', color: 'var(--primary)', padding: '4px 8px', borderRadius: 'var(--radius-sm)', fontSize: '11px' }}>{k}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        }
        if (key === 'diseno' && typeof value === 'object') {
          const diseno = value;
          return (
            <div key={key} style={{ background: 'var(--surface)', padding: '16px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
              <h3 style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: '600', margin: '0 0 8px 0', textTransform: 'uppercase' }}>{label}</h3>
              <div style={{ color: 'var(--text-muted)', fontSize: '12px', lineHeight: '1.5' }}>
                {diseno.paleta && Array.isArray(diseno.paleta) && (
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '11px', fontWeight: '500', marginBottom: '6px' }}>Paleta de Colores</div>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      {diseno.paleta.map((color, i) => (
                        <div key={i} style={{ textAlign: 'center' }}>
                          <div style={{ width: '40px', height: '40px', backgroundColor: color, borderRadius: '50%', border: '1px solid var(--border)', marginBottom: '4px' }}></div>
                          <div style={{ fontSize: '10px' }}>{color}</div>
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
        if (key === 'monetizacion' && typeof value === 'object') {
          const m = value;
          return (
            <div key={key} style={{ background: 'var(--surface)', padding: '16px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
              <h3 style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: '600', margin: '0 0 8px 0', textTransform: 'uppercase' }}>{label}</h3>
              <div style={{ color: 'var(--text-muted)', fontSize: '12px', lineHeight: '1.5' }}>
                {m.modelo && <p style={{ margin: '0 0 8px 0' }}><strong>{m.modelo}</strong></p>}
                {m.revenue_estimado_mensual_usd && <p style={{ margin: 0, fontSize: '14px', color: 'var(--primary)', fontWeight: '600' }}>${m.revenue_estimado_mensual_usd}/mes</p>}
              </div>
            </div>
          );
        }
        return (
          <div key={key} style={{ background: 'var(--surface)', padding: '16px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
            <h3 style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: '600', margin: '0 0 8px 0', textTransform: 'uppercase' }}>{label}</h3>
            <div style={{ color: 'var(--text-muted)', fontSize: '12px', lineHeight: '1.5' }}>{renderField(value)}</div>
          </div>
        );
      })}
    </div>
  );
};

// ─── Stepper ──────────────────────────────────────────────────────────────────

const STEPS = [
  { num: 1, label: 'Info' },
  { num: 2, label: 'Validador' },
  { num: 3, label: 'Research' },
  { num: 4, label: 'Specs' },
  { num: 5, label: 'Pipeline' },
  { num: 6, label: 'Play Console' },
  { num: 7, label: 'ASO' },
];

const Stepper = ({ current, completed, onStep }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', overflowX: 'auto', paddingBottom: '4px' }}>
    {STEPS.map((step, idx) => {
      const isCompleted = completed[step.num];
      const isActive = step.num === current;
      const isPending = step.num > current && !isCompleted;
      return (
        <div key={step.num} style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
          <button
            onClick={() => onStep(step.num)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: 'var(--radius-sm)',
              transition: 'background var(--dur)',
            }}
          >
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '13px',
              fontWeight: '700',
              border: `2px solid ${isActive ? 'var(--primary)' : isCompleted ? 'var(--nz-success)' : 'var(--border)'}`,
              background: isActive ? 'var(--primary)' : isCompleted ? 'var(--nz-success)' : 'transparent',
              color: isActive || isCompleted ? 'var(--primary-fg)' : isPending ? 'var(--text-subtle)' : 'var(--text-muted)',
              transition: 'all var(--dur)',
            }}>
              {isCompleted && !isActive ? <IconCheck /> : step.num}
            </div>
            <span style={{
              fontSize: '11px',
              fontWeight: isActive ? '700' : '500',
              color: isActive ? 'var(--primary)' : isCompleted ? 'var(--text-muted)' : 'var(--text-subtle)',
              whiteSpace: 'nowrap',
            }}>
              {step.label}
            </span>
          </button>
          {idx < STEPS.length - 1 && (
            <div style={{ width: '20px', height: '2px', background: isCompleted ? 'var(--nz-success)' : 'var(--border)', borderRadius: '1px', flexShrink: 0 }} />
          )}
        </div>
      );
    })}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export default function IdeaDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [idea, setIdea] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [toast, setToast] = useState(null);
  const [editingFields, setEditingFields] = useState({});
  const [allRuns, setAllRuns] = useState([]);
  const [loadingAllRuns, setLoadingAllRuns] = useState(false);

  // Step actions loading states
  const [sendingPipeline, setSendingPipeline] = useState(false);
  const [generatingResearch, setGeneratingResearch] = useState(false);
  const [generatingSpecs, setGeneratingSpecs] = useState(false);
  const [validating, setValidating] = useState(false);

  // Help modals
  const [helpModal, setHelpModal] = useState(null);

  // Postmortem
  const [showPostmortem, setShowPostmortem] = useState(false);
  const { savePostmortem } = useAppPostmortems(id);

  // ASO local state (to allow typing before save)
  const [asoLocal, setAsoLocal] = useState(null);

  useEffect(() => { fetchIdea(); }, [id]);
  useEffect(() => { if (idea?.id) fetchLastRun(); }, [idea?.id]);
  useEffect(() => {
    if (idea && !asoLocal) {
      setAsoLocal({
        titulo: idea.aso?.titulo || '',
        descripcion_corta: idea.aso?.descripcion_corta || '',
        descripcion_larga: idea.aso?.descripcion_larga || '',
        keywords: idea.aso?.keywords || '',
      });
    }
  }, [idea]);

  const fetchIdea = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('ideas').select('*').eq('id', id).single();
      if (error || !data) throw new Error('Idea no encontrada');
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
      setLoadingAllRuns(true);
      const { data, error } = await supabase
        .from('pipeline_runs')
        .select('*')
        .eq('idea_id', idea.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      if (data) setAllRuns(data);
    } catch (err) {
      console.error('Error fetching runs:', err);
    } finally {
      setLoadingAllRuns(false);
    }
  };

  const handleFieldChange = (field, value) => setEditingFields(prev => ({ ...prev, [field]: value }));

  const handleFieldBlur = async (field, newValue) => {
    if (newValue !== idea[field]) {
      try {
        const { error } = await supabase.from('ideas').update({ [field]: newValue }).eq('id', idea.id);
        if (error) throw error;
        setIdea(prev => ({ ...prev, [field]: newValue }));
        setToast({ message: '✓ Guardado', type: 'success' });
      } catch (err) {
        setToast({ message: err.message, type: 'error' });
      }
    }
    setEditingFields(prev => ({ ...prev, [field]: undefined }));
  };

  const handleValidar = async () => {
    setValidating(true);
    try {
      const response = await fetch('http://localhost:5678/webhook/idea-validar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: idea.titulo,
          descripcion: idea.descripcion,
          mercado: idea.mercado || '',
          categoria: idea.categoria || '',
        }),
      });
      if (!response.ok) throw new Error('Error al conectar con n8n. Verifica que esté corriendo en http://localhost:5678');
      const result = await response.json();
      const { error } = await supabase.from('ideas').update({ validacion: result }).eq('id', idea.id);
      if (error) throw error;
      setIdea(prev => ({ ...prev, validacion: result }));
      setToast({ message: '✓ Validación completada', type: 'success' });
    } catch (err) {
      const msg = err.message.includes('Failed to fetch') || err.message.includes('localhost')
        ? '⚠️ n8n no está corriendo. Ejecutá: npm start en la carpeta de n8n'
        : err.message;
      setToast({ message: msg, type: 'error' });
    } finally {
      setValidating(false);
    }
  };

  const handleGenerateResearch = async () => {
    setGeneratingResearch(true);
    try {
      const response = await fetch('http://localhost:5678/webhook/idea-research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea: { titulo: idea.titulo, descripcion: idea.descripcion, mercado: idea.mercado || '', categoria: idea.categoria || '', publico: idea.publico || '' } }),
      });
      if (!response.ok) throw new Error('Error al conectar con n8n.');
      const result = await response.json();
      const { error } = await supabase.from('ideas').update({ research: result, research_mercado: JSON.stringify(result), estado: 'investigando' }).eq('id', idea.id);
      if (error) throw error;
      setIdea(prev => ({ ...prev, research: result, research_mercado: JSON.stringify(result), estado: 'investigando' }));
      setToast({ message: '✓ Research generado', type: 'success' });
    } catch (err) {
      const msg = err.message.includes('Failed to fetch') || err.message.includes('localhost')
        ? '⚠️ n8n no está corriendo.'
        : err.message;
      setToast({ message: msg, type: 'error' });
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
        body: JSON.stringify({ idea: { titulo: idea.titulo, descripcion: idea.descripcion, mercado: idea.mercado || '', categoria: idea.categoria || '', publico: idea.publico || '' } }),
      });
      if (!response.ok) throw new Error('Error al conectar con n8n.');
      const result = await response.json();
      const { error } = await supabase.from('ideas').update({ specs: result, specs_pantallas: result.pantallas || '', specs_flujos: result.flujos || '', specs_apis: result.apis || '', complejidad: result.complejidad || '' }).eq('id', idea.id);
      if (error) throw error;
      setIdea(prev => ({ ...prev, specs: result, specs_pantallas: result.pantallas || '', specs_flujos: result.flujos || '', specs_apis: result.apis || '', complejidad: result.complejidad || '' }));
      setToast({ message: '✓ Specs generados', type: 'success' });
    } catch (err) {
      const msg = err.message.includes('Failed to fetch') || err.message.includes('localhost')
        ? '⚠️ n8n no está corriendo.'
        : err.message;
      setToast({ message: msg, type: 'error' });
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
        r ? `\nRESEARCH:\n- Propuesta de valor: ${r.propuesta_valor}\n- Público: ${r.publico_objetivo}\n- Paleta: ${r.diseno?.paleta?.join(', ')}\n- Tipografía: ${r.diseno?.tipografia_display}\n- Monetización: ${r.monetizacion?.modelo}` : '',
        s ? `\nSPECS:\n- Pantallas: ${s.pantallas?.map(p => p.nombre).join(', ')}\n- Notas: ${s.notas_tecnicas}` : '',
      ].filter(Boolean).join('');

      const response = await fetch('http://localhost:3001/pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: idea.titulo, descripcion: descripcionCompleta, publico: idea.publico || 'Usuarios argentinos', categoria: idea.categoria || 'utilidad-global', mercado: idea.mercado || '', idea_id: idea.id }),
      });
      if (!response.ok) throw new Error('El servidor local no está corriendo. Ejecutá: node server.js');
      const result = await response.json();
      await supabase.from('ideas').update({ estado: 'aprobada' }).eq('id', idea.id);
      setToast({ message: '✓ Pipeline iniciado', type: 'success' });
      setTimeout(() => navigate(`/pipeline?runId=${result.runId}`), 1500);
    } catch (err) {
      const msg = err.message.includes('Failed to fetch') || err.message.includes('localhost')
        ? '⚠️ El servidor local no está corriendo. Ejecutá: node server.js'
        : err.message;
      setToast({ message: msg, type: 'error' });
    } finally {
      setSendingPipeline(false);
    }
  };

  const handleChecklistPlayConsole = async (key) => {
    const updated = { ...(idea.checklist_publicacion || {}), [key]: !(idea.checklist_publicacion?.[key] || false) };
    try {
      const { error } = await supabase.from('ideas').update({ checklist_publicacion: updated }).eq('id', idea.id);
      if (error) throw error;
      setIdea(prev => ({ ...prev, checklist_publicacion: updated }));
    } catch (err) {
      setToast({ message: 'Error al guardar: ' + err.message, type: 'error' });
    }
  };

  const handleSaveAso = async () => {
    try {
      const { error } = await supabase.from('ideas').update({ aso: asoLocal }).eq('id', idea.id);
      if (error) throw error;
      setIdea(prev => ({ ...prev, aso: asoLocal }));
      setToast({ message: '✓ ASO guardado', type: 'success' });
    } catch (err) {
      setToast({ message: 'Error al guardar: ' + err.message, type: 'error' });
    }
  };

  const getPackageName = () => {
    if (!idea?.titulo) return '';
    const slug = idea.titulo.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    return 'com.nztech.' + slug.replace(/-/g, '');
  };

  // ─── Step completion detection ─────────────────────────────────────────────

  const playConsoleItems = ['cuenta_desarrollador', 'app_creada', 'store_listing', 'screenshots_cargados', 'apk_subido', 'content_rating', 'pricing', 'publicado'];

  const stepCompleted = {
    1: !!(idea?.titulo && idea?.descripcion),
    2: !!(idea?.validacion),
    3: !!(idea?.research_mercado || idea?.research),
    4: !!(idea?.specs_pantallas),
    5: allRuns.some(r => r.estado === 'completado'),
    6: playConsoleItems.every(k => idea?.checklist_publicacion?.[k]),
    7: !!(idea?.aso?.titulo || idea?.aso?.descripcion_corta),
  };

  // ─── Render guards ─────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div style={{ background: 'var(--bg)', minHeight: '100%', padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '16px' }}>Cargando...</div>
      </div>
    );
  }

  if (!idea) {
    return (
      <div style={{ background: 'var(--bg)', minHeight: '100%', padding: '24px', textAlign: 'center' }}>
        <div style={{ color: 'var(--text-muted)' }}>Idea no encontrada</div>
      </div>
    );
  }

  let researchData = idea.research;
  if (!researchData && idea.research_mercado) {
    try { researchData = JSON.parse(idea.research_mercado); } catch { researchData = null; }
  }

  const specsData = idea.specs || {
    pantallas: parseField(idea.specs_pantallas),
    flujos: parseField(idea.specs_flujos),
    apis: parseField(idea.specs_apis),
    complejidad: idea.complejidad,
  };

  const validacion = idea.validacion;
  const scoreColor = !validacion?.score ? 'var(--text-muted)'
    : validacion.score < 40 ? 'var(--nz-danger)'
    : validacion.score < 70 ? 'var(--nz-warning)'
    : 'var(--nz-success)';

  // ─── Editable field helper ─────────────────────────────────────────────────

  const EditableInput = ({ field, label, multiline }) => (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '8px', fontWeight: '500', textTransform: 'uppercase' }}>{label}</div>
      {editingFields[field] !== undefined ? (
        multiline ? (
          <textarea
            autoFocus
            value={editingFields[field]}
            onChange={e => handleFieldChange(field, e.target.value)}
            onBlur={e => handleFieldBlur(field, e.target.value)}
            rows={4}
            style={{ width: '100%', padding: '10px 12px', background: 'var(--surface)', border: '1px solid var(--primary)', borderRadius: 'var(--radius-sm)', color: 'var(--text)', fontSize: '14px', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }}
          />
        ) : (
          <input
            autoFocus
            type="text"
            value={editingFields[field]}
            onChange={e => handleFieldChange(field, e.target.value)}
            onBlur={e => handleFieldBlur(field, e.target.value)}
            style={{ width: '100%', padding: '10px 12px', background: 'var(--surface)', border: '1px solid var(--primary)', borderRadius: 'var(--radius-sm)', color: 'var(--text)', fontSize: '14px', fontFamily: 'inherit', boxSizing: 'border-box' }}
          />
        )
      ) : (
        <div
          onClick={() => setEditingFields(prev => ({ ...prev, [field]: idea[field] || '' }))}
          style={{ padding: '10px 12px', background: 'var(--surface)', borderRadius: 'var(--radius-sm)', color: idea[field] ? 'var(--text-muted)' : 'var(--text-subtle)', fontSize: '14px', cursor: 'pointer', border: '1px solid var(--border)', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}
          title="Click para editar"
        >
          {idea[field] || 'Sin especificar'}
        </div>
      )}
    </div>
  );

  // ─── Return ────────────────────────────────────────────────────────────────

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>

      {/* Sticky Header */}
      <div style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)', padding: '16px 24px', position: 'sticky', top: 0, zIndex: 10 }}>
        <button
          onClick={() => navigate('/ideas')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '14px', fontWeight: '600', padding: 0, marginBottom: '12px' }}
        >
          <IconArrowLeft /> Volver a Ideas
        </button>
        <h1 style={{ color: 'var(--text)', fontSize: '24px', fontWeight: '700', margin: '0 0 16px 0' }}>{idea.titulo}</h1>
        <Stepper current={currentStep} completed={stepCompleted} onStep={setCurrentStep} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, maxWidth: '900px', width: '100%', margin: '0 auto', padding: '24px 24px 40px', boxSizing: 'border-box' }}>

        {/* ── Etapa 1: Info Base ─────────────────────────────────────────────── */}
        {currentStep === 1 && (
          <div>
            <h2 style={{ color: 'var(--text)', fontSize: '18px', fontWeight: '700', marginBottom: '24px' }}>Información base</h2>

            <EditableInput field="titulo" label="Título" />
            <EditableInput field="descripcion" label="Descripción" multiline />
            <EditableInput field="mercado" label="Mercado" />
            <EditableInput field="categoria" label="Categoría" />

            <div style={{ marginBottom: '20px' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '8px', fontWeight: '500', textTransform: 'uppercase' }}>Status</div>
              <select
                value={idea.estado || 'idea'}
                onChange={async e => {
                  const val = e.target.value;
                  await supabase.from('ideas').update({ estado: val }).eq('id', idea.id);
                  setIdea(prev => ({ ...prev, estado: val }));
                }}
                style={{ padding: '10px 12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text)', fontSize: '14px', cursor: 'pointer', minWidth: '160px' }}
              >
                {['idea', 'investigando', 'aprobada', 'descartada', 'publicada'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* ── Etapa 2: Validador ─────────────────────────────────────────────── */}
        {currentStep === 2 && (
          <div>
            <h2 style={{ color: 'var(--text)', fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>Validador IA</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '24px' }}>Analiza la viabilidad de la idea con 6 criterios ponderados.</p>

            <button
              onClick={handleValidar}
              disabled={validating}
              style={{ padding: '12px 24px', background: 'var(--primary)', border: 'none', color: 'var(--primary-fg)', borderRadius: 'var(--radius)', cursor: validating ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: '600', opacity: validating ? 0.6 : 1, marginBottom: '32px', transition: 'opacity var(--dur)' }}
            >
              {validating ? 'Validando...' : validacion ? 'Re-validar con IA' : 'Validar con IA'}
            </button>

            {validacion && (
              <div>
                {/* Score + Veredicto */}
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '32px', marginBottom: '24px', textAlign: 'center' }}>
                  <div style={{ fontSize: '72px', fontWeight: '800', color: scoreColor, fontFamily: 'var(--font-mono)', lineHeight: 1 }}>
                    {validacion.score}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px', fontFamily: 'var(--font-mono)' }}>/ 100</div>
                  {validacion.veredicto && (
                    <div style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text)', lineHeight: '1.4' }}>
                      {validacion.veredicto}
                    </div>
                  )}
                </div>

                {/* 6 criterios */}
                {(() => {
                  const criterios = validacion.analisis || validacion.criterios;
                  if (!Array.isArray(criterios) || criterios.length === 0) return null;
                  return (
                    <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 640 ? '1fr' : '1fr 1fr', gap: '12px' }}>
                      {criterios.map((c, i) => {
                        const cScore = typeof c.puntaje === 'number' ? c.puntaje : null;
                        const cColor = cScore === null ? 'var(--text-muted)'
                          : cScore < 4 ? 'var(--nz-danger)'
                          : cScore < 7 ? 'var(--nz-warning)'
                          : 'var(--nz-success)';
                        return (
                          <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                              <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)', flex: 1 }}>{c.criterio}</div>
                              {cScore !== null && (
                                <div style={{ fontSize: '16px', fontWeight: '700', color: cColor, fontFamily: 'var(--font-mono)', flexShrink: 0, marginLeft: '8px', whiteSpace: 'nowrap' }}>
                                  {cScore}<span style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>/10</span>
                                </div>
                              )}
                            </div>
                            {c.texto && <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5' }}>{c.texto}</div>}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}

        {/* ── Etapa 3: Research ──────────────────────────────────────────────── */}
        {currentStep === 3 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
              <h2 style={{ color: 'var(--text)', fontSize: '18px', fontWeight: '700', margin: 0 }}>Research de Mercado</h2>
              <button
                onClick={handleGenerateResearch}
                disabled={generatingResearch}
                style={{ padding: '10px 20px', background: 'var(--primary)', border: 'none', color: 'var(--primary-fg)', borderRadius: 'var(--radius)', cursor: generatingResearch ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: '600', opacity: generatingResearch ? 0.6 : 1, transition: 'opacity var(--dur)' }}
              >
                {generatingResearch ? 'Generando...' : researchData ? 'Actualizar Research' : 'Generar Research'}
              </button>
            </div>
            {researchData
              ? <ResearchSection data={researchData} />
              : <div style={{ background: 'var(--surface)', padding: '24px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', textAlign: 'center', color: 'var(--text-muted)' }}>No hay research aún. Hacé click en "Generar Research".</div>
            }
          </div>
        )}

        {/* ── Etapa 4: Specs ─────────────────────────────────────────────────── */}
        {currentStep === 4 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
              <h2 style={{ color: 'var(--text)', fontSize: '18px', fontWeight: '700', margin: 0 }}>Especificaciones Técnicas</h2>
              <button
                onClick={handleGenerateSpecs}
                disabled={generatingSpecs || !idea.research_mercado}
                title={!idea.research_mercado ? 'Primero genera el Research' : ''}
                style={{ padding: '10px 20px', background: 'var(--primary)', border: 'none', color: 'var(--primary-fg)', borderRadius: 'var(--radius)', cursor: (generatingSpecs || !idea.research_mercado) ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: '600', opacity: (generatingSpecs || !idea.research_mercado) ? 0.5 : 1, transition: 'opacity var(--dur)' }}
              >
                {generatingSpecs ? 'Generando...' : idea.specs_pantallas ? 'Actualizar Specs' : 'Generar Specs'}
              </button>
            </div>
            {idea.specs_pantallas || idea.specs_flujos || idea.specs_apis || idea.complejidad ? (
              <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : '1fr 1fr', gap: '16px' }}>
                {idea.specs_pantallas && (
                  <div style={{ background: 'var(--surface)', padding: '16px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                    <h3 style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: '600', margin: '0 0 8px 0', textTransform: 'uppercase' }}>Pantallas</h3>
                    <div style={{ color: 'var(--text-muted)', fontSize: '12px', lineHeight: '1.5' }}>{renderField(parseField(idea.specs_pantallas))}</div>
                  </div>
                )}
                {idea.specs_flujos && (
                  <div style={{ background: 'var(--surface)', padding: '16px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                    <h3 style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: '600', margin: '0 0 8px 0', textTransform: 'uppercase' }}>Flujos</h3>
                    <div style={{ color: 'var(--text-muted)', fontSize: '12px', lineHeight: '1.5' }}>
                      {Array.isArray(specsData.flujos)
                        ? <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {specsData.flujos.map((flujo, i) => (
                              <div key={i} style={{ paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
                                <strong style={{ color: 'var(--primary)' }}>{flujo.nombre}</strong>
                                {Array.isArray(flujo.pasos) && (
                                  <ol style={{ margin: '8px 0 0 0', paddingLeft: '20px', color: 'var(--text-muted)' }}>
                                    {flujo.pasos.map((paso, j) => <li key={j} style={{ margin: '4px 0', fontSize: '11px' }}>{paso}</li>)}
                                  </ol>
                                )}
                              </div>
                            ))}
                          </div>
                        : specsData.flujos ? String(specsData.flujos) : 'Sin datos'
                      }
                    </div>
                  </div>
                )}
                {idea.specs_apis && (
                  <div style={{ background: 'var(--surface)', padding: '16px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                    <h3 style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: '600', margin: '0 0 8px 0', textTransform: 'uppercase' }}>APIs / Integraciones</h3>
                    <div style={{ color: 'var(--text-muted)', fontSize: '12px', lineHeight: '1.5' }}>
                      {Array.isArray(specsData.apis)
                        ? <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {specsData.apis.map((api, i) => (
                              <div key={i} style={{ paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
                                <strong style={{ color: 'var(--primary)' }}>{api.nombre}</strong>
                                {api.endpoint && <div style={{ marginTop: '4px' }}><a href={api.endpoint} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--nz-info)', fontSize: '11px', textDecoration: 'none', wordBreak: 'break-all' }}>{api.endpoint}</a></div>}
                                {api.uso && <div style={{ marginTop: '4px', fontSize: '11px' }}>{api.uso}</div>}
                                {api.auth && <div style={{ marginTop: '4px', fontSize: '10px', color: 'var(--primary)' }}>Auth: {api.auth}</div>}
                              </div>
                            ))}
                          </div>
                        : specsData.apis ? String(specsData.apis) : 'Sin datos'
                      }
                    </div>
                  </div>
                )}
                {idea.complejidad && (
                  <div style={{ background: 'var(--surface)', padding: '16px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                    <h3 style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: '600', margin: '0 0 8px 0', textTransform: 'uppercase' }}>Complejidad</h3>
                    <div style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: '600', textTransform: 'capitalize' }}>{idea.complejidad}</div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ background: 'var(--surface)', padding: '24px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', textAlign: 'center', color: 'var(--text-muted)' }}>
                No hay specs aún. Primero genera el Research, luego los Specs.
              </div>
            )}
          </div>
        )}

        {/* ── Etapa 5: Pipeline ──────────────────────────────────────────────── */}
        {currentStep === 5 && (
          <div>
            <h2 style={{ color: 'var(--text)', fontSize: '18px', fontWeight: '700', marginBottom: '24px' }}>Pipeline de Construcción</h2>

            <button
              onClick={handleLanzarPipeline}
              disabled={sendingPipeline}
              style={{ width: '100%', padding: '16px 32px', background: 'var(--primary)', border: 'none', color: 'var(--primary-fg)', borderRadius: 'var(--radius)', cursor: sendingPipeline ? 'not-allowed' : 'pointer', fontSize: '16px', fontWeight: '600', opacity: sendingPipeline ? 0.6 : 1, transition: 'opacity var(--dur)', marginBottom: '32px' }}
            >
              {sendingPipeline ? 'Lanzando...' : '🚀 Lanzar Pipeline'}
            </button>

            <h3 style={{ color: 'var(--text)', fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Historial de Runs</h3>
            {loadingAllRuns ? (
              <div style={{ color: 'var(--text-muted)', padding: '20px', textAlign: 'center' }}>Cargando...</div>
            ) : allRuns.length > 0 ? (
              <div style={{ display: 'grid', gap: '12px' }}>
                {allRuns.map((run, index) => {
                  const runColor = run.estado === 'completado' ? 'var(--nz-success)' : run.estado === 'running' ? 'var(--nz-info)' : 'var(--nz-danger)';
                  return (
                    <div key={run.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)' }}>#{allRuns.length - index}</div>
                        <span style={{ backgroundColor: `color-mix(in oklch, ${runColor} 20%, transparent)`, color: runColor, fontSize: '11px', fontWeight: '600', padding: '4px 8px', borderRadius: 'var(--radius-sm)', textTransform: 'capitalize' }}>
                          {run.estado}
                        </span>
                      </div>
                      <div style={{ display: 'grid', gap: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>
                        {run.created_at && <div><strong>Fecha:</strong> {new Date(run.created_at).toLocaleString('es-ES')}</div>}
                        {run.paso_actual && <div><strong>Paso:</strong> {run.paso_actual}</div>}
                        {run.duracion_segundos && <div><strong>Duración:</strong> {run.duracion_segundos}s</div>}
                        {run.estado === 'error' && run.error && <div style={{ color: 'var(--nz-danger)' }}><strong>Error:</strong> {run.error}</div>}
                      </div>
                      {run.repo_url && (
                        <div style={{ marginTop: '12px' }}>
                          <a href={run.repo_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 12px', border: '1px solid var(--primary)', color: 'var(--primary)', borderRadius: 'var(--radius-sm)', fontSize: '12px', fontWeight: '600', textDecoration: 'none' }}>
                            📦 Ver repo
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                No hay runs aún para esta idea.
              </div>
            )}
          </div>
        )}

        {/* ── Etapa 6: Play Console Checklist ────────────────────────────────── */}
        {currentStep === 6 && (
          <div>
            <h2 style={{ color: 'var(--text)', fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>Play Console</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '24px' }}>Checklist de publicación en Google Play Store.</p>

            {/* Package name copiable */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px', marginBottom: '24px' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '8px' }}>Package Name</div>
              <div
                onClick={() => { navigator.clipboard.writeText(getPackageName()); setToast({ message: '✓ Copiado', type: 'success' }); }}
                style={{ padding: '10px 12px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--primary)', cursor: 'pointer' }}
              >
                {getPackageName()}
              </div>
            </div>

            {/* Progress */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
                <span>Progreso</span>
                <span>{playConsoleItems.filter(k => idea.checklist_publicacion?.[k]).length} / {playConsoleItems.length}</span>
              </div>
              <div style={{ height: '4px', background: 'var(--surface-2)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ height: '100%', background: 'var(--primary)', width: `${(playConsoleItems.filter(k => idea.checklist_publicacion?.[k]).length / playConsoleItems.length) * 100}%`, transition: 'width 0.3s ease' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gap: '8px', marginBottom: '32px' }}>
              {[
                { key: 'cuenta_desarrollador', label: 'Cuenta de desarrollador activa' },
                { key: 'app_creada', label: 'App creada en Play Console' },
                { key: 'store_listing', label: 'Store listing completo (título, descripción, categoría)' },
                { key: 'screenshots_cargados', label: 'Screenshots cargados (mínimo 2)' },
                { key: 'apk_subido', label: 'APK / AAB subido' },
                { key: 'content_rating', label: 'Content rating completado' },
                { key: 'pricing', label: 'Precios y distribución configurados' },
                { key: 'publicado', label: 'App enviada para revisión / publicada' },
              ].map(item => {
                const checked = idea.checklist_publicacion?.[item.key] || false;
                return (
                  <label
                    key={item.key}
                    style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '14px 16px', cursor: 'pointer', transition: 'background var(--dur)' }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleChecklistPlayConsole(item.key)}
                      style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--primary)', flexShrink: 0 }}
                    />
                    <span style={{ color: checked ? 'var(--text-subtle)' : 'var(--text)', fontSize: '13px', textDecoration: checked ? 'line-through' : 'none', flex: 1 }}>
                      {item.label}
                    </span>
                  </label>
                );
              })}
            </div>

            {stepCompleted[6] && (
              <button
                onClick={() => setShowPostmortem(true)}
                style={{ width: '100%', padding: '18px 32px', background: 'var(--primary)', border: 'none', color: 'var(--primary-fg)', borderRadius: 'var(--radius)', cursor: 'pointer', fontSize: '16px', fontWeight: '700', transition: 'opacity var(--dur)' }}
              >
                Publicar app →
              </button>
            )}
          </div>
        )}

        {/* ── Etapa 7: ASO ───────────────────────────────────────────────────── */}
        {currentStep === 7 && asoLocal && (
          <div>
            <h2 style={{ color: 'var(--text)', fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>ASO — App Store Optimization</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '28px' }}>Textos optimizados para Play Store. Los caracteres restantes se muestran en tiempo real.</p>

            {/* Título app */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: '500', textTransform: 'uppercase' }}>Título app</label>
                <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: asoLocal.titulo.length > 30 ? 'var(--nz-danger)' : 'var(--text-muted)' }}>
                  {asoLocal.titulo.length} / 30
                </span>
              </div>
              <input
                type="text"
                value={asoLocal.titulo}
                onChange={e => setAsoLocal(prev => ({ ...prev, titulo: e.target.value }))}
                maxLength={30}
                style={{ width: '100%', padding: '10px 12px', background: 'var(--surface)', border: `1px solid ${asoLocal.titulo.length > 30 ? 'var(--nz-danger)' : 'var(--border)'}`, borderRadius: 'var(--radius-sm)', color: 'var(--text)', fontSize: '14px', fontFamily: 'inherit', boxSizing: 'border-box' }}
              />
            </div>

            {/* Descripción corta */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: '500', textTransform: 'uppercase' }}>Descripción corta</label>
                <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: asoLocal.descripcion_corta.length > 80 ? 'var(--nz-danger)' : 'var(--text-muted)' }}>
                  {asoLocal.descripcion_corta.length} / 80
                </span>
              </div>
              <input
                type="text"
                value={asoLocal.descripcion_corta}
                onChange={e => setAsoLocal(prev => ({ ...prev, descripcion_corta: e.target.value }))}
                maxLength={80}
                style={{ width: '100%', padding: '10px 12px', background: 'var(--surface)', border: `1px solid ${asoLocal.descripcion_corta.length > 80 ? 'var(--nz-danger)' : 'var(--border)'}`, borderRadius: 'var(--radius-sm)', color: 'var(--text)', fontSize: '14px', fontFamily: 'inherit', boxSizing: 'border-box' }}
              />
            </div>

            {/* Descripción larga */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: '500', textTransform: 'uppercase' }}>Descripción larga</label>
                <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: asoLocal.descripcion_larga.length > 4000 ? 'var(--nz-danger)' : 'var(--text-muted)' }}>
                  {asoLocal.descripcion_larga.length} / 4000
                </span>
              </div>
              <textarea
                value={asoLocal.descripcion_larga}
                onChange={e => setAsoLocal(prev => ({ ...prev, descripcion_larga: e.target.value }))}
                maxLength={4000}
                rows={10}
                style={{ width: '100%', padding: '10px 12px', background: 'var(--surface)', border: `1px solid ${asoLocal.descripcion_larga.length > 4000 ? 'var(--nz-danger)' : 'var(--border)'}`, borderRadius: 'var(--radius-sm)', color: 'var(--text)', fontSize: '14px', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box', lineHeight: '1.6' }}
              />
            </div>

            {/* Keywords */}
            <div style={{ marginBottom: '28px' }}>
              <div style={{ marginBottom: '8px' }}>
                <label style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: '500', textTransform: 'uppercase' }}>Keywords</label>
                <div style={{ color: 'var(--text-subtle)', fontSize: '11px', marginTop: '2px' }}>Separadas por coma</div>
              </div>
              <input
                type="text"
                value={asoLocal.keywords}
                onChange={e => setAsoLocal(prev => ({ ...prev, keywords: e.target.value }))}
                placeholder="cálculo, conversor, herramienta, gratis..."
                style={{ width: '100%', padding: '10px 12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text)', fontSize: '14px', fontFamily: 'inherit', boxSizing: 'border-box' }}
              />
              {asoLocal.keywords && (
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '12px' }}>
                  {asoLocal.keywords.split(',').map(k => k.trim()).filter(Boolean).map((k, i) => (
                    <span key={i} style={{ backgroundColor: 'var(--primary-soft)', color: 'var(--primary)', padding: '4px 10px', borderRadius: 'var(--radius-pill)', fontSize: '12px', fontWeight: '500' }}>{k}</span>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={handleSaveAso}
              style={{ padding: '12px 28px', background: 'var(--primary)', border: 'none', color: 'var(--primary-fg)', borderRadius: 'var(--radius)', cursor: 'pointer', fontSize: '14px', fontWeight: '600', transition: 'opacity var(--dur)' }}
            >
              Guardar ASO
            </button>
          </div>
        )}

        {/* ── Nav Anterior / Siguiente ────────────────────────────────────────── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '40px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
          <button
            onClick={() => setCurrentStep(s => Math.max(1, s - 1))}
            disabled={currentStep === 1}
            style={{ padding: '10px 20px', background: 'var(--surface)', border: '1px solid var(--border)', color: currentStep === 1 ? 'var(--text-subtle)' : 'var(--text)', borderRadius: 'var(--radius)', cursor: currentStep === 1 ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: '600', transition: 'all var(--dur)' }}
          >
            ← Anterior
          </button>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {currentStep} / {STEPS.length}
          </span>
          <button
            onClick={() => setCurrentStep(s => Math.min(STEPS.length, s + 1))}
            disabled={currentStep === STEPS.length}
            style={{ padding: '10px 20px', background: currentStep === STEPS.length ? 'var(--surface)' : 'var(--primary)', border: '1px solid var(--border)', color: currentStep === STEPS.length ? 'var(--text-subtle)' : 'var(--primary-fg)', borderRadius: 'var(--radius)', cursor: currentStep === STEPS.length ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: '600', transition: 'all var(--dur)' }}
          >
            Siguiente →
          </button>
        </div>
      </div>

      {/* Help Modal */}
      {helpModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setHelpModal(null)}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '32px', maxWidth: '500px', width: '90%', boxShadow: 'var(--shadow-lg)' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ color: 'var(--primary)', fontSize: '18px', fontWeight: '600', marginBottom: '16px', marginTop: 0 }}>{helpModal.title}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px', whiteSpace: 'pre-wrap' }}>{helpModal.description}</p>
            <button onClick={() => setHelpModal(null)} style={{ width: '100%', padding: '12px', background: 'var(--primary)', border: 'none', color: 'var(--primary-fg)', borderRadius: 'var(--radius)', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>Cerrar</button>
          </div>
        </div>
      )}

      {toast && <ToastNotification message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {showPostmortem && (
        <PostMortemModal
          idea={idea}
          onClose={() => setShowPostmortem(false)}
          onComplete={async (postmortemData) => {
            try {
              await savePostmortem(postmortemData);
              const { data: appData, error: insertError } = await supabase
                .from('apps')
                .insert({
                  nombre: idea.titulo,
                  descripcion: idea.descripcion,
                  package_name: getPackageName(),
                  estado: 'published',
                  idea_id: idea.id,
                  repo_url: allRuns.find(r => r.estado === 'completado')?.repo_url || '',
                  categoria: idea.categoria,
                })
                .select('id')
                .single();
              if (insertError) throw insertError;
              await supabase.from('ideas').update({ estado: 'publicada' }).eq('id', idea.id);
              setShowPostmortem(false);
              setToast({ message: '✓ App publicada exitosamente', type: 'success' });
              setTimeout(() => navigate(`/apps/${appData.id}`), 1200);
            } catch (err) {
              setToast({ message: 'Error: ' + err.message, type: 'error' });
              setShowPostmortem(false);
            }
          }}
        />
      )}
    </div>
  );
}
