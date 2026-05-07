import { useState, useEffect } from 'react';
import DatePicker from '../ui/DatePicker';

const IconX = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const fieldStyle = {
  width: '100%', background: 'var(--surface-2)', border: '1px solid var(--border)',
  borderRadius: 'var(--radius)', padding: '10px 12px', color: 'var(--text)',
  fontSize: 14, boxSizing: 'border-box',
};

export default function MetricsForm({ isOpen, onClose, onSave, appId, isLoading = false }) {
  const [form, setForm] = useState({ fecha: '', impresiones: '', clicks: '', ingresos: '', dau: '', crash_rate: '', rating: '' });

  useEffect(() => {
    if (isOpen) setForm(p => ({ ...p, fecha: new Date().toISOString().split('T')[0] }));
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fecha) return;
    try {
      await onSave({
        fecha: form.fecha,
        impresiones: parseFloat(form.impresiones) || 0,
        clicks:      parseFloat(form.clicks) || 0,
        ingresos:    parseFloat(form.ingresos) || 0,
        dau:         parseFloat(form.dau) || 0,
        crash_rate:  parseFloat(form.crash_rate) || 0,
        rating:      parseFloat(form.rating) || 0,
      });
      onClose();
    } catch (err) { console.error(err); }
  };

  const labelStyle = { display: 'block', color: 'var(--text-muted)', fontSize: 12, marginBottom: 8 };

  const numFields = [
    { name: 'impresiones', label: 'Impresiones', placeholder: '0' },
    { name: 'clicks',      label: 'Clicks',      placeholder: '0' },
    { name: 'ingresos',    label: 'Ingresos ($)', placeholder: '0.00', step: '0.01' },
    { name: 'dau',         label: 'DAU',          placeholder: '0' },
    { name: 'crash_rate',  label: 'Crash Rate (%)', placeholder: '0.00', step: '0.01' },
    { name: 'rating',      label: 'Rating ⭐',   placeholder: '0.0', step: '0.1', min: '0', max: '5' },
  ];

  return (
    <>
      {isOpen && <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 40 }} />}
      <div style={{
        position: 'fixed', top: 0, right: 0, width: '100%', maxWidth: 450, height: '100vh',
        background: 'var(--surface)', borderLeft: '1px solid var(--border)',
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s var(--ease-out)',
        zIndex: 50, display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ borderBottom: '1px solid var(--border)', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ color: 'var(--text)', margin: 0, fontSize: 18, fontWeight: 600 }}>Cargar métricas</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}>
            <IconX />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ flex: 1, overflow: 'auto', padding: 24, display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: 20 }}>
            <DatePicker value={form.fecha} onChange={(d) => setForm(p => ({ ...p, fecha: d }))} label="Fecha *" />
          </div>
          {numFields.map(f => (
            <div key={f.name} style={{ marginBottom: 20 }}>
              <label style={labelStyle}>{f.label}</label>
              <input type="number" name={f.name} value={form[f.name]} onChange={handleChange}
                placeholder={f.placeholder} step={f.step} min={f.min} max={f.max} style={fieldStyle} />
            </div>
          ))}
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', gap: 12, borderTop: '1px solid var(--border)', paddingTop: 16, marginTop: 16 }}>
            <button type="button" onClick={onClose} className="nz-btn nz-btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>Cancelar</button>
            <button type="submit" disabled={isLoading} className="nz-btn nz-btn-primary" style={{ flex: 1, justifyContent: 'center', opacity: isLoading ? 0.6 : 1 }}>
              {isLoading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
