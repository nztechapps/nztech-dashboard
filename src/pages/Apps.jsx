import { useNavigate } from 'react-router-dom';
import { useApps } from '../hooks/useApps';
import AppIcon from '../components/ui/AppIcon';
import StatusBadge from '../components/ui/StatusBadge';
import AppForm from '../components/apps/AppForm';
import { supabase } from '../lib/supabase';
import React, { useState, useEffect } from 'react';


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
  const { apps, loading, createApp, updateApp, deleteApp } = useApps();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [appMetrics, setAppMetrics] = useState({});
  const [openMenuId, setOpenMenuId] = useState(null);

  // Fetch monthly revenue for each app
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

    if (apps.length > 0) {
      fetchMetrics();
    }
  }, [apps]);

  const handleNewApp = () => {
    setSelectedApp(null);
    setIsFormOpen(true);
    setOpenMenuId(null);
  };

  const handleEditApp = (app) => {
    setSelectedApp(app);
    setIsFormOpen(true);
    setOpenMenuId(null);
  };

  const handleDeleteApp = async (app) => {
    if (window.confirm(`¿Eliminar "${app.nombre}"?`)) {
      try {
        setIsLoading(true);
        await deleteApp(app.id);
        setOpenMenuId(null);
      } catch (err) {
        alert('Error al eliminar app');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSaveApp = async (formData) => {
    try {
      setIsLoading(true);
      if (selectedApp) {
        await updateApp(selectedApp.id, formData);
      } else {
        await createApp({
          ...formData,
          created_at: new Date().toISOString(),
        });
      }
    } catch (err) {
      alert('Error al guardar app');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppClick = (app) => {
    navigate(`/apps/${app.id}`);
  };

  return (
    <div style={{ backgroundColor: '#0A0A0F', minHeight: '100vh', padding: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ color: 'white', margin: 0, fontSize: '24px', fontWeight: '600' }}>Apps</h1>
        <button
          onClick={handleNewApp}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            backgroundColor: '#00E5A0',
            border: 'none',
            color: '#0A0A0F',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
          }}
        >
          <IconPlus /> Nueva app
        </button>
      </div>

      {/* App List */}
      {loading ? (
        <div style={{ color: '#999', textAlign: 'center', padding: '40px 0' }}>
          Cargando...
        </div>
      ) : apps.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 24px',
            backgroundColor: '#13131A',
            borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div style={{ color: '#999', marginBottom: '16px' }}>No hay apps todavía</div>
          <button
            onClick={handleNewApp}
            style={{
              padding: '10px 16px',
              backgroundColor: '#00E5A0',
              border: 'none',
              color: '#0A0A0F',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
            }}
          >
            Crear primera app
          </button>
        </div>
      ) : (
        <div style={{ space: '8px' }}>
          {apps.map((app) => (
            <div
              key={app.id}
              onClick={() => handleAppClick(app)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '16px',
                backgroundColor: '#13131A',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '10px',
                marginBottom: '8px',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#1C1C26';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#13131A';
              }}
            >
              {/* Icon */}
              <AppIcon nombre={app.nombre || app.name} icono_url={app.icono_url} size={36} />

              {/* Name & Package */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: 'white', fontWeight: '500', marginBottom: '4px' }}>
                  {app.nombre || app.name}
                </div>
                <div style={{ color: '#999', fontSize: '12px' }}>
                  {app.package}
                </div>
              </div>

              {/* Status */}
              <StatusBadge status={app.status || 'development'} />

              {/* Market */}
              {app.mercado && (
                <span
                  style={{
                    backgroundColor: 'rgba(100, 150, 255, 0.2)',
                    color: '#6496FF',
                    fontSize: '11px',
                    padding: '4px 8px',
                    borderRadius: '20px',
                  }}
                >
                  {app.mercado}
                </span>
              )}

              {/* Ingresos */}
              <div style={{ color: '#00E5A0', fontWeight: '500', minWidth: '80px', textAlign: 'right' }}>
                ${appMetrics[app.id] || '0.00'}
              </div>

              {/* Fecha */}
              <div style={{ color: '#999', fontSize: '12px', minWidth: '100px', textAlign: 'right' }}>
                {formatDate(app.created_at)}
              </div>

              {/* Menu */}
              <div
                style={{ position: 'relative' }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setOpenMenuId(openMenuId === app.id ? null : app.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#999',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <IconMoreVertical />
                </button>

                {openMenuId === app.id && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      marginTop: '4px',
                      backgroundColor: '#1C1C26',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      zIndex: 10,
                      minWidth: '140px',
                    }}
                  >
                    <button
                      onClick={() => handleEditApp(app)}
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '10px 12px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: '#999',
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontSize: '13px',
                        borderBottom: '1px solid rgba(255,255,255,0.08)',
                      }}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteApp(app)}
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '10px 12px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: '#FF4D4F',
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontSize: '13px',
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

      {/* Form */}
      <AppForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveApp}
        initialData={selectedApp}
        isLoading={isLoading}
      />
    </div>
  );
}
