import { useState, useEffect } from 'react';

const IconX = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

export default function AppForm({ isOpen, onClose, onSave, initialData = null, isLoading = false }) {
  const [formData, setFormData] = useState({
    nombre: '',
    package: '',
    mercado: 'AR',
    categoria: '',
    status: 'development',
    admob_unit_id: '',
    play_url: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        nombre: '',
        package: '',
        mercado: 'AR',
        categoria: '',
        status: 'development',
        admob_unit_id: '',
        play_url: '',
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.nombre?.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }
    if (!formData.package?.trim()) {
      newErrors.package = 'El package name es requerido';
    } else if (!formData.package.includes('.')) {
      newErrors.package = 'El package debe tener formato com.empresa.app';
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
      await onSave(formData);
      onClose();
    } catch (err) {
      console.error('Error saving app:', err);
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
            {initialData ? 'Editar app' : 'Nueva app'}
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
            <label style={{ display: 'block', color: '#999', fontSize: '12px', marginBottom: '8px' }}>
              Nombre *
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Mi App"
              style={{
                width: '100%',
                backgroundColor: '#13131A',
                border: errors.nombre ? '1px solid #FF4D4F' : '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px',
                padding: '10px 12px',
                color: 'white',
                fontSize: '14px',
                boxSizing: 'border-box',
              }}
            />
            {errors.nombre && <span style={{ color: '#FF4D4F', fontSize: '11px', marginTop: '4px', display: 'block' }}>{errors.nombre}</span>}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#999', fontSize: '12px', marginBottom: '8px' }}>
              Package *
            </label>
            <input
              type="text"
              name="package"
              value={formData.package}
              onChange={handleChange}
              placeholder="com.nztech.appnombre"
              style={{
                width: '100%',
                backgroundColor: '#13131A',
                border: errors.package ? '1px solid #FF4D4F' : '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px',
                padding: '10px 12px',
                color: 'white',
                fontSize: '14px',
                boxSizing: 'border-box',
              }}
            />
            {errors.package && <span style={{ color: '#FF4D4F', fontSize: '11px', marginTop: '4px', display: 'block' }}>{errors.package}</span>}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#999', fontSize: '12px', marginBottom: '8px' }}>
              Mercado
            </label>
            <select
              name="mercado"
              value={formData.mercado}
              onChange={handleChange}
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
            >
              <option value="AR">Argentina</option>
              <option value="MX">México</option>
              <option value="ES">España</option>
              <option value="CL">Chile</option>
              <option value="CO">Colombia</option>
              <option value="PE">Perú</option>
              <option value="global">Global</option>
            </select>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#999', fontSize: '12px', marginBottom: '8px' }}>
              Categoría
            </label>
            <input
              type="text"
              name="categoria"
              value={formData.categoria}
              onChange={handleChange}
              placeholder="finanzas/utilidad/calculadora"
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
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
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
            >
              <option value="development">Development</option>
              <option value="testing">Testing</option>
              <option value="published">Published</option>
              <option value="deprecated">Deprecated</option>
            </select>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#999', fontSize: '12px', marginBottom: '8px' }}>
              AdMob Unit ID
            </label>
            <input
              type="text"
              name="admob_unit_id"
              value={formData.admob_unit_id}
              onChange={handleChange}
              placeholder="ca-app-pub-xxx"
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
              URL Play Store
            </label>
            <input
              type="url"
              name="play_url"
              value={formData.play_url}
              onChange={handleChange}
              placeholder="https://play.google.com/store/apps/details?id=..."
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
