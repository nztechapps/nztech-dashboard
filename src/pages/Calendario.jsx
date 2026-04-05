import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEventos } from '../hooks/useEventos';
import { supabase } from '../lib/supabase';
import ToastNotification from '../components/ui/ToastNotification';

const IconChevronLeft = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="15 18 9 12 15 6"></polyline>
  </svg>
);

const IconChevronRight = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);

const IconX = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const IconTrash = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);

const IconArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);

const TIPO_COLORS = {
  publicacion: '#1a4d2e',
  update: '#1e3a8a',
  aso: '#d97706',
  revision: '#6b7280',
  vencimiento: '#dc2626',
  otro: '#4b5563',
};

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

function formatDateForComparison(date) {
  return date.toISOString().split('T')[0];
}

function formatDateLabel(day, month, year) {
  const date = new Date(year, month, day);
  return date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
}

export default function Calendario() {
  const navigate = useNavigate();
  const { eventos, createEvento, deleteEvento } = useEventos();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [tareas, setTareas] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    titulo: '',
    tipo: 'publicacion',
    app_id: null,
    notas: '',
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  // Cargar tareas con due_date
  useEffect(() => {
    const fetchTareas = async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('id, titulo, due_date, estado, app_id, notas')
        .not('due_date', 'is', null)
        .neq('estado', 'done');
      if (!error) {
        setTareas(data || []);
      }
    };
    fetchTareas();
  }, []);

  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getTareasForDay = (day) => {
    if (!day) return [];
    const dateStr = formatDateForComparison(new Date(year, month, day));
    return tareas.filter((t) => t.due_date === dateStr);
  };

  const getEventosForDay = (day) => {
    if (!day) return [];
    const dateStr = formatDateForComparison(new Date(year, month, day));
    return eventos.filter((e) => e.fecha === dateStr);
  };

  const getDayItems = (day) => {
    if (!day) return { tareas: [], eventos: [] };
    return {
      tareas: getTareasForDay(day),
      eventos: getEventosForDay(day),
    };
  };

  const handleDayClick = (day) => {
    if (day) {
      setSelectedDay(day);
      setIsFormOpen(false);
      setFormData({ titulo: '', tipo: 'publicacion', app_id: null, notas: '' });
    }
  };

  const handleAddEvent = async () => {
    if (!formData.titulo.trim()) return;
    const dateStr = formatDateForComparison(new Date(year, month, selectedDay));
    try {
      await createEvento({
        titulo: formData.titulo,
        tipo: formData.tipo,
        app_id: formData.app_id,
        notas: formData.notas || null,
        fecha: dateStr,
      });
      setToast({ message: 'Evento creado', type: 'success' });
      setFormData({ titulo: '', tipo: 'publicacion', app_id: null, notas: '' });
      setIsFormOpen(false);
    } catch (err) {
      setToast({ message: 'Error al crear evento', type: 'error' });
    }
  };

  const monthName = new Date(year, month, 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

  return (
    <div style={{ backgroundColor: '#0A0A0F', minHeight: '100vh', padding: '24px', display: 'flex' }}>
      {/* Calendario */}
      <div style={{ flex: 1 }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ color: 'white', fontSize: '24px', fontWeight: '600', margin: '0 0 24px 0' }}>
            Calendario
          </h1>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <button onClick={goToPreviousMonth} style={{ background: 'none', border: 'none', color: '#00E5A0', cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center' }}>
              <IconChevronLeft />
            </button>
            <h2 style={{ color: 'white', fontSize: '18px', fontWeight: '600', margin: 0, textTransform: 'capitalize' }}>
              {monthName}
            </h2>
            <button onClick={goToNextMonth} style={{ background: 'none', border: 'none', color: '#00E5A0', cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center' }}>
              <IconChevronRight />
            </button>
          </div>
        </div>

        <div style={{ backgroundColor: '#13131A', borderRadius: '10px', padding: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', marginBottom: '12px' }}>
            {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day) => (
              <div key={day} style={{ textAlign: 'center', color: '#666', fontSize: '12px', fontWeight: '600', padding: '8px 0' }}>
                {day}
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', minHeight: '400px' }}>
            {days.map((day, idx) => {
              const items = getDayItems(day);
              const isSelected = selectedDay === day;

              return (
                <div
                  key={idx}
                  onClick={() => handleDayClick(day)}
                  style={{
                    backgroundColor: isSelected ? 'rgba(0,229,160,0.08)' : day ? '#0A0A0F' : 'transparent',
                    border: isSelected ? '1px solid #00E5A0' : day ? '1px solid rgba(255,255,255,0.08)' : 'none',
                    borderRadius: '6px',
                    padding: '8px',
                    minHeight: '80px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    justifyContent: 'flex-start',
                    cursor: day ? 'pointer' : 'default',
                  }}
                >
                  {day && (
                    <div style={{ color: '#999', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>
                      {day}
                    </div>
                  )}

                  {items.tareas.map((t) => (
                    <div key={`tarea-${t.id}`} style={{ backgroundColor: '#7C6AFF', color: 'white', fontSize: '9px', padding: '2px 4px', borderRadius: '3px', marginBottom: '2px', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {t.titulo}
                    </div>
                  ))}

                  {items.eventos.map((e) => (
                    <div key={`evento-${e.id}`} style={{ backgroundColor: TIPO_COLORS[e.tipo], color: 'white', fontSize: '9px', padding: '2px 4px', borderRadius: '3px', marginBottom: '2px', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {e.titulo}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ marginTop: '24px', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: '#7C6AFF', borderRadius: '2px' }} />
            <span style={{ color: '#999', fontSize: '13px' }}>Tarea</span>
          </div>
        </div>
      </div>

      {/* Panel Lateral */}
      {selectedDay && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            bottom: 0,
            width: '320px',
            backgroundColor: '#13131A',
            borderLeft: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '-4px 0 16px rgba(0,0,0,0.4)',
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            animation: 'slideIn 0.3s ease-out',
          }}
        >
          <style>{`
            @keyframes slideIn {
              from { transform: translateX(100%); }
              to { transform: translateX(0); }
            }
          `}</style>

          {/* Header */}
          <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ color: 'white', margin: 0, fontSize: '14px', fontWeight: '600', textTransform: 'capitalize' }}>
              {formatDateLabel(selectedDay, month, year)}
            </h3>
            <button
              onClick={() => setSelectedDay(null)}
              style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', padding: '0', display: 'flex' }}
            >
              <IconX />
            </button>
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflow: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {(() => {
              const items = getDayItems(selectedDay);
              const allItems = [
                ...items.tareas.map(t => ({ type: 'tarea', data: t, title: t.titulo })),
                ...items.eventos.map(e => ({ type: 'evento', data: e, title: e.titulo })),
              ];

              if (allItems.length === 0 && !isFormOpen) {
                return <div style={{ color: '#666', textAlign: 'center', paddingTop: '20px' }}>Sin eventos este día</div>;
              }

              return (
                <>
                  {allItems.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        backgroundColor: '#0A0A0F',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '6px',
                        padding: '12px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: '8px',
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ color: 'white', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>{item.title}</div>
                        {item.type === 'tarea' && item.data.due_date && (
                          <div style={{ color: '#00E5A0', fontSize: '10px', marginBottom: '4px', fontWeight: '500' }}>
                            Vence: {new Date(item.data.due_date).toLocaleDateString('es-ES')}
                          </div>
                        )}
                        {item.data.notas && (
                          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', marginTop: '4px', fontFamily: 'monospace', maxHeight: '40px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'pre-wrap' }}>
                            {item.data.notas}
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                        {item.type === 'tarea' && (
                          <button
                            onClick={() => navigate(`/apps/${item.data.app_id}`)}
                            title="Ver en Kanban"
                            style={{ background: 'none', border: 'none', color: '#00E5A0', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <IconArrowRight />
                          </button>
                        )}
                        {item.type === 'evento' && (
                          <button
                            onClick={() => {
                              deleteEvento(item.data.id);
                              setToast({ message: 'Evento eliminado', type: 'success' });
                            }}
                            title="Eliminar evento"
                            style={{ background: 'none', border: 'none', color: '#FF4D4F', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <IconTrash />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </>
              );
            })()}

            {/* Formulario */}
            {isFormOpen && (
              <div style={{ backgroundColor: '#1C1C26', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '12px', marginTop: 'auto' }}>
                <div style={{ marginBottom: '10px' }}>
                  <input
                    type="text"
                    placeholder="Título del evento"
                    value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    style={{ width: '100%', backgroundColor: '#0A0A0F', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', padding: '6px', color: 'white', fontSize: '12px', boxSizing: 'border-box', marginBottom: '8px' }}
                  />
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                    style={{ width: '100%', backgroundColor: '#0A0A0F', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', padding: '6px', color: 'white', fontSize: '12px', boxSizing: 'border-box', marginBottom: '8px' }}
                  >
                    <option value="publicacion">Publicación</option>
                    <option value="update">Update</option>
                    <option value="aso">ASO</option>
                    <option value="revision">Revisión</option>
                    <option value="vencimiento">Vencimiento</option>
                    <option value="otro">Otro</option>
                  </select>
                  <select
                    value={formData.app_id || ''}
                    onChange={(e) => setFormData({ ...formData, app_id: e.target.value ? e.target.value : null })}
                    style={{ width: '100%', backgroundColor: '#0A0A0F', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', padding: '6px', color: 'white', fontSize: '12px', boxSizing: 'border-box', marginBottom: '8px' }}
                  >
                    <option value="">Sin app</option>
                    {apps.map(app => (
                      <option key={app.id} value={app.id}>{app.nombre || app.name}</option>
                    ))}
                  </select>
                  <textarea
                    placeholder="Notas (opcional)"
                    value={formData.notas}
                    onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                    style={{ width: '100%', backgroundColor: '#0A0A0F', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', padding: '6px', color: 'white', fontSize: '12px', boxSizing: 'border-box', minHeight: '60px', marginBottom: '8px', fontFamily: 'monospace', resize: 'vertical' }}
                  />
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={handleAddEvent}
                      style={{ flex: 1, padding: '6px', backgroundColor: '#00E5A0', border: 'none', color: '#0A0A0F', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: '600' }}
                    >
                      Agregar
                    </button>
                    <button
                      onClick={() => setIsFormOpen(false)}
                      style={{ flex: 1, padding: '6px', backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.08)', color: '#999', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {!isFormOpen && (
              <button
                onClick={() => setIsFormOpen(true)}
                style={{
                  width: '100%',
                  padding: '8px',
                  backgroundColor: 'transparent',
                  border: '1px dashed rgba(255,255,255,0.12)',
                  color: '#999',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '500',
                  marginTop: 'auto',
                }}
              >
                Agregar evento
              </button>
            )}
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <ToastNotification
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
