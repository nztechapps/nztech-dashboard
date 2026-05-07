import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useAgentInbox } from '../../hooks/useAgentInbox'

const navGroups = [
  {
    label: null,
    items: [
      { path: '/', label: 'Home', icon: 'home' },
      { path: '/ideas', label: 'Ideas', icon: 'lightbulb' },
      { path: '/apps', label: 'Apps', icon: 'grid' },
      { path: '/pipeline', label: 'Pipeline', icon: 'rocket' },
    ],
  },
  {
    label: 'Contenido',
    items: [
      { path: '/guiones', label: 'Guiones', icon: 'document' },
      { path: '/social', label: 'Social', icon: 'share' },
    ],
  },
  {
    label: 'Sistema',
    items: [
      { path: '/manuales', label: 'Manuales', icon: 'book' },
      { path: '/productividad', label: 'Productividad', icon: 'zap' },
    ],
  },
  {
    label: 'Gestión',
    items: [
      { path: '/tareas', label: 'Tareas', icon: 'checklist' },
      { path: '/finanzas', label: 'Finanzas', icon: 'chart' },
      { path: '/calendario', label: 'Calendario', icon: 'calendar' },
      { path: '/agentes', label: 'Agentes', icon: 'robot' },
    ],
  },
]

const IconHome = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
)
const IconGrid = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7"></rect>
    <rect x="14" y="3" width="7" height="7"></rect>
    <rect x="14" y="14" width="7" height="7"></rect>
    <rect x="3" y="14" width="7" height="7"></rect>
  </svg>
)
const IconChart = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <polyline points="19 12 12 19 5 12"></polyline>
  </svg>
)
const IconRobot = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="9" y1="9" x2="9" y2="9.01"></line>
    <line x1="15" y1="9" x2="15" y2="9.01"></line>
    <path d="M9 15a3 3 0 0 1 0-6M15 15a3 3 0 0 0 0-6"></path>
  </svg>
)
const IconCalendar = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
)
const IconRocket = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4.5 16.5c-1.5-1.5-2-3.5-2-5.5 0-4.5 3.5-8 8-8s8 3.5 8 8-3.5 8-8 8c-2 0-4-0.5-5.5-2"></path>
    <polyline points="12 4 12 12 9 12"></polyline>
  </svg>
)
const IconDocument = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
  </svg>
)
const IconChecklist = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="10" y1="6" x2="21" y2="6"></line>
    <line x1="10" y1="12" x2="21" y2="12"></line>
    <line x1="10" y1="18" x2="21" y2="18"></line>
    <polyline points="3 6 4 7 6 5"></polyline>
    <polyline points="3 12 4 13 6 11"></polyline>
    <polyline points="3 18 4 19 6 17"></polyline>
  </svg>
)
const IconLightbulb = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="10" r="3"></circle>
    <path d="M12 2a8 8 0 0 1 6.93 12l-1.27 2H6.34l-1.27-2A8 8 0 0 1 12 2z"></path>
    <line x1="9" y1="21" x2="15" y2="21"></line>
    <line x1="10" y1="23" x2="14" y2="23"></line>
  </svg>
)
const IconShare = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="18" cy="5" r="3"></circle>
    <circle cx="6" cy="12" r="3"></circle>
    <circle cx="18" cy="19" r="3"></circle>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
  </svg>
)
const IconBook = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
  </svg>
)
const IconZap = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
  </svg>
)
const IconX = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
)

const getIcon = (iconName) => {
  switch (iconName) {
    case 'home': return <IconHome />
    case 'grid': return <IconGrid />
    case 'chart': return <IconChart />
    case 'robot': return <IconRobot />
    case 'calendar': return <IconCalendar />
    case 'rocket': return <IconRocket />
    case 'document': return <IconDocument />
    case 'lightbulb': return <IconLightbulb />
    case 'checklist': return <IconChecklist />
    case 'share': return <IconShare />
    case 'book': return <IconBook />
    case 'zap': return <IconZap />
    default: return null
  }
}

function NavItem({ item, isActive, showBadge, pendingCount, onNavigate }) {
  return (
    <li>
      <Link
        to={item.path}
        onClick={onNavigate}
        style={{
          display: 'flex',
          alignItems: 'center',
          borderRadius: '8px',
          transition: 'background 0.15s, color 0.15s',
          color: isActive ? '#059669' : '#6B7280',
          backgroundColor: isActive ? '#F0FDF9' : 'transparent',
          borderLeft: isActive ? '3px solid #00E5A0' : '3px solid transparent',
          padding: isActive ? '8px 9px' : '8px 12px',
          gap: '10px',
          fontWeight: isActive ? '500' : '400',
          fontSize: '14px',
          position: 'relative',
          textDecoration: 'none',
        }}
        onMouseEnter={(e) => {
          if (!isActive) {
            e.currentTarget.style.backgroundColor = '#F3F4F6'
            e.currentTarget.style.color = '#111827'
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.color = '#6B7280'
          }
        }}
      >
        <span style={{ display: 'flex', width: 18, height: 18, flexShrink: 0 }}>{getIcon(item.icon)}</span>
        <span>{item.label}</span>
        {showBadge && (
          <span style={{
            marginLeft: 'auto',
            backgroundColor: '#FF4D4F',
            color: 'white',
            fontSize: '10px',
            fontWeight: '600',
            padding: '2px 4px',
            borderRadius: '10px',
            minWidth: '16px',
            textAlign: 'center',
          }}>
            {pendingCount}
          </span>
        )}
      </Link>
    </li>
  )
}

export function Sidebar({ isOpen, onClose }) {
  const { user, signOut } = useAuth()
  const location = useLocation()
  const { pendingCount } = useAgentInbox()

  const handleLogout = async () => {
    await signOut()
  }

  const sidebarContent = (
    <>
      {/* Logo + close on mobile */}
      <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ color: '#111827', fontWeight: '700', fontSize: '18px' }}>
          <span style={{ color: '#00E5A0' }}>NZ</span>Tech
        </span>
        <button
          onClick={onClose}
          className="md:hidden"
          style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', padding: '4px', display: 'flex' }}
        >
          <IconX />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        {navGroups.map((group, groupIndex) => (
          <div key={groupIndex} className={groupIndex > 0 ? 'mt-4' : ''}>
            {group.label && (
              <div style={{ padding: '16px 12px 6px' }}>
                <span style={{
                  color: '#9CA3AF',
                  fontSize: '11px',
                  fontWeight: '600',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}>
                  {group.label}
                </span>
              </div>
            )}
            <ul className="space-y-0.5">
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
      <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', padding: '12px 16px' }}>
        <p style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {user?.email || 'Usuario'}
        </p>
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: '500',
            backgroundColor: 'transparent',
            color: '#9CA3AF',
            border: '1px solid rgba(0,0,0,0.10)',
            cursor: 'pointer',
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#F3F4F6'
            e.currentTarget.style.color = '#111827'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.color = '#9CA3AF'
          }}
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
        className="hidden md:flex border-r flex-shrink-0 flex-col"
        style={{
          width: '220px',
          height: '100vh',
          backgroundColor: '#FFFFFF',
          borderRightColor: 'rgba(0,0,0,0.08)',
          overflowY: 'auto',
        }}
      >
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1040,
            display: 'flex',
          }}
        >
          {/* Backdrop */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.4)',
            }}
            onClick={onClose}
          />
          {/* Drawer */}
          <aside
            style={{
              position: 'relative',
              width: '260px',
              height: '100%',
              backgroundColor: '#FFFFFF',
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
              zIndex: 1,
            }}
          >
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  )
}
