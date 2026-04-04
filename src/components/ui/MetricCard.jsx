export default function MetricCard({ label, value, sub, subColor = 'neutral' }) {
  const subColorClass = {
    'green': 'text-[#00E5A0]',
    'red': 'text-[#FF4D4F]',
    'neutral': 'text-[rgba(255,255,255,0.45)]'
  }[subColor] || 'text-[rgba(255,255,255,0.45)]';

  return (
    <div className="bg-[#13131A] border border-[rgba(255,255,255,0.08)] rounded-[10px] p-4">
      <div className="text-[11px] text-[rgba(255,255,255,0.45)] uppercase tracking-[0.08em] mb-3">
        {label}
      </div>
      <div className="text-[28px] font-medium text-white mb-2" style={{ fontFamily: 'Syne' }}>
        {value}
      </div>
      {sub && (
        <div className={`text-[12px] ${subColorClass}`}>
          {sub}
        </div>
      )}
    </div>
  );
}
