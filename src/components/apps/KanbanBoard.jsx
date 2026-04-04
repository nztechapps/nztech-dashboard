import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';

const IconPlus = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const IconGripVertical = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="9" cy="5" r="1"></circle>
    <circle cx="9" cy="12" r="1"></circle>
    <circle cx="9" cy="19" r="1"></circle>
    <circle cx="15" cy="5" r="1"></circle>
    <circle cx="15" cy="12" r="1"></circle>
    <circle cx="15" cy="19" r="1"></circle>
  </svg>
);

const TaskCard = ({ task, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const typeColors = {
    pipeline: { bg: 'rgba(124, 106, 255, 0.12)', text: '#7C6AFF' },
    aso: { bg: 'rgba(100, 150, 255, 0.12)', text: '#6496FF' },
    mantenimiento: { bg: 'rgba(255, 180, 0, 0.12)', text: '#FFB400' },
    marketing: { bg: 'rgba(0, 229, 160, 0.12)', text: '#00E5A0' },
    legal: { bg: 'rgba(255, 77, 79, 0.12)', text: '#FF4D4F' },
  };

  const priorityColors = {
    1: '#FF4D4F',
    2: '#FFB400',
    3: 'rgba(255,255,255,0.45)',
  };

  const typeConfig = typeColors[task.tipo] || typeColors.pipeline;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="mb-3 p-3 bg-[#1C1C26] border border-[rgba(255,255,255,0.08)] rounded-[8px] cursor-grab active:cursor-grabbing"
    >
      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
        <div {...attributes} {...listeners} style={{ cursor: 'grab', color: '#999', marginTop: '2px' }}>
          <IconGripVertical />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: 'white', fontSize: '13px', marginBottom: '6px', wordBreak: 'break-word' }}>
            {task.titulo}
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <span
              style={{
                backgroundColor: typeConfig.bg,
                color: typeConfig.text,
                fontSize: '10px',
                padding: '2px 6px',
                borderRadius: '12px',
                whiteSpace: 'nowrap',
              }}
            >
              {task.tipo}
            </span>
            <span
              style={{
                display: 'inline-block',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: priorityColors[task.prioridad] || priorityColors[3],
                marginTop: '2px',
              }}
            />
          </div>
        </div>
        {onDelete && (
          <button
            onClick={() => onDelete(task.id)}
            style={{
              background: 'none',
              border: 'none',
              color: '#FF4D4F',
              cursor: 'pointer',
              padding: '0',
              fontSize: '12px',
              flexShrink: 0,
            }}
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

const NewTaskForm = ({ estado, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    titulo: '',
    tipo: 'pipeline',
    prioridad: 2,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'prioridad' ? parseInt(value) : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.titulo.trim()) {
      alert('Por favor escribe un título');
      return;
    }
    onSubmit(estado, formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        backgroundColor: '#1C1C26',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '8px',
        padding: '12px',
        marginBottom: '12px',
      }}
    >
      <div style={{ marginBottom: '10px' }}>
        <input
          type="text"
          name="titulo"
          value={formData.titulo}
          onChange={handleChange}
          placeholder="Título de la tarea"
          style={{
            width: '100%',
            backgroundColor: '#13131A',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '6px',
            padding: '8px',
            color: 'white',
            fontSize: '13px',
            boxSizing: 'border-box',
            marginBottom: '8px',
          }}
          autoFocus
        />
      </div>

      <div style={{ marginBottom: '10px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <select
          name="tipo"
          value={formData.tipo}
          onChange={handleChange}
          style={{
            backgroundColor: '#13131A',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '6px',
            padding: '8px',
            color: 'white',
            fontSize: '12px',
          }}
        >
          <option value="pipeline">Pipeline</option>
          <option value="aso">ASO</option>
          <option value="mantenimiento">Mantenimiento</option>
          <option value="marketing">Marketing</option>
          <option value="legal">Legal</option>
        </select>

        <select
          name="prioridad"
          value={formData.prioridad}
          onChange={handleChange}
          style={{
            backgroundColor: '#13131A',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '6px',
            padding: '8px',
            color: 'white',
            fontSize: '12px',
          }}
        >
          <option value="1">Alta (1)</option>
          <option value="2">Media (2)</option>
          <option value="3">Baja (3)</option>
        </select>
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          type="submit"
          style={{
            flex: 1,
            padding: '8px',
            backgroundColor: '#00E5A0',
            border: 'none',
            color: '#0A0A0F',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '600',
          }}
        >
          Agregar
        </button>
        <button
          type="button"
          onClick={onCancel}
          style={{
            flex: 1,
            padding: '8px',
            backgroundColor: 'transparent',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#999',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '12px',
          }}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
};

const KanbanColumn = ({ title, estado, tasks, onAddTask, onDeleteTask }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { setNodeRef } = useSortable({
    id: title,
    disabled: true,
  });

  const handleAddClick = () => {
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (columnEstado, taskData) => {
    try {
      await onAddTask(columnEstado, taskData);
      setIsFormOpen(false);
    } catch (err) {
      console.error('Error adding task:', err);
    }
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        flex: 1,
        minWidth: '300px',
        backgroundColor: '#0A0A0F',
        padding: '16px',
        borderRadius: '10px',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <h3 style={{ color: 'white', fontSize: '14px', fontWeight: '600', marginBottom: '12px', marginTop: 0 }}>
        {title} <span style={{ color: '#999' }}>({tasks.length})</span>
      </h3>

      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onDelete={onDeleteTask} />
        ))}
      </SortableContext>

      {isFormOpen ? (
        <NewTaskForm estado={estado} onSubmit={handleFormSubmit} onCancel={handleFormCancel} />
      ) : (
        onAddTask && (
          <button
            onClick={handleAddClick}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: 'transparent',
              border: '1px dashed rgba(255,255,255,0.12)',
              color: '#999',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              marginTop: '8px',
            }}
          >
            <IconPlus /> Nueva tarea
          </button>
        )
      )}
    </div>
  );
};

export default function KanbanBoard({ tasks, onUpdateTask, onDeleteTask, onAddTask }) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const todoTasks = tasks.filter((t) => t.estado === 'todo');
  const inProgressTasks = tasks.filter((t) => t.estado === 'in_progress');
  const doneTasks = tasks.filter((t) => t.estado === 'done');

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const activeTask = tasks.find((t) => t.id === active.id);
      const overTask = tasks.find((t) => t.id === over.id);

      if (activeTask && overTask) {
        // Determine new state based on which column the task is over
        let newState = activeTask.estado;

        if (overTask.estado === 'todo') newState = 'todo';
        else if (overTask.estado === 'in_progress') newState = 'in_progress';
        else if (overTask.estado === 'done') newState = 'done';

        if (newState !== activeTask.estado) {
          try {
            await onUpdateTask(activeTask.id, { estado: newState });
          } catch (err) {
            console.error('Error updating task:', err);
          }
        }
      }
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div style={{ display: 'flex', gap: '16px', overflow: 'auto', paddingBottom: '16px' }}>
        <KanbanColumn
          title="Todo"
          estado="todo"
          tasks={todoTasks}
          onAddTask={onAddTask}
          onDeleteTask={onDeleteTask}
        />
        <KanbanColumn
          title="En progreso"
          estado="in_progress"
          tasks={inProgressTasks}
          onAddTask={onAddTask}
          onDeleteTask={onDeleteTask}
        />
        <KanbanColumn
          title="Hecho"
          estado="done"
          tasks={doneTasks}
          onAddTask={null}
          onDeleteTask={onDeleteTask}
        />
      </div>
    </DndContext>
  );
}
