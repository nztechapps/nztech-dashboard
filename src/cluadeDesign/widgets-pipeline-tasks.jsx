/* global React */
const { useState, useMemo } = React;

/* =====================================================
   Pipeline / Kanban
   ===================================================== */
const STAGES = [
  { id: 'lead',     label: 'Lead',        color: 'oklch(0.65 0.012 285)' },
  { id: 'contact',  label: 'Contactado',  color: 'oklch(0.62 0.14 235)' },
  { id: 'demo',     label: 'Demo',        color: 'oklch(0.78 0.14 75)' },
  { id: 'proposal', label: 'Propuesta',   color: 'var(--primary)' },
  { id: 'won',      label: 'Cerrado',     color: 'var(--nz-success)' },
];

const INITIAL_LEADS = [
  { id: 'l1', stage: 'lead',     company: 'Bauen Studio',     contact: 'M. Pérez',    amount: 4200, tag: 'Web' },
  { id: 'l2', stage: 'lead',     company: 'Roca & Hijos',     contact: 'J. Roca',     amount: 6800, tag: 'Mobile' },
  { id: 'l3', stage: 'contact',  company: 'Fintec Lab',       contact: 'A. Núñez',    amount: 12500, tag: 'SaaS' },
  { id: 'l4', stage: 'contact',  company: 'Kalwill Co.',      contact: 'J. Kalwill',  amount: 3500, tag: 'Web' },
  { id: 'l5', stage: 'demo',     company: 'SaudePlus',        contact: 'C. Lima',     amount: 18200, tag: 'Health' },
  { id: 'l6', stage: 'demo',     company: 'Subero Mobile',    contact: 'A. Subero',   amount: 7400, tag: 'Mobile' },
  { id: 'l7', stage: 'proposal', company: 'Snaptro',          contact: 'F. Nintzel',  amount: 22000, tag: 'AI' },
  { id: 'l8', stage: 'proposal', company: 'Runelore Server',  contact: 'L. M.',       amount: 9900, tag: 'Backend' },
  { id: 'l9', stage: 'won',      company: 'PetShopApp',       contact: 'V. Cohen',    amount: 5400, tag: 'Mobile' },
];

const TAG_COLORS = {
  Web:    'oklch(0.62 0.14 235)',
  Mobile: 'oklch(0.55 0.22 285)',
  SaaS:   'oklch(0.62 0.16 155)',
  Health: 'oklch(0.62 0.20 350)',
  AI:     'oklch(0.78 0.14 75)',
  Backend:'oklch(0.50 0.012 285)',
};

function LeadCard({ lead, onDragStart }) {
  return (
    <div
      draggable
      onDragStart={(e) => { onDragStart(lead.id); e.dataTransfer.effectAllowed = 'move'; }}
      className="nz-card"
      style={{
        padding: 12, cursor: 'grab', display: 'flex', flexDirection: 'column', gap: 8,
        boxShadow: 'var(--shadow-sm)',
      }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{lead.company}</div>
        <span className="nz-pill" style={{
          color: TAG_COLORS[lead.tag] || 'var(--text-muted)',
          background: 'transparent', borderColor: 'var(--border)',
        }}>{lead.tag}</span>
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{lead.contact}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 6, borderTop: '1px dashed var(--border)' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>
          ${lead.amount.toLocaleString('es-AR')}
        </span>
        <div style={{ width: 22, height: 22, borderRadius: 999, background: 'var(--primary-soft)',
          color: 'var(--primary)', display: 'grid', placeItems: 'center', fontSize: 10, fontWeight: 700 }}>
          {lead.contact.split(' ').map(s => s[0]).join('').slice(0,2)}
        </div>
      </div>
    </div>
  );
}

function PipelineKanban() {
  const [leads, setLeads] = useState(INITIAL_LEADS);
  const [dragId, setDragId] = useState(null);
  const [overStage, setOverStage] = useState(null);

  const totals = useMemo(() => {
    const t = {};
    STAGES.forEach(s => { t[s.id] = leads.filter(l => l.stage === s.id).reduce((a,b) => a + b.amount, 0); });
    return t;
  }, [leads]);

  const onDrop = (stageId) => {
    if (!dragId) return;
    setLeads(ls => ls.map(l => l.id === dragId ? { ...l, stage: stageId } : l));
    setDragId(null);
    setOverStage(null);
  };

  return (
    <div className="nz-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16, gridColumn: '1 / -1' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 600 }}>Sales Pipeline</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginTop: 4 }}>Tablero de leads</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="nz-btn nz-btn-ghost">Filtros</button>
          <button className="nz-btn nz-btn-primary"><IconPlus /><span>Nuevo lead</span></button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${STAGES.length}, 1fr)`, gap: 12 }}>
        {STAGES.map(stage => {
          const items = leads.filter(l => l.stage === stage.id);
          const isOver = overStage === stage.id;
          return (
            <div key={stage.id}
              onDragOver={(e) => { e.preventDefault(); setOverStage(stage.id); }}
              onDragLeave={() => setOverStage(null)}
              onDrop={() => onDrop(stage.id)}
              style={{
                background: isOver ? 'var(--primary-soft)' : 'var(--bg-muted)',
                border: `1px dashed ${isOver ? 'var(--primary)' : 'var(--border)'}`,
                borderRadius: 'var(--radius-lg)',
                padding: 12, display: 'flex', flexDirection: 'column', gap: 10,
                minHeight: 240, transition: 'background var(--dur), border-color var(--dur)',
              }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 999, background: stage.color }}/>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{stage.label}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-subtle)' }}>{items.length}</span>
                </div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
                  ${(totals[stage.id]/1000).toFixed(1)}K
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {items.map(l => <LeadCard key={l.id} lead={l} onDragStart={setDragId} />)}
              </div>

              <button style={{
                marginTop: 'auto', background: 'transparent', border: '1px dashed var(--border)',
                borderRadius: 'var(--radius)', padding: '8px', fontSize: 12, color: 'var(--text-subtle)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
              }}>
                <IconPlus /> Añadir
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* =====================================================
   Task Management
   ===================================================== */
const INITIAL_TASKS = [
  { id: 't1', title: 'Refactor Sidebar a tokens', done: true,  prio: 'high', due: 'Hoy', assignee: 'FN', project: 'Dashboard' },
  { id: 't2', title: 'Conectar Supabase a Pipeline', done: false, prio: 'high', due: 'Hoy', assignee: 'AS', project: 'Pipeline' },
  { id: 't3', title: 'Diseñar onboarding SaudePlus', done: false, prio: 'med',  due: 'Mañ.', assignee: 'JK', project: 'SaudePlus' },
  { id: 't4', title: 'Publicar reel "Behind the build"', done: false, prio: 'med', due: 'Vie', assignee: 'FN', project: 'Social' },
  { id: 't5', title: 'Revisar propuesta Snaptro', done: false, prio: 'low', due: 'Lun', assignee: 'AS', project: 'Pipeline' },
  { id: 't6', title: 'Actualizar README factory', done: true, prio: 'low', due: 'Ayer', assignee: 'FN', project: 'Dashboard' },
];

const PRIO = {
  high: { label: 'Alta', color: 'var(--nz-danger)' },
  med:  { label: 'Media', color: 'var(--nz-warning)' },
  low:  { label: 'Baja', color: 'var(--text-muted)' },
};

function TaskList() {
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [filter, setFilter] = useState('open');
  const [draft, setDraft] = useState('');

  const filtered = useMemo(() => {
    if (filter === 'all') return tasks;
    if (filter === 'open') return tasks.filter(t => !t.done);
    return tasks.filter(t => t.done);
  }, [tasks, filter]);

  const toggle = (id) => setTasks(ts => ts.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const add = (e) => {
    e.preventDefault();
    if (!draft.trim()) return;
    setTasks(ts => [{ id: 't' + Date.now(), title: draft.trim(), done: false, prio: 'med', due: 'Hoy', assignee: 'FN', project: 'Inbox' }, ...ts]);
    setDraft('');
  };

  const counts = {
    all: tasks.length,
    open: tasks.filter(t => !t.done).length,
    done: tasks.filter(t => t.done).length,
  };

  return (
    <div className="nz-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14, gridColumn: 'span 2' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 600 }}>Task Management</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginTop: 4 }}>Tu lista de hoy</div>
        </div>
        <div style={{ display: 'flex', gap: 4, padding: 3, background: 'var(--surface-2)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          {[['open','Abiertas'],['done','Hechas'],['all','Todas']].map(([k,v]) => (
            <button key={k} onClick={() => setFilter(k)}
              style={{
                padding: '6px 12px', borderRadius: 6, border: 'none', fontSize: 12, fontWeight: 500,
                background: filter === k ? 'var(--surface)' : 'transparent',
                color: filter === k ? 'var(--text)' : 'var(--text-muted)',
                boxShadow: filter === k ? 'var(--shadow-sm)' : 'none', cursor: 'pointer',
              }}>
              {v} <span style={{ color: 'var(--text-subtle)', marginLeft: 4 }}>{counts[k]}</span>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={add} style={{ display: 'flex', gap: 8 }}>
        <input className="nz-input" placeholder="Añadir tarea… (Enter)" value={draft} onChange={e => setDraft(e.target.value)} />
        <button type="submit" className="nz-btn nz-btn-primary"><IconPlus /></button>
      </form>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {filtered.map(t => (
          <div key={t.id} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '10px 4px',
            borderBottom: '1px solid var(--border)',
          }}>
            <button onClick={() => toggle(t.id)} aria-label="toggle"
              style={{
                width: 18, height: 18, borderRadius: 6, flexShrink: 0,
                border: `1.5px solid ${t.done ? 'var(--primary)' : 'var(--border-strong)'}`,
                background: t.done ? 'var(--primary)' : 'transparent',
                display: 'grid', placeItems: 'center', cursor: 'pointer', padding: 0,
              }}>
              {t.done && (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--primary-fg)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="4 12 10 18 20 6"/>
                </svg>
              )}
            </button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 13, color: t.done ? 'var(--text-subtle)' : 'var(--text)',
                fontWeight: 500, textDecoration: t.done ? 'line-through' : 'none',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>{t.title}</div>
              <div style={{ fontSize: 11, color: 'var(--text-subtle)', marginTop: 2, display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: 999, background: PRIO[t.prio].color }}/>
                  {PRIO[t.prio].label}
                </span>
                <span>·</span>
                <span>{t.project}</span>
                <span>·</span>
                <span>{t.due}</span>
              </div>
            </div>
            <div style={{ width: 26, height: 26, borderRadius: 999, background: 'var(--surface-2)',
              border: '1px solid var(--border)', display: 'grid', placeItems: 'center',
              fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', flexShrink: 0 }}>
              {t.assignee}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: 24, color: 'var(--text-subtle)', fontSize: 13 }}>
            Nada por aquí. ✨
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { PipelineKanban, TaskList, STAGES, INITIAL_LEADS });
