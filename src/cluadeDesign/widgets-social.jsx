/* global React */
const { useState, useMemo } = React;

/* =====================================================
   Helpers
   ===================================================== */
const fmtNumber = (n) => {
  if (n >= 1_000_000) return (n/1_000_000).toFixed(1).replace(/\.0$/,'') + 'M';
  if (n >= 1_000)     return (n/1_000).toFixed(1).replace(/\.0$/,'') + 'K';
  return String(n);
};

/* =====================================================
   KPI strip
   ===================================================== */
const KPIS = [
  { id: 'revenue', label: 'MRR Estimado', value: '$24.8K', delta: 12.4, dir: 'up', spark: [10,12,11,15,18,17,21,24] },
  { id: 'leads',   label: 'Leads Activos', value: '142',   delta: 8.1,  dir: 'up', spark: [80,90,88,100,110,120,135,142] },
  { id: 'tasks',   label: 'Tareas Abiertas', value: '37', delta: -4.2, dir: 'down', spark: [50,48,46,44,42,40,38,37] },
  { id: 'eng',     label: 'Engagement Rate', value: '6.8%', delta: 1.3,  dir: 'up', spark: [4,4.5,5,5.2,5.8,6.1,6.5,6.8] },
];

function Sparkline({ data, color = 'var(--primary)' }) {
  const w = 80, h = 28, p = 2;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v,i) => {
    const x = p + (i/(data.length-1)) * (w-2*p);
    const y = h - p - ((v-min)/range) * (h-2*p);
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: 'block' }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function KPICard({ k }) {
  const positive = k.dir === 'up';
  return (
    <div className="nz-card" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{k.label}</div>
        <span className="nz-pill" style={{
          color: positive ? 'var(--nz-success)' : 'var(--nz-danger)',
          background: 'transparent', borderColor: 'transparent', padding: '2px 0', fontWeight: 600,
        }}>
          {positive ? <IconArrowUp /> : <IconArrowDown />}
          {Math.abs(k.delta)}%
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ fontSize: 26, fontWeight: 600, color: 'var(--text)', fontFeatureSettings: '"tnum"', fontVariantNumeric: 'tabular-nums' }}>{k.value}</div>
        <Sparkline data={k.spark} color={positive ? 'var(--primary)' : 'var(--nz-danger)'} />
      </div>
    </div>
  );
}

/* =====================================================
   Social Media Insights
   ===================================================== */
const SOCIAL_DATA = {
  '7d': [
    { d: 'Lun', followers: 120, eng: 4.2, reach: 8200 },
    { d: 'Mar', followers: 180, eng: 4.8, reach: 9100 },
    { d: 'Mié', followers: 240, eng: 5.1, reach: 10400 },
    { d: 'Jue', followers: 320, eng: 5.6, reach: 12800 },
    { d: 'Vie', followers: 410, eng: 6.0, reach: 14900 },
    { d: 'Sáb', followers: 380, eng: 6.4, reach: 13200 },
    { d: 'Dom', followers: 460, eng: 6.8, reach: 15600 },
  ],
};

const SOCIAL_BREAKDOWN = [
  { id: 'ig', name: 'Instagram', Logo: LogoIG, followers: 12480, delta: 4.2, color: 'oklch(0.62 0.20 350)' },
  { id: 'x',  name: 'X / Twitter', Logo: LogoX, followers: 8210, delta: 1.8, color: 'oklch(0.30 0.012 285)' },
  { id: 'li', name: 'LinkedIn', Logo: LogoLI, followers: 5640, delta: 6.1, color: 'oklch(0.50 0.14 240)' },
  { id: 'tt', name: 'TikTok',   Logo: LogoTT, followers: 21300, delta: 12.7, color: 'oklch(0.55 0.18 200)' },
];

function AreaChart({ data, dataKey = 'followers', height = 200 }) {
  const w = 600, h = height, padX = 36, padY = 18;
  const max = Math.max(...data.map(d => d[dataKey])) * 1.15;
  const min = 0;
  const stepX = (w - padX*2) / (data.length - 1);

  const points = data.map((d, i) => {
    const x = padX + i * stepX;
    const y = h - padY - ((d[dataKey] - min) / (max - min)) * (h - padY*2);
    return { x, y, raw: d };
  });

  const linePath = points.map((p, i) => `${i===0?'M':'L'}${p.x},${p.y}`).join(' ');
  const areaPath = `${linePath} L${points[points.length-1].x},${h-padY} L${points[0].x},${h-padY} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height, display: 'block' }} preserveAspectRatio="none">
      <defs>
        <linearGradient id="nzArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.30"/>
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0"/>
        </linearGradient>
      </defs>
      {[0,1,2,3].map(i => {
        const y = padY + i * ((h - padY*2) / 3);
        return <line key={i} x1={padX} y1={y} x2={w-padX} y2={y} stroke="var(--border)" strokeDasharray="2 4"/>
      })}
      <path d={areaPath} fill="url(#nzArea)"/>
      <path d={linePath} fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      {points.map((p,i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill="var(--surface)" stroke="var(--primary)" strokeWidth="2"/>
      ))}
      {points.map((p,i) => (
        <text key={`t${i}`} x={p.x} y={h-4} textAnchor="middle" fontSize="10" fill="var(--text-subtle)" fontFamily="var(--font-sans)">
          {p.raw.d}
        </text>
      ))}
    </svg>
  );
}

function SocialInsights() {
  const [metric, setMetric] = useState('followers');
  const labels = { followers: 'Seguidores', eng: 'Engagement', reach: 'Reach' };

  return (
    <div className="nz-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16, gridColumn: 'span 2' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 600 }}>Social Media Insights</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginTop: 4 }}>Crecimiento últimos 7 días</div>
        </div>
        <div style={{ display: 'flex', gap: 4, padding: 3, background: 'var(--surface-2)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          {Object.entries(labels).map(([k, v]) => (
            <button key={k} onClick={() => setMetric(k)}
              style={{
                padding: '6px 12px', borderRadius: 6, border: 'none', fontSize: 12, fontWeight: 500,
                background: metric === k ? 'var(--surface)' : 'transparent',
                color: metric === k ? 'var(--text)' : 'var(--text-muted)',
                boxShadow: metric === k ? 'var(--shadow-sm)' : 'none',
                cursor: 'pointer',
              }}>{v}</button>
          ))}
        </div>
      </div>

      <AreaChart data={SOCIAL_DATA['7d']} dataKey={metric} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
        {SOCIAL_BREAKDOWN.map(p => (
          <div key={p.id} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: p.color }}>
              <p.Logo />
              <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{p.name}</span>
            </div>
            <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>{fmtNumber(p.followers)}</div>
            <div style={{ fontSize: 11, color: p.delta > 0 ? 'var(--nz-success)' : 'var(--nz-danger)', fontWeight: 600 }}>
              {p.delta > 0 ? '↑' : '↓'} {Math.abs(p.delta)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =====================================================
   Engagement Mini-card
   ===================================================== */
const ENG_FEED = [
  { id: 1, Logo: LogoIG, text: 'Post "Behind the build #14"', stat: '+418 likes', time: '2h' },
  { id: 2, Logo: LogoLI, text: 'Caso de éxito: SaudePlus', stat: '+62 reposts', time: '6h' },
  { id: 3, Logo: LogoTT, text: 'Reel "Stack que usamos"', stat: '12.4K views', time: '1d' },
  { id: 4, Logo: LogoX,  text: 'Hilo sobre App Factory', stat: '+89 likes', time: '2d' },
];

function EngagementCard() {
  return (
    <div className="nz-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 600 }}>Top Engagement</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginTop: 4 }}>Posts destacados</div>
        </div>
        <button className="nz-btn nz-btn-ghost" style={{ padding: '6px 8px' }}><IconMore /></button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {ENG_FEED.map(item => (
          <div key={item.id} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '10px 4px',
            borderBottom: '1px solid var(--border)',
          }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--surface-2)',
              display: 'grid', placeItems: 'center', color: 'var(--text-muted)', flexShrink: 0 }}>
              <item.Logo />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.text}</div>
              <div style={{ fontSize: 11, color: 'var(--text-subtle)', marginTop: 2 }}>{item.stat} · hace {item.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, {
  KPICard, KPIS, SocialInsights, EngagementCard, Sparkline, AreaChart, fmtNumber,
});
