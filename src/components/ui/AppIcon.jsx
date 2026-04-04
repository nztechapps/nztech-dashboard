export default function AppIcon({ nombre, icono_url, size = 36 }) {
  const getInitials = (name) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: '#1C1C26',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        overflow: 'hidden',
      }}
    >
      {icono_url ? (
        <img
          src={icono_url}
          alt={nombre}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      ) : (
        <span
          style={{
            color: '#00E5A0',
            fontFamily: 'DM Mono',
            fontSize: `${Math.max(size / 2, 12)}px`,
            fontWeight: '600',
          }}
        >
          {getInitials(nombre || 'App')}
        </span>
      )}
    </div>
  );
}
