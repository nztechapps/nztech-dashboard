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

const IconPlus = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
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
  const day = new Date(year, month, 1).getDay();
  // Convert Sunday=0 to Monday=0
  return (day + 6) % 7;
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
  const [objectives, setObjectives] = useState([]);
  const [newObjective, setNewObjective] = useState('');
  const [formData, setFormData] = useState({
    titulo: '',
    tipo: 'publicacion',
    app_id: null,
    notas: '',
  });

  const today = new Date();
  const todayStr = formatDateForComparison(today);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  useEffect(() => {
    const fetchTareas = async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('id, titulo, due_date, estado, app_id, notas')
        .not('due_date', 'is', null)
        .neq('estado', 'done');
      if (!error) setTareas(data || []);
    };
    fetchTareas();
  }, []);

  useEffect(() => {
    const fetchObjectives = async () => {
      const y = currentDate.getFullYear();
      const m = currentDate.getMonth();
      const firstDay = new Date(y, m, 1).toISOString().split('T')[0];
      const lastDay = new Date(y, m + 1, 0).toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('calendar_objectives')
        .select('*')
        .gte('fecha', firstDay)
        .lte('fecha', lastDay)
        .order('fecha', { ascending: true });
      if (!error) setObjectives(data || []);
    };
    fetchObjectives();
  }, [currentDate]);

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const goToPreviousMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const goToNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

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

  const getObjectivesForDay = (day) => {
    if (!day) return [];
    const dateStr = formatDateForComparison(new Date(year, month, day));
    return objectives.filter((o) => o.fecha === dateStr);
  };

  const getDayItems = (day) => {
    if (!day) return { tareas: [], eventos: [], objetivos: [] };
    return {
      tareas: getTareasForDay(day),
      eventos: getEventosForDay(day),
      objetivos: getObjectivesForDay(day),
    };
  };

  const hasObjectivesOnDay = (day) => {
    if (!day) return false;
    return getObjectivesForDay(day).length > 0;
  };

  const isToday = (day) => {
    if (!day) return false;
    return formatDateForComparison(new Date(year, month, day)) === todayStr;
  };

  const handleAddObjective = async () => {
    if (!newObjective.trim() || !selectedDay) return;
    try {
      const dateStr = formatDateForComparison(new Date(year, month, selectedDay));
      const { data, error } = await supabase
        .from('calendar_objectives')
        .insert({ fecha: dateStr, texto: newObjective.trim(), completado: false })
        .select();
      if (error) throw error;
      setObjectives([...objectives, data[0]]);
      setNewObjective('');
      setToast({ message: 'Objetivo agregado', type: 'success' });
    } catch {
      setToast({ message: 'Error al agregar objetivo', type: 'error' });
    }
  };

  const handleToggleObjective = async (objId, currentState) => {
    try {
      const { error } = await supabase
        .from('calendar_objectives')
        .update({ completado: !currentState })
        .eq('id', objId);
      if (error) throw error;
      setObjectives(objectives.map(o => o.id === objId ? { ...o, completado: !currentState } : o));
    } catch {
      setToast({ message: 'Error al actualizar objetivo', type: 'error' });
    }
  };

  const handleDeleteObjective = async (objId) => {
    try {
      const { error } = await supabase
        .from('calendar_objectives')
        .delete()
        .eq('id', objId);
      if (error) throw error;
      setObjectives(objectives.filter(o => o.id !== objId));
      setToast({ message: 'Objetivo eliminado', type: 'success' });
    } catch {
      setToast({ message: 'Error al eliminar objetivo', type: 'error' });
    }
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
    } catch {
      setToast({ message: 'Error al crear evento', type: 'error' });
    }
  };

  const monthName = new Date(year, month, 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100%', padding: '24px', display: 'flex', gap: '24px' }}>
      {/* Calendario */}
      <div style={{ flex: 1 }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ color: 'var(--text)', fontSize: '24px', fontWeight: '600', margin: '0 0 24px 0' }}>
            Calendario
          </h1>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <button onClick={goToPreviousMonth} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center' }}>
              <IconChevronLeft />
            </button>
            <h2 style={{ color: 'var(--text)', fontSize: '18px', fontWeight: '600', margin: 0, textTransform: 'capitalize' }}>
              {monthName}
            </h2>
            <button onClick={goToNextMonth} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center' }}>
              <IconChevronRight />
            </button>
          </div>
        </div>

        <div style={{ background: 'var(--surface)', borderRadius: '10px', padding: '16px', border: '1px solid var(--border)' }}>
          {/* Week headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', marginBottom: '12px' }}>
            {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day) => (
              <div key={day} style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px', fontWeight: '600', padding: '8px 0' }}>
                {day}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', minHeight: '400px' }}>
            {days.map((day, idx) => {
              const items = getDayItems(day);
              const isSelected = selectedDay === day;
              const todayDay = isToday(day);

              let bg = 'transparent';
              let border = 'none';
              let borderWidth = '1px';

              if (day) {
                bg = 'var(--bg)';
                border = '1px solid var(--border)';
              }
              if (isSelected) {
                bg = 'color-mix(in oklch, var(--primary) 6%, var(--surface))';
                border = '1px solid var(--primary)';
              }
              if (todayDay && !isSelected) {
                border = '2px solid var(--primary)';
                borderWidth = '2px';
                bg = 'var(--surface)';
              }

              return (
                <div
                  key={idx}
                  onClick={() => handleDayClick(day)}
                  style={{
                    background: bg,
                    border,
                    borderRadius: '6px',
                    padding: '8px',
                    minHeight: '80px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    justifyContent: 'flex-start',
                    cursor: day ? 'pointer' : 'default',
                    transition: 'background 0.15s',
                  }}
                >
                  {day && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '4px' }}>
                      <div style={{
                        color: todayDay ? 'var(--primary)' : 'var(--text-muted)',
                        fontSize: '12px',
                        fontWeight: todayDay ? '700' : '600',
                      }}>
                        {day}
                      </div>
                      {hasObjectivesOnDay(day) && (
                        <div style={{ width: '6px', height: '6px', background: 'var(--primary)', borderRadius: '50%' }} title="Tiene objetivos" />
                      )}
                    </div>
                  )}

                  {items.tareas.map((t) => (
                    <div key={`tarea-${t.id}`} style={{ backgroundColor: '#7C6AFF', color: '#fff', fontSize: '9px', padding: '2px 4px', borderRadius: '3px', marginBottom: '2px', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {t.titulo}
                    </div>
                  ))}

                  {items.eventos.map((e) => (
                    <div key={`evento-${e.id}`} style={{ backgroundColor: TIPO_COLORS[e.tipo], color: '#fff', fontSize: '9px', padding: '2px 4px', borderRadius: '3px', marginBottom: '2px', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
            <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Tarea</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '6px', height: '6px', background: 'var(--primary)', borderRadius: '50%' }} />
            <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Con objetivos</span>
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
            background: 'var(--surface)',
            borderLeft: '1px solid var(--border)',
            boxShadow: 'var(--shadow-lg)',
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

          <div style={{ padding: '16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ color: 'var(--text)', margin: 0, fontSize: '14px', fontWeight: '600', textTransform: 'capitalize' }}>
              {formatDateLabel(selectedDay, month, year)}
            </h3>
            <button
              onClick={() => setSelectedDay(null)}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0', display: 'flex' }}
            >
              <IconX />
            </button>
          </div>

          <div style={{ flex: 1, overflow: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Objetivos */}
            {(() => {
              const dayObjectives = getObjectivesForDay(selectedDay);
              return (
                <div style={{ backgroundColor: 'color-mix(in oklch, var(--primary) 5%, transparent)', border: '1px solid color-mix(in oklch, var(--primary) 25%, transparent)', borderRadius: '6px', padding: '12px' }}>
                  <h4 style={{ color: 'var(--primary)', fontSize: '12px', fontWeight: '600', margin: '0 0 10px 0', textTransform: 'uppercase' }}>
                    Objetivos del día
                  </h4>

                  {dayObjectives.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' }}>
                      {dayObjectives.map((obj) => (
                        <div
                          key={obj.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: 'var(--bg)',
                            padding: '8px',
                            borderRadius: '4px',
                            border: '1px solid var(--border)',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={obj.completado}
                            onChange={() => handleToggleObjective(obj.id, obj.completado)}
                            style={{ width: '14px', height: '14px', cursor: 'pointer', accentColor: 'var(--primary)' }}
                          />
                          <span
                            style={{
                              flex: 1,
                              color: obj.completado ? 'var(--text-subtle)' : 'var(--text)',
                              fontSize: '12px',
                              textDecoration: obj.completado ? 'line-through' : 'none',
                              wordBreak: 'break-word',
                            }}
                          >
                            {obj.texto}
                          </span>
                          <button
                            onClick={() => handleDeleteObjective(obj.id)}
                            style={{ background: 'none', border: 'none', color: 'var(--nz-danger)', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center', flexShrink: 0 }}
                          >
                            <IconTrash />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <input
                      type="text"
                      placeholder="Nuevo objetivo..."
                      value={newObjective}
                      onChange={(e) => setNewObjective(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddObjective()}
                      style={{
                        flex: 1,
                        background: 'var(--bg)',
                        border: '1px solid var(--border)',
                        borderRadius: '4px',
                        padding: '6px 8px',
                        color: 'var(--text)',
                        fontSize: '11px',
                        boxSizing: 'border-box',
                      }}
                    />
                    <button
                      onClick={handleAddObjective}
                      style={{
                        backgroundColor: 'transparent',
                        border: '1px solid var(--primary)',
                        color: 'var(--primary)',
                        borderRadius: '4px',
                        padding: '6px 10px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '11px',
                        fontWeight: '600',
                      }}
                    >
                      <IconPlus />
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* Events & tasks */}
            {(() => {
              const items = getDayItems(selectedDay);
              const allItems = [
                ...items.tareas.map(t => ({ type: 'tarea', data: t, title: t.titulo })),
                ...items.eventos.map(e => ({ type: 'evento', data: e, title: e.titulo })),
              ];

              if (allItems.length === 0 && !isFormOpen) {
                return <div style={{ color: 'var(--text-subtle)', textAlign: 'center', paddingTop: '4px', fontSize: '13px' }}>Sin eventos este día</div>;
              }

              return (
                <>
                  {allItems.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: 'var(--bg)',
                        border: '1px solid var(--border)',
                        borderRadius: '6px',
                        padding: '12px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: '8px',
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ color: 'var(--text)', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>{item.title}</div>
                        {item.type === 'tarea' && item.data.due_date && (
                          <div style={{ color: 'var(--primary)', fontSize: '10px', marginBottom: '4px', fontWeight: '500' }}>
                            Vence: {new Date(item.data.due_date).toLocaleDateString('es-ES')}
                          </div>
                        )}
                        {item.data.notas && (
                          <div style={{ color: 'var(--text-subtle)', fontSize: '10px', marginTop: '4px', fontFamily: 'monospace', maxHeight: '40px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'pre-wrap' }}>
                            {item.data.notas}
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                        {item.type === 'tarea' && (
                          <button
                            onClick={() => navigate(`/apps/${item.data.app_id}`)}
                            title="Ver en Kanban"
                            style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
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
                            style={{ background: 'none', border: 'none', color: 'var(--nz-danger)', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
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

            {/* Formulario nuevo evento */}
            {isFormOpen && (
              <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '6px', padding: '12px' }}>
                <div style={{ marginBottom: '10px' }}>
                  <input
                    type="text"
                    placeholder="Título del evento"
                    value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '4px', padding: '6px', color: 'var(--text)', fontSize: '12px', boxSizing: 'border-box', marginBottom: '8px' }}
                  />
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                    style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '4px', padding: '6px', color: 'var(--text)', fontSize: '12px', boxSizing: 'border-box', marginBottom: '8px' }}
                  >
                    <option value="publicacion">Publicación</option>
                    <option value="update">Update</option>
                    <option value="aso">ASO</option>
                    <option value="revision">Revisión</option>
                    <option value="vencimiento">Vencimiento</option>
                    <option value="otro">Otro</option>
                  </select>
                  <textarea
                    placeholder="Notas (opcional)"
                    value={formData.notas}
                    onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                    style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '4px', padding: '6px', color: 'var(--text)', fontSize: '12px', boxSizing: 'border-box', minHeight: '60px', marginBottom: '8px', fontFamily: 'monospace', resize: 'vertical' }}
                  />
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={handleAddEvent}
                      style={{ flex: 1, padding: '6px', background: 'var(--primary)', border: 'none', color: 'var(--primary-fg)', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: '600' }}
                    >
                      Agregar
                    </button>
                    <button
                      onClick={() => setIsFormOpen(false)}
                      style={{ flex: 1, padding: '6px', backgroundColor: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}
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
                  border: '1px dashed var(--border-strong)',
                  color: 'var(--text-muted)',
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
