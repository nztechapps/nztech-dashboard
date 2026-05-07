import { useNavigate } from 'react-router-dom';
import { useIdeas } from '../hooks/useIdeas';
import AppIcon from '../components/ui/AppIcon';
import StatusBadge from '../components/ui/StatusBadge';
import AppForm from '../components/apps/AppForm';
import ConfirmModal from '../components/ui/ConfirmModal';
import ToastNotification from '../components/ui/ToastNotification';
import { supabase } from '../lib/supabase';
import React, { useState, useEffect } from 'react';

const IconPlus = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const IconMore = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/>
  </svg>
);

const fmtDate = (s) => new Date(s).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });

export default function Apps() {
  const navigate = useNavigate();
  const { ideas, loading, createIdea, updateIdea, deleteIdea } = useIdeas();
  const apps = ideas.filter(i => i.publicada === true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [appMetrics, setAppMetrics] = useState({});
  const [openMenuId, setOpenMenuId] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, appId: null, appName: '' });
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      const d30 = new Date(); d30.setDate(d30.getDate() - 30);
      try {
        const { data } = await supabase.from('metrics').select('app_id, ingresos').gte('fecha', d30.toISOString());
        const m = {};
        apps.forEach(app => {
          const rows = data?.filter(r => r.app_id === app.id) || [];
          m[app.id] = rows.reduce((s, r) => s + (r.ingresos || 0), 0).toFixed(2);
        });
        setAppMetrics(m);
      } catch (err) { console.error(err); }
    };
    if (apps.length > 0) fetch();
  }, [apps]);

  const handleSaveApp = async (formData) => {
    try {
      setIsLoading(true);
      if (selectedApp) {
        await updateIdea(selectedApp.id, formData);
        setToast({ message: 'App actualizada', type: 'success' });
      } else {
        await createIdea({ ...formData, publicada: true, created_at: new Date().toISOString() });
        setToast({ message: 'App creada', type: 'success' });
      }
    } catch (err) {
      setToast({ message: 'Error al guardar app', type: 'error' });
    } finally { setIsLoading(false); }
  };

  const handleConfirmDelete = async () => {
    try {
      setIsLoading(true);
      await deleteIdea(confirmModal.appId);
      setToast({ message: 'App eliminada', type: 'success' });
      setConfirmModal({ isOpen: false, appId: null, appName: '' });
    } catch (err) {
      setToast({ message: 'Error al eliminar', type: 'error' });
      setConfirmModal({ isOpen: false, appId: null, appName: '' });
    } finally { setIsLoading(false); }
  };

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100%', padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
        <button onClick={() => { setSelectedApp(null); setIsFormOpen(true); }} className="nz-btn nz-btn-primary">
          <IconPlus /> Nueva app
        </button>
      </div>

      {loading ? (
        <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0' }}>Cargando...</div>
      ) : apps.length === 0 ? (
        <div className="nz-card" style={{ textAlign: 'center', padding: '60px 24px' }}>
          <div style={{ color: 'var(--text-muted)', marginBottom: 16 }}>No hay apps todavía</div>
          <button onClick={() => { setSelectedApp(null); setIsFormOpen(true); }} className="nz-btn nz-btn-primary">
            Crear primera app
          </button>
        </div>
      ) : (
        <div>
          {apps.map(app => (
            <div
              key={app.id}
              onClick={() => navigate(`/apps/${app.id}`)}
              className="nz-card"
              style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, marginBottom: 8, cursor: 'pointer', transition: 'all var(--dur)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <AppIcon nombre={app.titulo || app.nombre || app.name} icono_url={app.icono_url} size={36} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: 'var(--text)', fontWeight: 500, marginBottom: 4 }}>{app.titulo || app.nombre || app.name}</div>
                <div style={{ color: 'var(--text-subtle)', fontSize: 12 }}>{app.package}</div>
              </div>
              <StatusBadge status={app.status || 'development'} />
              {app.mercado && (
                <span className="nz-pill">{app.mercado}</span>
              )}
              <div style={{ color: 'var(--nz-success)', fontWeight: 600, minWidth: 80, textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
                ${appMetrics[app.id] || '0.00'}
              </div>
              <div style={{ color: 'var(--text-subtle)', fontSize: 12, minWidth: 100, textAlign: 'right' }}>
                {fmtDate(app.created_at)}
              </div>

              <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
                <button onClick={() => setOpenMenuId(openMenuId === app.id ? null : app.id)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-subtle)', cursor: 'pointer', padding: 4, display: 'flex' }}>
                  <IconMore />
                </button>
                {openMenuId === app.id && (
                  <div className="nz-card" style={{ position: 'absolute', top: '100%', right: 0, marginTop: 4, zIndex: 10, minWidth: 140, overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
                    <button onClick={() => { setSelectedApp(app); setIsFormOpen(true); setOpenMenuId(null); }}
                      style={{ display: 'block', width: '100%', padding: '10px 12px', background: 'transparent', border: 'none', color: 'var(--text)', textAlign: 'left', cursor: 'pointer', fontSize: 13, borderBottom: '1px solid var(--border)' }}>
                      Editar
                    </button>
                    <button onClick={() => { setConfirmModal({ isOpen: true, appId: app.id, appName: app.titulo || app.nombre }); setOpenMenuId(null); }}
                      style={{ display: 'block', width: '100%', padding: '10px 12px', background: 'transparent', border: 'none', color: 'var(--nz-danger)', textAlign: 'left', cursor: 'pointer', fontSize: 13 }}>
                      Eliminar
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <AppForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} onSave={handleSaveApp} initialData={selectedApp} isLoading={isLoading} />
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Eliminar app"
        message={`¿Eliminar "${confirmModal.appName}"? Esta acción no se puede deshacer.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmModal({ isOpen: false, appId: null, appName: '' })}
        confirmLabel="Eliminar"
      />
      {toast && <ToastNotification message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
