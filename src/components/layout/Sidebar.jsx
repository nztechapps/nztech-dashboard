import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useAgentInbox } from '../../hooks/useAgentInbox'

const navGroups = [
  {
    label: null,
    items: [
      { path: '/',      label: 'Home',         icon: 'home' },
      { path: '/ideas', label: 'Ideas',         icon: 'lightbulb' },
      { path: '/apps',  label: 'Apps',          icon: 'grid' },
      { path: '/pipeline', label: 'Pipeline',   icon: 'rocket' },
    ],
  },
  {
    label: 'Contenido',
    items: [
      { path: '/guiones', label: 'Guiones', icon: 'document' },
      { path: '/social',  label: 'Social',  icon: 'share' },
    ],
  },
  {
    label: 'Sistema',
    items: [
      { path: '/manuales',      label: 'Manuales',      icon: 'book' },
      { path: '/productividad', label: 'Productividad', icon: 'zap' },
    ],
  },
  {
    label: 'Gestión',
    items: [
      { path: '/tareas',     label: 'Tareas',     icon: 'checklist' },
      { path: '/finanzas',   label: 'Finanzas',   icon: 'chart' },
      { path: '/calendario', label: 'Calendario', icon: 'calendar' },
      { path: '/agentes',    label: 'Agentes',    icon: 'robot' },
    ],
  },
]

/* ── Icons ─────────────────────────────────────────────── */
const Ico = ({ children }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
)

const icons = {
  home:        <Ico><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></Ico>,
  lightbulb:   <Ico><circle cx="12" cy="10" r="3"/><path d="M12 2a8 8 0 0 1 6.93 12l-1.27 2H6.34l-1.27-2A8 8 0 0 1 12 2z"/><line x1="9" y1="21" x2="15" y2="21"/></Ico>,
  grid:        <Ico><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></Ico>,
  rocket:      <Ico><path d="M4.5 16.5c-1.5-1.5-2-3.5-2-5.5 0-4.5 3.5-8 8-8s8 3.5 8 8-3.5 8-8 8c-2 0-4-0.5-5.5-2"/><polyline points="12 4 12 12 9 12"/></Ico>,
  document:    <Ico><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></Ico>,
  share:       <Ico><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></Ico>,
  book:        <Ico><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></Ico>,
  zap:         <Ico><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></Ico>,
  checklist:   <Ico><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><polyline points="3 6 4 7 6 5"/><polyline points="3 12 4 13 6 11"/><polyline points="3 18 4 19 6 17"/></Ico>,
  chart:       <Ico><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></Ico>,
  calendar:    <Ico><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></Ico>,
  robot:       <Ico><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="9" y1="9" x2="9" y2="9.01"/><line x1="15" y1="9" x2="15" y2="9.01"/><path d="M9 15a3 3 0 0 1 0-6M15 15a3 3 0 0 0 0-6"/></Ico>,
  close:       <Ico><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></Ico>,
}

/* ── NavItem ────────────────────────────────────────────── */
function NavItem({ item, isActive, showBadge, pendingCount, onNavigate }) {
  return (
    <li>
      <Link
        to={item.path}
        onClick={onNavigate}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '9px 12px',
          borderRadius: 'var(--radius)',
          fontSize: 13.5,
          fontWeight: isActive ? 500 : 400,
          color: isActive ? 'var(--primary)' : 'var(--text-muted)',
          background: isActive ? 'var(--primary-soft)' : 'transparent',
          textDecoration: 'none',
          transition: 'background var(--dur-fast), color var(--dur-fast)',
          position: 'relative',
        }}
        onMouseEnter={(e) => {
          if (!isActive) {
            e.currentTarget.style.background = 'var(--surface-hover)'
            e.currentTarget.style.color = 'var(--text)'
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = 'var(--text-muted)'
          }
        }}
      >
        <span style={{ display: 'flex', flexShrink: 0 }}>{icons[item.icon]}</span>
        <span>{item.label}</span>
        {showBadge && (
          <span style={{
            marginLeft: 'auto',
            background: 'var(--nz-danger)',
            color: '#fff',
            fontSize: 10,
            fontWeight: 600,
            padding: '2px 5px',
            borderRadius: 'var(--radius-pill)',
            minWidth: 16,
            textAlign: 'center',
          }}>
            {pendingCount}
          </span>
        )}
        {isActive && !showBadge && (
          <span style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: 999, background: 'var(--primary)' }} />
        )}
      </Link>
    </li>
  )
}

/* ── Sidebar ────────────────────────────────────────────── */
export function Sidebar({ isOpen, onClose }) {
  const { user, signOut } = useAuth()
  const location = useLocation()
  const { pendingCount } = useAgentInbox()

  const initials = user?.email?.slice(0, 2).toUpperCase() || 'NZ'

  const sidebarContent = (
    <>
      {/* Logo */}
      <div style={{
        padding: '20px 16px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10,
            background: 'linear-gradient(135deg, var(--primary), color-mix(in oklch, var(--primary) 55%, black))',
            display: 'grid', placeItems: 'center',
            color: 'var(--primary-fg)', fontWeight: 700, fontSize: 13,
            boxShadow: '0 4px 12px color-mix(in oklch, var(--primary) 35%, transparent)',
            flexShrink: 0,
          }}>NZ</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>NZTech</div>
            <div style={{ fontSize: 11, color: 'var(--text-subtle)' }}>App Factory</div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="md:hidden"
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}
        >
          {icons.close}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto scrollable" style={{ padding: '8px 12px' }}>
        {navGroups.map((group, gi) => (
          <div key={gi} style={{ marginTop: gi > 0 ? 16 : 0 }}>
            {group.label && (
              <div style={{ padding: '8px 12px 4px', color: 'var(--text-subtle)', fontSize: 11, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase' }}>
                {group.label}
              </div>
            )}
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 2 }}>
              {group.items.map((item) => (
                <NavItem
                  key={item.path}
                  item={item}
                  isActive={location.pathname === item.path}
                  showBadge={item.path === '/agentes' && pendingCount > 0}
                  pendingCount={pendingCount}
                  onNavigate={onClose}
                />
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* User Footer */}
      <div style={{ borderTop: '1px solid var(--border)', padding: '12px 16px' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 999,
            background: 'var(--surface-2)', border: '1px solid var(--border)',
            display: 'grid', placeItems: 'center',
            color: 'var(--text-muted)', fontSize: 11, fontWeight: 600, flexShrink: 0,
          }}>{initials}</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.email || 'Usuario'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-subtle)' }}>Owner</div>
          </div>
        </div>
        <button
          onClick={signOut}
          className="nz-btn nz-btn-ghost"
          style={{ width: '100%', justifyContent: 'center', fontSize: 12 }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-hover)'; e.currentTarget.style.color = 'var(--text)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
        >
          Salir
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex flex-col flex-shrink-0"
        style={{
          width: 220,
          height: '100vh',
          background: 'var(--surface)',
          borderRight: '1px solid var(--border)',
          overflowY: 'auto',
          position: 'sticky',
          top: 0,
        }}
      >
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1040, display: 'flex' }}>
          <div
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }}
            onClick={onClose}
          />
          <aside style={{
            position: 'relative',
            width: 260,
            height: '100%',
            background: 'var(--surface)',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            zIndex: 1,
          }}>
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  )
}
