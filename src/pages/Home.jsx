import { useEffect, useState } from 'react';
import { useIdeas } from '../hooks/useIdeas';
import { useTareas } from '../hooks/useTareas';
import { useNotifications } from '../hooks/useNotifications';
import { supabase } from '../lib/supabase';

function getDailyGreeting() {
  const date = new Date();
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  return `${days[date.getDay()]}, ${date.getDate()} de ${months[date.getMonth()]}`;
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatRelativeDate(dateString) {
  const diffDays = Math.floor((Date.now() - new Date(dateString).getTime()) / 86400000);
  if (diffDays === 0) return 'hoy';
  if (diffDays === 1) return 'ayer';
  if (diffDays < 7) return `hace ${diffDays}d`;
  return formatDate(dateString);
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60), s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/* ── Icons ─────────────────────────────────────────────── */
const Ico = ({ children }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);
const IconRocket = () => <Ico><path d="M4.5 16.5c-1.5-1.5-2-3.5-2-5.5 0-4.5 3.5-8 8-8s8 3.5 8 8-3.5 8-8 8c-2 0-4-0.5-5.5-2"/><polyline points="12 4 12 12 9 12"/></Ico>;
const IconCheck = () => <Ico><polyline points="20 6 9 17 4 12"/></Ico>;
const IconAlert = () => <Ico><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3.05h16.94a2 2 0 0 0 1.71-3.05L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></Ico>;
const IconArrowUp = () => <Ico><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></Ico>;
const IconArrowDown = () => <Ico><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></Ico>;

/* ── Sparkline ──────────────────────────────────────────── */
function Sparkline({ data, positive = true }) {
  const w = 80, h = 28, p = 2;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = p + (i / (data.length - 1)) * (w - 2 * p);
    const y = h - p - ((v - min) / range) * (h - 2 * p);
    return `${x},${y}`;
  }).join(' ');
  const color = positive ? 'var(--primary)' : 'var(--nz-danger)';
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: 'block' }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── KpiCard ────────────────────────────────────────────── */
function KpiCard({ label, value, delta, spark, positive = true }) {
  return (
    <div className="nz-card" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{label}</div>
        {delta != null && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, fontWeight: 600,
            color: positive ? 'var(--nz-success)' : 'var(--nz-danger)',
          }}>
            {positive ? <IconArrowUp /> : <IconArrowDown />}
            {Math.abs(delta)}%
          </span>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>{value}</div>
        {spark && <Sparkline data={spark} positive={positive} />}
      </div>
    </div>
  );
}

/* ── StatusBadge ────────────────────────────────────────── */
const StatusBadge = ({ status }) => {
  const config = {
    development: { bg: 'var(--surface-2)', color: 'var(--text-muted)' },
    testing:     { bg: 'oklch(0.97 0.06 75)',  color: 'oklch(0.45 0.15 75)' },
    published:   { bg: 'oklch(0.97 0.06 155)', color: 'oklch(0.40 0.14 155)' },
    deprecated:  { bg: 'oklch(0.97 0.05 27)',  color: 'oklch(0.45 0.18 27)' },
  };
  const c = config[status] || config.development;
  return (
    <span style={{ background: c.bg, color: c.color, fontSize: 10, padding: '3px 8px', borderRadius: 'var(--radius-pill)', fontWeight: 500 }}>
      {status}
    </span>
  );
};

/* ── RunStatusBadge ─────────────────────────────────────── */
const RunStatusBadge = ({ estado }) => {
  const config = {
    running:      { bg: 'var(--primary-soft)', color: 'var(--primary)' },
    completado:   { bg: 'oklch(0.97 0.06 155)', color: 'oklch(0.40 0.14 155)' },
    error:        { bg: 'oklch(0.97 0.05 27)',  color: 'oklch(0.45 0.18 27)' },
    ensamblando:  { bg: 'oklch(0.97 0.06 75)',  color: 'oklch(0.45 0.15 75)' },
  };
  const c = config[estado] || config.running;
  return (
    <span style={{ background: c.bg, color: c.color, fontSize: 11, padding: '3px 10px', borderRadius: 'var(--radius-pill)', fontWeight: 600, textTransform: 'capitalize' }}>
      {estado}
    </span>
  );
};

/* ── Home ───────────────────────────────────────────────── */
export default function Home() {
  const { ideas } = useIdeas();
  const { tareas } = useTareas();
  const { notifications } = useNotifications();

  const [revenue, setRevenue] = useState('—');
  const [activeRun, setActiveRun] = useState(null);
  const [timer, setTimer] = useState(0);

  const publishedApps = ideas.filter(i => i.publicada);
  const latestIdeas = ideas.filter(i => !i.publicada).slice(0, 5);
  const ideasCount = ideas.filter(i => !i.publicada).length;

  const pendingTareas = tareas.filter(t => !t.completada && t.estado !== 'completada');
  const urgentTarea = pendingTareas[0];
  const appsWithIssues = notifications.filter(n => n.tipo === 'error').length > 0;

  useEffect(() => {
    const fetch = async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const { data } = await supabase.from('metrics').select('ingresos').gte('fecha', thirtyDaysAgo.toISOString());
      const total = (data || []).reduce((s, m) => s + (m.ingresos || 0), 0);
      setRevenue(total > 0 ? `$${total.toFixed(2)}` : '$0.00');
    };
    fetch();
  }, []);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('pipeline_runs').select('*').in('estado', ['running', 'ensamblando']).order('created_at', { ascending: false }).limit(1).maybeSingle();
      setActiveRun(data || null);
    };
    fetch();
    const interval = setInterval(fetch, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!activeRun) return;
    const interval = setInterval(() => {
      setTimer(Math.floor((Date.now() - new Date(activeRun.created_at).getTime()) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [activeRun]);

  return (
    <div style={{ background: 'var(--bg)', padding: '28px', minHeight: '100%' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Daily Brief */}
        <div className="nz-card" style={{ padding: 20 }}>
          <div style={{ fontSize: 12, color: 'var(--text-subtle)', marginBottom: 4 }}>{getDailyGreeting()}</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>Buenos días, Fede.</div>
          <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 16 }}>
            {urgentTarea ? `Hoy toca: ${urgentTarea.titulo}` : 'Nada pendiente por hoy. ¡Gran día!'}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
            {[
              { icon: <IconRocket />, label: 'Pipeline', value: activeRun ? `${activeRun.estado} — ${formatTime(timer)}` : 'Sin actividad', active: !!activeRun, color: 'var(--primary)' },
              { icon: <IconCheck />, label: 'Tareas', value: pendingTareas.length === 0 ? '¡Todo hecho!' : `${pendingTareas.length} sin completar`, active: pendingTareas.length === 0, color: 'var(--nz-success)' },
              { icon: <IconAlert />, label: 'Alertas', value: appsWithIssues ? 'Hay issues activos' : 'Todo en orden', active: !appsWithIssues, color: appsWithIssues ? 'var(--nz-danger)' : 'var(--nz-success)' },
            ].map((item, i) => (
              <div key={i} style={{ background: 'var(--surface-2)', borderRadius: 'var(--radius)', padding: '10px 14px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <span style={{ color: item.color }}>{item.icon}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '.05em' }}>{item.label}</span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
          <KpiCard label="Revenue AdMob" value={revenue} sub="último mes" spark={[4,6,5,8,9,8,10,12]} />
          <KpiCard label="Apps publicadas" value={`${publishedApps.length}/50`} delta={null} spark={[2,4,5,6,7,8,10,publishedApps.length]} />
          <KpiCard label="Ideas en desarrollo" value={ideasCount} delta={null} spark={[8,9,10,11,12,13,14,ideasCount]} />
          <KpiCard
            label="Tareas pendientes"
            value={pendingTareas.length}
            delta={null}
            spark={[8,7,6,5,4,4,3,pendingTareas.length]}
            positive={pendingTareas.length === 0}
          />
        </div>

        {/* Apps del Portfolio */}
        <div className="nz-card" style={{ padding: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 14 }}>Apps del Portfolio</div>
          {publishedApps.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-subtle)', fontSize: 14 }}>Publicá tu primera app</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10 }}>
              {publishedApps.slice(0, 6).map(app => (
                <div key={app.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'var(--surface-2)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'var(--primary)', flexShrink: 0 }}>
                    {(app.titulo || 'A').slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{app.titulo}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-subtle)' }}>{formatDate(app.created_at)}</div>
                  </div>
                  <StatusBadge status={app.estado || 'published'} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pipeline + Actividad Reciente */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          <div className="nz-card" style={{ padding: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 14 }}>Pipeline</div>
            {activeRun ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-subtle)', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase' }}>App</div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>{activeRun.nombre}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-subtle)', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase' }}>Estado</div>
                  <RunStatusBadge estado={activeRun.estado} />
                </div>
                {activeRun.paso_actual && (
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-subtle)', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase' }}>Paso actual</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{activeRun.paso_actual}</div>
                  </div>
                )}
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-subtle)', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase' }}>Tiempo</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>{formatTime(timer)}</div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-subtle)', fontSize: 13 }}>Nada ejecutando</div>
            )}
            <a href="/pipeline" style={{ display: 'block', marginTop: 16, textAlign: 'center', fontSize: 12, color: 'var(--primary)', fontWeight: 500, textDecoration: 'none' }}>
              Ver todos los runs →
            </a>
          </div>

          <div className="nz-card" style={{ padding: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 14 }}>Actividad Reciente</div>
            {latestIdeas.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-subtle)', fontSize: 13 }}>Sin actividad reciente</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {latestIdeas.map(idea => (
                  <div key={idea.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{idea.titulo}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-subtle)', marginLeft: 12, flexShrink: 0 }}>{formatRelativeDate(idea.updated_at)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
