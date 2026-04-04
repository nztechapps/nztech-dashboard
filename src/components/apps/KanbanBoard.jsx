import { useState } from 'react';
import {
  DndContext, pointerWithin, rectIntersection,
  KeyboardSensor, PointerSensor, useSensor, useSensors,
  useDroppable,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import {
  SortableContext, sortableKeyboardCoordinates,
  verticalListSortingStrategy, useSortable,
} from '@dnd-kit/sortable';

const IconPlus = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const IconGripVertical = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/>
    <circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/>
  </svg>
);

const typeColors = {
  pipeline: { bg: 'rgba(124,106,255,0.12)', text: '#7C6AFF' },
  aso: { bg: 'rgba(100,150,255,0.12)', text: '#6496FF' },
  mantenimiento: { bg: 'rgba(255,180,0,0.12)', text: '#FFB400' },
  marketing: { bg: 'rgba(0,229,160,0.12)', text: '#00E5A0' },
  legal: { bg: 'rgba(255,77,79,0.12)', text: '#FF4D4F' },
};

const priorityColors = { 1: '#FF4D4F', 2: '#FFB400', 3: 'rgba(255,255,255,0.45)' };

const IconText = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 7h16M4 12h16M4 17h16"/>
  </svg>
);

const TaskCard = ({ task, onDelete, onUpdate }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [editedNotes, setEditedNotes] = useState(task.notas || '');
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
  const typeConfig = typeColors[task.tipo] || typeColors.pipeline;

  const handleCardClick = (e) => {
    if (e.target !== e.currentTarget && !e.target.closest('button')) return;
    setIsExpanded(!isExpanded);
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(task.notas || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveNotes = async () => {
    if (onUpdate && editedNotes !== task.notas) {
      await onUpdate(task.id, { notas: editedNotes });
    }
    setIsEditingNotes(false);
  };

  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
      className="mb-3 bg-[#1C1C26] border border-[rgba(255,255,255,0.08)] rounded-[8px]">
      <div style={{ padding: '12px', cursor: 'pointer' }} onClick={handleCardClick}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
          <div {...attributes} {...listeners} style={{ cursor: 'grab', color: '#999', marginTop: '2px', flexShrink: 0 }}>
            <IconGripVertical />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: 'white', fontSize: '13px', marginBottom: '6px', wordBreak: 'break-word' }}>{task.titulo}</div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ backgroundColor: typeConfig.bg, color: typeConfig.text, fontSize: '10px', padding: '2px 6px', borderRadius: '12px' }}>{task.tipo}</span>
              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: priorityColors[task.prioridad] || priorityColors[3] }} />
              {task.notas && <span style={{ color: '#666', fontSize: '12px', marginLeft: 'auto' }}><IconText /></span>}
            </div>
          </div>
          {onDelete && (
            <button onClick={(e) => { e.stopPropagation(); onDelete(task.id); }} style={{ background: 'none', border: 'none', color: '#FF4D4F', cursor: 'pointer', fontSize: '16px', flexShrink: 0, padding: '0', lineHeight: '1' }}>×</button>
          )}
        </div>
      </div>

      {isExpanded && task.notas && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '12px' }} onClick={(e) => e.stopPropagation()}>
          {isEditingNotes ? (
            <div>
              <textarea value={editedNotes} onChange={(e) => setEditedNotes(e.target.value)} onBlur={handleSaveNotes}
                style={{ width: '100%', backgroundColor: '#13131A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '8px', color: 'white', fontSize: '12px', boxSizing: 'border-box', fontFamily: 'DM Mono, monospace', minHeight: '80px', resize: 'vertical' }}
                autoFocus />
              <button onClick={handleSaveNotes} style={{ marginTop: '8px', padding: '6px 12px', backgroundColor: '#00E5A0', border: 'none', color: '#0A0A0F', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: '600' }}>Guardar</button>
            </div>
          ) : (
            <div>
              <div style={{ backgroundColor: '#13131A', borderRadius: '6px', padding: '8px', marginBottom: '8px', fontSize: '12px', color: 'rgba(255,255,255,0.7)', fontFamily: 'DM Mono, monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {task.notas}
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={handleCopyPrompt} style={{ padding: '6px 12px', backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.08)', color: '#999', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>
                  {copied ? 'Copiado ✓' : 'Copiar prompt'}
                </button>
                {onUpdate && (
                  <button onClick={() => setIsEditingNotes(true)} style={{ padding: '6px 12px', backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.08)', color: '#999', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>
                    Editar
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const NewTaskForm = ({ estado, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({ titulo: '', tipo: 'pipeline', prioridad: 2, notas: '' });
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'prioridad' ? parseInt(value) : value }));
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.titulo.trim()) return;
    onSubmit(estado, formData);
  };
  return (
    <form onSubmit={handleSubmit} style={{ backgroundColor: '#1C1C26', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '12px', marginBottom: '12px' }}>
      <input type="text" name="titulo" value={formData.titulo} onChange={handleChange} placeholder="Título de la tarea" autoFocus
        style={{ width: '100%', backgroundColor: '#13131A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '8px', color: 'white', fontSize: '13px', boxSizing: 'border-box', marginBottom: '8px' }} />
      <textarea name="notas" value={formData.notas} onChange={handleChange} placeholder="Descripción o prompt para ejecutar esta tarea..."
        style={{ width: '100%', backgroundColor: '#13131A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '8px', color: 'white', fontSize: '12px', boxSizing: 'border-box', marginBottom: '10px', minHeight: '60px', fontFamily: 'DM Mono, monospace', resize: 'vertical' }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
        <select name="tipo" value={formData.tipo} onChange={handleChange} style={{ backgroundColor: '#13131A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '8px', color: 'white', fontSize: '12px' }}>
          <option value="pipeline">Pipeline</option>
          <option value="aso">ASO</option>
          <option value="mantenimiento">Mantenimiento</option>
          <option value="marketing">Marketing</option>
          <option value="legal">Legal</option>
        </select>
        <select name="prioridad" value={formData.prioridad} onChange={handleChange} style={{ backgroundColor: '#13131A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '8px', color: 'white', fontSize: '12px' }}>
          <option value="1">Alta</option>
          <option value="2">Media</option>
          <option value="3">Baja</option>
        </select>
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button type="submit" style={{ flex: 1, padding: '8px', backgroundColor: '#00E5A0', border: 'none', color: '#0A0A0F', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>Agregar</button>
        <button type="button" onClick={onCancel} style={{ flex: 1, padding: '8px', backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.08)', color: '#999', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>Cancelar</button>
      </div>
    </form>
  );
};

const KanbanColumn = ({ title, estado, tasks, onAddTask, onDeleteTask, onUpdateTask }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { setNodeRef, isOver } = useDroppable({ id: estado });

  const handleFormSubmit = async (columnEstado, taskData) => {
    try {
      await onAddTask(columnEstado, taskData);
      setIsFormOpen(false);
    } catch (err) {
      console.error('Error adding task:', err);
    }
  };

  return (
    <div ref={setNodeRef} style={{
      flex: 1, minWidth: '280px', backgroundColor: isOver ? '#111118' : '#0A0A0F',
      padding: '16px', borderRadius: '10px',
      border: `1px solid ${isOver ? 'rgba(0,229,160,0.3)' : 'rgba(255,255,255,0.08)'}`,
      transition: 'background-color 0.15s, border-color 0.15s',
    }}>
      <h3 style={{ color: 'white', fontSize: '14px', fontWeight: '600', marginBottom: '12px', marginTop: 0 }}>
        {title} <span style={{ color: '#999' }}>({tasks.length})</span>
      </h3>
      <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        {tasks.map(task => <TaskCard key={task.id} task={task} onDelete={onDeleteTask} onUpdate={onUpdateTask} />)}
      </SortableContext>
      {isFormOpen ? (
        <NewTaskForm estado={estado} onSubmit={handleFormSubmit} onCancel={() => setIsFormOpen(false)} />
      ) : onAddTask && (
        <button onClick={() => setIsFormOpen(true)} style={{
          width: '100%', padding: '10px', backgroundColor: 'transparent',
          border: '1px dashed rgba(255,255,255,0.12)', color: '#999',
          borderRadius: '8px', cursor: 'pointer', fontSize: '12px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '8px',
        }}>
          <IconPlus /> Nueva tarea
        </button>
      )}
    </div>
  );
};

export default function KanbanBoard({ tasks, onUpdateTask, onDeleteTask, onAddTask }) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const todoTasks = tasks.filter(t => t.estado === 'todo');
  const doingTasks = tasks.filter(t => t.estado === 'doing');
  const doneTasks = tasks.filter(t => t.estado === 'done');

  const getColumnEstado = (itemId) => {
    if (todoTasks.find(t => t.id === itemId)) return 'todo';
    if (doingTasks.find(t => t.id === itemId)) return 'doing';
    if (doneTasks.find(t => t.id === itemId)) return 'done';
    return itemId;
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeEstado = getColumnEstado(active.id);
    const overEstado = getColumnEstado(over.id);
    const newEstado = ['todo', 'doing', 'done'].includes(over.id) ? over.id : overEstado;

    if (newEstado && newEstado !== activeEstado) {
      try {
        await onUpdateTask(active.id, { estado: newEstado });
      } catch (err) {
        console.error('Error updating task:', err);
      }
    }
  };

  return (
    <DndContext sensors={sensors}
      collisionDetection={(args) => {
        const p = pointerWithin(args);
        return p.length > 0 ? p : rectIntersection(args);
      }}
      onDragEnd={handleDragEnd}>
      <div style={{ display: 'flex', gap: '16px', overflow: 'auto', paddingBottom: '16px' }}>
        <KanbanColumn title="Todo" estado="todo" tasks={todoTasks} onAddTask={onAddTask} onDeleteTask={onDeleteTask} onUpdateTask={onUpdateTask} />
        <KanbanColumn title="En progreso" estado="doing" tasks={doingTasks} onAddTask={onAddTask} onDeleteTask={onDeleteTask} onUpdateTask={onUpdateTask} />
        <KanbanColumn title="Hecho" estado="done" tasks={doneTasks} onAddTask={null} onDeleteTask={onDeleteTask} onUpdateTask={onUpdateTask} />
      </div>
    </DndContext>
  );
}