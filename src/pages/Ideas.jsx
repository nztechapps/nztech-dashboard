import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIdeas } from '../hooks/useIdeas';
import ToastNotification from '../components/ui/ToastNotification';
import DatePicker from '../components/ui/DatePicker';

const IconLightbulb = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>
);

const IconPlus = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const IconX = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const IconRocket = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4.5 16.5c-1.5-1.5-2-3.5-2-5.5 0-4.5 3.5-8 8-8s8 3.5 8 8-3.5 8-8 8c-2 0-4-0.5-5.5-2"></path>
    <polyline points="12 4 12 12 9 12"></polyline>
  </svg>
);

const getStatusColor = (estado) => {
  switch (estado) {
    case 'idea':
      return '#999';
    case 'investigando':
      return '#6496FF';
    case 'aprobada':
      return '#00E5A0';
    case 'descartada':
      return '#FF4D4F';
    default:
      return '#999';
  }
};

const StarRating = ({ value, onChange, disabled = false }) => (
  <div style={{ display: 'flex', gap: '4px' }}>
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        onClick={() => !disabled && onChange(star)}
        style={{
          background: 'none',
          border: 'none',
          fontSize: '20px',
          cursor: disabled ? 'default' : 'pointer',
          opacity: star <= value ? 1 : 0.3,
        }}
      >
        ★
      </button>
    ))}
  </div>
);

function IdeaModal({ idea, isOpen, onClose }) {
  if (!isOpen || !idea) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#13131A',
          borderRadius: '12px',
          padding: '24px',
          maxWidth: '500px',
          width: '100%',
          maxHeight: '80vh',
          overflow: 'auto',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <h2 style={{ color: 'white', margin: 0, fontSize: '18px', fontWeight: '600' }}>
            {idea.titulo}
          </h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', padding: 0 }}
          >
            <IconX />
          </button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
            <span
              style={{
                backgroundColor: 'rgba(0,229,160,0.12)',
                color: getStatusColor(idea.estado),
                fontSize: '11px',
                fontWeight: '600',
                padding: '4px 8px',
                borderRadius: '4px',
              }}
            >
              {idea.estado}
            </span>
            {idea.categoria && (
              <span
                style={{
                  backgroundColor: 'rgba(124,106,255,0.12)',
                  color: '#7C6AFF',
                  fontSize: '11px',
                  fontWeight: '600',
                  padding: '4px 8px',
                  borderRadius: '4px',
                }}
              >
                {idea.categoria}
              </span>
            )}
            {idea.mercado && (
              <span
                style={{
                  backgroundColor: 'rgba(100,150,255,0.12)',
                  color: '#6496FF',
                  fontSize: '11px',
                  fontWeight: '600',
                  padding: '4px 8px',
                  borderRadius: '4px',
                }}
              >
                {idea.mercado}
              </span>
            )}
          </div>

          {idea.descripcion && (
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', margin: '0 0 12px 0', whiteSpace: 'pre-wrap' }}>
              {idea.descripcion}
            </p>
          )}

          {idea.prioridad && (
            <div style={{ marginBottom: '12px' }}>
              <div style={{ color: '#999', fontSize: '11px', marginBottom: '4px' }}>Prioridad</div>
              <StarRating value={idea.prioridad} onChange={() => {}} disabled />
            </div>
          )}

          {idea.notas && (
            <div style={{ marginBottom: '12px' }}>
              <div style={{ color: '#999', fontSize: '11px', marginBottom: '4px' }}>Notas</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', fontFamily: 'DM Mono, monospace', whiteSpace: 'pre-wrap' }}>
                {idea.notas}
              </div>
            </div>
          )}
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px', display: 'flex', gap: '12px' }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '10px',
              backgroundColor: 'transparent',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#999',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '600',
            }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

function NewIdeaModal({ isOpen, onClose, onSubmit, isLoading }) {
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    publico: '',
    mercado: '',
    categoria: '',
    prioridad: 3,
    notas: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.titulo.trim()) return;
    try {
      await onSubmit(formData);
      setFormData({
        titulo: '',
        descripcion: '',
        publico: '',
        mercado: '',
        categoria: '',
        prioridad: 3,
        notas: '',
      });
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#13131A',
          borderRadius: '12px',
          padding: '24px',
          maxWidth: '500px',
          width: '100%',
          maxHeight: '80vh',
          overflow: 'auto',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ color: 'white', margin: 0, fontSize: '18px', fontWeight: '600' }}>
            Nueva idea
          </h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', padding: 0 }}
          >
            <IconX />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', color: '#999', fontSize: '11px', marginBottom: '6px', fontWeight: '500' }}>
              Título *
            </label>
            <input
              type="text"
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              placeholder="Nombre de la idea"
              style={{
                width: '100%',
                backgroundColor: '#0A0A0F',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '6px',
                padding: '10px 12px',
                color: 'white',
                fontSize: '13px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', color: '#999', fontSize: '11px', marginBottom: '6px', fontWeight: '500' }}>
              Descripción
            </label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              placeholder="Describe la idea"
              style={{
                width: '100%',
                backgroundColor: '#0A0A0F',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '6px',
                padding: '10px 12px',
                color: 'white',
                fontSize: '13px',
                boxSizing: 'border-box',
                minHeight: '80px',
                fontFamily: 'DM Mono, monospace',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', color: '#999', fontSize: '11px', marginBottom: '6px', fontWeight: '500' }}>
                Público
              </label>
              <input
                type="text"
                value={formData.publico}
                onChange={(e) => setFormData({ ...formData, publico: e.target.value })}
                placeholder="Ej: desarrolladores"
                style={{
                  width: '100%',
                  backgroundColor: '#0A0A0F',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '6px',
                  padding: '10px 12px',
                  color: 'white',
                  fontSize: '13px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', color: '#999', fontSize: '11px', marginBottom: '6px', fontWeight: '500' }}>
                Mercado
              </label>
              <input
                type="text"
                value={formData.mercado}
                onChange={(e) => setFormData({ ...formData, mercado: e.target.value })}
                placeholder="Ej: argentina"
                style={{
                  width: '100%',
                  backgroundColor: '#0A0A0F',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '6px',
                  padding: '10px 12px',
                  color: 'white',
                  fontSize: '13px',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', color: '#999', fontSize: '11px', marginBottom: '6px', fontWeight: '500' }}>
              Categoría
            </label>
            <input
              type="text"
              value={formData.categoria}
              onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
              placeholder="Ej: productividad"
              style={{
                width: '100%',
                backgroundColor: '#0A0A0F',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '6px',
                padding: '10px 12px',
                color: 'white',
                fontSize: '13px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', color: '#999', fontSize: '11px', marginBottom: '6px', fontWeight: '500' }}>
              Prioridad
            </label>
            <StarRating value={formData.prioridad} onChange={(val) => setFormData({ ...formData, prioridad: val })} />
          </div>

          <div>
            <label style={{ display: 'block', color: '#999', fontSize: '11px', marginBottom: '6px', fontWeight: '500' }}>
              Notas
            </label>
            <textarea
              value={formData.notas}
              onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
              placeholder="Notas adicionales"
              style={{
                width: '100%',
                backgroundColor: '#0A0A0F',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '6px',
                padding: '10px 12px',
                color: 'white',
                fontSize: '13px',
                boxSizing: 'border-box',
                minHeight: '60px',
                fontFamily: 'DM Mono, monospace',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '10px',
                backgroundColor: 'transparent',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#999',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '600',
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '10px',
                backgroundColor: '#00E5A0',
                border: 'none',
                color: '#0A0A0F',
                borderRadius: '6px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontSize: '13px',
                fontWeight: '600',
                opacity: isLoading ? 0.6 : 1,
              }}
            >
              {isLoading ? 'Guardando...' : 'Crear idea'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Ideas() {
  const navigate = useNavigate();
  const { ideas, loading, createIdea } = useIdeas();
  const [isNewIdeaOpen, setIsNewIdeaOpen] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [filterEstado, setFilterEstado] = useState('');
  const [filterCategoria, setFilterCategoria] = useState('');
  const [filterMercado, setFilterMercado] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [toast, setToast] = useState(null);

  const filteredIdeas = ideas.filter((idea) => {
    if (filterEstado && idea.estado !== filterEstado) return false;
    if (filterCategoria && idea.categoria !== filterCategoria) return false;
    if (filterMercado && idea.mercado !== filterMercado) return false;
    return true;
  });

  const handleCreateIdea = async (formData) => {
    try {
      setIsCreating(true);
      await createIdea(formData);
      setIsNewIdeaOpen(false);
      setToast({ message: 'Idea creada', type: 'success' });
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setIsCreating(false);
    }
  };

  const parseCsvLine = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const handleCsvImport = async (file) => {
    try {
      const text = await file.text();
      const lines = text.split('\n').filter((l) => l.trim());

      if (lines.length < 2) {
        setToast({ message: 'El CSV debe contener al menos una fila de datos', type: 'error' });
        return;
      }

      const headers = parseCsvLine(lines[0]);
      const validCategories = [
        'datos-gubernamentales-ar',
        'finanzas-ar',
        'utilidad-global',
        'salud',
        'productividad',
        'info-ar',
      ];

      let successCount = 0;
      let errorCount = 0;
      const errors = [];

      for (let i = 1; i < lines.length; i++) {
        try {
          const values = parseCsvLine(lines[i]);
          const row = {};
          headers.forEach((header, idx) => {
            row[header] = values[idx] || '';
          });

          if (!row.titulo || !row.titulo.trim()) {
            errors.push(`Fila ${i + 1}: falta el título`);
            errorCount++;
            continue;
          }

          const prioridad = parseInt(row.prioridad) || 3;
          if (prioridad < 1 || prioridad > 5) {
            errors.push(`Fila ${i + 1}: prioridad debe ser entre 1 y 5`);
            errorCount++;
            continue;
          }

          if (row.categoria && !validCategories.includes(row.categoria)) {
            errors.push(`Fila ${i + 1}: categoría inválida`);
            errorCount++;
            continue;
          }

          await createIdea({
            titulo: row.titulo.trim(),
            descripcion: row.descripcion || null,
            publico: row.publico || null,
            mercado: row.mercado || null,
            categoria: row.categoria || null,
            prioridad: prioridad,
            notas: row.notas || null,
            estado: 'idea',
          });
          successCount++;
        } catch (err) {
          errors.push(`Fila ${i + 1}: ${err.message}`);
          errorCount++;
        }
      }

      const message = `${successCount} ideas importadas correctamente${errorCount > 0 ? `, ${errorCount} errores` : ''}`;
      setToast({
        message,
        type: errorCount > 0 && successCount === 0 ? 'error' : 'success',
      });
    } catch (err) {
      setToast({ message: 'Error al leer el archivo CSV', type: 'error' });
    }
  };

  const downloadTemplate = () => {
    const template = `titulo,descripcion,publico,categoria,mercado,prioridad,notas
"Mi app de ejemplo","Descripción de la app","Usuarios argentinos","utilidad-global","argentina",3,"Notas opcionales"`;

    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.setAttribute('href', URL.createObjectURL(blob));
    link.setAttribute('download', 'ideas_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const categories = [...new Set(ideas.map((i) => i.categoria).filter(Boolean))];
  const mercados = [...new Set(ideas.map((i) => i.mercado).filter(Boolean))];

  return (
    <div style={{ backgroundColor: '#0A0A0F', minHeight: '100vh', padding: '24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <IconLightbulb style={{ color: '#00E5A0' }} />
              <h1 style={{ color: 'white', fontSize: '28px', fontWeight: '600', margin: 0 }}>
                Ideas
              </h1>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <input
                type="file"
                ref={(el) => {
                  if (el) el.id = 'csv-input';
                }}
                accept=".csv"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleCsvImport(file);
                  e.target.value = '';
                }}
              />
              <button
                onClick={() => document.getElementById('csv-input')?.click()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  backgroundColor: 'transparent',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: '#999',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '600',
                }}
              >
                Importar CSV
              </button>
              <button
                onClick={downloadTemplate}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  backgroundColor: 'transparent',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: '#999',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '600',
                }}
              >
                Template
              </button>
              <button
                onClick={() => setIsNewIdeaOpen(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  backgroundColor: '#00E5A0',
                  border: 'none',
                  color: '#0A0A0F',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '600',
                }}
              >
                <IconPlus /> Nueva idea
              </button>
            </div>
          </div>
          <p style={{ color: '#999', fontSize: '13px', margin: 0 }}>
            Gestiona todas tus ideas para futuras apps
          </p>
        </div>

        {/* Filtros */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '24px' }}>
          <div>
            <label style={{ display: 'block', color: '#999', fontSize: '11px', marginBottom: '6px', fontWeight: '500' }}>
              Estado
            </label>
            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: '#13131A',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '6px',
                padding: '10px 12px',
                color: 'white',
                fontSize: '13px',
              }}
            >
              <option value="">Todos</option>
              <option value="idea">Idea</option>
              <option value="investigando">Investigando</option>
              <option value="aprobada">Aprobada</option>
              <option value="descartada">Descartada</option>
            </select>
          </div>

          {categories.length > 0 && (
            <div>
              <label style={{ display: 'block', color: '#999', fontSize: '11px', marginBottom: '6px', fontWeight: '500' }}>
                Categoría
              </label>
              <select
                value={filterCategoria}
                onChange={(e) => setFilterCategoria(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: '#13131A',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '6px',
                  padding: '10px 12px',
                  color: 'white',
                  fontSize: '13px',
                }}
              >
                <option value="">Todas</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          )}

          {mercados.length > 0 && (
            <div>
              <label style={{ display: 'block', color: '#999', fontSize: '11px', marginBottom: '6px', fontWeight: '500' }}>
                Mercado
              </label>
              <select
                value={filterMercado}
                onChange={(e) => setFilterMercado(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: '#13131A',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '6px',
                  padding: '10px 12px',
                  color: 'white',
                  fontSize: '13px',
                }}
              >
                <option value="">Todos</option>
                {mercados.map((merc) => (
                  <option key={merc} value={merc}>
                    {merc}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Grid de ideas */}
        {loading ? (
          <div style={{ color: '#999', textAlign: 'center', padding: '40px 0' }}>
            Cargando...
          </div>
        ) : filteredIdeas.length === 0 ? (
          <div
            style={{
              backgroundColor: '#13131A',
              border: '1px dashed rgba(255,255,255,0.12)',
              borderRadius: '10px',
              padding: '40px 20px',
              textAlign: 'center',
            }}
          >
            <p style={{ color: '#666', margin: 0, fontSize: '13px' }}>
              {ideas.length === 0 ? 'No hay ideas aún' : 'No hay ideas que coincidan con los filtros'}
            </p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '16px',
            }}
          >
            {filteredIdeas.map((idea) => (
              <button
                key={idea.id}
                onClick={() => {
                  setSelectedIdea(idea);
                  setIsDetailOpen(true);
                }}
                style={{
                  background: 'none',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '8px',
                  padding: '16px',
                  backgroundColor: '#13131A',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#1C1C26';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#13131A';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                }}
              >
                <h3 style={{ color: 'white', margin: '0 0 8px 0', fontSize: '14px', fontWeight: '600' }}>
                  {idea.titulo}
                </h3>

                {idea.descripcion && (
                  <p
                    style={{
                      color: 'rgba(255,255,255,0.6)',
                      margin: '0 0 12px 0',
                      fontSize: '12px',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {idea.descripcion}
                  </p>
                )}

                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                  <span
                    style={{
                      backgroundColor: 'rgba(0,229,160,0.12)',
                      color: getStatusColor(idea.estado),
                      fontSize: '10px',
                      fontWeight: '600',
                      padding: '4px 8px',
                      borderRadius: '4px',
                    }}
                  >
                    {idea.estado || 'idea'}
                  </span>
                  {idea.categoria && (
                    <span
                      style={{
                        backgroundColor: 'rgba(124,106,255,0.12)',
                        color: '#7C6AFF',
                        fontSize: '10px',
                        fontWeight: '600',
                        padding: '4px 8px',
                        borderRadius: '4px',
                      }}
                    >
                      {idea.categoria}
                    </span>
                  )}
                </div>

                {idea.prioridad && (
                  <div style={{ display: 'flex', gap: '2px', fontSize: '14px' }}>
                    {[...Array(5)].map((_, i) => (
                      <span key={i} style={{ opacity: i < idea.prioridad ? 1 : 0.3 }}>
                        ★
                      </span>
                    ))}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <NewIdeaModal
        isOpen={isNewIdeaOpen}
        onClose={() => setIsNewIdeaOpen(false)}
        onSubmit={handleCreateIdea}
        isLoading={isCreating}
      />

      <IdeaModal idea={selectedIdea} isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} />

      {toast && (
        <ToastNotification message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
