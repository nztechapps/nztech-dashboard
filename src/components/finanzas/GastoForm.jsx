import { useState } from 'react';
import DatePicker from '../ui/DatePicker';

const IconX = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

export default function GastoForm({ isOpen, onClose, onSave, isLoading = false }) {
  const today = new Date().toISOString().split('T')[0];
  const [formData, setFormData] = useState({
    fecha: today,
    concepto: '',
    categoria: 'herramientas_ia',
    monto_usd: '',
    notas: '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'monto_usd' ? parseFloat(value) || '' : value,
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.concepto.trim()) {
      newErrors.concepto = 'El concepto es requerido';
    }
    if (!formData.monto_usd || formData.monto_usd <= 0) {
      newErrors.monto_usd = 'Ingresá un monto válido';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }
    try {
      await onSave({
        fecha: formData.fecha,
        concepto: formData.concepto.trim(),
        categoria: formData.categoria,
        monto_usd: formData.monto_usd,
        notas: formData.notas.trim() || null,
      });
      setFormData({
        fecha: today,
        concepto: '',
        categoria: 'herramientas_ia',
        monto_usd: '',
        notas: '',
      });
    } catch (err) {
      console.error('Error al guardar gasto:', err);
    }
  };

  const categoryColors = {
    plataforma: { bg: 'rgba(100,150,255,0.12)', text: '#6496FF' },
    herramientas_ia: { bg: 'rgba(124,106,255,0.12)', text: '#7C6AFF' },
    equipo: { bg: 'rgba(255,180,0,0.12)', text: '#FFB400' },
    marketing: { bg: 'rgba(0,229,160,0.12)', text: '#00E5A0' },
    otro: { bg: 'rgba(155,155,155,0.12)', text: '#9B9B9B' },
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      bottom: 0,
      width: '400px',
      backgroundColor: '#13131A',
      borderLeft: '1px solid rgba(255,255,255,0.08)',
      boxShadow: '-4px 0 16px rgba(0,0,0,0.4)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      animation: 'slideIn 0.3s ease-out',
    }}>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>

      {/* Header */}
      <div style={{
        padding: '20px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <h2 style={{ color: 'white', margin: 0, fontSize: '18px', fontWeight: '600' }}>
          Nuevo gasto
        </h2>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#999',
            cursor: 'pointer',
            padding: '0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <IconX />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ flex: 1, overflow: 'auto', padding: '20px', display: 'flex', flexDirection: 'column' }}>
        {/* Fecha */}
        <div style={{ marginBottom: '20px' }}>
          <DatePicker value={formData.fecha} onChange={(date) => setFormData(prev => ({ ...prev, fecha: date }))} label="Fecha" />
        </div>

        {/* Concepto */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', color: '#999', fontSize: '12px', marginBottom: '6px', fontWeight: '500' }}>
            Concepto *
          </label>
          <input
            type="text"
            name="concepto"
            value={formData.concepto}
            onChange={handleChange}
            placeholder="Claude Pro — Abril 2026"
            style={{
              width: '100%',
              backgroundColor: '#13131A',
              border: errors.concepto ? '1px solid #FF4D4F' : '1px solid rgba(255,255,255,0.08)',
              borderRadius: '6px',
              padding: '10px',
              color: 'white',
              fontSize: '13px',
              boxSizing: 'border-box',
            }}
          />
          {errors.concepto && <span style={{ color: '#FF4D4F', fontSize: '11px', marginTop: '4px', display: 'block' }}>{errors.concepto}</span>}
        </div>

        {/* Categoría */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', color: '#999', fontSize: '12px', marginBottom: '6px', fontWeight: '500' }}>
            Categoría
          </label>
          <select
            name="categoria"
            value={formData.categoria}
            onChange={handleChange}
            style={{
              width: '100%',
              backgroundColor: '#13131A',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '6px',
              padding: '10px',
              color: 'white',
              fontSize: '13px',
              boxSizing: 'border-box',
            }}
          >
            <option value="plataforma">Plataforma</option>
            <option value="herramientas_ia">Herramientas IA</option>
            <option value="equipo">Equipo</option>
            <option value="marketing">Marketing</option>
            <option value="otro">Otro</option>
          </select>
        </div>

        {/* Monto */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', color: '#999', fontSize: '12px', marginBottom: '6px', fontWeight: '500' }}>
            Monto USD *
          </label>
          <input
            type="number"
            name="monto_usd"
            value={formData.monto_usd}
            onChange={handleChange}
            placeholder="20.00"
            step="0.01"
            min="0"
            style={{
              width: '100%',
              backgroundColor: '#13131A',
              border: errors.monto_usd ? '1px solid #FF4D4F' : '1px solid rgba(255,255,255,0.08)',
              borderRadius: '6px',
              padding: '10px',
              color: 'white',
              fontSize: '13px',
              boxSizing: 'border-box',
            }}
          />
          {errors.monto_usd && <span style={{ color: '#FF4D4F', fontSize: '11px', marginTop: '4px', display: 'block' }}>{errors.monto_usd}</span>}
        </div>

        {/* Notas */}
        <div style={{ marginBottom: '20px', flex: 1 }}>
          <label style={{ display: 'block', color: '#999', fontSize: '12px', marginBottom: '6px', fontWeight: '500' }}>
            Notas (opcional)
          </label>
          <textarea
            name="notas"
            value={formData.notas}
            onChange={handleChange}
            placeholder="Notas adicionales..."
            style={{
              width: '100%',
              backgroundColor: '#13131A',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '6px',
              padding: '10px',
              color: 'white',
              fontSize: '13px',
              boxSizing: 'border-box',
              minHeight: '80px',
              resize: 'vertical',
              fontFamily: 'DM Mono, monospace',
            }}
          />
        </div>

        {/* Botones */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: 'transparent',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#999',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: '#00E5A0',
              border: 'none',
              color: '#0A0A0F',
              borderRadius: '6px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              opacity: isLoading ? 0.6 : 1,
            }}
          >
            {isLoading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  );
}
