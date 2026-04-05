import { useState, useEffect } from 'react';
import DatePicker from '../ui/DatePicker';

const IconX = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

export default function MetricsForm({ isOpen, onClose, onSave, appId, isLoading = false }) {
  const [formData, setFormData] = useState({
    fecha: '',
    impresiones: '',
    clicks: '',
    ingresos: '',
    dau: '',
    crash_rate: '',
    rating: '',
  });

  useEffect(() => {
    if (isOpen) {
      const today = new Date().toISOString().split('T')[0];
      setFormData((prev) => ({
        ...prev,
        fecha: today,
      }));
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fecha) {
      return;
    }

    const dataToSave = {
      fecha: formData.fecha,
      impresiones: formData.impresiones ? parseFloat(formData.impresiones) : 0,
      clicks: formData.clicks ? parseFloat(formData.clicks) : 0,
      ingresos: formData.ingresos ? parseFloat(formData.ingresos) : 0,
      dau: formData.dau ? parseFloat(formData.dau) : 0,
      crash_rate: formData.crash_rate ? parseFloat(formData.crash_rate) : 0,
      rating: formData.rating ? parseFloat(formData.rating) : 0,
    };

    try {
      await onSave(dataToSave);
      onClose();
    } catch (err) {
      console.error('Error saving metric:', err);
    }
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.4)',
            zIndex: 40,
          }}
        />
      )}

      {/* Panel */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '100%',
          maxWidth: '450px',
          height: '100vh',
          backgroundColor: '#0A0A0F',
          borderLeft: '1px solid rgba(255,255,255,0.08)',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s ease-out',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          style={{
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            padding: '16px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h2 style={{ color: 'white', margin: 0, fontSize: '18px', fontWeight: '600' }}>
            Cargar métricas
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255,255,255,0.45)',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IconX />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          style={{
            flex: 1,
            overflow: 'auto',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ marginBottom: '20px' }}>
            <DatePicker value={formData.fecha} onChange={(date) => setFormData(prev => ({ ...prev, fecha: date }))} label="Fecha *" />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#999', fontSize: '12px', marginBottom: '8px' }}>
              Impresiones
            </label>
            <input
              type="number"
              name="impresiones"
              value={formData.impresiones}
              onChange={handleChange}
              placeholder="0"
              style={{
                width: '100%',
                backgroundColor: '#13131A',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px',
                padding: '10px 12px',
                color: 'white',
                fontSize: '14px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#999', fontSize: '12px', marginBottom: '8px' }}>
              Clicks
            </label>
            <input
              type="number"
              name="clicks"
              value={formData.clicks}
              onChange={handleChange}
              placeholder="0"
              style={{
                width: '100%',
                backgroundColor: '#13131A',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px',
                padding: '10px 12px',
                color: 'white',
                fontSize: '14px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#999', fontSize: '12px', marginBottom: '8px' }}>
              Ingresos ($)
            </label>
            <input
              type="number"
              name="ingresos"
              value={formData.ingresos}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              style={{
                width: '100%',
                backgroundColor: '#13131A',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px',
                padding: '10px 12px',
                color: 'white',
                fontSize: '14px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#999', fontSize: '12px', marginBottom: '8px' }}>
              DAU (Daily Active Users)
            </label>
            <input
              type="number"
              name="dau"
              value={formData.dau}
              onChange={handleChange}
              placeholder="0"
              style={{
                width: '100%',
                backgroundColor: '#13131A',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px',
                padding: '10px 12px',
                color: 'white',
                fontSize: '14px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#999', fontSize: '12px', marginBottom: '8px' }}>
              Crash Rate (%)
            </label>
            <input
              type="number"
              name="crash_rate"
              value={formData.crash_rate}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              style={{
                width: '100%',
                backgroundColor: '#13131A',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px',
                padding: '10px 12px',
                color: 'white',
                fontSize: '14px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#999', fontSize: '12px', marginBottom: '8px' }}>
              Rating (⭐)
            </label>
            <input
              type="number"
              name="rating"
              value={formData.rating}
              onChange={handleChange}
              placeholder="0.0"
              step="0.1"
              min="0"
              max="5"
              style={{
                width: '100%',
                backgroundColor: '#13131A',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px',
                padding: '10px 12px',
                color: 'white',
                fontSize: '14px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ flex: 1 }} />

          {/* Botones */}
          <div
            style={{
              display: 'flex',
              gap: '12px',
              borderTop: '1px solid rgba(255,255,255,0.08)',
              paddingTop: '16px',
              marginTop: '16px',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '10px 16px',
                backgroundColor: 'transparent',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.45)',
                borderRadius: '8px',
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
                padding: '10px 16px',
                backgroundColor: '#00E5A0',
                border: 'none',
                color: '#0A0A0F',
                borderRadius: '8px',
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
    </>
  );
}
