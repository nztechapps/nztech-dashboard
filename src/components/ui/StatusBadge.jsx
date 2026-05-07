export default function StatusBadge({ status }) {
  const statusConfig = {
    development: { bg: '#F5F3FF', text: '#7C3AED' },
    testing:     { bg: '#FFFBEB', text: '#92400E' },
    published:   { bg: '#ECFDF5', text: '#065F46' },
    deprecated:  { bg: '#FEF2F2', text: '#991B1B' },
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
