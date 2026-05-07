import { useNotifications } from '../../hooks/useNotifications'
import { useTheme } from '../../hooks/useTheme'

const IconMenu = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
)
const IconBell = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9z"/><path d="M10 21a2 2 0 0 0 4 0"/>
  </svg>
)
const IconSearch = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.5" y2="16.5"/>
  </svg>
)
const IconSun = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4"/>
    <line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/>
    <line x1="4.5" y1="4.5" x2="5.9" y2="5.9"/><line x1="18.1" y1="18.1" x2="19.5" y2="19.5"/>
    <line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/>
    <line x1="4.5" y1="19.5" x2="5.9" y2="18.1"/><line x1="18.1" y1="5.9" x2="19.5" y2="4.5"/>
  </svg>
)
const IconMoon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>
  </svg>
)

export function TopBar({ title = 'Dashboard', onMenuClick }) {
  const { unreadCount } = useNotifications()
  const { theme, toggleTheme } = useTheme()

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '0 24px',
      height: 56,
      background: 'color-mix(in oklch, var(--bg) 85%, transparent)',
      backdropFilter: 'blur(8px)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: 0,
      zIndex: 10,
      flexShrink: 0,
    }}>
      {/* Menu button (mobile only) */}
      <button
        className="md:hidden"
        onClick={onMenuClick}
        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', padding: 6, borderRadius: 'var(--radius)' }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-hover)' }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'none' }}
      >
        <IconMenu />
      </button>

      {/* Title */}
      <h1 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap' }}>
        {title}
      </h1>

      {/* Search */}
      <div style={{ position: 'relative', flex: 1, maxWidth: 340, marginLeft: 8 }}>
        <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)', display: 'flex', pointerEvents: 'none' }}>
          <IconSearch />
        </span>
        <input
          className="nz-input"
          placeholder="Buscar…"
          style={{ paddingLeft: 34 }}
        />
      </div>

      {/* Right actions */}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="nz-btn nz-btn-ghost"
          style={{ padding: '7px 9px' }}
          aria-label="Cambiar tema"
        >
          {theme === 'dark' ? <IconSun /> : <IconMoon />}
        </button>

        {/* Notifications */}
        <button
          className="nz-btn nz-btn-ghost"
          style={{ padding: '7px 9px', position: 'relative' }}
          aria-label="Notificaciones"
        >
          <IconBell />
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute',
              top: 5, right: 5,
              width: 8, height: 8,
              borderRadius: 999,
              background: 'var(--nz-danger)',
              border: '1.5px solid var(--bg)',
            }} />
          )}
        </button>
      </div>
    </header>
  )
}
