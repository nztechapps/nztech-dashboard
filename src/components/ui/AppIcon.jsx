export default function AppIcon({ nombre, icono_url, size = 36 }) {
  const initials = (nombre || 'App').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div style={{
      width: size, height: size,
      background: 'var(--primary-soft)',
      borderRadius: 'var(--radius)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0, overflow: 'hidden',
    }}>
      {icono_url ? (
        <img src={icono_url} alt={nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <span style={{ color: 'var(--primary)', fontFamily: 'var(--font-mono)', fontSize: Math.max(size / 2.5, 11), fontWeight: 700 }}>
          {initials}
        </span>
      )}
    </div>
  );
}
