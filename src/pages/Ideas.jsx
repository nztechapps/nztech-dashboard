import { useState } from 'react';
import { createPortal } from 'react-dom';
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

const IconSpinner = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
    <circle cx="12" cy="12" r="1"></circle>
    <path d="M12 2a10 10 0 0 0 0 20"></path>
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

const IconCheck = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const IconTrash = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
);

function DeleteConfirmModal({ field, isOpen, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return createPortal(
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        zIndex: 1001,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onCancel}
    >
      <div
        style={{
          backgroundColor: '#13131A',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.08)',
          padding: '24px',
          maxWidth: '400px',
          width: '100%',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ color: 'white', margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600' }}>
          ¿Borrar este campo?
        </h3>
        <p style={{ color: '#999', fontSize: '13px', margin: '0 0 24px 0', lineHeight: '1.5' }}>
          El contenido generado se perderá y tendrás que regenerarlo.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{
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
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '10px 20px',
              backgroundColor: '#FF4D4F',
              border: 'none',
              color: 'white',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '600',
            }}
          >
            Borrar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function IdeaProcessingModal({ idea, isOpen, onClose, onUpdateIdea }) {
  const [editingFields, setEditingFields] = useState({});
  const [processingStep, setProcessingStep] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [sendingPipeline, setSendingPipeline] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  if (!isOpen || !idea) return null;

  // Limpiar valores JSON para mostrar formateados
  const cleanValue = (val) => {
    if (!val) return '';
    const trimmed = val.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (typeof parsed === 'object') {
          return JSON.stringify(parsed, null, 2);
        }
      } catch (e) {}
    }
    return trimmed;
  };

  const pasoAgente = idea.paso_agente || 0;
  const agentStatus = idea.agente_status || 'idle';
  const isProcessingNow = agentStatus === 'processing';

  const steps = [
    { id: 0, label: 'Paso 0 — Info base', completed: true },
    { id: 1, label: 'Paso 1 — Research', completed: pasoAgente >= 1 },
    { id: 2, label: 'Paso 2 — Specs', completed: pasoAgente >= 2 },
    { id: 3, label: 'Pipeline', completed: false },
  ];

  const handleFieldChange = (field, value) => {
    setEditingFields({ ...editingFields, [field]: value });
  };

  const handleFieldBlur = async (field, value) => {
    if (value !== idea[field]) {
      try {
        await onUpdateIdea(idea.id, { [field]: value });
      } catch (err) {
        console.error('Error updating field:', err);
      }
    }
    setEditingFields({ ...editingFields, [field]: undefined });
  };

  const handleRunStep = async (step) => {
    setProcessingStep(step);
    setErrorMessage(null);
    try {
      if (step === 1) {
        // Step 1: Research de mercado
        // Marcar como processing en Supabase para mostrar spinner
        await onUpdateIdea(idea.id, { agente_status: 'processing' });

        const response = await fetch('http://localhost:5678/webhook/idea-research', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            idea: {
              titulo: idea.titulo,
              descripcion: idea.descripcion,
              mercado: idea.mercado,
              categoria: idea.categoria,
            },
          }),
        });

        if (!response.ok) {
          throw new Error(`Error en webhook research: ${response.statusText}`);
        }

        const result = await response.json();

        // Guardar resultado en Supabase
        await onUpdateIdea(idea.id, {
          research_mercado: result.research_mercado,
          paso_agente: 1,
          agente_status: 'waiting_approval',
        });

        setActiveStep(1);
      } else if (step === 2) {
        // Step 2: Specs técnicas
        // Marcar como processing en Supabase para mostrar spinner
        await onUpdateIdea(idea.id, { agente_status: 'processing' });

        const response = await fetch('http://localhost:5678/webhook/idea-specs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            idea: {
              titulo: idea.titulo,
              descripcion: idea.descripcion,
              mercado: idea.mercado,
              categoria: idea.categoria,
              research_mercado: idea.research_mercado,
            },
          }),
        });

        if (!response.ok) {
          throw new Error(`Error en webhook specs: ${response.statusText}`);
        }

        const result = await response.json();

        // Guardar resultado en Supabase
        await onUpdateIdea(idea.id, {
          specs_pantallas: result.pantallas,
          specs_flujos: result.flujos,
          specs_apis: result.apis,
          complejidad: result.complejidad,
          paso_agente: 2,
          agente_status: 'waiting_approval',
        });

        setActiveStep(2);
      }
    } catch (err) {
      console.error(`Error running step ${step}:`, err);
      setErrorMessage(err.message);
      // Reset processing status on error
      await onUpdateIdea(idea.id, { agente_status: 'idle' });
    } finally {
      setProcessingStep(null);
    }
  };

  const handleSendToPipeline = async () => {
    setSendingPipeline(true);
    setErrorMessage(null);
    try {
      const response = await fetch('http://localhost:3001/pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: idea.titulo,
          descripcion: idea.descripcion,
          publico: idea.publico || 'Usuarios argentinos',
          categoria: idea.categoria || 'utilidad-global',
          mercado: idea.mercado || '',
          idea_id: idea.id,
        }),
      });

      if (!response.ok) {
        throw new Error('El servidor local no está corriendo. Ejecutá: node server.js en la carpeta del pipeline');
      }

      const result = await response.json();
      const { runId } = result;

      // Cambiar estado a 'aprobada'
      await onUpdateIdea(idea.id, { estado: 'aprobada' });

      // Cerrar modal y navegar al pipeline después de éxito
      setTimeout(() => {
        onClose();
        window.location.href = `/pipeline?runId=${runId}`;
      }, 500);
    } catch (err) {
      console.error('Error sending to pipeline:', err);
      const errorMsg = err.message.includes('Failed to fetch') || err.message.includes('localhost')
        ? '⚠️ El servidor local no está corriendo. Ejecutá: node server.js en la carpeta del pipeline'
        : err.message;
      setErrorMessage(errorMsg);
    } finally {
      setSendingPipeline(false);
    }
  };

  const handleStepClick = (stepId) => {
    if (stepId <= pasoAgente || stepId === 0) {
      setActiveStep(stepId);
    }
  };

  const handleDeleteField = async (field) => {
    try {
      const updateData = { [field]: null };

      // Si borra research_mercado, resetear todo
      if (field === 'research_mercado') {
        updateData.paso_agente = 0;
        updateData.specs_pantallas = null;
        updateData.specs_flujos = null;
        updateData.specs_apis = null;
        updateData.complejidad = null;
      }

      await onUpdateIdea(idea.id, updateData);
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting field:', err);
    }
  };

  return createPortal(
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onClose}
    >
      {/* Modal */}
      <div
        style={{
          backgroundColor: '#13131A',
          borderRadius: window.innerWidth < 768 ? 0 : '12px',
          maxWidth: window.innerWidth < 768 ? '100vw' : '640px',
          width: window.innerWidth < 768 ? '100%' : '100%',
          height: window.innerWidth < 768 ? '100vh' : 'min(85vh, 600px)',
          border: window.innerWidth < 768 ? 'none' : '1px solid rgba(255,255,255,0.08)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header con X */}
        <div
          style={{
            padding: '24px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            position: 'sticky',
            top: 0,
            backgroundColor: '#13131A',
            zIndex: 10,
          }}
        >
          <h2 style={{ color: 'white', margin: 0, fontSize: '18px', fontWeight: '600' }}>
            {idea.titulo}
          </h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', padding: 0, marginLeft: '12px' }}
          >
            <IconX />
          </button>
        </div>

        {/* Stepper */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            overflow: 'auto',
          }}
        >
          {steps.map((step, idx) => (
            <div key={step.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={() => handleStepClick(step.id)}
                disabled={step.id > pasoAgente && step.id !== 0}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: step.id <= pasoAgente || step.id === 0 ? 'pointer' : 'default',
                  backgroundColor:
                    activeStep === step.id
                      ? '#00E5A0'
                      : step.completed
                        ? 'rgba(0,229,160,0.2)'
                        : 'rgba(255,255,255,0.08)',
                  color:
                    activeStep === step.id
                      ? '#0A0A0F'
                      : step.completed
                        ? '#00E5A0'
                        : '#666',
                  opacity: step.id > pasoAgente && step.id !== 0 ? 0.5 : 1,
                }}
              >
                {step.completed && step.id !== activeStep ? <IconCheck /> : step.id}
              </button>
              {idx < steps.length - 1 && (
                <span style={{ color: '#444', fontSize: '18px', margin: '0 -4px', display: window.innerWidth < 768 ? 'none' : 'block' }}>→</span>
              )}
            </div>
          ))}
        </div>

        {/* Content */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: window.innerWidth < 768 ? '16px' : '24px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Error Banner */}
          {errorMessage && (
            <div
              style={{
                backgroundColor: 'rgba(255,77,79,0.12)',
                border: '1px solid rgba(255,77,79,0.3)',
                borderRadius: '6px',
                padding: '12px 16px',
                marginBottom: '20px',
                color: '#FF4D4F',
                fontSize: '13px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{errorMessage}</span>
                <button
                  onClick={() => {
                    const currentStep = activeStep;
                    if (currentStep === 1) handleRunStep(1);
                    else if (currentStep === 2) handleRunStep(2);
                  }}
                  style={{
                    backgroundColor: 'transparent',
                    border: '1px solid rgba(255,77,79,0.3)',
                    color: '#FF4D4F',
                    padding: '4px 12px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '600',
                    marginLeft: '12px',
                  }}
                >
                  Reintentar
                </button>
              </div>
            </div>
          )}

          {/* PASO 0 — Info base */}
          {activeStep === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', color: '#999', fontSize: '11px', marginBottom: '6px', fontWeight: '500' }}>
                  Título
                </label>
                <input
                  type="text"
                  value={editingFields.titulo !== undefined ? editingFields.titulo : idea.titulo}
                  onChange={(e) => handleFieldChange('titulo', e.target.value)}
                  onBlur={(e) => handleFieldBlur('titulo', e.target.value)}
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
                  value={editingFields.descripcion !== undefined ? editingFields.descripcion : idea.descripcion || ''}
                  onChange={(e) => handleFieldChange('descripcion', e.target.value)}
                  onBlur={(e) => handleFieldBlur('descripcion', e.target.value)}
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
                    resize: 'vertical',
                  }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', color: '#999', fontSize: '11px', marginBottom: '6px', fontWeight: '500' }}>
                    Mercado
                  </label>
                  <input
                    type="text"
                    value={editingFields.mercado !== undefined ? editingFields.mercado : idea.mercado || ''}
                    onChange={(e) => handleFieldChange('mercado', e.target.value)}
                    onBlur={(e) => handleFieldBlur('mercado', e.target.value)}
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
                    Categoría
                  </label>
                  <input
                    type="text"
                    value={editingFields.categoria !== undefined ? editingFields.categoria : idea.categoria || ''}
                    onChange={(e) => handleFieldChange('categoria', e.target.value)}
                    onBlur={(e) => handleFieldBlur('categoria', e.target.value)}
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
                  Prioridad
                </label>
                <StarRating
                  value={editingFields.prioridad !== undefined ? editingFields.prioridad : idea.prioridad || 3}
                  onChange={(val) => {
                    handleFieldChange('prioridad', val);
                    handleFieldBlur('prioridad', val);
                  }}
                />
              </div>
              <button
                onClick={() => handleRunStep(1)}
                disabled={isProcessingNow || sendingPipeline || processingStep !== null}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px 20px',
                  backgroundColor: '#00E5A0',
                  border: 'none',
                  color: '#0A0A0F',
                  borderRadius: '6px',
                  cursor: isProcessingNow || sendingPipeline || processingStep !== null ? 'not-allowed' : 'pointer',
                  fontSize: '13px',
                  fontWeight: '600',
                  opacity: isProcessingNow || sendingPipeline || processingStep !== null ? 0.6 : 1,
                  marginTop: '8px',
                }}
              >
                {processingStep === 1 ? <IconSpinner /> : null}
                Generar research →
              </button>
            </div>
          )}

          {/* PASO 1 — Research */}
          {activeStep === 1 && pasoAgente >= 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
              {isProcessingNow ? (
                <div
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '16px',
                  }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      border: '3px solid rgba(255,255,255,0.1)',
                      borderTop: '3px solid #00E5A0',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite',
                    }}
                  />
                  <div style={{ color: '#999', fontSize: '14px', textAlign: 'center' }}>
                    Analizando mercado con IA...
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ position: 'relative' }}>
                    <textarea
                      value={editingFields.research_mercado !== undefined ? editingFields.research_mercado : idea.research_mercado || ''}
                      onChange={(e) => handleFieldChange('research_mercado', e.target.value)}
                      onBlur={(e) => handleFieldBlur('research_mercado', e.target.value)}
                      style={{
                        width: '100%',
                        backgroundColor: '#0A0A0F',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '6px',
                        padding: '12px',
                        color: 'rgba(255,255,255,0.7)',
                        fontSize: '13px',
                        boxSizing: 'border-box',
                        minHeight: '150px',
                        fontFamily: 'DM Mono, monospace',
                        resize: 'vertical',
                      }}
                    />
                    <button
                      onClick={() => setDeleteConfirm({ field: 'research_mercado' })}
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        backgroundColor: 'rgba(255,77,79,0.1)',
                        border: '1px solid rgba(255,77,79,0.3)',
                        color: '#FF4D4F',
                        borderRadius: '4px',
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255,77,79,0.2)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255,77,79,0.1)';
                      }}
                      title="Borrar contenido"
                    >
                      <IconTrash />
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      onClick={() => handleRunStep(1)}
                      disabled={isProcessingNow || sendingPipeline || processingStep !== null}
                      style={{
                        flex: 1,
                        padding: '10px 16px',
                        backgroundColor: 'transparent',
                        border: '1px solid rgba(255,255,255,0.12)',
                        color: '#999',
                        borderRadius: '6px',
                        cursor: isProcessingNow || sendingPipeline || processingStep !== null ? 'not-allowed' : 'pointer',
                        fontSize: '13px',
                        fontWeight: '600',
                        opacity: isProcessingNow || sendingPipeline || processingStep !== null ? 0.5 : 1,
                      }}
                    >
                      Regenerar
                    </button>
                    <button
                      onClick={() => handleRunStep(2)}
                      disabled={isProcessingNow || sendingPipeline || processingStep !== null}
                      style={{
                        flex: 1,
                        padding: '10px 16px',
                        backgroundColor: '#00E5A0',
                        border: 'none',
                        color: '#0A0A0F',
                        borderRadius: '6px',
                        cursor: isProcessingNow || sendingPipeline || processingStep !== null ? 'not-allowed' : 'pointer',
                        fontSize: '13px',
                        fontWeight: '600',
                        opacity: isProcessingNow || sendingPipeline || processingStep !== null ? 0.6 : 1,
                      }}
                    >
                      Aprobar → Specs
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* PASO 2 — Specs técnicas */}
          {activeStep === 2 && pasoAgente >= 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
              {isProcessingNow ? (
                <div
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '16px',
                  }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      border: '3px solid rgba(255,255,255,0.1)',
                      borderTop: '3px solid #00E5A0',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite',
                    }}
                  />
                  <div style={{ color: '#999', fontSize: '14px', textAlign: 'center' }}>
                    Generando especificaciones técnicas...
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <label style={{ display: 'block', color: '#999', fontSize: '11px', marginBottom: '6px', fontWeight: '500' }}>
                      Pantallas
                    </label>
                    <div style={{ position: 'relative' }}>
                      <textarea
                        value={editingFields.specs_pantallas !== undefined ? editingFields.specs_pantallas : cleanValue(idea.specs_pantallas)}
                        onChange={(e) => handleFieldChange('specs_pantallas', e.target.value)}
                        onBlur={(e) => handleFieldBlur('specs_pantallas', e.target.value)}
                        style={{
                          width: '100%',
                          backgroundColor: '#0A0A0F',
                          border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: '6px',
                          padding: '10px 12px',
                          color: 'rgba(255,255,255,0.7)',
                          fontSize: '12px',
                          boxSizing: 'border-box',
                          height: '120px',
                          fontFamily: 'DM Mono, monospace',
                          resize: 'none',
                        }}
                      />
                      <button
                        onClick={() => setDeleteConfirm({ field: 'specs_pantallas' })}
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          backgroundColor: 'rgba(255,77,79,0.1)',
                          border: '1px solid rgba(255,77,79,0.3)',
                          color: '#FF4D4F',
                          borderRadius: '4px',
                          width: '32px',
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(255,77,79,0.2)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(255,77,79,0.1)';
                        }}
                        title="Borrar contenido"
                      >
                        <IconTrash />
                      </button>
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#999', fontSize: '11px', marginBottom: '6px', fontWeight: '500' }}>
                      Flujos
                    </label>
                    <div style={{ position: 'relative' }}>
                      <textarea
                        value={editingFields.specs_flujos !== undefined ? editingFields.specs_flujos : cleanValue(idea.specs_flujos)}
                        onChange={(e) => handleFieldChange('specs_flujos', e.target.value)}
                        onBlur={(e) => handleFieldBlur('specs_flujos', e.target.value)}
                        style={{
                          width: '100%',
                          backgroundColor: '#0A0A0F',
                          border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: '6px',
                          padding: '10px 12px',
                          color: 'rgba(255,255,255,0.7)',
                          fontSize: '12px',
                          boxSizing: 'border-box',
                          height: '120px',
                          fontFamily: 'DM Mono, monospace',
                          resize: 'none',
                        }}
                      />
                      <button
                        onClick={() => setDeleteConfirm({ field: 'specs_flujos' })}
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          backgroundColor: 'rgba(255,77,79,0.1)',
                          border: '1px solid rgba(255,77,79,0.3)',
                          color: '#FF4D4F',
                          borderRadius: '4px',
                          width: '32px',
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(255,77,79,0.2)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(255,77,79,0.1)';
                        }}
                        title="Borrar contenido"
                      >
                        <IconTrash />
                      </button>
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#999', fontSize: '11px', marginBottom: '6px', fontWeight: '500' }}>
                      APIs / Integraciones
                    </label>
                    <div style={{ position: 'relative' }}>
                      <textarea
                        value={editingFields.specs_apis !== undefined ? editingFields.specs_apis : cleanValue(idea.specs_apis)}
                        onChange={(e) => handleFieldChange('specs_apis', e.target.value)}
                        onBlur={(e) => handleFieldBlur('specs_apis', e.target.value)}
                        style={{
                          width: '100%',
                          backgroundColor: '#0A0A0F',
                          border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: '6px',
                          padding: '10px 12px',
                          color: 'rgba(255,255,255,0.7)',
                          fontSize: '12px',
                          boxSizing: 'border-box',
                          height: '120px',
                          fontFamily: 'DM Mono, monospace',
                          resize: 'none',
                        }}
                      />
                      <button
                        onClick={() => setDeleteConfirm({ field: 'specs_apis' })}
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          backgroundColor: 'rgba(255,77,79,0.1)',
                          border: '1px solid rgba(255,77,79,0.3)',
                          color: '#FF4D4F',
                          borderRadius: '4px',
                          width: '32px',
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(255,77,79,0.2)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(255,77,79,0.1)';
                        }}
                        title="Borrar contenido"
                      >
                        <IconTrash />
                      </button>
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#999', fontSize: '11px', marginBottom: '6px', fontWeight: '500' }}>
                      Complejidad
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        value={editingFields.complejidad !== undefined ? editingFields.complejidad : cleanValue(idea.complejidad)}
                        onChange={(e) => handleFieldChange('complejidad', e.target.value)}
                        onBlur={(e) => handleFieldBlur('complejidad', e.target.value)}
                        placeholder="baja | media | alta"
                        style={{
                          width: '100%',
                          backgroundColor: '#0A0A0F',
                          border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: '6px',
                          padding: '10px 12px',
                          color: 'rgba(255,255,255,0.7)',
                          fontSize: '13px',
                          boxSizing: 'border-box',
                        }}
                      />
                      <button
                        onClick={() => setDeleteConfirm({ field: 'complejidad' })}
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          backgroundColor: 'rgba(255,77,79,0.1)',
                          border: '1px solid rgba(255,77,79,0.3)',
                          color: '#FF4D4F',
                          borderRadius: '4px',
                          width: '32px',
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(255,77,79,0.2)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(255,77,79,0.1)';
                        }}
                        title="Borrar contenido"
                      >
                        <IconTrash />
                      </button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      onClick={() => handleRunStep(2)}
                      disabled={isProcessingNow || sendingPipeline || processingStep !== null}
                      style={{
                        flex: 1,
                        padding: '10px 16px',
                        backgroundColor: 'transparent',
                        border: '1px solid rgba(255,255,255,0.12)',
                        color: '#999',
                        borderRadius: '6px',
                        cursor: isProcessingNow || sendingPipeline || processingStep !== null ? 'not-allowed' : 'pointer',
                        fontSize: '13px',
                        fontWeight: '600',
                        opacity: isProcessingNow || sendingPipeline || processingStep !== null ? 0.5 : 1,
                      }}
                    >
                      Regenerar
                    </button>
                    <button
                      onClick={handleSendToPipeline}
                      disabled={sendingPipeline || isProcessingNow || processingStep !== null}
                      style={{
                        flex: 1,
                        padding: '10px 16px',
                        backgroundColor: '#00E5A0',
                        border: 'none',
                        color: '#0A0A0F',
                        borderRadius: '6px',
                        cursor: sendingPipeline || isProcessingNow || processingStep !== null ? 'not-allowed' : 'pointer',
                        fontSize: '13px',
                        fontWeight: '600',
                        opacity: sendingPipeline || isProcessingNow || processingStep !== null ? 0.6 : 1,
                      }}
                    >
                      {sendingPipeline ? 'Enviando...' : 'Enviar a Pipeline →'}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* PASO 3 — Pipeline (solo vista) */}
          {activeStep === 3 && (
            <div style={{ color: '#999', textAlign: 'center', padding: '40px 20px' }}>
              <p>Pipeline será completado próximamente</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      <DeleteConfirmModal
        field={deleteConfirm?.field}
        isOpen={deleteConfirm !== null}
        onConfirm={() => {
          if (deleteConfirm?.field) {
            handleDeleteField(deleteConfirm.field);
          }
        }}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>,
    document.body
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
  const [filterEstado, setFilterEstado] = useState('');
  const [filterCategoria, setFilterCategoria] = useState('');
  const [filterMercado, setFilterMercado] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [toast, setToast] = useState(null);

  // Agregar numeración basada en created_at (más antigua = #001)
  const numberedIdeas = ideas.map((idea, index) => ({
    ...idea,
    numero: String(index + 1).padStart(3, '0'),
  }));

  const filteredIdeas = numberedIdeas
    .filter((idea) => {
      if (filterEstado && idea.estado !== filterEstado) return false;
      if (filterCategoria && idea.categoria !== filterCategoria) return false;
      if (filterMercado && idea.mercado !== filterMercado) return false;

      // Búsqueda: número, título, categoría
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const numero = String(idea.numero);
        return (
          numero.includes(query) ||
          idea.titulo.toLowerCase().includes(query) ||
          (idea.categoria && idea.categoria.toLowerCase().includes(query))
        );
      }

      return true;
    })
    .sort((a, b) => (b.prioridad || 0) - (a.prioridad || 0));

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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexDirection: window.innerWidth < 768 ? 'column' : 'row', alignItems: window.innerWidth < 768 ? 'flex-start' : 'center', gap: window.innerWidth < 768 ? '12px' : '0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <IconLightbulb style={{ color: '#00E5A0' }} />
              <h1 style={{ color: 'white', fontSize: window.innerWidth < 768 ? '24px' : '28px', fontWeight: '600', margin: 0 }}>
                Ideas
              </h1>
            </div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', width: window.innerWidth < 768 ? '100%' : 'auto' }}>
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

        {/* Búsqueda */}
        <div style={{ marginBottom: '16px' }}>
          <input
            type="text"
            placeholder="Buscar por número o nombre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              backgroundColor: '#13131A',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '6px',
              color: 'white',
              fontSize: '13px',
              boxSizing: 'border-box',
            }}
          />
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
              gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '16px',
            }}
          >
            {filteredIdeas.map((idea) => (
              <div key={idea.id} style={{ position: 'relative' }}>
                {/* Número badge */}
                <div
                  style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    backgroundColor: '#00E5A0',
                    color: '#0A0A0F',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: '700',
                    zIndex: 2,
                  }}
                >
                  #{idea.numero}
                </div>

                <button
                  onClick={() => navigate(`/ideas/${idea.id}`)}
                  style={{
                    width: '100%',
                    background: 'none',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '8px',
                    padding: '16px',
                    paddingTop: '56px',
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
                <button
                  onClick={() => navigate(`/ideas/${idea.id}`)}
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    width: '32px',
                    height: '32px',
                    backgroundColor: 'rgba(100,150,255,0.1)',
                    border: '1px solid rgba(100,150,255,0.3)',
                    color: '#6496FF',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    fontWeight: '600',
                    transition: 'all 0.2s',
                    zIndex: 3,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(100,150,255,0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(100,150,255,0.1)';
                  }}
                  title="Ver detalle"
                >
                  ↗
                </button>
              </div>
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

      {toast && (
        <ToastNotification message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
