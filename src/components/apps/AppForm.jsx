import { useState, useEffect } from 'react';

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

export default function AppForm({ isOpen, onClose, onSave, initialData = null, isLoading = false }) {
  const [formData, setFormData] = useState({ nombre: '', package: '', mercado: 'AR', categoria: '', status: 'development', admob_unit_id: '', play_url: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setFormData(initialData || { nombre: '', package: '', mercado: 'AR', categoria: '', status: 'development', admob_unit_id: '', play_url: '' });
    setErrors({});
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!formData.nombre?.trim()) e.nombre = 'El nombre es requerido';
    if (!formData.package?.trim()) e.package = 'El package name es requerido';
    else if (!formData.package.includes('.')) e.package = 'Formato: com.empresa.app';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try { await onSave(formData); onClose(); } catch (err) { console.error(err); }
  };

  const labelStyle = { display: 'block', color: 'var(--text-muted)', fontSize: 12, marginBottom: 8 };
  const errStyle = { color: 'var(--nz-danger)', fontSize: 11, marginTop: 4, display: 'block' };

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
          <h2 style={{ color: 'var(--text)', margin: 0, fontSize: 18, fontWeight: 600 }}>
            {initialData ? 'Editar app' : 'Nueva app'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}>
            <IconX />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ flex: 1, overflow: 'auto', padding: 24, display: 'flex', flexDirection: 'column' }}>
          {[
            { name: 'nombre', label: 'Nombre *', type: 'text', placeholder: 'Mi App' },
            { name: 'package', label: 'Package *', type: 'text', placeholder: 'com.nztech.app' },
            { name: 'categoria', label: 'Categoría', type: 'text', placeholder: 'finanzas/utilidad' },
            { name: 'admob_unit_id', label: 'AdMob Unit ID', type: 'text', placeholder: 'ca-app-pub-xxx' },
            { name: 'play_url', label: 'URL Play Store', type: 'url', placeholder: 'https://play.google.com/...' },
          ].map(f => (
            <div key={f.name} style={{ marginBottom: 20 }}>
              <label style={labelStyle}>{f.label}</label>
              <input type={f.type} name={f.name} value={formData[f.name]} onChange={handleChange} placeholder={f.placeholder}
                style={{ ...fieldStyle, border: errors[f.name] ? '1px solid var(--nz-danger)' : '1px solid var(--border)' }} />
              {errors[f.name] && <span style={errStyle}>{errors[f.name]}</span>}
            </div>
          ))}

          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Mercado</label>
            <select name="mercado" value={formData.mercado} onChange={handleChange} style={fieldStyle}>
              {['AR','MX','ES','CL','CO','PE','global'].map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Status</label>
            <select name="status" value={formData.status} onChange={handleChange} style={fieldStyle}>
              <option value="development">Development</option>
              <option value="testing">Testing</option>
              <option value="published">Published</option>
              <option value="deprecated">Deprecated</option>
            </select>
          </div>

          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', gap: 12, borderTop: '1px solid var(--border)', paddingTop: 16, marginTop: 16 }}>
            <button type="button" onClick={onClose} className="nz-btn nz-btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>
              Cancelar
            </button>
            <button type="submit" disabled={isLoading} className="nz-btn nz-btn-primary" style={{ flex: 1, justifyContent: 'center', opacity: isLoading ? 0.6 : 1 }}>
              {isLoading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
