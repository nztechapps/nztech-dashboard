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
              <strong style={{ color: 'var(--primary)' }}>{item.nombre}</strong>
              <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '4px' }}>
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
              <strong style={{ color: 'var(--primary)' }}>{item.nombre}</strong>
              {item.url && (
                <div style={{ color: '#6496FF', fontSize: '11px', marginTop: '2px' }}>
                  {item.url}
                </div>
              )}
              {item.gratuita !== undefined && (
                <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '2px' }}>
                  {item.gratuita ? '✓ Gratuita' : '💰 De pago'}
                </div>
              )}
              {item.uso && (
                <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '4px' }}>
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
              <strong style={{ color: 'var(--primary)' }}>{item.nombre}</strong>
              {item.tab && (
                <div style={{ color: 'var(--primary)', fontSize: '10px', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                  [{item.tab}]
                </div>
              )}
              {item.descripcion && (
                <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '4px' }}>
                  {item.descripcion}
                </div>
              )}
              {item.elementos && (
                <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '4px' }}>
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
          <div key={i} style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
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
      return <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Error al parsear datos: {data}</div>;
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
            <div key={key} style={{ background: 'var(--surface)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <h3 style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: '600', margin: '0 0 8px 0', textTransform: 'uppercase' }}>
                {label}
              </h3>
              <div style={{ color: 'var(--text-muted)', fontSize: '12px', lineHeight: '1.5' }}>
                {aso.titulo && <p style={{ margin: '0 0 8px 0', fontWeight: '600', color: 'var(--primary)' }}>{aso.titulo}</p>}
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
            <div key={key} style={{ background: 'var(--surface)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <h3 style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: '600', margin: '0 0 8px 0', textTransform: 'uppercase' }}>
                {label}
              </h3>
              <div style={{ color: 'var(--text-muted)', fontSize: '12px', lineHeight: '1.5' }}>
                {diseno.paleta && Array.isArray(diseno.paleta) && (
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '11px', fontWeight: '500', marginBottom: '6px', color: 'var(--text-muted)' }}>Paleta de Colores</div>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      {diseno.paleta.map((color, i) => (
                        <div key={i} style={{ textAlign: 'center' }}>
                          <div style={{ width: '40px', height: '40px', backgroundColor: color, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '4px' }}></div>
                          <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{color}</div>
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
            <div key={key} style={{ background: 'var(--surface)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <h3 style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: '600', margin: '0 0 8px 0', textTransform: 'uppercase' }}>
                {label}
              </h3>
              <div style={{ color: 'var(--text-muted)', fontSize: '12px', lineHeight: '1.5' }}>
                {monetizacion.modelo && <p style={{ margin: '0 0 8px 0' }}><strong>{monetizacion.modelo}</strong></p>}
                {monetizacion.revenue_estimado_mensual_usd && (
                  <p style={{ margin: 0, fontSize: '14px', color: 'var(--primary)', fontWeight: '600' }}>
                    ${monetizacion.revenue_estimado_mensual_usd}/mes
                  </p>
                )}
              </div>
            </div>
          );
        }

        // Renderizado por defecto con renderField
        return (
          <div key={key} style={{ background: 'var(--surface)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <h3 style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: '600', margin: '0 0 8px 0', textTransform: 'uppercase' }}>
              {label}
            </h3>
            <div style={{ color: 'var(--text-muted)', fontSize: '12px', lineHeight: '1.5' }}>
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
  const [helpModal, setHelpModal] = useState(null);
  const [helpModalFirebaseAdMob, setHelpModalFirebaseAdMob] = useState(null);
  const [allRuns, setAllRuns] = useState([]);
  const [loadingAllRuns, setLoadingAllRuns] = useState(false);

  const tabs = ['info', 'research', 'specs', 'pipeline', 'calidad', 'publicacion', 'screenshots'];

  const hasCompletedRun = lastRun?.estado === 'completado';
  const calidadAprobada = idea?.checklist_calidad && Object.values(idea.checklist_calidad).filter(item => {
    // Handle both old boolean format and new { ok, nota } format
    return typeof item === 'boolean' ? item : item?.ok === true;
  }).length === 6;

  const hasContent = {
    info: true,
    research: !!idea?.research_mercado || !!idea?.research,
    specs: !!(idea?.specs_pantallas || idea?.specs_flujos || idea?.specs_apis || idea?.complejidad),
    pipeline: true,
    calidad: hasCompletedRun,
    publicacion: calidadAprobada,
    screenshots: hasCompletedRun,
  };

  const publicacionHelp = {
    google_services: {
      title: 'google-services.json',
      description: 'Ir a console.firebase.google.com → Crear proyecto → Agregar app Android con package name com.nztech.{slug} → Descargar google-services.json → Copiar el archivo a la carpeta app/ del proyecto clonado en Android Studio'
    },
    admob_app_id: {
      title: 'App ID de AdMob',
      description: 'Ir a admob.google.com → Crear app → Copiar el App ID (formato ca-app-pub-XXXXXXXX~XXXXXXXXXX) → Pegarlo en AndroidManifest.xml reemplazando REEMPLAZAR_CON_APP_ID_ADMOB'
    },
    admob_unit_id: {
      title: 'Unit ID de banner',
      description: 'En AdMob → tu app → Unidades de anuncios → Crear unidad Banner → Copiar el Unit ID (formato ca-app-pub-XXXXXXXX/XXXXXXXXXX) → Pegarlo en activity_main.xml reemplazando REEMPLAZAR_CON_AD_UNIT_ID_REAL'
    },
    release_build: {
      title: 'Build release',
      description: 'En Android Studio → Build → Generate Signed Bundle/APK → APK → Crear o seleccionar keystore → Build release → El APK queda en app/release/'
    },
    firma_apk: {
      title: 'Firma del APK',
      description: 'El APK firmado se genera automáticamente al hacer release build con un keystore. Guardar el keystore en lugar seguro — sin él no podés actualizar la app'
    },
    screenshots: {
      title: 'Screenshots',
      description: 'Tomar al menos 2 screenshots del emulador o dispositivo con las funciones principales de la app. Formato: PNG, mínimo 320px, máximo 3840px. Subir en Play Console → Presencia en la tienda → Screenshots de teléfono'
    },
    descripcion_aso: {
      title: 'Descripción ASO',
      description: 'En Play Console → Presencia en la tienda → Descripción principal (4000 chars). Incluir keyword principal en las primeras líneas. Terminar con "NZTech — Apps simples para Argentina"'
    },
    politica_privacidad: {
      title: 'Política de privacidad',
      description: 'Publicar en GitHub Pages: crear repo nztechapps.github.io/privacy/{slug}/index.html con la política generada. Luego en Play Console → Política de privacidad → pegar la URL'
    },
    clasificacion: {
      title: 'Clasificación de contenido',
      description: 'Play Console → Clasificación de contenido → Completar cuestionario → La mayoría de apps NZTech califican como "Para todos"'
    },
    datos_seguridad: {
      title: 'Seguridad de datos',
      description: 'Play Console → Seguridad de los datos → Declarar: recopila Identificadores de dispositivo (AdMob), Datos de uso y diagnóstico (Firebase). No recopila datos personales del usuario'
    },
  };

  const firebaseAdMobHelp = {
    firebase_proyecto: {
      title: 'Crear proyecto en Firebase',
      description: 'Ir a console.firebase.google.com → Click en "Agregar proyecto" → Elegir nombre → Desactivar Google Analytics si no lo necesitás → Crear proyecto'
    },
    firebase_registrar: {
      title: 'Registrar app Android',
      description: 'En tu proyecto Firebase → Agregar app → Ícono Android → Ingresar el package name exacto → Apodo opcional → Registrar app'
    },
    firebase_descargar: {
      title: 'Descargar google-services.json',
      description: 'Después de registrar la app → Descargar el archivo google-services.json → NO compartir este archivo públicamente'
    },
    firebase_copiar: {
      title: 'Copiar google-services.json',
      description: 'Copiar google-services.json a la carpeta app/ del proyecto Android en Android Studio. Debe quedar en la misma carpeta que build.gradle.kts'
    },
    admob_app: {
      title: 'Crear app en AdMob',
      description: 'Ir a admob.google.com → Apps → Agregar app → Seleccionar Android → Buscar en Play Store (si ya está publicada) o ingresar manualmente → Agregar'
    },
    admob_appid: {
      title: 'Configurar App ID de AdMob',
      description: 'En AdMob → tu app → Información de la app → Copiar el App ID (formato ca-app-pub-XXXXXXXX~XXXXXXXXXX) → En Android Studio abrir AndroidManifest.xml → Reemplazar REEMPLAZAR_CON_APP_ID_ADMOB por el ID copiado'
    },
    admob_unit: {
      title: 'Crear unidad de banner',
      description: 'En AdMob → tu app → Unidades de anuncios → Crear unidad de anuncio → Seleccionar Banner → Ponerle nombre → Crear unidad de anuncio'
    },
    admob_unitid: {
      title: 'Configurar Unit ID de AdMob',
      description: 'Copiar el Unit ID generado (formato ca-app-pub-XXXXXXXX/XXXXXXXXXX) → En Android Studio abrir app/src/main/res/layout/activity_main.xml → Reemplazar REEMPLAZAR_CON_AD_UNIT_ID_REAL por el ID copiado'
    },
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
      setLoadingAllRuns(true);

      // Fetch all runs
      const { data: allRunsData, error: allRunsError } = await supabase
        .from('pipeline_runs')
        .select('*')
        .eq('idea_id', idea.id)
        .order('created_at', { ascending: false });

      if (allRunsError) throw allRunsError;

      if (allRunsData && allRunsData.length > 0) {
        setAllRuns(allRunsData);
        setLastRun(allRunsData[0]);
      }
    } catch (err) {
      console.error('Error fetching runs:', err);
    } finally {
      setLoadingRun(false);
      setLoadingAllRuns(false);
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

  const getPackageName = () => {
    if (!idea?.titulo) return '';
    const slug = idea.titulo.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    return 'com.nztech.' + slug.replace(/-/g, '');
  };

  const getLastCompletedRun = () => {
    return allRuns.find(run => run.estado === 'completado');
  };

  const handleChecklistFirebaseAdMob = async (key) => {
    const lastCompletedRun = getLastCompletedRun();
    if (!lastCompletedRun) return;

    const currentChecklist = lastCompletedRun.checklist_firebase_admob || {};
    const currentValue = currentChecklist[key] || false;

    // Toggle normal
    const updated = { ...currentChecklist, [key]: !currentValue };

    try {
      const { error } = await supabase
        .from('pipeline_runs')
        .update({ checklist_firebase_admob: updated })
        .eq('id', lastCompletedRun.id);

      if (error) throw error;

      // Update local state
      const updatedAllRuns = allRuns.map(run =>
        run.id === lastCompletedRun.id ? { ...run, checklist_firebase_admob: updated } : run
      );
      setAllRuns(updatedAllRuns);
      setToast({ message: '✓ Guardado', type: 'success' });
    } catch (err) {
      setToast({ message: 'Error al guardar: ' + err.message, type: 'error' });
    }
  };

  const handleChecklistPublicacion = async (key) => {
    const currentChecklist = idea.checklist_publicacion || {};
    const currentValue = currentChecklist[key] || false;

    // Toggle normal
    const updated = { ...currentChecklist, [key]: !currentValue };

    try {
      const { error } = await supabase
        .from('ideas')
        .update({ checklist_publicacion: updated })
        .eq('id', idea.id);

      if (error) throw error;

      setIdea(prev => ({ ...prev, checklist_publicacion: updated }));
      setToast({ message: '✓ Guardado', type: 'success' });
    } catch (err) {
      setToast({ message: 'Error al guardar: ' + err.message, type: 'error' });
    }
  };

  const handleChecklistUpdate = async (field, key, value) => {
    try {
      const currentChecklist = idea[field] || {};
      let updatedValue = value;

      // Convert old boolean structure to new { ok, nota } structure
      if (typeof value === 'boolean' || typeof currentChecklist[key] === 'boolean') {
        updatedValue = {
          ok: typeof value === 'boolean' ? value : value.ok || false,
          nota: typeof currentChecklist[key] === 'object' ? currentChecklist[key].nota || '' : '',
        };
      } else if (typeof value === 'object' && value !== null) {
        updatedValue = value;
      }

      const updatedChecklist = { ...currentChecklist, [key]: updatedValue };

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
      <div style={{ background: 'var(--bg)', minHeight: '100%', padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '16px' }}>Cargando...</div>
      </div>
    );
  }

  if (!idea) {
    return (
      <div style={{ background: 'var(--bg)', minHeight: '100%', padding: '24px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', color: 'var(--text-muted)', textAlign: 'center' }}>
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
      background: 'var(--bg)',
      minHeight: '100%',
      display: 'flex',
      flexDirection: 'column',
      padding: 0
    }}>
      {/* Sticky Header */}
      <div style={{
        background: 'var(--bg)',
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
            color: 'var(--primary)',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            padding: '0',
            marginBottom: '12px',
          }}
        >
          <IconArrowLeft /> Volver a Ideas
        </button>

        <h1 style={{ color: 'var(--text)', fontSize: '28px', fontWeight: '700', margin: 0 }}>
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
                    color: 'var(--primary)',
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
                <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '8px', fontWeight: '500' }}>Prioridad</div>
                <StarRating value={idea.prioridad} />
              </div>
            )}

            {/* Editable Descripción */}
            {idea.descripcion && (
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ color: 'var(--primary)', fontSize: '14px', fontWeight: '600', marginBottom: '12px', textTransform: 'uppercase' }}>
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
                      background: 'var(--surface)',
                      border: '1px solid #00E5A0',
                      borderRadius: '6px',
                      color: 'var(--text)',
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
                      color: 'var(--text-muted)',
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
                <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '8px', fontWeight: '500', textTransform: 'uppercase' }}>
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
                      background: 'var(--surface)',
                      border: '1px solid #00E5A0',
                      borderRadius: '6px',
                      color: 'var(--text)',
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
                      background: 'var(--surface)',
                      borderRadius: '6px',
                      color: 'var(--text-muted)',
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
                <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '8px', fontWeight: '500', textTransform: 'uppercase' }}>
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
                      background: 'var(--surface)',
                      border: '1px solid #00E5A0',
                      borderRadius: '6px',
                      color: 'var(--text)',
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
                      background: 'var(--surface)',
                      borderRadius: '6px',
                      color: 'var(--text-muted)',
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
              <div style={{ background: 'var(--surface)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border)', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-muted)', margin: 0 }}>No hay research aún. Genera uno con el botón en Info.</p>
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
                  <div style={{ background: 'var(--surface)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <h3 style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: '600', margin: '0 0 8px 0', textTransform: 'uppercase' }}>
                      Pantallas
                    </h3>
                    <div style={{ color: 'var(--text-muted)', fontSize: '12px', lineHeight: '1.5' }}>
                      {renderField(parseField(idea.specs_pantallas))}
                    </div>
                  </div>
                )}

                {/* Flujos */}
                {idea.specs_flujos && (
                  <div style={{ background: 'var(--surface)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <h3 style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: '600', margin: '0 0 8px 0', textTransform: 'uppercase' }}>
                      Flujos
                    </h3>
                    <div style={{ color: 'var(--text-muted)', fontSize: '12px', lineHeight: '1.5' }}>
                      {Array.isArray(specsData.flujos) ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {specsData.flujos.map((flujo, i) => (
                            <div key={i} style={{ paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                              <strong style={{ color: 'var(--primary)' }}>{flujo.nombre}</strong>
                              {Array.isArray(flujo.pasos) && (
                                <ol style={{ margin: '8px 0 0 0', paddingLeft: '20px', color: 'var(--text-muted)' }}>
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
                  <div style={{ background: 'var(--surface)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <h3 style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: '600', margin: '0 0 8px 0', textTransform: 'uppercase' }}>
                      APIs / Integraciones
                    </h3>
                    <div style={{ color: 'var(--text-muted)', fontSize: '12px', lineHeight: '1.5' }}>
                      {Array.isArray(specsData.apis) ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {specsData.apis.map((api, i) => (
                            <div key={i} style={{ paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                              <strong style={{ color: 'var(--primary)' }}>{api.nombre}</strong>
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
                                <div style={{ marginTop: '4px', fontSize: '10px', color: 'var(--primary)' }}>
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
                  <div style={{ background: 'var(--surface)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <h3 style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: '600', margin: '0 0 8px 0', textTransform: 'uppercase' }}>
                      Complejidad
                    </h3>
                    <div style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: '600', textTransform: 'capitalize' }}>
                      {idea.complejidad}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ background: 'var(--surface)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border)', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-muted)', margin: 0 }}>No hay specs aún. Primero genera el Research, luego los Specs.</p>
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
              <h3 style={{ color: 'var(--text)', fontSize: '20px', fontWeight: '600', marginBottom: '24px' }}>Pipeline</h3>

              {/* 1. BOTÓN LANZAR PIPELINE */}
              <button
                onClick={handleLanzarPipeline}
                disabled={sendingPipeline}
                style={{
                  width: '100%',
                  padding: '16px 32px',
                  background: 'var(--primary)',
                  border: 'none',
                  color: '#0A0A0F',
                  borderRadius: '8px',
                  cursor: sendingPipeline ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: '600',
                  opacity: sendingPipeline ? 0.6 : 1,
                  transition: 'all 200ms ease',
                  marginBottom: '32px',
                }}
              >
                {sendingPipeline ? 'Lanzando...' : '🚀 Lanzar Pipeline'}
              </button>

              {/* 2. HISTORIAL DE RUNS */}
              <div style={{ marginBottom: '32px' }}>
                <h4 style={{ color: 'var(--text)', fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Historial de Runs</h4>

                {loadingAllRuns ? (
                  <div style={{ color: 'var(--text-muted)', padding: '20px', textAlign: 'center' }}>Cargando runs...</div>
                ) : allRuns.length > 0 ? (
                  <div style={{ display: 'grid', gap: '12px' }}>
                    {allRuns.map((run, index) => (
                      <div
                        key={run.id}
                        style={{
                          background: 'var(--surface)',
                          border: '1px solid var(--border)',
                          borderRadius: '8px',
                          padding: '16px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)' }}>
                            #{allRuns.length - index}
                          </div>
                          <span
                            style={{
                              backgroundColor: run.estado === 'completado' ? 'rgba(0, 229, 160, 0.2)' : run.estado === 'running' ? 'rgba(100, 150, 255, 0.2)' : 'rgba(255, 77, 79, 0.2)',
                              color: run.estado === 'completado' ? '#00E5A0' : run.estado === 'running' ? '#6496FF' : '#FF4D4F',
                              fontSize: '11px',
                              fontWeight: '600',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              display: 'inline-block',
                              textTransform: 'capitalize',
                            }}
                          >
                            {run.estado}
                          </span>
                        </div>

                        <div style={{ display: 'grid', gap: '8px', fontSize: '13px', color: '#DDD' }}>
                          {run.created_at && (
                            <div>
                              <span style={{ color: 'var(--text-muted)' }}>Fecha:</span> {new Date(run.created_at).toLocaleDateString('es-ES')} a las {new Date(run.created_at).toLocaleTimeString('es-ES')}
                            </div>
                          )}

                          {run.paso_actual && (
                            <div>
                              <span style={{ color: 'var(--text-muted)' }}>Paso actual:</span> {run.paso_actual}
                            </div>
                          )}

                          {run.duracion_segundos && (
                            <div>
                              <span style={{ color: 'var(--text-muted)' }}>Duración:</span> {run.duracion_segundos}s
                            </div>
                          )}

                          {run.estado === 'error' && run.error && (
                            <div style={{ color: 'var(--nz-danger)' }}>
                              <span style={{ color: 'var(--text-muted)' }}>Error:</span> {run.error}
                            </div>
                          )}
                        </div>

                        {run.repo_url && (
                          <div style={{ marginTop: '12px' }}>
                            <a
                              href={run.repo_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '8px 12px',
                                backgroundColor: 'transparent',
                                border: '1px solid #00E5A0',
                                color: 'var(--primary)',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: '600',
                                textDecoration: 'none',
                                transition: 'all 200ms ease',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(0, 229, 160, 0.1)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }}
                            >
                              📦 Ver repo
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No hay runs aún para esta idea
                  </div>
                )}
              </div>

              {/* 3. SETUP CHECKLIST */}
              {getLastCompletedRun() ? (
                <div>
                  <h4 style={{ color: 'var(--text)', fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Setup: Firebase + AdMob</h4>

                  <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '8px' }}>Package Name (copiable):</div>
                    <div
                      onClick={() => {
                        navigator.clipboard.writeText(getPackageName());
                        setToast({ message: '✓ Copiado al portapapeles', type: 'success' });
                      }}
                      style={{
                        padding: '12px',
                        background: 'var(--bg)',
                        border: '1px solid rgba(0, 229, 160, 0.3)',
                        borderRadius: '6px',
                        fontFamily: 'monospace',
                        fontSize: '13px',
                        color: 'var(--primary)',
                        cursor: 'pointer',
                        transition: 'all 200ms ease',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(0, 229, 160, 0.6)'}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(0, 229, 160, 0.3)'}
                    >
                      {getPackageName()}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gap: '12px' }}>
                    <div>
                      <h5 style={{ color: 'var(--primary)', fontSize: '13px', fontWeight: '600', marginBottom: '8px', margin: '0 0 8px 0' }}>Firebase</h5>
                      <div style={{ display: 'grid', gap: '8px' }}>
                        {[
                          { key: 'firebase_proyecto', label: 'Crear proyecto en console.firebase.google.com' },
                          { key: 'firebase_registrar', label: 'Registrar app con ' + getPackageName() },
                          { key: 'firebase_descargar', label: 'Descargar google-services.json' },
                          { key: 'firebase_copiar', label: 'Copiar google-services.json a app/' },
                        ].map(item => {
                          const lastCompletedRun = getLastCompletedRun();
                          const isChecked = lastCompletedRun?.checklist_firebase_admob?.[item.key] || false;
                          return (
                            <label
                              key={item.key}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '12px',
                                background: 'var(--bg)',
                                border: '1px solid var(--border)',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                transition: 'all 200ms ease',
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 229, 160, 0.08)'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0A0A0F'}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleChecklistFirebaseAdMob(item.key)}
                                style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#00E5A0', flexShrink: 0 }}
                              />
                              <span style={{ color: isChecked ? '#999' : '#DDD', fontSize: '13px', textDecoration: isChecked ? 'line-through' : 'none', flex: 1 }}>
                                {item.label}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setHelpModalFirebaseAdMob({ key: item.key, ...firebaseAdMobHelp[item.key] });
                                }}
                                style={{ padding: '4px 8px', backgroundColor: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', borderRadius: '50%', transition: 'all 200ms ease', flexShrink: 0 }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 229, 160, 0.15)'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                title="Ayuda"
                              >
                                ⓘ
                              </button>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <h5 style={{ color: 'var(--primary)', fontSize: '13px', fontWeight: '600', marginBottom: '8px', margin: '0 0 8px 0' }}>AdMob</h5>
                      <div style={{ display: 'grid', gap: '8px' }}>
                        {[
                          { key: 'admob_app', label: 'Crear app en admob.google.com' },
                          { key: 'admob_appid', label: 'Copiar App ID → AndroidManifest.xml' },
                          { key: 'admob_unit', label: 'Crear unidad de banner' },
                          { key: 'admob_unitid', label: 'Copiar Unit ID → activity_main.xml' },
                        ].map(item => {
                          const lastCompletedRun = getLastCompletedRun();
                          const isChecked = lastCompletedRun?.checklist_firebase_admob?.[item.key] || false;
                          return (
                            <label
                              key={item.key}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '12px',
                                background: 'var(--bg)',
                                border: '1px solid var(--border)',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                transition: 'all 200ms ease',
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 229, 160, 0.08)'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0A0A0F'}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleChecklistFirebaseAdMob(item.key)}
                                style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#00E5A0', flexShrink: 0 }}
                              />
                              <span style={{ color: isChecked ? '#999' : '#DDD', fontSize: '13px', textDecoration: isChecked ? 'line-through' : 'none', flex: 1 }}>
                                {item.label}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setHelpModalFirebaseAdMob({ key: item.key, ...firebaseAdMobHelp[item.key] });
                                }}
                                style={{ padding: '4px 8px', backgroundColor: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', borderRadius: '50%', transition: 'all 200ms ease', flexShrink: 0 }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 229, 160, 0.15)'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                title="Ayuda"
                              >
                                ⓘ
                              </button>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Completa un pipeline exitosamente para desbloquear el Setup Checklist
                </div>
              )}
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
              <h3 style={{ color: 'var(--text)', fontSize: '20px', fontWeight: '600', marginBottom: '24px' }}>Control de Calidad</h3>

              {!hasCompletedRun ? (
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
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
                  ].map(item => {
                    const itemData = idea.checklist_calidad?.[item.key];
                    const isChecked = typeof itemData === 'boolean' ? itemData : itemData?.ok === true;
                    const nota = typeof itemData === 'object' ? itemData?.nota || '' : '';
                    const hasNota = nota.trim().length > 0;
                    const shouldShowNota = isChecked || hasNota;

                    return (
                      <div key={item.key} style={{ display: 'grid', gap: '8px' }}>
                        <label
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            background: 'var(--surface)',
                            border: '1px solid var(--border)',
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
                            checked={isChecked}
                            onChange={(e) => handleChecklistUpdate('checklist_calidad', item.key, { ok: e.target.checked, nota })}
                            style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#00E5A0', flexShrink: 0 }}
                          />
                          <span style={{ color: isChecked ? '#999' : '#DDD', fontSize: '14px', textDecoration: isChecked ? 'line-through' : 'none' }}>
                            {item.label}
                          </span>
                        </label>
                        {shouldShowNota && (
                          <textarea
                            value={nota}
                            onChange={(e) => {
                              // Update state locally without saving yet
                              const tempChecklist = { ...idea.checklist_calidad };
                              tempChecklist[item.key] = { ok: isChecked, nota: e.target.value };
                              setIdea(prev => ({ ...prev, checklist_calidad: { ...prev.checklist_calidad, ...tempChecklist } }));
                            }}
                            onBlur={(e) => {
                              e.currentTarget.style.borderColor = 'rgba(0, 229, 160, 0.3)';
                              // Save on blur
                              if (e.target.value.trim() !== nota.trim()) {
                                handleChecklistUpdate('checklist_calidad', item.key, { ok: isChecked, nota: e.target.value });
                              }
                            }}
                            onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(0, 229, 160, 0.6)'}
                            placeholder="Observaciones..."
                            style={{
                              width: '100%',
                              minHeight: '80px',
                              padding: '12px',
                              background: 'var(--surface)',
                              border: '1px solid rgba(0, 229, 160, 0.3)',
                              borderRadius: '6px',
                              color: '#DDD',
                              fontFamily: 'inherit',
                              fontSize: '13px',
                              lineHeight: '1.5',
                              resize: 'vertical',
                              boxSizing: 'border-box',
                              transition: 'all 200ms ease',
                            }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {calidadAprobada && (
                <button
                  onClick={() => setActiveTab('publicacion')}
                  style={{
                    width: '100%',
                    padding: '16px 32px',
                    background: 'var(--primary)',
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
              <h3 style={{ color: 'var(--text)', fontSize: '20px', fontWeight: '600', marginBottom: '24px' }}>Publicación</h3>

              {!calidadAprobada ? (
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Completa el control de calidad primero
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: '24px' }}>
                    <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                      <h4 style={{ color: 'var(--text)', margin: 0, fontSize: '14px', fontWeight: '600' }}>Setup Técnico</h4>
                      <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
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
                        <label key={item.key} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px', cursor: 'pointer' }}>
                          <input type="checkbox" checked={idea.checklist_publicacion?.[item.key] || false} onChange={() => handleChecklistPublicacion(item.key)} style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#00E5A0' }} />
                          <span style={{ color: idea.checklist_publicacion?.[item.key] ? '#999' : '#DDD', fontSize: '12px', textDecoration: idea.checklist_publicacion?.[item.key] ? 'line-through' : 'none', flex: 1 }}>{item.label}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              setHelpModal({ key: item.key, ...publicacionHelp[item.key] });
                            }}
                            style={{ padding: '4px 8px', backgroundColor: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', borderRadius: '50%', transition: 'all 200ms ease' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 229, 160, 0.15)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            title="Ayuda"
                          >
                            ⓘ
                          </button>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                      <h4 style={{ color: 'var(--text)', margin: 0, fontSize: '14px', fontWeight: '600' }}>Play Store</h4>
                      <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
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
                        <label key={item.key} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px', cursor: 'pointer' }}>
                          <input type="checkbox" checked={idea.checklist_publicacion?.[item.key] || false} onChange={() => handleChecklistPublicacion(item.key)} style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#00E5A0' }} />
                          <span style={{ color: idea.checklist_publicacion?.[item.key] ? '#999' : '#DDD', fontSize: '12px', textDecoration: idea.checklist_publicacion?.[item.key] ? 'line-through' : 'none', flex: 1 }}>{item.label}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              setHelpModal({ key: item.key, ...publicacionHelp[item.key] });
                            }}
                            style={{ padding: '4px 8px', backgroundColor: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', borderRadius: '50%', transition: 'all 200ms ease' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 229, 160, 0.15)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            title="Ayuda"
                          >
                            ⓘ
                          </button>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <div style={{ height: '4px', background: 'var(--surface-2)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', background: 'var(--primary)', width: `${(Object.values(idea.checklist_publicacion || {}).filter(Boolean).length / 10) * 100}%`, transition: 'width 0.3s ease' }} />
                    </div>
                  </div>

                  {Object.values(idea.checklist_publicacion || {}).filter(Boolean).length === 10 && (
                    <button
                      onClick={handleConvertirEnApp}
                      style={{
                        width: '100%',
                        padding: '20px 32px',
                        background: 'var(--primary)',
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
              <h3 style={{ color: 'var(--text)', fontSize: '20px', fontWeight: '600', marginBottom: '24px' }}>Screenshots</h3>

              {!hasCompletedRun ? (
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Completa un pipeline exitosamente para desbloquear este tab
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: '24px' }}>
                    <h4 style={{ color: 'var(--text)', fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>Feature Graphic Generator</h4>
                    <button
                      onClick={handleGenerateFeatureGraphic}
                      disabled={generatingGraphic}
                      style={{
                        padding: '12px 24px',
                        backgroundColor: '#7C6AFF',
                        border: 'none',
                        color: 'var(--text)',
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
                      <div style={{ marginTop: '16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '20px', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
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
                    <h4 style={{ color: 'var(--text)', fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>Screenshots</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '12px' }}>
                      Nota: La carga de archivos requiere una solución de storage (Supabase Storage o similar)
                    </p>
                    <div style={{ background: 'var(--surface)', border: '2px dashed rgba(0, 229, 160, 0.3)', borderRadius: '8px', padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      <p>📸 Sube screenshots aquí (implementar storage)</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {helpModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setHelpModal(null)}
        >
          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid rgba(0, 229, 160, 0.3)',
              borderRadius: '12px',
              padding: '32px',
              maxWidth: '500px',
              width: '90%',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ color: 'var(--primary)', fontSize: '18px', fontWeight: '600', marginBottom: '16px', marginTop: 0 }}>
              {helpModal.title}
            </h3>
            <p style={{ color: '#DDD', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px', whiteSpace: 'pre-wrap' }}>
              {helpModal.description}
            </p>
            <button
              onClick={() => setHelpModal(null)}
              style={{
                width: '100%',
                padding: '12px 24px',
                background: 'var(--primary)',
                border: 'none',
                color: '#0A0A0F',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 200ms ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {helpModalFirebaseAdMob && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setHelpModalFirebaseAdMob(null)}
        >
          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid rgba(0, 229, 160, 0.3)',
              borderRadius: '12px',
              padding: '32px',
              maxWidth: '500px',
              width: '90%',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ color: 'var(--primary)', fontSize: '18px', fontWeight: '600', marginBottom: '16px', marginTop: 0 }}>
              {helpModalFirebaseAdMob.title}
            </h3>
            <p style={{ color: '#DDD', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px', whiteSpace: 'pre-wrap' }}>
              {helpModalFirebaseAdMob.description}
            </p>
            <button
              onClick={() => setHelpModalFirebaseAdMob(null)}
              style={{
                width: '100%',
                padding: '12px 24px',
                background: 'var(--primary)',
                border: 'none',
                color: '#0A0A0F',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 200ms ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {toast && (
        <ToastNotification message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
