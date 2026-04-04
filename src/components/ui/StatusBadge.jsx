export default function StatusBadge({ status }) {
  const statusConfig = {
    development: {
      bg: 'rgba(255,255,255,0.06)',
      text: 'rgba(255,255,255,0.45)',
    },
    testing: {
      bg: 'rgba(255,180,0,0.12)',
      text: '#FFB400',
    },
    published: {
      bg: 'rgba(0,229,160,0.12)',
      text: '#00E5A0',
    },
    deprecated: {
      bg: 'rgba(255,77,79,0.12)',
      text: '#FF4D4F',
    },
  };

  const config = statusConfig[status] || statusConfig.development;

  return (
    <span
      className="inline-block"
      style={{
        backgroundColor: config.bg,
        color: config.text,
        fontSize: '11px',
        padding: '2px 8px',
        borderRadius: '20px',
        fontWeight: '500',
      }}
    >
      {status}
    </span>
  );
}
