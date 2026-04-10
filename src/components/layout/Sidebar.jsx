import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useAgentInbox } from '../../hooks/useAgentInbox'

const navItems = [
  { path: '/', label: 'Home', icon: 'home' },
  { path: '/apps', label: 'Apps', icon: 'grid' },
  { path: '/finanzas', label: 'Finanzas', icon: 'chart' },
  { path: '/notificaciones', label: 'Notificaciones', icon: 'bell' },
  { path: '/agentes', label: 'Agentes', icon: 'robot' },
  { path: '/calendario', label: 'Calendario', icon: 'calendar' },
  { path: '/pipeline', label: 'Pipeline', icon: 'rocket' },
  { path: '/tareas', label: 'Tareas', icon: 'checklist' },
  { path: '/ideas', label: 'Ideas', icon: 'lightbulb' },
  { path: '/reportes', label: 'Reportes', icon: 'document' },
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

const IconBell = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
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
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>
)

const getIcon = (iconName) => {
  switch (iconName) {
    case 'home':
      return <IconHome />
    case 'grid':
      return <IconGrid />
    case 'chart':
      return <IconChart />
    case 'bell':
      return <IconBell />
    case 'robot':
      return <IconRobot />
    case 'calendar':
      return <IconCalendar />
    case 'rocket':
      return <IconRocket />
    case 'document':
      return <IconDocument />
    case 'lightbulb':
      return <IconLightbulb />
    case 'checklist':
      return <IconChecklist />
    default:
      return null
  }
}

export function Sidebar() {
  const { user, signOut } = useAuth()
  const location = useLocation()
  const { pendingCount } = useAgentInbox()

  const handleLogout = async () => {
    await signOut()
  }

  const getInitials = (email) => {
    if (!email) return ''
    const parts = email.split('@')[0].split('.')
    return parts.map((p) => p[0]).join('').toUpperCase().slice(0, 2)
  }

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <aside
      className="flex fixed border-r"
      style={{
        width: isMobile ? '100%' : '220px',
        height: isMobile ? 'auto' : '100vh',
        backgroundColor: '#0A0A0F',
        borderRightColor: isMobile ? 'transparent' : 'rgba(255,255,255,0.08)',
        borderTopColor: isMobile ? 'rgba(255,255,255,0.08)' : 'transparent',
        borderTop: isMobile ? '1px solid rgba(255,255,255,0.08)' : 'none',
        left: 0,
        top: isMobile ? 'auto' : 0,
        bottom: isMobile ? 0 : 'auto',
        zIndex: isMobile ? 50 : 'auto',
        flexDirection: isMobile ? 'row' : 'column',
      }}
    >
      {/* Logo */}
      {!isMobile && (
        <div className="px-6 py-8 border-b" style={{ borderBottomColor: 'rgba(255,255,255,0.08)' }}>
          <div className="flex items-baseline gap-1">
            <span style={{ color: '#00E5A0' }} className="text-2xl font-bold">
              NZ
            </span>
            <span style={{ color: 'white' }} className="text-2xl font-bold">
              Tech
            </span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className={isMobile ? 'flex flex-1' : 'flex-1 px-4 py-6'}>
        <ul className={isMobile ? 'flex w-full' : 'space-y-2'} style={{ justifyContent: isMobile ? 'space-around' : undefined }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            const showBadge = item.path === '/agentes' && pendingCount > 0
            return (
              <li key={item.path} style={{ flex: isMobile ? 1 : undefined }}>
                <Link
                  to={item.path}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors group"
                  style={{
                    color: isActive ? '#00E5A0' : 'white',
                    backgroundColor: isActive ? 'rgba(0,229,160,0.08)' : 'transparent',
                    justifyContent: isMobile ? 'center' : undefined,
                    padding: isMobile ? '12px 0' : '12px 16px',
                    gap: isMobile ? 0 : '12px',
                    position: 'relative',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }
                  }}
                >
                  <span>{getIcon(item.icon)}</span>
                  {!isMobile && <span className="text-sm font-medium">{item.label}</span>}
                  {showBadge && (
                    <span style={{
                      marginLeft: isMobile ? 'auto' : 'auto',
                      position: isMobile ? 'absolute' : 'relative',
                      top: isMobile ? '-8px' : undefined,
                      right: isMobile ? '0px' : undefined,
                      backgroundColor: '#FF4D4F',
                      color: 'white',
                      fontSize: '10px',
                      fontWeight: '600',
                      padding: '2px 4px',
                      borderRadius: '10px',
                      minWidth: isMobile ? '16px' : undefined,
                      textAlign: isMobile ? 'center' : undefined,
                    }}>
                      {pendingCount}
                    </span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User Footer */}
      {!isMobile && (
        <div className="p-4 border-t space-y-3" style={{ borderTopColor: 'rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold"
              style={{
                backgroundColor: '#1C1C26',
                color: '#00E5A0',
              }}
            >
              {getInitials(user?.email)}
            </div>
            <div className="flex-1 min-w-0">
              <p style={{ color: 'rgba(255,255,255,0.45)' }} className="text-xs truncate">
                {user?.email || 'Usuario'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              backgroundColor: 'transparent',
              color: 'rgba(255,255,255,0.45)',
              border: '1px solid rgba(255,255,255,0.12)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'
              e.currentTarget.style.color = 'white'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = 'rgba(255,255,255,0.45)'
            }}
          >
            Salir
          </button>
        </div>
      )}
    </aside>
  )
}
