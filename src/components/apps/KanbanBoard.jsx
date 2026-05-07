import { useState } from 'react';
import { DndContext, pointerWithin, rectIntersection, KeyboardSensor, PointerSensor, useSensor, useSensors, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import DatePicker from '../ui/DatePicker';

const IconPlus = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const IconGrip = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/>
    <circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/>
  </svg>
);
const IconText = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 7h16M4 12h16M4 17h16"/>
  </svg>
);

const typeColors = {
  pipeline:      { bg: 'var(--primary-soft)', color: 'var(--primary)' },
  aso:           { bg: 'oklch(0.97 0.04 235)', color: 'oklch(0.45 0.14 235)' },
  mantenimiento: { bg: 'oklch(0.97 0.06 75)',  color: 'oklch(0.45 0.15 75)' },
  marketing:     { bg: 'oklch(0.97 0.06 155)', color: 'oklch(0.40 0.14 155)' },
  legal:         { bg: 'oklch(0.97 0.05 27)',  color: 'oklch(0.45 0.18 27)' },
};
const priorityColors = {
  1: 'var(--nz-danger)',
  2: 'var(--nz-warning)',
  3: 'var(--text-subtle)',
};

const dateColor = (dateStr) => {
  if (!dateStr) return 'var(--text-muted)';
  const d = new Date(dateStr); const t = new Date(); t.setHours(0,0,0,0); d.setHours(0,0,0,0);
  const days = (d - t) / 86400000;
  if (days < 0) return 'var(--nz-danger)';
  if (days <= 3) return 'var(--nz-warning)';
  return 'var(--text-muted)';
};

const inputS = { width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '8px 10px', color: 'var(--text)', fontSize: 13, boxSizing: 'border-box' };

const TaskCard = ({ task, onDelete, onUpdate }) => {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [editedNotes, setEditedNotes] = useState(task.notas || '');
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
  const tc = typeColors[task.tipo] || typeColors.pipeline;

  const handleSaveNotes = async () => {
    if (onUpdate && editedNotes !== task.notas) await onUpdate(task.id, { notas: editedNotes });
    setEditingNotes(false);
  };

  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1, marginBottom: 8 }}>
      <div className="nz-card" style={{ padding: 12 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <div {...attributes} {...listeners} style={{ cursor: 'grab', color: 'var(--text-subtle)', marginTop: 2, flexShrink: 0 }}>
            <IconGrip />
          </div>
          <div style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => setExpanded(e => !e)}>
            <div style={{ color: 'var(--text)', fontSize: 13, marginBottom: 6, wordBreak: 'break-word' }}>{task.titulo}</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ background: tc.bg, color: tc.color, fontSize: 10, padding: '2px 7px', borderRadius: 'var(--radius-pill)' }}>{task.tipo}</span>
              <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: 999, background: priorityColors[task.prioridad] || priorityColors[3] }} />
              {task.notas && <span style={{ color: 'var(--text-subtle)', fontSize: 11, marginLeft: 'auto' }}><IconText /></span>}
            </div>
          </div>
          {onDelete && (
            <button onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
              style={{ background: 'none', border: 'none', color: 'var(--nz-danger)', cursor: 'pointer', fontSize: 16, flexShrink: 0, padding: 0, lineHeight: 1 }}>×</button>
          )}
        </div>
      </div>

      {expanded && (task.notas || task.due_date) && (
        <div style={{ borderTop: '1px solid var(--border)', padding: 12, background: 'var(--surface-2)', borderRadius: '0 0 var(--radius-lg) var(--radius-lg)' }} onClick={e => e.stopPropagation()}>
          {task.due_date && (
            <div style={{ marginBottom: 10, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
              <div style={{ color: 'var(--text-subtle)', fontSize: 10, marginBottom: 4 }}>Fecha límite</div>
              <div style={{ color: dateColor(task.due_date), fontSize: 13, fontWeight: 500 }}>
                {new Date(task.due_date).toLocaleDateString('es-ES')}
              </div>
            </div>
          )}
          {editingNotes ? (
            <div>
              <textarea value={editedNotes} onChange={e => setEditedNotes(e.target.value)} onBlur={handleSaveNotes}
                style={{ ...inputS, background: 'var(--surface)', fontFamily: 'var(--font-mono)', minHeight: 80, resize: 'vertical' }} autoFocus />
              <button onClick={handleSaveNotes} className="nz-btn nz-btn-primary" style={{ marginTop: 8, fontSize: 11, padding: '5px 12px' }}>Guardar</button>
            </div>
          ) : task.notas ? (
            <div>
              <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-sm)', padding: 8, marginBottom: 8, fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {task.notas}
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => { navigator.clipboard.writeText(task.notas); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                  className="nz-btn nz-btn-ghost" style={{ fontSize: 11, padding: '5px 10px' }}>
                  {copied ? 'Copiado ✓' : 'Copiar prompt'}
                </button>
                {onUpdate && (
                  <button onClick={() => setEditingNotes(true)} className="nz-btn nz-btn-ghost" style={{ fontSize: 11, padding: '5px 10px' }}>Editar</button>
                )}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

const NewTaskForm = ({ estado, onSubmit, onCancel }) => {
  const [form, setForm] = useState({ titulo: '', tipo: 'pipeline', prioridad: 2, notas: '', due_date: '' });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: name === 'prioridad' ? parseInt(value) : value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.titulo.trim()) { setErrors({ titulo: 'Requerido' }); return; }
    onSubmit(estado, form);
  };

  return (
    <form onSubmit={handleSubmit} className="nz-card" style={{ padding: 12, marginBottom: 12 }}>
      <div style={{ marginBottom: 8 }}>
        <input type="text" name="titulo" value={form.titulo} onChange={handleChange} placeholder="Título de la tarea" autoFocus
          style={{ ...inputS, border: errors.titulo ? '1px solid var(--nz-danger)' : '1px solid var(--border)' }} />
        {errors.titulo && <span style={{ color: 'var(--nz-danger)', fontSize: 11 }}>{errors.titulo}</span>}
      </div>
      <textarea name="notas" value={form.notas} onChange={handleChange} placeholder="Descripción o prompt..."
        style={{ ...inputS, marginBottom: 8, minHeight: 56, fontFamily: 'var(--font-mono)', resize: 'vertical' }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
        <select name="tipo" value={form.tipo} onChange={handleChange} style={inputS}>
          <option value="pipeline">Pipeline</option>
          <option value="aso">ASO</option>
          <option value="mantenimiento">Mantenimiento</option>
          <option value="marketing">Marketing</option>
          <option value="legal">Legal</option>
        </select>
        <select name="prioridad" value={form.prioridad} onChange={handleChange} style={inputS}>
          <option value="1">Alta</option>
          <option value="2">Media</option>
          <option value="3">Baja</option>
        </select>
      </div>
      <div style={{ marginBottom: 8 }}>
        <DatePicker value={form.due_date} onChange={d => setForm(p => ({ ...p, due_date: d }))} label="Fecha límite (opcional)" />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="submit" className="nz-btn nz-btn-primary" style={{ flex: 1, justifyContent: 'center', fontSize: 12 }}>Agregar</button>
        <button type="button" onClick={onCancel} className="nz-btn nz-btn-ghost" style={{ flex: 1, justifyContent: 'center', fontSize: 12 }}>Cancelar</button>
      </div>
    </form>
  );
};

const KanbanColumn = ({ title, estado, tasks, onAddTask, onDeleteTask, onUpdateTask }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { setNodeRef, isOver } = useDroppable({ id: estado });

  const handleFormSubmit = async (colEstado, taskData) => {
    try { await onAddTask(colEstado, taskData); setIsFormOpen(false); } catch (err) { console.error(err); }
  };

  return (
    <div ref={setNodeRef} style={{
      flex: 1, minWidth: 280, padding: 16, borderRadius: 'var(--radius-lg)',
      background: isOver ? 'var(--primary-soft)' : 'var(--bg-muted)',
      border: `1px dashed ${isOver ? 'var(--primary)' : 'var(--border)'}`,
      transition: 'background var(--dur), border-color var(--dur)',
    }}>
      <h3 style={{ color: 'var(--text)', fontSize: 14, fontWeight: 600, marginBottom: 12, marginTop: 0 }}>
        {title} <span style={{ color: 'var(--text-subtle)', fontWeight: 400 }}>({tasks.length})</span>
      </h3>
      <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        {tasks.map(task => <TaskCard key={task.id} task={task} onDelete={onDeleteTask} onUpdate={onUpdateTask} />)}
      </SortableContext>
      {isFormOpen ? (
        <NewTaskForm estado={estado} onSubmit={handleFormSubmit} onCancel={() => setIsFormOpen(false)} />
      ) : onAddTask && (
        <button onClick={() => setIsFormOpen(true)} style={{
          width: '100%', padding: 10, background: 'transparent',
          border: '1px dashed var(--border)', color: 'var(--text-subtle)',
          borderRadius: 'var(--radius)', cursor: 'pointer', fontSize: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 8,
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

  const todoTasks  = tasks.filter(t => t.estado === 'todo');
  const doingTasks = tasks.filter(t => t.estado === 'doing');
  const doneTasks  = tasks.filter(t => t.estado === 'done');

  const getCol = (id) => {
    if (todoTasks.find(t => t.id === id))  return 'todo';
    if (doingTasks.find(t => t.id === id)) return 'doing';
    if (doneTasks.find(t => t.id === id))  return 'done';
    return id;
  };

  const handleDragEnd = async ({ active, over }) => {
    if (!over) return;
    const fromCol = getCol(active.id);
    const toCol = ['todo','doing','done'].includes(over.id) ? over.id : getCol(over.id);
    if (toCol && toCol !== fromCol) {
      try { await onUpdateTask(active.id, { estado: toCol }); } catch (err) { console.error(err); }
    }
  };

  return (
    <DndContext sensors={sensors}
      collisionDetection={args => { const p = pointerWithin(args); return p.length > 0 ? p : rectIntersection(args); }}
      onDragEnd={handleDragEnd}>
      <div style={{ display: 'flex', gap: 16, overflow: 'auto', paddingBottom: 16 }}>
        <KanbanColumn title="Todo"       estado="todo"  tasks={todoTasks}  onAddTask={onAddTask} onDeleteTask={onDeleteTask} onUpdateTask={onUpdateTask} />
        <KanbanColumn title="En progreso" estado="doing" tasks={doingTasks} onAddTask={onAddTask} onDeleteTask={onDeleteTask} onUpdateTask={onUpdateTask} />
        <KanbanColumn title="Hecho"      estado="done"  tasks={doneTasks}  onAddTask={null}      onDeleteTask={onDeleteTask} onUpdateTask={onUpdateTask} />
      </div>
    </DndContext>
  );
}
