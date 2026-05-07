import { useNavigate } from 'react-router-dom';
import { useIdeas } from '../hooks/useIdeas';
import AppIcon from '../components/ui/AppIcon';
import StatusBadge from '../components/ui/StatusBadge';
import AppForm from '../components/apps/AppForm';
import ConfirmModal from '../components/ui/ConfirmModal';
import ToastNotification from '../components/ui/ToastNotification';
import { supabase } from '../lib/supabase';
import React, { useState, useEffect } from 'react';

const card = {
  background: '#FFFFFF',
  borderRadius: '12px',
  border: '1px solid rgba(0,0,0,0.06)',
  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  padding: '16px',
  marginBottom: '8px',
};

const IconPlus = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const IconMoreVertical = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="1"></circle>
    <circle cx="12" cy="5" r="1"></circle>
    <circle cx="12" cy="19" r="1"></circle>
  </svg>
);

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function Apps() {
  const navigate = useNavigate();
  const { ideas, loading, createIdea, updateIdea, deleteIdea } = useIdeas();
  const apps = ideas.filter((i) => i.publicada === true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [appMetrics, setAppMetrics] = useState({});
  const [openMenuId, setOpenMenuId] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, appId: null, appName: '' });
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      try {
        const { data } = await supabase
          .from('metrics')
          .select('app_id, ingresos')
          .gte('fecha', thirtyDaysAgo.toISOString());
        const metrics = {};
        apps.forEach((app) => {
          const appData = data?.filter((m) => m.app_id === app.id) || [];
          const totalIngresos = appData.reduce((sum, m) => sum + (m.ingresos || 0), 0);
          metrics[app.id] = totalIngresos.toFixed(2);
        });
        setAppMetrics(metrics);
      } catch (err) {
        console.error('Error fetching metrics:', err);
      }
    };
    if (apps.length > 0) fetchMetrics();
  }, [apps]);

  const handleNewApp = () => { setSelectedApp(null); setIsFormOpen(true); setOpenMenuId(null); };
  const handleEditApp = (app) => { setSelectedApp(app); setIsFormOpen(true); setOpenMenuId(null); };
  const handleDeleteApp = (app) => { setConfirmModal({ isOpen: true, appId: app.id, appName: app.titulo || app.nombre }); };

  const handleConfirmDelete = async () => {
    try {
      setIsLoading(true);
      await deleteIdea(confirmModal.appId);
      setOpenMenuId(null);
      setToast({ message: 'App eliminada', type: 'success' });
      setConfirmModal({ isOpen: false, appId: null, appName: '' });
    } catch (err) {
      setToast({ message: 'Error al eliminar app', type: 'error' });
      setConfirmModal({ isOpen: false, appId: null, appName: '' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveApp = async (formData) => {
    try {
      setIsLoading(true);
      if (selectedApp) {
        await updateIdea(selectedApp.id, formData);
        setToast({ message: 'App actualizada correctamente', type: 'success' });
      } else {
        await createIdea({ ...formData, publicada: true, created_at: new Date().toISOString() });
        setToast({ message: 'App creada correctamente', type: 'success' });
      }
    } catch (err) {
      setToast({ message: 'Error al guardar app', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#F9FAFB', minHeight: '100%', padding: '24px' }}>
      {/* Action row */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
        <button
          onClick={handleNewApp}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '8px 16px', backgroundColor: '#00E5A0', border: 'none',
            color: '#003D2B', borderRadius: '8px', cursor: 'pointer',
            fontSize: '14px', fontWeight: '600',
          }}
        >
          <IconPlus /> Nueva app
        </button>
      </div>

      {loading ? (
        <div style={{ color: '#6B7280', textAlign: 'center', padding: '40px 0' }}>Cargando...</div>
      ) : apps.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px 24px',
          backgroundColor: '#FFFFFF', borderRadius: '12px',
          border: '1px solid rgba(0,0,0,0.06)',
        }}>
          <div style={{ color: '#6B7280', marginBottom: '16px' }}>No hay apps todavía</div>
          <button
            onClick={handleNewApp}
            style={{
              padding: '8px 16px', backgroundColor: '#00E5A0', border: 'none',
              color: '#003D2B', borderRadius: '8px', cursor: 'pointer',
              fontSize: '14px', fontWeight: '600',
            }}
          >
            Crear primera app
          </button>
        </div>
      ) : (
        <div>
          {apps.map((app) => (
            <div
              key={app.id}
              onClick={() => navigate(`/apps/${app.id}`)}
              style={{ ...card, display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', transition: 'all 0.15s ease' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(139,92,246,0.3)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(139,92,246,0.08)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(0,0,0,0.06)';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <AppIcon nombre={app.titulo || app.nombre || app.name} icono_url={app.icono_url} size={36} />

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: '#111827', fontWeight: '500', marginBottom: '4px' }}>
                  {app.titulo || app.nombre || app.name}
                </div>
                <div style={{ color: '#6B7280', fontSize: '12px' }}>{app.package}</div>
              </div>

              <StatusBadge status={app.status || 'development'} />

              {app.mercado && (
                <span style={{
                  backgroundColor: '#EFF6FF', color: '#1E40AF',
                  fontSize: '11px', padding: '3px 8px', borderRadius: '20px', fontWeight: '500',
                }}>
                  {app.mercado}
                </span>
              )}

              <div style={{ color: '#059669', fontWeight: '600', minWidth: '80px', textAlign: 'right', fontFamily: 'DM Mono, monospace' }}>
                ${appMetrics[app.id] || '0.00'}
              </div>

              <div style={{ color: '#9CA3AF', fontSize: '12px', minWidth: '100px', textAlign: 'right' }}>
                {formatDate(app.created_at)}
              </div>

              <div style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => setOpenMenuId(openMenuId === app.id ? null : app.id)}
                  style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', padding: '4px', display: 'flex' }}
                >
                  <IconMoreVertical />
                </button>
                {openMenuId === app.id && (
                  <div style={{
                    position: 'absolute', top: '100%', right: 0, marginTop: '4px',
                    backgroundColor: '#FFFFFF', border: '1px solid rgba(0,0,0,0.08)',
                    borderRadius: '8px', overflow: 'hidden', zIndex: 10, minWidth: '140px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}>
                    <button
                      onClick={() => handleEditApp(app)}
                      style={{
                        display: 'block', width: '100%', padding: '10px 12px',
                        backgroundColor: 'transparent', border: 'none',
                        color: '#374151', textAlign: 'left', cursor: 'pointer',
                        fontSize: '13px', borderBottom: '1px solid rgba(0,0,0,0.06)',
                      }}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteApp(app)}
                      style={{
                        display: 'block', width: '100%', padding: '10px 12px',
                        backgroundColor: 'transparent', border: 'none',
                        color: '#DC2626', textAlign: 'left', cursor: 'pointer', fontSize: '13px',
                      }}
                    >
                      Eliminar
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <AppForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveApp}
        initialData={selectedApp}
        isLoading={isLoading}
      />
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Eliminar app"
        message={`¿Estás seguro que deseas eliminar "${confirmModal.appName}"? Esta acción no se puede deshacer.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmModal({ isOpen: false, appId: null, appName: '' })}
        confirmLabel="Eliminar"
        confirmColor="#DC2626"
      />
      {toast && (
        <ToastNotification message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
