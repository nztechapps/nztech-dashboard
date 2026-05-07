import { useAuth } from '../../hooks/useAuth'
import { useNotifications } from '../../hooks/useNotifications'

const IconBell = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
  </svg>
)

export function TopBar({ title = 'Dashboard' }) {
  const { unreadCount } = useNotifications()
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <header
      className="border-b flex items-center justify-between px-6 flex-shrink-0"
      style={{
        height: '56px',
        backgroundColor: '#FFFFFF',
        borderBottomColor: 'rgba(0,0,0,0.08)',
      }}
    >
      <h1 style={{ color: '#111827' }} className="text-lg font-medium">
        {title}
      </h1>

      <button
        className="relative p-2 rounded-lg transition-colors"
        style={{
          backgroundColor: 'transparent',
          color: '#00E5A0',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#F3F4F6'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent'
        }}
      >
        <IconBell />
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 bg-[#FF4D4F] text-white text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center"
            style={{ fontSize: '11px' }}
          >
            {unreadCount}
          </span>
        )}
      </button>
    </header>
  )
}
