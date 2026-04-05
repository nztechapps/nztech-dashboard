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

  return (
    <aside
      className="flex flex-col h-screen fixed left-0 top-0 border-r"
      style={{
        width: '220px',
        backgroundColor: '#0A0A0F',
        borderRightColor: 'rgba(255,255,255,0.08)',
      }}
    >
      {/* Logo */}
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

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            const showBadge = item.path === '/agentes' && pendingCount > 0
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors group"
                  style={{
                    color: isActive ? '#00E5A0' : 'white',
                    backgroundColor: isActive ? 'rgba(0,229,160,0.08)' : 'transparent',
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
                  <span className="text-sm font-medium">{item.label}</span>
                  {showBadge && (
                    <span style={{
                      marginLeft: 'auto',
                      backgroundColor: '#FF4D4F',
                      color: 'white',
                      fontSize: '11px',
                      fontWeight: '600',
                      padding: '2px 6px',
                      borderRadius: '10px',
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
    </aside>
  )
}
