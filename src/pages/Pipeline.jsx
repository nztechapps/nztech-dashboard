import { useState, useEffect } from 'react';
import { usePipelineRuns, useRealtimeRun } from '../hooks/usePipelineRuns';
import { supabase } from '../lib/supabase';
import ToastNotification from '../components/ui/ToastNotification';
import Badge from '../components/ui/Badge';

const inputStyle = {
  width: '100%',
  backgroundColor: '#F9FAFB',
  border: '1px solid rgba(0,0,0,0.12)',
  borderRadius: '6px',
  padding: '10px 12px',
  color: '#111827',
  fontSize: '13px',
  boxSizing: 'border-box',
};

const card = {
  backgroundColor: '#FFFFFF',
  border: '1px solid rgba(0,0,0,0.06)',
  borderRadius: '12px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  padding: '20px',
};

const IconPlay = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="5 3 19 12 5 21 5 3"></polygon>
  </svg>
);
const IconSquare = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18"></rect>
  </svg>
);
const IconCopy = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
  </svg>
);

const sectionTitle = { fontSize: '13px', fontWeight: '600', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', marginTop: 0 };

export default function Pipeline() {
  const { runs, loading, createRun, cancelRun } = usePipelineRuns();
  const [formData, setFormData] = useState({
    nombre: '', descripcion: '', publico: '', mercado: 'argentina', categoria: 'utilidad-global',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [timer, setTimer] = useState(0);

  const activeRun = runs.find((r) => r.estado === 'running');
  const realtimeRun = useRealtimeRun(activeRun?.id || null);
  const displayRun = realtimeRun || activeRun;

  useEffect(() => {
    if (!displayRun) return;
    const interval = setInterval(() => {
      setTimer(Math.floor((Date.now() - new Date(displayRun.created_at).getTime()) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [displayRun]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre.trim()) { setToast({ message: 'El nombre es requerido', type: 'error' }); return; }
    try {
      setIsSubmitting(true);
      await createRun(formData);
      setFormData({ nombre: '', descripcion: '', publico: '', mercado: 'argentina', categoria: 'utilidad-global' });
      setToast({ message: 'Pipeline iniciado', type: 'success' });
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!displayRun) return;
    try { await cancelRun(displayRun.id); setToast({ message: 'Pipeline cancelado', type: 'success' }); }
    catch (err) { setToast({ message: err.message, type: 'error' }); }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const getPackageName = (nombre) => {
    const slug = nombre.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    return 'com.nztech.' + slug.replace(/-/g, '');
  };

  const handleChecklistUpdate = async (runId, key, value) => {
    try {
      const run = runs.find(r => r.id === runId);
      if (!run) return;
      const updatedChecklist = { ...(run.checklist_firebase_admob || {}), [key]: value };
      await supabase.from('pipeline_runs').update({ checklist_firebase_admob: updatedChecklist }).eq('id', runId);
    } catch (err) {
      setToast({ message: 'Error al actualizar checklist: ' + err.message, type: 'error' });
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setToast({ message: 'Copiado al portapapeles', type: 'success' });
  };

  return (
    <div style={{ backgroundColor: '#F9FAFB', minHeight: '100%', padding: '24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Form Nueva App */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={sectionTitle}>Nueva app</h2>
          <form
            onSubmit={handleSubmit}
            style={{ ...card, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}
          >
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', color: '#6B7280', fontSize: '11px', marginBottom: '6px', fontWeight: '500' }}>Nombre *</label>
              <input type="text" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Nombre de la app" disabled={isSubmitting || !!displayRun} style={{ ...inputStyle, opacity: isSubmitting || displayRun ? 0.5 : 1 }} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', color: '#6B7280', fontSize: '11px', marginBottom: '6px', fontWeight: '500' }}>Descripción</label>
              <textarea value={formData.descripcion} onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                placeholder="Describe brevemente qué hace la app" disabled={isSubmitting || !!displayRun}
                style={{ ...inputStyle, minHeight: '80px', fontFamily: 'DM Mono, monospace', resize: 'vertical', opacity: isSubmitting || displayRun ? 0.5 : 1 }} />
            </div>
            <div>
              <label style={{ display: 'block', color: '#6B7280', fontSize: '11px', marginBottom: '6px', fontWeight: '500' }}>Público</label>
              <input type="text" value={formData.publico} onChange={(e) => setFormData({ ...formData, publico: e.target.value })}
                placeholder="Ej: diseñadores" disabled={isSubmitting || !!displayRun} style={{ ...inputStyle, opacity: isSubmitting || displayRun ? 0.5 : 1 }} />
            </div>
            <div>
              <label style={{ display: 'block', color: '#6B7280', fontSize: '11px', marginBottom: '6px', fontWeight: '500' }}>Mercado</label>
              <select value={formData.mercado} onChange={(e) => setFormData({ ...formData, mercado: e.target.value })}
                disabled={isSubmitting || !!displayRun} style={{ ...inputStyle, opacity: isSubmitting || displayRun ? 0.5 : 1 }}>
                <option value="argentina">Argentina</option>
                <option value="mexico">México</option>
                <option value="chile">Chile</option>
                <option value="colombia">Colombia</option>
                <option value="peru">Perú</option>
                <option value="global">Global</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', color: '#6B7280', fontSize: '11px', marginBottom: '6px', fontWeight: '500' }}>Categoría</label>
              <select value={formData.categoria} onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                disabled={isSubmitting || !!displayRun} style={{ ...inputStyle, opacity: isSubmitting || displayRun ? 0.5 : 1 }}>
                <option value="datos-gubernamentales-ar">Datos Gubernamentales AR</option>
                <option value="finanzas-ar">Finanzas AR</option>
                <option value="utilidad-global">Utilidad Global</option>
                <option value="salud">Salud</option>
                <option value="productividad">Productividad</option>
                <option value="info-ar">Info AR</option>
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" disabled={isSubmitting || !!displayRun}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px',
                  backgroundColor: isSubmitting || displayRun ? '#E5E7EB' : '#00E5A0',
                  color: isSubmitting || displayRun ? '#9CA3AF' : '#003D2B',
                  border: 'none', borderRadius: '8px', cursor: isSubmitting || displayRun ? 'not-allowed' : 'pointer',
                  fontSize: '14px', fontWeight: '600',
                }}>
                <IconPlay /> {isSubmitting ? 'Iniciando...' : 'Generar app'}
              </button>
            </div>
          </form>
        </div>

        {/* Run Activo */}
        {displayRun && (
          <div style={{ marginBottom: '32px' }}>
            <h2 style={sectionTitle}>Pipeline activo</h2>
            <div style={{ ...card, borderLeft: '3px solid #8B5CF6' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ color: '#111827', margin: '0 0 6px 0', fontSize: '15px', fontWeight: '600' }}>{displayRun.nombre}</h3>
                  <p style={{ color: '#6B7280', margin: 0, fontSize: '12px' }}>Paso: {displayRun.paso_actual || 'iniciando...'}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#00E5A0', fontSize: '18px', fontWeight: '600', fontFamily: 'DM Mono, monospace' }}>{formatTime(timer)}</div>
                  <div style={{ color: '#9CA3AF', fontSize: '11px', marginTop: '4px' }}>Tiempo transcurrido</div>
                </div>
              </div>
              <div style={{ marginBottom: '16px', height: '4px', backgroundColor: '#E5E7EB', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ height: '100%', backgroundColor: '#8B5CF6', animation: 'pulse 1.5s infinite', width: '30%' }} />
              </div>
              <button onClick={handleCancel}
                style={{ padding: '6px 14px', backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', color: '#DC2626', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <IconSquare /> Cancelar
              </button>
              <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }`}</style>
            </div>
          </div>
        )}

        {/* Historial */}
        <div>
          <h2 style={sectionTitle}>Historial</h2>
          {loading ? (
            <div style={{ color: '#6B7280', textAlign: 'center', padding: '40px 0' }}>Cargando...</div>
          ) : runs.length === 0 ? (
            <div style={{ color: '#9CA3AF', textAlign: 'center', padding: '40px 0' }}>No hay runs aún</div>
          ) : (
            <div style={{ display: 'grid', gap: '12px' }}>
              {runs.map((run) => {
                const packageName = getPackageName(run.nombre);
                const checklist = run.checklist_firebase_admob || {};
                const checklistItems = [
                  { key: 'firebase_proyecto', label: 'Crear proyecto en console.firebase.google.com', category: 'Firebase' },
                  { key: 'firebase_registrar', label: `Registrar app con ${packageName}`, category: 'Firebase' },
                  { key: 'firebase_descargar', label: 'Descargar google-services.json', category: 'Firebase' },
                  { key: 'firebase_copiar', label: 'Copiar google-services.json a app/ del proyecto', category: 'Firebase' },
                  { key: 'admob_app', label: 'Crear app en admob.google.com', category: 'AdMob' },
                  { key: 'admob_appid', label: 'Copiar App ID → AndroidManifest.xml', category: 'AdMob' },
                  { key: 'admob_unit', label: 'Crear unidad de banner', category: 'AdMob' },
                  { key: 'admob_unitid', label: 'Copiar Unit ID → activity_main.xml', category: 'AdMob' },
                ];
                const completedCount = checklistItems.filter(item => checklist[item.key]).length;

                return (
                  <div key={run.id}>
                    <div style={{ ...card, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                          <h3 style={{ color: '#111827', margin: 0, fontSize: '14px', fontWeight: '600' }}>{run.nombre}</h3>
                          <Badge status={run.estado} />
                        </div>
                        {run.paso_actual && (
                          <div style={{ color: '#6B7280', fontSize: '12px', marginBottom: '8px', padding: '8px', backgroundColor: '#F5F3FF', borderRadius: '6px', borderLeft: '2px solid #8B5CF6' }}>
                            <span style={{ color: '#9CA3AF', fontSize: '10px', textTransform: 'uppercase', fontWeight: '600' }}>Paso actual:</span>
                            <div style={{ color: '#374151', marginTop: '4px' }}>{run.paso_actual}</div>
                          </div>
                        )}
                        <div style={{ color: '#9CA3AF', fontSize: '11px', marginBottom: '6px' }}>
                          {run.categoria} • {run.created_at && !isNaN(new Date(run.created_at)) ? new Date(run.created_at).toLocaleDateString('es-ES') : '—'}
                        </div>
                        {run.estado === 'completado' && (
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {run.repo_url && (
                              <a href={run.repo_url} target="_blank" rel="noopener noreferrer"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', backgroundColor: '#ECFDF5', border: '1px solid #6EE7B7', color: '#065F46', fontSize: '11px', fontWeight: '600', borderRadius: '6px', textDecoration: 'none' }}>
                                📦 Abrir repo
                              </a>
                            )}
                            {run.github_url && (
                              <a href={run.github_url} target="_blank" rel="noopener noreferrer"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', backgroundColor: '#EFF6FF', border: '1px solid #93C5FD', color: '#1E40AF', fontSize: '11px', fontWeight: '600', borderRadius: '6px', textDecoration: 'none' }}>
                                📁 Ver output
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                      {run.pipeline_output_path && (
                        <button onClick={() => navigator.clipboard.writeText(run.pipeline_output_path)}
                          style={{ background: 'none', border: 'none', color: '#00E5A0', cursor: 'pointer', padding: '4px', display: 'flex', marginLeft: '16px' }}>
                          <IconCopy />
                        </button>
                      )}
                    </div>

                    {run.estado === 'completado' && (
                      <div style={{ marginTop: '8px', backgroundColor: '#FFFFFF', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '12px', padding: '16px' }}>
                        <div style={{ marginBottom: '12px' }}>
                          <h4 style={{ color: '#111827', margin: '0 0 8px 0', fontSize: '13px', fontWeight: '600' }}>Package Name</h4>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <code style={{ backgroundColor: '#F5F3FF', border: '1px solid #EDE9FE', borderRadius: '6px', padding: '8px 12px', color: '#7C3AED', fontSize: '12px', fontFamily: 'DM Mono, monospace', flex: 1, minWidth: 0 }}>
                              {packageName}
                            </code>
                            <button onClick={() => copyToClipboard(packageName)}
                              style={{ background: 'none', border: 'none', color: '#7C3AED', cursor: 'pointer', padding: '4px', display: 'flex' }}>
                              <IconCopy />
                            </button>
                          </div>
                        </div>

                        <div style={{ marginBottom: '12px' }}>
                          <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h4 style={{ color: '#111827', margin: 0, fontSize: '13px', fontWeight: '600' }}>Setup Checklist</h4>
                            <span style={{ color: '#6B7280', fontSize: '11px' }}>{completedCount}/{checklistItems.length}</span>
                          </div>
                          <div style={{ height: '4px', backgroundColor: '#E5E7EB', borderRadius: '2px', overflow: 'hidden', marginBottom: '12px' }}>
                            <div style={{ height: '100%', backgroundColor: '#00E5A0', width: `${(completedCount / checklistItems.length) * 100}%`, transition: 'width 0.3s ease' }} />
                          </div>
                        </div>

                        {['Firebase', 'AdMob'].map((category) => (
                          <div key={category} style={{ marginBottom: '12px' }}>
                            <h5 style={{ color: '#9CA3AF', margin: '0 0 8px 0', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{category}</h5>
                            <div style={{ display: 'grid', gap: '6px' }}>
                              {checklistItems.filter(item => item.category === category).map((item) => (
                                <label key={item.key}
                                  style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', padding: '6px', borderRadius: '6px', transition: 'background-color 0.2s' }}
                                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F5F3FF'}
                                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                  <input type="checkbox" checked={checklist[item.key] || false}
                                    onChange={(e) => handleChecklistUpdate(run.id, item.key, e.target.checked)}
                                    style={{ width: '16px', height: '16px', margin: '2px 0 0 0', cursor: 'pointer', accentColor: '#00E5A0', flexShrink: 0 }} />
                                  <span style={{ color: checklist[item.key] ? '#9CA3AF' : '#374151', fontSize: '12px', textDecoration: checklist[item.key] ? 'line-through' : 'none' }}>
                                    {item.label}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {toast && <ToastNotification message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
