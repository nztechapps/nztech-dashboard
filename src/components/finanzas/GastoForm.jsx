import { useState } from 'react';
import DatePicker from '../ui/DatePicker';

const IconX = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const fieldStyle = {
  width: '100%', background: 'var(--surface-2)', border: '1px solid var(--border)',
  borderRadius: 'var(--radius)', padding: '10px 12px', color: 'var(--text)',
  fontSize: 13, boxSizing: 'border-box',
};
const labelStyle = { display: 'block', color: 'var(--text-muted)', fontSize: 12, marginBottom: 6, fontWeight: 500 };

export default function GastoForm({ isOpen, onClose, onSave, isLoading = false }) {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({ fecha: today, concepto: '', categoria: 'herramientas_ia', monto_usd: '', notas: '' });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: name === 'monto_usd' ? parseFloat(value) || '' : value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.concepto.trim()) e.concepto = 'El concepto es requerido';
    if (!form.monto_usd || form.monto_usd <= 0) e.monto_usd = 'Ingresá un monto válido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await onSave({ fecha: form.fecha, concepto: form.concepto.trim(), categoria: form.categoria, monto_usd: form.monto_usd, notas: form.notas.trim() || null });
      setForm({ fecha: today, concepto: '', categoria: 'herramientas_ia', monto_usd: '', notas: '' });
    } catch (err) { console.error(err); }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, right: 0, bottom: 0, width: 400,
      background: 'var(--surface)', borderLeft: '1px solid var(--border)',
      boxShadow: 'var(--shadow-lg)', zIndex: 1000,
      display: 'flex', flexDirection: 'column',
      animation: 'slideIn 0.3s var(--ease-out)',
    }}>
      <style>{`@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>

      <div style={{ padding: 20, borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ color: 'var(--text)', margin: 0, fontSize: 18, fontWeight: 600 }}>Nuevo gasto</h2>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}>
          <IconX />
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ flex: 1, overflow: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <DatePicker value={form.fecha} onChange={(d) => setForm(p => ({ ...p, fecha: d }))} label="Fecha" />
        </div>
        <div>
          <label style={labelStyle}>Concepto *</label>
          <input type="text" name="concepto" value={form.concepto} onChange={handleChange}
            placeholder="Claude Pro — Abril 2026"
            style={{ ...fieldStyle, border: errors.concepto ? '1px solid var(--nz-danger)' : '1px solid var(--border)' }} />
          {errors.concepto && <span style={{ color: 'var(--nz-danger)', fontSize: 11, marginTop: 4, display: 'block' }}>{errors.concepto}</span>}
        </div>
        <div>
          <label style={labelStyle}>Categoría</label>
          <select name="categoria" value={form.categoria} onChange={handleChange} style={fieldStyle}>
            <option value="plataforma">Plataforma</option>
            <option value="herramientas_ia">Herramientas IA</option>
            <option value="equipo">Equipo</option>
            <option value="marketing">Marketing</option>
            <option value="otro">Otro</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>Monto USD *</label>
          <input type="number" name="monto_usd" value={form.monto_usd} onChange={handleChange}
            placeholder="20.00" step="0.01" min="0"
            style={{ ...fieldStyle, border: errors.monto_usd ? '1px solid var(--nz-danger)' : '1px solid var(--border)' }} />
          {errors.monto_usd && <span style={{ color: 'var(--nz-danger)', fontSize: 11, marginTop: 4, display: 'block' }}>{errors.monto_usd}</span>}
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Notas (opcional)</label>
          <textarea name="notas" value={form.notas} onChange={handleChange} placeholder="Notas adicionales..."
            style={{ ...fieldStyle, minHeight: 80, resize: 'vertical', fontFamily: 'var(--font-mono)' }} />
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" onClick={onClose} className="nz-btn nz-btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>Cancelar</button>
          <button type="submit" disabled={isLoading} className="nz-btn nz-btn-primary" style={{ flex: 1, justifyContent: 'center', opacity: isLoading ? 0.6 : 1 }}>
            {isLoading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  );
}
