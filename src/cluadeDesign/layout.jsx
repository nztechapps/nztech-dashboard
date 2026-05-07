/* global React */
const { useState, useMemo } = React;

/* =====================================================
   Iconos (stroke, currentColor)
   ===================================================== */
const Icon = ({ d, children, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    {d ? <path d={d} /> : children}
  </svg>
);

const IconDashboard = () => (
  <Icon><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/>
    <rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></Icon>
);
const IconSocial = () => (
  <Icon><circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/>
    <line x1="8.2" y1="13.4" x2="15.8" y2="17.6"/><line x1="15.8" y1="6.4" x2="8.2" y2="10.6"/></Icon>
);
const IconPipeline = () => (
  <Icon><rect x="3" y="4" width="5" height="16" rx="1.5"/><rect x="9.5" y="4" width="5" height="11" rx="1.5"/>
    <rect x="16" y="4" width="5" height="7" rx="1.5"/></Icon>
);
const IconTasks = () => (
  <Icon><polyline points="3 7 5 9 9 5"/><polyline points="3 14 5 16 9 12"/>
    <line x1="12" y1="7" x2="21" y2="7"/><line x1="12" y1="14" x2="21" y2="14"/>
    <line x1="3" y1="20" x2="21" y2="20"/></Icon>
);
const IconSearch = () => <Icon><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.5" y2="16.5"/></Icon>;
const IconBell = () => <Icon d="M6 8a6 6 0 0 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9zM10 21a2 2 0 0 0 4 0"/>;
const IconSun = () => (
  <Icon><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/>
    <line x1="4.5" y1="4.5" x2="5.9" y2="5.9"/><line x1="18.1" y1="18.1" x2="19.5" y2="19.5"/>
    <line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/>
    <line x1="4.5" y1="19.5" x2="5.9" y2="18.1"/><line x1="18.1" y1="5.9" x2="19.5" y2="4.5"/></Icon>
);
const IconMoon = () => <Icon d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>;
const IconPlus = () => <Icon><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></Icon>;
const IconMore = () => <Icon><circle cx="5" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="19" cy="12" r="1.4"/></Icon>;
const IconArrowUp = () => <Icon><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></Icon>;
const IconArrowDown = () => <Icon><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></Icon>;
const IconUsers = () => <Icon><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></Icon>;
const IconHeart = () => <Icon d="M20.84 4.6a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.07a5.5 5.5 0 1 0-7.78 7.78L12 21.23l8.84-8.85a5.5 5.5 0 0 0 0-7.78z"/>;
const IconChat = () => <Icon d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>;
const IconEye = () => <Icon><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></Icon>;

/* logos sociales (glyphs simples) */
const LogoX = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2H21.5l-7.5 8.59L22.5 22h-6.86l-5.37-6.97L4 22H.7l8.05-9.21L1 2h7.04l4.85 6.43L18.24 2zm-2.4 18.07h1.9L7.34 3.84H5.3l10.55 16.23z"/></svg>;
const LogoIG = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.7" fill="currentColor"/></svg>;
const LogoLI = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zm7 0h3.8v1.7h.1A4.2 4.2 0 0 1 18 8.7c4 0 4.7 2.6 4.7 6V21h-4v-5.6c0-1.3 0-3-1.9-3s-2.1 1.5-2.1 3V21h-4z"/></svg>;
const LogoTT = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19.6 6.7a5.4 5.4 0 0 1-3.2-1V15a5.5 5.5 0 1 1-5.5-5.5h.6v3a2.6 2.6 0 1 0 1.9 2.5V2h2.9a3.4 3.4 0 0 0 3.3 3.3z"/></svg>;

/* =====================================================
   Sidebar
   ===================================================== */
const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: IconDashboard },
  { id: 'social',    label: 'Social Media', icon: IconSocial },
  { id: 'pipeline',  label: 'Pipeline', icon: IconPipeline },
  { id: 'tasks',     label: 'Tasks', icon: IconTasks },
];

function Sidebar({ active, onChange }) {
  return (
    <aside style={{
      width: 240, flexShrink: 0, height: '100vh', position: 'sticky', top: 0,
      background: 'var(--surface)', borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ padding: '20px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 10,
          background: 'linear-gradient(135deg, var(--primary), color-mix(in oklch, var(--primary) 55%, black))',
          display: 'grid', placeItems: 'center', color: 'var(--primary-fg)', fontWeight: 700, fontSize: 14,
          boxShadow: '0 4px 12px color-mix(in oklch, var(--primary) 35%, transparent)',
        }}>NZ</div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>NZTech</div>
          <div style={{ fontSize: 11, color: 'var(--text-subtle)' }}>App Factory</div>
        </div>
      </div>

      <nav style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV.map(item => {
          const Icn = item.icon;
          const isActive = active === item.id;
          return (
            <button key={item.id} onClick={() => onChange(item.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
                borderRadius: 'var(--radius)', border: 'none', fontSize: 13.5, fontWeight: 500,
                background: isActive ? 'var(--primary-soft)' : 'transparent',
                color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                transition: 'background var(--dur-fast), color var(--dur-fast)',
                textAlign: 'left', width: '100%',
              }}
              onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'var(--surface-hover)'; e.currentTarget.style.color = 'var(--text)'; } }}
              onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; } }}>
              <Icn />
              <span>{item.label}</span>
              {isActive && <span style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: 999, background: 'var(--primary)' }}/>}
            </button>
          );
        })}
      </nav>

      <div style={{ marginTop: 'auto', padding: 16, borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ width: 32, height: 32, borderRadius: 999, background: 'var(--surface-2)',
            border: '1px solid var(--border)', display: 'grid', placeItems: 'center',
            color: 'var(--text-muted)', fontSize: 12, fontWeight: 600 }}>FN</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Federico N.</div>
            <div style={{ fontSize: 11, color: 'var(--text-subtle)' }}>Owner</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

/* =====================================================
   TopBar
   ===================================================== */
function TopBar({ theme, onToggleTheme, title }) {
  return (
    <header style={{
      display: 'flex', alignItems: 'center', gap: 16,
      padding: '16px 28px', borderBottom: '1px solid var(--border)',
      background: 'color-mix(in oklch, var(--bg) 60%, transparent)',
      backdropFilter: 'blur(8px)',
      position: 'sticky', top: 0, zIndex: 10,
    }}>
      <div>
        <div style={{ fontSize: 11, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 600 }}>Workspace</div>
        <h1 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: 'var(--text)' }}>{title}</h1>
      </div>

      <div style={{ position: 'relative', flex: 1, maxWidth: 380, marginLeft: 24 }}>
        <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)', display: 'flex' }}><IconSearch /></span>
        <input className="nz-input" placeholder="Buscar leads, tareas, posts…" style={{ paddingLeft: 38 }} />
      </div>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
        <button className="nz-btn nz-btn-ghost" aria-label="Notificaciones" style={{ position: 'relative', padding: '8px 10px' }}>
          <IconBell />
          <span style={{ position: 'absolute', top: 6, right: 6, width: 7, height: 7, borderRadius: 999, background: 'var(--nz-danger)' }}/>
        </button>
        <button className="nz-btn nz-btn-ghost" onClick={onToggleTheme} style={{ padding: '8px 10px' }}>
          {theme === 'dark' ? <IconSun /> : <IconMoon />}
        </button>
        <button className="nz-btn nz-btn-primary"><IconPlus /><span>Nuevo</span></button>
      </div>
    </header>
  );
}

/* =====================================================
   exporta
   ===================================================== */
Object.assign(window, {
  Sidebar, TopBar, NAV,
  Icon, IconDashboard, IconSocial, IconPipeline, IconTasks,
  IconSearch, IconBell, IconSun, IconMoon, IconPlus, IconMore,
  IconArrowUp, IconArrowDown, IconUsers, IconHeart, IconChat, IconEye,
  LogoX, LogoIG, LogoLI, LogoTT,
});
