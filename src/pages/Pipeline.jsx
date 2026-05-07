import { useState, useEffect } from 'react';
import { usePipelineRuns, useRealtimeRun } from '../hooks/usePipelineRuns';
import { supabase } from '../lib/supabase';
import ToastNotification from '../components/ui/ToastNotification';
import Badge from '../components/ui/Badge';

const inputS = {
  width: '100%', background: 'var(--surface-2)', border: '1px solid var(--border)',
  borderRadius: 'var(--radius)', padding: '10px 12px', color: 'var(--text)',
  fontSize: 13, boxSizing: 'border-box',
};

const IconPlay   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>;
const IconSquare = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18"/></svg>;
const IconCopy   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>;

const sectionTitle = {
  fontSize: 13, fontWeight: 600, color: 'var(--text-subtle)',
  textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 12, marginTop: 0,
};

const fmtTime = (s) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
const getPkg  = (n) => 'com.nztech.' + n.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'').replace(/-/g,'');

export default function Pipeline() {
  const { runs, loading, createRun, cancelRun } = usePipelineRuns();
  const [form, setForm] = useState({ nombre: '', descripcion: '', publico: '', mercado: 'argentina', categoria: 'utilidad-global' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [timer, setTimer] = useState(0);

  const activeRun = runs.find(r => r.estado === 'running');
  const realtimeRun = useRealtimeRun(activeRun?.id || null);
  const displayRun = realtimeRun || activeRun;

  useEffect(() => {
    if (!displayRun) return;
    const iv = setInterval(() => setTimer(Math.floor((Date.now() - new Date(displayRun.created_at).getTime()) / 1000)), 1000);
    return () => clearInterval(iv);
  }, [displayRun]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombre.trim()) { setToast({ message: 'El nombre es requerido', type: 'error' }); return; }
    try {
      setIsSubmitting(true);
      await createRun(form);
      setForm({ nombre: '', descripcion: '', publico: '', mercado: 'argentina', categoria: 'utilidad-global' });
      setToast({ message: 'Pipeline iniciado', type: 'success' });
    } catch (err) { setToast({ message: err.message, type: 'error' }); }
    finally { setIsSubmitting(false); }
  };

  const handleCancel = async () => {
    if (!displayRun) return;
    try { await cancelRun(displayRun.id); setToast({ message: 'Pipeline cancelado', type: 'success' }); }
    catch (err) { setToast({ message: err.message, type: 'error' }); }
  };

  const handleChecklistUpdate = async (runId, key, value) => {
    try {
      const run = runs.find(r => r.id === runId);
      if (!run) return;
      const updated = { ...(run.checklist_firebase_admob || {}), [key]: value };
      await supabase.from('pipeline_runs').update({ checklist_firebase_admob: updated }).eq('id', runId);
    } catch (err) { setToast({ message: 'Error: ' + err.message, type: 'error' }); }
  };

  const labelS = { display: 'block', color: 'var(--text-muted)', fontSize: 11, marginBottom: 6, fontWeight: 500 };
  const disabled = isSubmitting || !!displayRun;

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100%', padding: 24 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* Form */}
        <div style={{ marginBottom: 32 }}>
          <h2 style={sectionTitle}>Nueva app</h2>
          <form onSubmit={handleSubmit} className="nz-card" style={{ padding: 20, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelS}>Nombre *</label>
              <input type="text" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})}
                placeholder="Nombre de la app" disabled={disabled} style={{ ...inputS, opacity: disabled ? 0.5 : 1 }} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelS}>Descripción</label>
              <textarea value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})}
                placeholder="Describe brevemente qué hace la app" disabled={disabled}
                style={{ ...inputS, minHeight: 80, fontFamily: 'var(--font-mono)', resize: 'vertical', opacity: disabled ? 0.5 : 1 }} />
            </div>
            <div>
              <label style={labelS}>Público</label>
              <input type="text" value={form.publico} onChange={e => setForm({...form, publico: e.target.value})}
                placeholder="Ej: diseñadores" disabled={disabled} style={{ ...inputS, opacity: disabled ? 0.5 : 1 }} />
            </div>
            <div>
              <label style={labelS}>Mercado</label>
              <select value={form.mercado} onChange={e => setForm({...form, mercado: e.target.value})}
                disabled={disabled} style={{ ...inputS, opacity: disabled ? 0.5 : 1 }}>
                {['argentina','mexico','chile','colombia','peru','global'].map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label style={labelS}>Categoría</label>
              <select value={form.categoria} onChange={e => setForm({...form, categoria: e.target.value})}
                disabled={disabled} style={{ ...inputS, opacity: disabled ? 0.5 : 1 }}>
                <option value="datos-gubernamentales-ar">Datos Gubernamentales AR</option>
                <option value="finanzas-ar">Finanzas AR</option>
                <option value="utilidad-global">Utilidad Global</option>
                <option value="salud">Salud</option>
                <option value="productividad">Productividad</option>
                <option value="info-ar">Info AR</option>
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" disabled={disabled} className="nz-btn nz-btn-primary"
                style={{ opacity: disabled ? 0.5 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}>
                <IconPlay /> {isSubmitting ? 'Iniciando...' : 'Generar app'}
              </button>
            </div>
          </form>
        </div>

        {/* Run activo */}
        {displayRun && (
          <div style={{ marginBottom: 32 }}>
            <h2 style={sectionTitle}>Pipeline activo</h2>
            <div className="nz-card" style={{ padding: 20, borderLeft: '3px solid var(--primary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <h3 style={{ color: 'var(--text)', margin: '0 0 6px', fontSize: 15, fontWeight: 600 }}>{displayRun.nombre}</h3>
                  <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: 12 }}>Paso: {displayRun.paso_actual || 'iniciando...'}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: 'var(--primary)', fontSize: 18, fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{fmtTime(timer)}</div>
                  <div style={{ color: 'var(--text-subtle)', fontSize: 11, marginTop: 4 }}>Tiempo transcurrido</div>
                </div>
              </div>
              <div style={{ marginBottom: 16, height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', background: 'var(--primary)', animation: 'pulse 1.5s infinite', width: '30%' }} />
              </div>
              <button onClick={handleCancel} style={{ padding: '6px 14px', background: 'oklch(0.97 0.05 27)', border: '1px solid oklch(0.80 0.10 27)', color: 'var(--nz-danger)', borderRadius: 'var(--radius)', cursor: 'pointer', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
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
            <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0' }}>Cargando...</div>
          ) : runs.length === 0 ? (
            <div style={{ color: 'var(--text-subtle)', textAlign: 'center', padding: '40px 0' }}>No hay runs aún</div>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              {runs.map(run => {
                const pkg = getPkg(run.nombre);
                const checklist = run.checklist_firebase_admob || {};
                const items = [
                  { key: 'firebase_proyecto', label: 'Crear proyecto en console.firebase.google.com', cat: 'Firebase' },
                  { key: 'firebase_registrar', label: `Registrar app con ${pkg}`, cat: 'Firebase' },
                  { key: 'firebase_descargar', label: 'Descargar google-services.json', cat: 'Firebase' },
                  { key: 'firebase_copiar', label: 'Copiar google-services.json a app/', cat: 'Firebase' },
                  { key: 'admob_app',    label: 'Crear app en admob.google.com', cat: 'AdMob' },
                  { key: 'admob_appid', label: 'Copiar App ID → AndroidManifest.xml', cat: 'AdMob' },
                  { key: 'admob_unit',  label: 'Crear unidad de banner', cat: 'AdMob' },
                  { key: 'admob_unitid',label: 'Copiar Unit ID → activity_main.xml', cat: 'AdMob' },
                ];
                const done = items.filter(i => checklist[i.key]).length;
                return (
                  <div key={run.id}>
                    <div className="nz-card" style={{ padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                          <h3 style={{ color: 'var(--text)', margin: 0, fontSize: 14, fontWeight: 600 }}>{run.nombre}</h3>
                          <Badge status={run.estado} />
                        </div>
                        {run.paso_actual && (
                          <div style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 8, padding: 8, background: 'var(--primary-soft)', borderRadius: 'var(--radius-sm)', borderLeft: '2px solid var(--primary)' }}>
                            <span style={{ color: 'var(--text-subtle)', fontSize: 10, textTransform: 'uppercase', fontWeight: 600 }}>Paso actual:</span>
                            <div style={{ color: 'var(--text)', marginTop: 4 }}>{run.paso_actual}</div>
                          </div>
                        )}
                        <div style={{ color: 'var(--text-subtle)', fontSize: 11, marginBottom: 6 }}>
                          {run.categoria} • {run.created_at && !isNaN(new Date(run.created_at)) ? new Date(run.created_at).toLocaleDateString('es-ES') : '—'}
                        </div>
                        {run.estado === 'completado' && (
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {run.repo_url && (
                              <a href={run.repo_url} target="_blank" rel="noopener noreferrer" className="nz-pill" style={{ textDecoration: 'none' }}>
                                📦 Abrir repo
                              </a>
                            )}
                            {run.github_url && (
                              <a href={run.github_url} target="_blank" rel="noopener noreferrer" className="nz-pill" style={{ textDecoration: 'none' }}>
                                📁 Ver output
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                      {run.pipeline_output_path && (
                        <button onClick={() => navigator.clipboard.writeText(run.pipeline_output_path)}
                          style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: 4, display: 'flex', marginLeft: 16 }}>
                          <IconCopy />
                        </button>
                      )}
                    </div>

                    {run.estado === 'completado' && (
                      <div className="nz-card" style={{ marginTop: 8, padding: 16 }}>
                        <div style={{ marginBottom: 12 }}>
                          <h4 style={{ color: 'var(--text)', margin: '0 0 8px', fontSize: 13, fontWeight: 600 }}>Package Name</h4>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <code style={{ background: 'var(--primary-soft)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '8px 12px', color: 'var(--primary)', fontSize: 12, fontFamily: 'var(--font-mono)', flex: 1 }}>
                              {pkg}
                            </code>
                            <button onClick={() => { navigator.clipboard.writeText(pkg); setToast({ message: 'Copiado', type: 'success' }); }}
                              style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: 4, display: 'flex' }}>
                              <IconCopy />
                            </button>
                          </div>
                        </div>
                        <div style={{ marginBottom: 12 }}>
                          <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h4 style={{ color: 'var(--text)', margin: 0, fontSize: 13, fontWeight: 600 }}>Setup Checklist</h4>
                            <span style={{ color: 'var(--text-subtle)', fontSize: 11 }}>{done}/{items.length}</span>
                          </div>
                          <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden', marginBottom: 12 }}>
                            <div style={{ height: '100%', background: 'var(--primary)', width: `${(done/items.length)*100}%`, transition: 'width 0.3s' }} />
                          </div>
                        </div>
                        {['Firebase','AdMob'].map(cat => (
                          <div key={cat} style={{ marginBottom: 12 }}>
                            <h5 style={{ color: 'var(--text-subtle)', margin: '0 0 8px', fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>{cat}</h5>
                            <div style={{ display: 'grid', gap: 4 }}>
                              {items.filter(i => i.cat === cat).map(item => (
                                <label key={item.key} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', padding: 6, borderRadius: 'var(--radius-sm)' }}
                                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-hover)'}
                                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                  <input type="checkbox" checked={checklist[item.key] || false}
                                    onChange={e => handleChecklistUpdate(run.id, item.key, e.target.checked)}
                                    style={{ width: 15, height: 15, margin: '2px 0 0', cursor: 'pointer', accentColor: 'var(--primary)', flexShrink: 0 }} />
                                  <span style={{ color: checklist[item.key] ? 'var(--text-subtle)' : 'var(--text)', fontSize: 12, textDecoration: checklist[item.key] ? 'line-through' : 'none' }}>
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
