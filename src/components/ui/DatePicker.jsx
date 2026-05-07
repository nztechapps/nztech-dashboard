import { useState, useRef, useEffect } from 'react';

const IconCalendar = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const IconChevL = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);
const IconChevR = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

const DAYS = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

export default function DatePicker({ value, onChange, label, placeholder = 'Seleccionar fecha' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [current, setCurrent] = useState(value ? new Date(value + 'T00:00:00') : new Date());
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const fmt = (d) => {
    const [y,m,day] = d.split('-');
    return `${day}/${m}/${y}`;
  };
  const toStr = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

  const daysInMonth = (d) => new Date(d.getFullYear(), d.getMonth()+1, 0).getDate();
  const firstDay = (d) => new Date(d.getFullYear(), d.getMonth(), 1).getDay();

  const open = () => {
    if (inputRef.current) {
      const r = inputRef.current.getBoundingClientRect();
      const below = window.innerHeight - r.bottom >= 300;
      setPos({ top: below ? r.bottom + 4 : 'auto', bottom: below ? 'auto' : window.innerHeight - r.top + 4, left: r.left });
    }
    setIsOpen(o => !o);
  };

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  const days = [];
  const prev = new Date(current.getFullYear(), current.getMonth()-1, 1);
  const prevDays = daysInMonth(prev);
  for (let i = firstDay(current)-1; i >= 0; i--)
    days.push({ day: prevDays-i, cur: false, date: new Date(prev.getFullYear(), prev.getMonth(), prevDays-i) });
  for (let i = 1; i <= daysInMonth(current); i++)
    days.push({ day: i, cur: true, date: new Date(current.getFullYear(), current.getMonth(), i) });
  const rem = 42 - days.length;
  const next = new Date(current.getFullYear(), current.getMonth()+1, 1);
  for (let i = 1; i <= rem; i++)
    days.push({ day: i, cur: false, date: new Date(next.getFullYear(), next.getMonth(), i) });

  const today = new Date(); today.setHours(0,0,0,0);

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      {label && (
        <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: 11, marginBottom: 6, fontWeight: 500 }}>
          {label}
        </label>
      )}
      <div
        ref={inputRef}
        onClick={open}
        className="nz-input"
        style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: value ? 'var(--text)' : 'var(--text-subtle)' }}
      >
        <span style={{ flex: 1 }}>{value ? fmt(value) : placeholder}</span>
        <IconCalendar />
      </div>

      {isOpen && (
        <div style={{
          position: 'fixed',
          top: pos.top === 'auto' ? 'auto' : pos.top,
          bottom: pos.bottom === 'auto' ? 'auto' : pos.bottom,
          left: pos.left,
          background: 'var(--surface)',
          border: '1px solid var(--border-strong)',
          borderRadius: 'var(--radius-lg)',
          padding: 16, zIndex: 9999,
          minWidth: 280,
          boxShadow: 'var(--shadow-lg)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <button onClick={() => setCurrent(new Date(current.getFullYear(), current.getMonth()-1, 1))}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}>
              <IconChevL />
            </button>
            <span style={{ color: 'var(--text)', fontSize: 14, fontWeight: 500 }}>
              {MONTHS[current.getMonth()]} {current.getFullYear()}
            </span>
            <button onClick={() => setCurrent(new Date(current.getFullYear(), current.getMonth()+1, 1))}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}>
              <IconChevR />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 8 }}>
            {DAYS.map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-subtle)', fontWeight: 500, paddingBottom: 4 }}>{d}</div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
            {days.map((d, i) => {
              const sel = value === toStr(d.date);
              const isToday = d.date.getTime() === today.getTime();
              return (
                <button key={i}
                  onClick={() => { if (d.cur) { onChange(toStr(d.date)); setIsOpen(false); } }}
                  style={{
                    width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: isToday && !sel ? '1px solid var(--border-strong)' : 'none',
                    background: sel ? 'var(--primary)' : 'transparent',
                    color: sel ? 'var(--primary-fg)' : d.cur ? 'var(--text)' : 'var(--text-subtle)',
                    borderRadius: '50%', cursor: d.cur ? 'pointer' : 'default',
                    fontSize: 13, fontWeight: sel || isToday ? 600 : 400, padding: 0,
                  }}
                  onMouseEnter={(e) => { if (d.cur && !sel) e.currentTarget.style.background = 'var(--surface-hover)'; }}
                  onMouseLeave={(e) => { if (!sel) e.currentTarget.style.background = 'transparent'; }}
                >
                  {d.day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
