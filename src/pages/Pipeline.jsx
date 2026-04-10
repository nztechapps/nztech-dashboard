import { useState, useEffect } from 'react';
import { usePipelineRuns, useRealtimeRun } from '../hooks/usePipelineRuns';
import { supabase } from '../lib/supabase';
import ToastNotification from '../components/ui/ToastNotification';

const IconRocket = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4.5 16.5c-1.5-1.5-2-3.5-2-5.5 0-4.5 3.5-8 8-8s8 3.5 8 8-3.5 8-8 8c-2 0-4-0.5-5.5-2"></path>
    <polyline points="12 4 12 12 9 12"></polyline>
  </svg>
);

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

const IconCheckCircle = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

const IconAlertCircle = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="8" x2="12" y2="12"></line>
    <line x1="12" y1="16" x2="12.01" y2="16"></line>
  </svg>
);

const IconCopy = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
  </svg>
);

const IconCheck = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const IconAssembly = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="1"></circle>
    <circle cx="19" cy="12" r="1"></circle>
    <circle cx="5" cy="12" r="1"></circle>
    <line x1="6" y1="12" x2="18" y2="12"></line>
  </svg>
);

export default function Pipeline() {
  const { runs, loading, createRun, cancelRun } = usePipelineRuns();
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    publico: '',
    mercado: 'argentina',
    categoria: 'utilidad-global',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [timer, setTimer] = useState(0);

  const activeRun = runs.find((r) => r.estado === 'running');
  const realtimeRun = useRealtimeRun(activeRun?.id || null);
  const displayRun = realtimeRun || activeRun;

  // Timer para run activo
  useEffect(() => {
    if (!displayRun) return;
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - new Date(displayRun.created_at).getTime()) / 1000);
      setTimer(elapsed);
    }, 1000);
    return () => clearInterval(interval);
  }, [displayRun]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre.trim()) {
      setToast({ message: 'El nombre es requerido', type: 'error' });
      return;
    }

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
    try {
      await cancelRun(displayRun.id);
      setToast({ message: 'Pipeline cancelado', type: 'success' });
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    }
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

      const currentChecklist = run.checklist_firebase_admob || {};
      const updatedChecklist = { ...currentChecklist, [key]: value };

      const { error } = await supabase
        .from('pipeline_runs')
        .update({ checklist_firebase_admob: updatedChecklist })
        .eq('id', runId);

      if (error) throw error;

      // Actualizar el run local
      const updatedRun = { ...run, checklist_firebase_admob: updatedChecklist };
      // Aquí React re-renderizará porque los runs cambian
    } catch (err) {
      setToast({ message: 'Error al actualizar checklist: ' + err.message, type: 'error' });
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setToast({ message: 'Copiado al portapapeles', type: 'success' });
  };

  const getStatusColor = (estado) => {
    switch (estado) {
      case 'running':
        return '#6496FF';
      case 'ensamblando':
        return '#FFB400';
      case 'completado':
        return '#00E5A0';
      case 'error':
        return '#FF4D4F';
      default:
        return '#999';
    }
  };

  const getStatusIcon = (estado) => {
    switch (estado) {
      case 'running':
        return <IconPlay />;
      case 'ensamblando':
        return <IconAssembly />;
      case 'completado':
        return <IconCheckCircle />;
      case 'error':
        return <IconAlertCircle />;
      default:
        return null;
    }
  };

  const getStatusDescription = (estado) => {
    switch (estado) {
      case 'running':
        return '🔵 Generando archivos...';
      case 'ensamblando':
        return '🟡 Ensamblando repo Android...';
      case 'completado':
        return '🟢 Completado';
      case 'error':
        return '🔴 Error';
      default:
        return estado;
    }
  };

  return (
    <div style={{ backgroundColor: '#0A0A0F', minHeight: '100vh', padding: '24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <IconRocket style={{ color: '#00E5A0' }} />
            <h1 style={{ color: 'white', fontSize: '28px', fontWeight: '600', margin: 0 }}>
              Pipeline
            </h1>
          </div>
          <p style={{ color: '#999', fontSize: '13px', margin: 0 }}>
            Ejecuta la generación automática de nuevas apps
          </p>
        </div>

        {/* Form Nueva App */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ color: 'white', fontSize: '16px', fontWeight: '600', marginBottom: '16px', marginTop: 0 }}>
            Nueva app
          </h2>
          <form
            onSubmit={handleSubmit}
            style={{
              backgroundColor: '#13131A',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '10px',
              padding: '20px',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
            }}
          >
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', color: '#999', fontSize: '11px', marginBottom: '6px', fontWeight: '500' }}>
                Nombre *
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Nombre de la app"
                disabled={isSubmitting || !!displayRun}
                style={{
                  width: '100%',
                  backgroundColor: '#0A0A0F',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '6px',
                  padding: '10px 12px',
                  color: 'white',
                  fontSize: '13px',
                  boxSizing: 'border-box',
                  opacity: isSubmitting || displayRun ? 0.5 : 1,
                }}
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', color: '#999', fontSize: '11px', marginBottom: '6px', fontWeight: '500' }}>
                Descripción
              </label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                placeholder="Describe brevemente qué hace la app"
                disabled={isSubmitting || !!displayRun}
                style={{
                  width: '100%',
                  backgroundColor: '#0A0A0F',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '6px',
                  padding: '10px 12px',
                  color: 'white',
                  fontSize: '13px',
                  boxSizing: 'border-box',
                  minHeight: '80px',
                  fontFamily: 'DM Mono, monospace',
                  opacity: isSubmitting || displayRun ? 0.5 : 1,
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', color: '#999', fontSize: '11px', marginBottom: '6px', fontWeight: '500' }}>
                Público
              </label>
              <input
                type="text"
                value={formData.publico}
                onChange={(e) => setFormData({ ...formData, publico: e.target.value })}
                placeholder="Ej: diseñadores"
                disabled={isSubmitting || !!displayRun}
                style={{
                  width: '100%',
                  backgroundColor: '#0A0A0F',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '6px',
                  padding: '10px 12px',
                  color: 'white',
                  fontSize: '13px',
                  boxSizing: 'border-box',
                  opacity: isSubmitting || displayRun ? 0.5 : 1,
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', color: '#999', fontSize: '11px', marginBottom: '6px', fontWeight: '500' }}>
                Mercado
              </label>
              <select
                value={formData.mercado}
                onChange={(e) => setFormData({ ...formData, mercado: e.target.value })}
                disabled={isSubmitting || !!displayRun}
                style={{
                  width: '100%',
                  backgroundColor: '#0A0A0F',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '6px',
                  padding: '10px 12px',
                  color: 'white',
                  fontSize: '13px',
                  boxSizing: 'border-box',
                  opacity: isSubmitting || displayRun ? 0.5 : 1,
                }}
              >
                <option value="argentina">Argentina</option>
                <option value="mexico">México</option>
                <option value="chile">Chile</option>
                <option value="colombia">Colombia</option>
                <option value="peru">Perú</option>
                <option value="global">Global</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', color: '#999', fontSize: '11px', marginBottom: '6px', fontWeight: '500' }}>
                Categoría
              </label>
              <select
                value={formData.categoria}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                disabled={isSubmitting || !!displayRun}
                style={{
                  width: '100%',
                  backgroundColor: '#0A0A0F',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '6px',
                  padding: '10px 12px',
                  color: 'white',
                  fontSize: '13px',
                  boxSizing: 'border-box',
                  opacity: isSubmitting || displayRun ? 0.5 : 1,
                }}
              >
                <option value="datos-gubernamentales-ar">Datos Gubernamentales AR</option>
                <option value="finanzas-ar">Finanzas AR</option>
                <option value="utilidad-global">Utilidad Global</option>
                <option value="salud">Salud</option>
                <option value="productividad">Productividad</option>
                <option value="info-ar">Info AR</option>
              </select>
            </div>

            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                disabled={isSubmitting || !!displayRun}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  backgroundColor: isSubmitting || displayRun ? '#999' : '#00E5A0',
                  border: 'none',
                  color: '#0A0A0F',
                  borderRadius: '6px',
                  cursor: isSubmitting || displayRun ? 'not-allowed' : 'pointer',
                  fontSize: '13px',
                  fontWeight: '600',
                }}
              >
                <IconPlay /> {isSubmitting ? 'Iniciando...' : 'Generar app'}
              </button>
            </div>
          </form>
        </div>

        {/* Run Activo */}
        {displayRun && (
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ color: 'white', fontSize: '16px', fontWeight: '600', marginBottom: '16px', marginTop: 0 }}>
              Pipeline activo
            </h2>
            <div style={{ backgroundColor: '#13131A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ color: 'white', margin: '0 0 6px 0', fontSize: '15px', fontWeight: '600' }}>
                    {displayRun.nombre}
                  </h3>
                  <p style={{ color: '#999', margin: 0, fontSize: '12px' }}>
                    Paso: {displayRun.paso_actual || 'iniciando...'}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#00E5A0', fontSize: '18px', fontWeight: '600', fontFamily: 'DM Mono, monospace' }}>
                    {formatTime(timer)}
                  </div>
                  <div style={{ color: '#999', fontSize: '11px', marginTop: '4px' }}>
                    Tiempo transcurrido
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div
                  style={{
                    height: '4px',
                    backgroundColor: '#1C1C26',
                    borderRadius: '2px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      backgroundColor: '#00E5A0',
                      animation: 'pulse 1.5s infinite',
                      width: '30%',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={handleCancel}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: 'transparent',
                    border: '1px solid #FF4D4F',
                    color: '#FF4D4F',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '600',
                  }}
                >
                  <IconSquare style={{ marginRight: '6px' }} /> Cancelar
                </button>
              </div>

              <style>{`
                @keyframes pulse {
                  0%, 100% { opacity: 1; }
                  50% { opacity: 0.6; }
                }
              `}</style>
            </div>
          </div>
        )}

        {/* Historial */}
        <div>
          <h2 style={{ color: 'white', fontSize: '16px', fontWeight: '600', marginBottom: '16px', marginTop: 0 }}>
            Historial
          </h2>
          {loading ? (
            <div style={{ color: '#999', textAlign: 'center', padding: '40px 0' }}>
              Cargando...
            </div>
          ) : runs.length === 0 ? (
            <div style={{ color: '#666', textAlign: 'center', padding: '40px 0' }}>
              No hay runs aún
            </div>
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
                    <div
                      style={{
                        backgroundColor: '#13131A',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '8px',
                        padding: '16px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                          <h3 style={{ color: 'white', margin: 0, fontSize: '14px', fontWeight: '600' }}>
                            {run.nombre}
                          </h3>
                          <span
                            style={{
                              backgroundColor: getStatusColor(run.estado),
                              color: run.estado === 'completado' ? '#0A0A0F' : 'white',
                              fontSize: '10px',
                              fontWeight: '600',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            {getStatusIcon(run.estado)}
                            {run.estado === 'ensamblando' ? 'ensamblando' : run.estado}
                          </span>
                        </div>

                        <div style={{ color: '#00E5A0', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>
                          {getStatusDescription(run.estado)}
                        </div>

                        {run.paso_actual && (
                          <div style={{ color: '#999', fontSize: '12px', marginBottom: '8px', padding: '8px', backgroundColor: 'rgba(0, 229, 160, 0.05)', borderRadius: '4px', borderLeft: '2px solid #00E5A0' }}>
                            <span style={{ color: '#666', fontSize: '10px', textTransform: 'uppercase', fontWeight: '600' }}>Paso actual:</span>
                            <div style={{ color: '#DDD', marginTop: '4px' }}>
                              {run.paso_actual}
                            </div>
                          </div>
                        )}

                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '6px' }}>
                          <span style={{ color: '#999', fontSize: '11px' }}>
                            {run.categoria} • {run.created_at && !isNaN(new Date(run.created_at)) ? new Date(run.created_at).toLocaleDateString('es-ES') : '—'}
                          </span>
                        </div>

                        {run.estado === 'completado' && (
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {run.repo_url && (
                              <a
                                href={run.repo_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  padding: '6px 12px',
                                  backgroundColor: 'rgba(0, 229, 160, 0.1)',
                                  border: '1px solid rgba(0, 229, 160, 0.3)',
                                  color: '#00E5A0',
                                  fontSize: '11px',
                                  fontWeight: '600',
                                  borderRadius: '4px',
                                  textDecoration: 'none',
                                  transition: 'all 200ms ease',
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = 'rgba(0, 229, 160, 0.2)';
                                  e.currentTarget.style.borderColor = 'rgba(0, 229, 160, 0.6)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = 'rgba(0, 229, 160, 0.1)';
                                  e.currentTarget.style.borderColor = 'rgba(0, 229, 160, 0.3)';
                                }}
                              >
                                📦 Abrir repo
                              </a>
                            )}
                            {run.github_url && (
                              <a
                                href={run.github_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  padding: '6px 12px',
                                  backgroundColor: 'rgba(100, 150, 255, 0.1)',
                                  border: '1px solid rgba(100, 150, 255, 0.3)',
                                  color: '#6496FF',
                                  fontSize: '11px',
                                  fontWeight: '600',
                                  borderRadius: '4px',
                                  textDecoration: 'none',
                                  transition: 'all 200ms ease',
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = 'rgba(100, 150, 255, 0.2)';
                                  e.currentTarget.style.borderColor = 'rgba(100, 150, 255, 0.6)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = 'rgba(100, 150, 255, 0.1)';
                                  e.currentTarget.style.borderColor = 'rgba(100, 150, 255, 0.3)';
                                }}
                              >
                                📁 Ver output
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                      {run.pipeline_output_path && (
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(run.pipeline_output_path);
                          }}
                          title="Copiar prompt"
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#00E5A0',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            marginLeft: '16px',
                          }}
                        >
                          <IconCopy />
                        </button>
                      )}
                    </div>

                    {run.estado === 'completado' && (
                      <div style={{ marginTop: '12px', backgroundColor: 'rgba(0, 229, 160, 0.05)', border: '1px solid rgba(0, 229, 160, 0.1)', borderRadius: '8px', padding: '16px' }}>
                        <div style={{ marginBottom: '12px' }}>
                          <h4 style={{ color: 'white', margin: '0 0 8px 0', fontSize: '13px', fontWeight: '600' }}>
                            Package Name
                          </h4>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <code
                              style={{
                                backgroundColor: '#0A0A0F',
                                border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: '4px',
                                padding: '8px 12px',
                                color: '#00E5A0',
                                fontSize: '12px',
                                fontFamily: 'DM Mono, monospace',
                                flex: 1,
                                minWidth: 0,
                              }}
                            >
                              {packageName}
                            </code>
                            <button
                              onClick={() => copyToClipboard(packageName)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#00E5A0',
                                cursor: 'pointer',
                                padding: '4px',
                                display: 'flex',
                                alignItems: 'center',
                              }}
                            >
                              <IconCopy />
                            </button>
                          </div>
                        </div>

                        <div style={{ marginBottom: '12px' }}>
                          <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h4 style={{ color: 'white', margin: 0, fontSize: '13px', fontWeight: '600' }}>
                              Setup Checklist
                            </h4>
                            <span style={{ color: '#999', fontSize: '11px' }}>
                              {completedCount}/{checklistItems.length}
                            </span>
                          </div>
                          <div
                            style={{
                              height: '4px',
                              backgroundColor: '#1C1C26',
                              borderRadius: '2px',
                              overflow: 'hidden',
                              marginBottom: '12px',
                            }}
                          >
                            <div
                              style={{
                                height: '100%',
                                backgroundColor: '#00E5A0',
                                width: `${(completedCount / checklistItems.length) * 100}%`,
                                transition: 'width 0.3s ease',
                              }}
                            />
                          </div>
                        </div>

                        {['Firebase', 'AdMob'].map((category) => (
                          <div key={category} style={{ marginBottom: '12px' }}>
                            <h5 style={{ color: '#999', margin: '0 0 8px 0', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                              {category}
                            </h5>
                            <div style={{ display: 'grid', gap: '6px' }}>
                              {checklistItems.filter(item => item.category === category).map((item) => (
                                <label
                                  key={item.key}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '10px',
                                    cursor: 'pointer',
                                    padding: '8px',
                                    borderRadius: '4px',
                                    transition: 'background-color 0.2s',
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 229, 160, 0.1)'}
                                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                  <input
                                    type="checkbox"
                                    checked={checklist[item.key] || false}
                                    onChange={(e) => handleChecklistUpdate(run.id, item.key, e.target.checked)}
                                    style={{
                                      width: '16px',
                                      height: '16px',
                                      margin: '2px 0 0 0',
                                      cursor: 'pointer',
                                      accentColor: '#00E5A0',
                                      flexShrink: 0,
                                    }}
                                  />
                                  <span style={{ color: checklist[item.key] ? '#999' : '#DDD', fontSize: '12px', textDecoration: checklist[item.key] ? 'line-through' : 'none' }}>
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

      {toast && (
        <ToastNotification message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
