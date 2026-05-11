import { useState, useRef } from 'react'
import { useTareas } from '../hooks/useTareas'
import { supabase } from '../lib/supabase'

const ESTADOS = ['pendiente', 'en_progreso', 'completado', 'bloqueado']

const ESTADO_CONFIG = {
  pendiente:   { label: 'Pendiente',   bg: 'var(--surface-2)',  color: 'var(--text-muted)' },
  en_progreso: { label: 'En progreso', bg: 'color-mix(in oklch, var(--nz-info) 12%, var(--surface))', color: 'var(--nz-info)' },
  completado:  { label: 'Completado',  bg: 'color-mix(in oklch, var(--nz-success) 12%, var(--surface))', color: 'var(--nz-success)' },
  bloqueado:   { label: 'Bloqueado',   bg: 'color-mix(in oklch, var(--nz-danger) 12%, var(--surface))', color: 'var(--nz-danger)' },
}

function nextEstado(estado) {
  const idx = ESTADOS.indexOf(estado)
  return ESTADOS[(idx + 1) % ESTADOS.length]
}

// ---- CSV helpers ----
function tareasToCSV(tareas) {
  const headers = ['titulo', 'descripcion', 'bloque', 'estado', 'tiempo_estimado', 'tags', 'flag', 'notas', 'orden']
  const rows = tareas.map((t) =>
    headers.map((h) => {
      const v = t[h]
      if (Array.isArray(v)) return `"${v.join(';')}"`
      if (typeof v === 'string' && (v.includes(',') || v.includes('"') || v.includes('\n')))
        return `"${v.replace(/"/g, '""')}"`
      return v ?? ''
    }).join(',')
  )
  return [headers.join(','), ...rows].join('\n')
}

function csvToTareas(csv) {
  const lines = csv.trim().split('\n')
  const headers = lines[0].split(',')
  return lines.slice(1).map((line) => {
    const values = []
    let cur = ''
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
      if (line[i] === '"') { inQuotes = !inQuotes; continue }
      if (line[i] === ',' && !inQuotes) { values.push(cur); cur = ''; continue }
      cur += line[i]
    }
    values.push(cur)
    const obj = {}
    headers.forEach((h, i) => {
      const v = values[i] ?? ''
      if (h === 'tags') obj[h] = v ? v.split(';').map((s) => s.trim()) : []
      else if (h === 'flag') obj[h] = v === 'true'
      else if (h === 'orden') obj[h] = parseInt(v) || 0
      else obj[h] = v
    })
    return obj
  })
}

const BLOQUES_DEFAULT = {
  A: { nombre: 'Bloque A — Ensamblador',                  color: 'var(--primary)', orden: 0 },
  B: { nombre: 'Bloque B — Dashboard prioritario',        color: '#3B82F6', orden: 1 },
  C: { nombre: 'Bloque C — Perfiles freelance',           color: '#F59E0B', orden: 2 },
  D: { nombre: 'Bloque D — Dashboard segunda prioridad',  color: '#EC4899', orden: 3 },
  E: { nombre: 'Bloque E — Optimizaciones del ciclo',     color: '#8B5CF6', orden: 4 },
}

const inputStyle = {
  width: '100%',
  background: 'var(--bg)',
  border: '1px solid var(--border)',
  borderRadius: '6px',
  color: 'var(--text)',
  fontSize: '13px',
  padding: '8px 10px',
  outline: 'none',
}

const btnPrimaryStyle = {
  padding: '6px 16px',
  borderRadius: '6px',
  background: 'var(--primary)',
  color: 'var(--primary-fg)',
  fontSize: '13px',
  fontWeight: '600',
  border: 'none',
  cursor: 'pointer',
}

const btnSecondaryStyle = {
  padding: '6px 14px',
  borderRadius: '6px',
  background: 'var(--surface-2)',
  color: 'var(--text-muted)',
  fontSize: '13px',
  border: '1px solid var(--border)',
  cursor: 'pointer',
}

// ---- Task Detail Modal ----
function TareaDetailModal({ tarea, bloqueName, onClose, onSave, onDelete }) {
  const [form, setForm] = useState({
    titulo: tarea.titulo || '',
    descripcion: tarea.descripcion || '',
    estado: tarea.estado || 'pendiente',
    tiempo_estimado: tarea.tiempo_estimado || '',
    tags: Array.isArray(tarea.tags) ? tarea.tags.join(', ') : (tarea.tags || ''),
    flag: tarea.flag || false,
    notas: tarea.notas || '',
  })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave(tarea.id, {
        titulo: form.titulo.trim(),
        descripcion: form.descripcion.trim(),
        estado: form.estado,
        tiempo_estimado: form.tiempo_estimado.trim(),
        tags: form.tags ? form.tags.split(',').map(s => s.trim()).filter(Boolean) : [],
        flag: form.flag,
        notas: form.notas.trim(),
      })
      onClose()
    } catch (e) {
      alert('Error al guardar: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('¿Eliminar esta tarea?')) return
    await onDelete(tarea.id)
    onClose()
  }

  const cfg = ESTADO_CONFIG[form.estado] || ESTADO_CONFIG.pendiente

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '14px',
        padding: '24px',
        width: '480px',
        maxWidth: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: 'var(--shadow-lg)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <h3 style={{ color: 'var(--text)', fontWeight: '700', fontSize: '16px', margin: 0 }}>
              Detalle de tarea
            </h3>
            {bloqueName && (
              <span style={{ color: 'var(--text-subtle)', fontSize: '12px' }}>{bloqueName}</span>
            )}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '18px', lineHeight: 1 }}>✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', marginBottom: '4px' }}>
              Título
            </label>
            <input
              value={form.titulo}
              onChange={(e) => setForm(f => ({ ...f, titulo: e.target.value }))}
              style={inputStyle}
              autoFocus
            />
          </div>

          <div>
            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', marginBottom: '4px' }}>
              Descripción
            </label>
            <input
              value={form.descripcion}
              onChange={(e) => setForm(f => ({ ...f, descripcion: e.target.value }))}
              style={inputStyle}
              placeholder="Descripción opcional"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', marginBottom: '4px' }}>
                Estado
              </label>
              <select
                value={form.estado}
                onChange={(e) => setForm(f => ({ ...f, estado: e.target.value }))}
                style={{ ...inputStyle, padding: '8px 10px' }}
              >
                {ESTADOS.map(e => (
                  <option key={e} value={e}>{ESTADO_CONFIG[e].label}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', marginBottom: '4px' }}>
                Tiempo estimado
              </label>
              <input
                value={form.tiempo_estimado}
                onChange={(e) => setForm(f => ({ ...f, tiempo_estimado: e.target.value }))}
                style={inputStyle}
                placeholder="ej: 3h"
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', marginBottom: '4px' }}>
              Tags (coma separados)
            </label>
            <input
              value={form.tags}
              onChange={(e) => setForm(f => ({ ...f, tags: e.target.value }))}
              style={inputStyle}
              placeholder="ej: frontend, bug, urgente"
            />
          </div>

          <div>
            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', marginBottom: '6px' }}>
              Notas
            </label>
            <textarea
              value={form.notas}
              onChange={(e) => setForm(f => ({ ...f, notas: e.target.value }))}
              rows={4}
              style={{ ...inputStyle, resize: 'vertical', fontFamily: 'var(--font-mono)', fontSize: '12px' }}
              placeholder="Notas o aprendizajes..."
            />
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '13px' }}>
            <input
              type="checkbox"
              checked={form.flag}
              onChange={(e) => setForm(f => ({ ...f, flag: e.target.checked }))}
              style={{ accentColor: 'var(--nz-danger)', width: '15px', height: '15px' }}
            />
            🚩 Marcar dificultad
          </label>

          <div style={{ display: 'flex', gap: '8px', paddingTop: '4px' }}>
            <button onClick={handleSave} disabled={saving} style={btnPrimaryStyle}>
              {saving ? 'Guardando…' : 'Guardar cambios'}
            </button>
            <button onClick={onClose} style={btnSecondaryStyle}>Cancelar</button>
            <button
              onClick={handleDelete}
              style={{ marginLeft: 'auto', padding: '6px 14px', borderRadius: '6px', background: 'transparent', border: '1px solid color-mix(in oklch, var(--nz-danger) 40%, transparent)', color: 'var(--nz-danger)', fontSize: '13px', cursor: 'pointer' }}
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ---- Nuevo bloque modal ----
function NuevoBloqueModal({ onClose, onSave }) {
  const [nombre, setNombre] = useState('')
  const [color, setColor] = useState('#00E5A0')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!nombre.trim()) return
    setSaving(true)
    try {
      await onSave({ nombre: nombre.trim(), color })
      onClose()
    } catch (e) {
      alert('Error al crear bloque: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '14px',
        padding: '24px',
        width: '360px',
        boxShadow: 'var(--shadow-lg)',
      }}>
        <h3 style={{ color: 'var(--text)', fontWeight: '700', fontSize: '16px', margin: '0 0 16px' }}>
          Nuevo bloque
        </h3>
        <div className="flex flex-col gap-3">
          <input
            placeholder="Nombre del bloque *"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            autoFocus
            style={inputStyle}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          />
          <div className="flex items-center gap-3">
            <label style={{ color: 'var(--text-muted)', fontSize: '13px', whiteSpace: 'nowrap' }}>Color</label>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              style={{ width: '40px', height: '32px', border: '1px solid var(--border)', borderRadius: '6px', backgroundColor: 'transparent', cursor: 'pointer', padding: '2px' }}
            />
            <span style={{ flex: 1, height: '8px', borderRadius: '4px', backgroundColor: color, opacity: 0.7 }} />
          </div>
          <div className="flex gap-2 mt-1">
            <button onClick={handleSave} disabled={saving} style={btnPrimaryStyle}>
              {saving ? 'Guardando…' : 'Crear bloque'}
            </button>
            <button onClick={onClose} style={btnSecondaryStyle}>Cancelar</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ---- Task card (list view) ----
function TareaCard({ tarea, bloqueActivo, readonly, onUpdateEstado, onToggleFlag, onUpdateNotas, onDelete, onOpenDetail, dragHandlers }) {
  const [expanded, setExpanded] = useState(false)
  const [notas, setNotas] = useState(tarea.notas || '')
  const [editingNotas, setEditingNotas] = useState(false)
  const cfg = ESTADO_CONFIG[tarea.estado] || ESTADO_CONFIG.pendiente
  const isLocked = !bloqueActivo || readonly

  return (
    <div
      draggable={!isLocked}
      onDragStart={dragHandlers?.onDragStart}
      onDragOver={dragHandlers?.onDragOver}
      onDrop={dragHandlers?.onDrop}
      onDragEnd={dragHandlers?.onDragEnd}
      data-id={tarea.id}
      style={{
        background: 'var(--surface)',
        border: `1px solid ${tarea.flag ? 'color-mix(in oklch, var(--nz-danger) 30%, var(--border))' : 'var(--border)'}`,
        borderRadius: '10px',
        padding: '14px 16px',
        cursor: isLocked ? 'default' : 'grab',
        transition: 'opacity 0.15s',
      }}
    >
      <div className="flex items-start gap-3">
        <button
          disabled={isLocked}
          onClick={() => !isLocked && onUpdateEstado(tarea.id, nextEstado(tarea.estado))}
          style={{
            flexShrink: 0, marginTop: '2px',
            padding: '3px 8px', borderRadius: '6px',
            fontSize: '11px', fontWeight: '600',
            backgroundColor: cfg.bg, color: cfg.color,
            border: 'none', cursor: isLocked ? 'not-allowed' : 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          {cfg.label}
        </button>

        <span
          style={{
            flex: 1,
            color: tarea.estado === 'completado' ? 'var(--text-subtle)' : 'var(--text)',
            textDecoration: tarea.estado === 'completado' ? 'line-through' : 'none',
            fontSize: '14px', fontWeight: '500', cursor: 'pointer',
          }}
          onClick={() => onOpenDetail(tarea)}
        >
          {tarea.titulo}
        </span>

        {tarea.tiempo_estimado && (
          <span style={{ color: 'var(--text-subtle)', fontSize: '12px', flexShrink: 0 }}>
            {tarea.tiempo_estimado}
          </span>
        )}

        <button
          disabled={isLocked}
          onClick={() => !isLocked && onToggleFlag(tarea.id, !tarea.flag)}
          style={{
            background: 'none', border: 'none',
            cursor: isLocked ? 'not-allowed' : 'pointer',
            fontSize: '14px', opacity: tarea.flag ? 1 : 0.25,
            padding: '0 2px', flexShrink: 0,
          }}
          title="Marcar dificultad"
        >
          🚩
        </button>

        <button
          onClick={() => setExpanded((e) => !e)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-subtle)', fontSize: '12px', padding: '0 2px', flexShrink: 0 }}
        >
          {expanded ? '▲' : '▼'}
        </button>
      </div>

      {tarea.tags && tarea.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2 ml-1">
          {tarea.tags.map((tag) => (
            <span key={tag} style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '10px', background: 'var(--surface-2)', color: 'var(--text-subtle)', border: '1px solid var(--border)' }}>
              {tag}
            </span>
          ))}
        </div>
      )}

      {expanded && (
        <div style={{ marginTop: '12px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
          {tarea.descripcion && (
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '10px' }}>
              {tarea.descripcion}
            </p>
          )}

          <div>
            <div style={{ color: 'var(--text-subtle)', fontSize: '11px', marginBottom: '4px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Notas / Aprendizajes
            </div>
            {editingNotas && !readonly ? (
              <div className="flex flex-col gap-2">
                <textarea
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  rows={3}
                  style={{ width: '100%', background: 'var(--bg)', border: '1px solid color-mix(in oklch, var(--primary) 30%, var(--border))', borderRadius: '6px', color: 'var(--text)', fontSize: '13px', padding: '8px', resize: 'vertical' }}
                />
                <div className="flex gap-2">
                  <button onClick={() => { onUpdateNotas(tarea.id, notas); setEditingNotas(false) }} style={btnPrimaryStyle}>Guardar</button>
                  <button onClick={() => { setNotas(tarea.notas || ''); setEditingNotas(false) }} style={btnSecondaryStyle}>Cancelar</button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => !isLocked && setEditingNotas(true)}
                style={{
                  minHeight: '36px', background: 'var(--bg)',
                  border: '1px dashed var(--border)', borderRadius: '6px',
                  padding: '8px',
                  color: notas ? 'var(--text)' : 'var(--text-subtle)',
                  fontSize: '13px', cursor: isLocked ? 'default' : 'pointer',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {notas || (readonly ? '—' : 'Click para agregar notas…')}
              </div>
            )}
          </div>

          {!readonly && (
            <div className="flex justify-end mt-3">
              <button
                onClick={() => onDelete(tarea.id)}
                style={{ background: 'none', border: '1px solid color-mix(in oklch, var(--nz-danger) 30%, transparent)', borderRadius: '6px', color: 'var(--nz-danger)', fontSize: '11px', padding: '3px 10px', cursor: 'pointer', opacity: 0.7 }}
              >
                Eliminar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ---- Task card (card grid view) ----
function TareaGridCard({ tarea, bloqueName, bloqueColor, onOpenDetail }) {
  const cfg = ESTADO_CONFIG[tarea.estado] || ESTADO_CONFIG.pendiente

  return (
    <div
      onClick={() => onOpenDetail(tarea)}
      style={{
        background: 'var(--surface)',
        border: `1px solid ${tarea.flag ? 'color-mix(in oklch, var(--nz-danger) 30%, var(--border))' : 'var(--border)'}`,
        borderRadius: '10px',
        padding: '14px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        transition: 'box-shadow 0.15s, border-color 0.15s',
      }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
        <span style={{
          color: tarea.estado === 'completado' ? 'var(--text-subtle)' : 'var(--text)',
          textDecoration: tarea.estado === 'completado' ? 'line-through' : 'none',
          fontSize: '13px', fontWeight: '600', lineHeight: '1.4',
        }}>
          {tarea.titulo}
        </span>
        {tarea.flag && <span style={{ flexShrink: 0, fontSize: '13px' }}>🚩</span>}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
        <span style={{ fontSize: '10px', fontWeight: '600', padding: '2px 7px', borderRadius: '6px', background: cfg.bg, color: cfg.color }}>
          {cfg.label}
        </span>
        {tarea.tiempo_estimado && (
          <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '6px', background: 'var(--surface-2)', color: 'var(--text-subtle)', border: '1px solid var(--border)' }}>
            {tarea.tiempo_estimado}
          </span>
        )}
      </div>

      {tarea.tags && tarea.tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {tarea.tags.slice(0, 3).map((tag) => (
            <span key={tag} style={{ fontSize: '9px', padding: '1px 6px', borderRadius: '10px', background: 'var(--surface-2)', color: 'var(--text-subtle)', border: '1px solid var(--border)' }}>
              {tag}
            </span>
          ))}
        </div>
      )}

      {bloqueName && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: 'auto' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: bloqueColor || 'var(--primary)', flexShrink: 0 }} />
          <span style={{ fontSize: '10px', color: 'var(--text-subtle)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {bloqueName}
          </span>
        </div>
      )}
    </div>
  )
}

// ---- Bloque section ----
function BloqueSection({
  bloque, tareas, idx, esBloqueActivo, readonly, viewMode,
  onUpdateEstado, onToggleFlag, onUpdateNotas, onDelete, onAddTarea, onArchivar, onOpenDetail, onReorder,
  bloqueDragHandlers, isDragOver,
}) {
  const [collapsed, setCollapsed] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [newTarea, setNewTarea] = useState({ titulo: '', descripcion: '', tiempo_estimado: '', tags: '' })
  const [dragOverId, setDragOverId] = useState(null)
  const draggedId = { current: null }

  const completadas = tareas.filter((t) => t.estado === 'completado').length
  const total = tareas.length
  const progreso = total > 0 ? Math.round((completadas / total) * 100) : 0
  const puedeArchivar = total > 0 && progreso === 100 && !readonly

  const handleAdd = async () => {
    if (!newTarea.titulo.trim()) return
    await onAddTarea({
      titulo: newTarea.titulo.trim(),
      descripcion: newTarea.descripcion.trim(),
      bloque: bloque.id,
      estado: 'pendiente',
      tiempo_estimado: newTarea.tiempo_estimado.trim(),
      tags: newTarea.tags ? newTarea.tags.split(',').map((s) => s.trim()).filter(Boolean) : [],
      flag: false, notas: '',
      orden: tareas.length + 1,
    })
    setNewTarea({ titulo: '', descripcion: '', tiempo_estimado: '', tags: '' })
    setShowForm(false)
  }

  const badgeMatch = bloque.nombre.match(/bloque\s+([^\s—–\-]+)/i)
  const badge = badgeMatch ? badgeMatch[1].toUpperCase() : (bloque.nombre.trim()[0]?.toUpperCase() || String(idx + 1))

  const borderColor = readonly
    ? 'var(--border)'
    : esBloqueActivo
      ? `color-mix(in oklch, ${bloque.color} 25%, var(--border))`
      : 'var(--border)'

  // Drag handlers for list items
  const makeDragHandlers = (tarea) => ({
    onDragStart: (e) => {
      draggedId.current = tarea.id
      e.dataTransfer.effectAllowed = 'move'
    },
    onDragOver: (e) => {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'move'
      setDragOverId(tarea.id)
    },
    onDrop: (e) => {
      e.preventDefault()
      const fromId = draggedId.current
      if (!fromId || fromId === tarea.id) { setDragOverId(null); return }
      const ordered = [...tareas].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
      const fromIdx = ordered.findIndex(t => t.id === fromId)
      const toIdx = ordered.findIndex(t => t.id === tarea.id)
      if (fromIdx === -1 || toIdx === -1) { setDragOverId(null); return }
      const reordered = [...ordered]
      const [moved] = reordered.splice(fromIdx, 1)
      reordered.splice(toIdx, 0, moved)
      const withNewOrdenes = reordered.map((t, i) => ({ ...t, orden: i }))
      onReorder(withNewOrdenes)
      draggedId.current = null
      setDragOverId(null)
    },
    onDragEnd: () => {
      draggedId.current = null
      setDragOverId(null)
    },
  })

  return (
    <div
      draggable={!!bloqueDragHandlers}
      onDragStart={bloqueDragHandlers?.onDragStart}
      onDragOver={bloqueDragHandlers?.onDragOver}
      onDrop={bloqueDragHandlers?.onDrop}
      onDragEnd={bloqueDragHandlers?.onDragEnd}
      style={{
        background: 'var(--surface)',
        border: `1px solid ${isDragOver ? 'var(--primary)' : borderColor}`,
        borderRadius: '14px', overflow: 'hidden',
        opacity: readonly ? 0.75 : 1,
        transition: 'opacity 0.2s, border-color 0.15s',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '10px 14px',
          borderBottom: collapsed ? 'none' : '1px solid var(--border)',
          cursor: 'pointer',
        }}
        onClick={() => setCollapsed((c) => !c)}
      >
        <div className="flex items-center gap-2">
          {bloqueDragHandlers && (
            <span
              onMouseDown={(e) => e.stopPropagation()}
              style={{
                color: 'var(--text-subtle)', fontSize: '13px', cursor: 'grab',
                padding: '0 2px', flexShrink: 0, lineHeight: 1, userSelect: 'none',
                letterSpacing: '-1px',
              }}
              title="Arrastrar bloque"
            >
              ⋮⋮
            </span>
          )}
          <div style={{
            width: '28px', height: '28px', borderRadius: '7px', flexShrink: 0,
            backgroundColor: `color-mix(in oklch, ${readonly ? 'var(--text-subtle)' : bloque.color} 15%, transparent)`,
            border: `1px solid color-mix(in oklch, ${readonly ? 'var(--text-subtle)' : bloque.color} 30%, transparent)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: readonly ? 'var(--text-subtle)' : bloque.color,
            fontWeight: '700', fontSize: '13px',
          }}>
            {badge}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="flex items-center gap-2 flex-wrap">
              <span style={{ color: readonly ? 'var(--text-subtle)' : 'var(--text)', fontWeight: '600', fontSize: '13px' }}>
                {bloque.nombre}
              </span>
              {readonly && (
                <span style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '10px', background: 'var(--surface-2)', color: 'var(--text-subtle)', border: '1px solid var(--border)' }}>
                  Archivado
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div style={{ flex: 1, height: '3px', backgroundColor: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{
                  width: `${progreso}%`, height: '100%',
                  backgroundColor: readonly ? 'var(--text-subtle)' : bloque.color,
                  borderRadius: '2px', transition: 'width 0.4s ease',
                }} />
              </div>
              <span style={{ color: 'var(--text-subtle)', fontSize: '11px', whiteSpace: 'nowrap' }}>
                {completadas}/{total} · {progreso}%
              </span>
            </div>
          </div>

          {puedeArchivar && (
            <button
              onClick={(e) => { e.stopPropagation(); onArchivar(bloque.id) }}
              style={{
                padding: '4px 10px', borderRadius: '6px', fontSize: '11px',
                backgroundColor: 'color-mix(in oklch, var(--primary) 10%, transparent)',
                color: 'var(--primary)',
                border: '1px solid color-mix(in oklch, var(--primary) 25%, transparent)',
                cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
              }}
            >
              Archivar bloque
            </button>
          )}

          <span style={{ color: 'var(--text-subtle)', fontSize: '12px', flexShrink: 0 }}>
            {collapsed ? '▼' : '▲'}
          </span>
        </div>
      </div>

      {/* Tasks */}
      {!collapsed && (
        <div style={{ padding: '12px 16px 16px' }}>
          {viewMode === 'cards' ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '10px',
            }}>
              {tareas.map((t) => (
                <TareaGridCard
                  key={t.id}
                  tarea={t}
                  bloqueName={bloque.nombre}
                  bloqueColor={bloque.color}
                  onOpenDetail={onOpenDetail}
                />
              ))}
              {tareas.length === 0 && (
                <p style={{ color: 'var(--text-subtle)', fontSize: '13px', gridColumn: '1/-1', padding: '12px 0', textAlign: 'center' }}>
                  Sin tareas
                </p>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {tareas
                .slice()
                .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
                .map((t) => (
                  <div
                    key={t.id}
                    style={{
                      outline: dragOverId === t.id ? '2px solid var(--primary)' : 'none',
                      borderRadius: '10px',
                      transition: 'outline 0.1s',
                    }}
                  >
                    <TareaCard
                      tarea={t}
                      bloqueActivo={esBloqueActivo}
                      readonly={readonly}
                      onUpdateEstado={onUpdateEstado}
                      onToggleFlag={onToggleFlag}
                      onUpdateNotas={onUpdateNotas}
                      onDelete={onDelete}
                      onOpenDetail={onOpenDetail}
                      dragHandlers={!readonly ? makeDragHandlers(t) : undefined}
                    />
                  </div>
                ))}
              {tareas.length === 0 && (
                <p style={{ color: 'var(--text-subtle)', fontSize: '13px', textAlign: 'center', padding: '12px 0' }}>
                  Sin tareas
                </p>
              )}
            </div>
          )}

          {esBloqueActivo && !readonly && (
            <div style={{ marginTop: '10px' }}>
              {showForm ? (
                <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '14px' }}>
                  <div className="flex flex-col gap-2">
                    <input
                      placeholder="Título de la tarea *"
                      value={newTarea.titulo}
                      onChange={(e) => setNewTarea((p) => ({ ...p, titulo: e.target.value }))}
                      style={inputStyle}
                    />
                    <input
                      placeholder="Descripción"
                      value={newTarea.descripcion}
                      onChange={(e) => setNewTarea((p) => ({ ...p, descripcion: e.target.value }))}
                      style={inputStyle}
                    />
                    <div className="flex gap-2">
                      <input
                        placeholder="Tiempo estimado (ej: 3h)"
                        value={newTarea.tiempo_estimado}
                        onChange={(e) => setNewTarea((p) => ({ ...p, tiempo_estimado: e.target.value }))}
                        style={{ ...inputStyle, flex: 1 }}
                      />
                      <input
                        placeholder="Tags (coma separados)"
                        value={newTarea.tags}
                        onChange={(e) => setNewTarea((p) => ({ ...p, tags: e.target.value }))}
                        style={{ ...inputStyle, flex: 1 }}
                      />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={handleAdd} style={btnPrimaryStyle}>Agregar</button>
                      <button onClick={() => setShowForm(false)} style={btnSecondaryStyle}>Cancelar</button>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowForm(true)}
                  style={{
                    width: '100%', padding: '8px', borderRadius: '8px',
                    border: '1px dashed var(--border-strong)',
                    backgroundColor: 'transparent', color: 'var(--text-subtle)',
                    fontSize: '13px', cursor: 'pointer',
                  }}
                >
                  + Agregar tarea
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ---- Main page ----
export default function Tareas() {
  const { tareas, bloques, loading, error, addBloque, archivarBloque, updateTarea, addTarea, deleteTarea, importTareas, reorderBloques, refetch } = useTareas()
  const [showArchivar, setShowArchivar] = useState(false)
  const [showNuevoBloque, setShowNuevoBloque] = useState(false)
  const [viewMode, setViewMode] = useState('list')
  const [selectedTarea, setSelectedTarea] = useState(null)
  const bloqueDragRef = useRef(null)
  const [bloqueDragOver, setBloqueDragOver] = useState(null)

  const handleUpdateEstado = async (id, estado) => {
    try { await updateTarea(id, { estado }) } catch (e) { console.error(e) }
  }
  const handleToggleFlag = async (id, flag) => {
    try { await updateTarea(id, { flag }) } catch (e) { console.error(e) }
  }
  const handleUpdateNotas = async (id, notas) => {
    try { await updateTarea(id, { notas }) } catch (e) { console.error(e) }
  }
  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta tarea?')) return
    try { await deleteTarea(id) } catch (e) { console.error(e) }
  }
  const handleAddTarea = async (tarea) => {
    try { await addTarea(tarea) } catch (e) { console.error(e) }
  }
  const handleArchivar = async (id) => {
    if (!window.confirm('¿Archivar este bloque? Quedará en solo lectura.')) return
    try { await archivarBloque(id) } catch (e) { console.error(e) }
  }
  const handleAddBloque = async (data) => {
    await addBloque(data)
  }
  const handleSaveDetail = async (id, updates) => {
    await updateTarea(id, updates)
  }
  const handleDeleteFromDetail = async (id) => {
    try { await deleteTarea(id) } catch (e) { console.error(e) }
  }
  const handleReorder = async (reorderedTareas) => {
    try {
      await Promise.all(reorderedTareas.map(t => updateTarea(t.id, { orden: t.orden })))
    } catch (e) { console.error(e) }
  }

  const makeBloqueDragHandlers = (bloque) => ({
    onDragStart: (e) => {
      bloqueDragRef.current = bloque.id
      e.dataTransfer.effectAllowed = 'move'
    },
    onDragOver: (e) => {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'move'
      if (bloqueDragRef.current !== bloque.id) setBloqueDragOver(bloque.id)
    },
    onDrop: (e) => {
      e.preventDefault()
      const fromId = bloqueDragRef.current
      if (!fromId || fromId === bloque.id) { setBloqueDragOver(null); return }
      const sorted = bloques.filter((b) => !b.archivado).sort((a, b) => a.orden - b.orden)
      const fromIdx = sorted.findIndex((b) => b.id === fromId)
      const toIdx = sorted.findIndex((b) => b.id === bloque.id)
      if (fromIdx === -1 || toIdx === -1) { setBloqueDragOver(null); return }
      const reordered = [...sorted]
      const [moved] = reordered.splice(fromIdx, 1)
      reordered.splice(toIdx, 0, moved)
      reorderBloques(reordered.map((b, i) => ({ ...b, orden: i })))
      bloqueDragRef.current = null
      setBloqueDragOver(null)
    },
    onDragEnd: () => {
      bloqueDragRef.current = null
      setBloqueDragOver(null)
    },
  })

  const bloquesActivos = bloques.filter((b) => !b.archivado).sort((a, b) => a.orden - b.orden)
  const bloquesArchivados = bloques.filter((b) => b.archivado).sort((a, b) => a.orden - b.orden)

  const esBloqueActivo = () => true

  const tareasActivas = tareas.filter((t) => bloquesActivos.some((b) => b.id === t.bloque))
  const totalTareas = tareasActivas.length
  const completadasTotal = tareasActivas.filter((t) => t.estado === 'completado').length
  const progresoGlobal = totalTareas > 0 ? Math.round((completadasTotal / totalTareas) * 100) : 0

  const handleExport = () => {
    const csv = tareasToCSV(tareas)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'tareas_nztech.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (ev) => {
      try {
        const parsed = csvToTareas(ev.target.result)
        const bloqueValues = [...new Set(parsed.map((t) => t.bloque).filter(Boolean))]
        const { data: existentes, error: bErr } = await supabase.from('bloques_tareas').select('*')
        if (bErr) throw bErr
        const bloqueMap = {}
        for (const val of bloqueValues) {
          if (existentes.find((b) => b.id === val)) { bloqueMap[val] = val; continue }
          const defaults = BLOQUES_DEFAULT[val.toUpperCase()] || { nombre: `Bloque ${val}`, color: '#888780', orden: 99 }
          const porNombre = existentes.find((b) => b.nombre === defaults.nombre)
          if (porNombre) {
            bloqueMap[val] = porNombre.id
          } else {
            const { data: nuevo, error: cErr } = await supabase.from('bloques_tareas').insert(defaults).select().single()
            if (cErr) throw cErr
            bloqueMap[val] = nuevo.id
          }
        }
        const tareasConUUID = parsed.map((t) => ({ ...t, bloque: bloqueMap[t.bloque] || t.bloque }))
        await importTareas(tareasConUUID)
        await refetch()
      } catch (err) {
        alert('Error al importar CSV: ' + err.message)
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleBorrarTodas = async () => {
    if (!window.confirm('¿Borrar TODAS las tareas? Esta acción no se puede deshacer.')) return
    await supabase.from('tareas').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    window.location.reload()
  }

  const getBloqueForTarea = (tarea) => bloques.find(b => b.id === tarea.bloque)

  if (loading) {
    return (
      <div style={{ padding: '32px', background: 'var(--bg)', minHeight: '100%', color: 'var(--text-subtle)', textAlign: 'center' }}>
        Cargando tareas…
      </div>
    )
  }

  if (error) {
    return <div style={{ padding: '32px', color: 'var(--nz-danger)' }}>Error: {error}</div>
  }

  return (
    <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto', background: 'var(--bg)', minHeight: '100%' }}>
      {showNuevoBloque && (
        <NuevoBloqueModal onClose={() => setShowNuevoBloque(false)} onSave={handleAddBloque} />
      )}

      {selectedTarea && (
        <TareaDetailModal
          tarea={selectedTarea}
          bloqueName={getBloqueForTarea(selectedTarea)?.nombre}
          onClose={() => setSelectedTarea(null)}
          onSave={handleSaveDetail}
          onDelete={handleDeleteFromDetail}
        />
      )}

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4" style={{ marginBottom: '24px' }}>
        <div>
          <h1 style={{ color: 'var(--text)', fontSize: '22px', fontWeight: '700', margin: 0 }}>
            Tareas del Proyecto
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
            Bloques secuenciales — completa uno para desbloquear el siguiente.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {/* View toggle */}
          <div style={{ display: 'flex', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
            {[
              { key: 'list', label: 'Lista' },
              { key: 'cards', label: 'Tarjetas' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setViewMode(key)}
                style={{
                  padding: '5px 12px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  background: viewMode === key ? 'var(--primary)' : 'transparent',
                  color: viewMode === key ? 'var(--primary-fg)' : 'var(--text-muted)',
                  transition: 'background 0.15s, color 0.15s',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          <button onClick={() => setShowNuevoBloque(true)} style={{ ...btnPrimaryStyle, padding: '6px 14px' }}>
            ＋ Nuevo bloque
          </button>
          <button
            onClick={() => setShowArchivar((v) => !v)}
            style={{
              ...btnSecondaryStyle,
              color: showArchivar ? 'var(--nz-success)' : 'var(--text-muted)',
              borderColor: showArchivar ? 'color-mix(in oklch, var(--primary) 30%, var(--border))' : 'var(--border)',
            }}
          >
            {showArchivar ? '✓ Ver archivados' : 'Ver archivados'}
          </button>
          <button onClick={handleExport} style={btnSecondaryStyle}>↓ CSV</button>
          <label style={{ ...btnSecondaryStyle, cursor: 'pointer', display: 'inline-block' }}>
            ↑ CSV
            <input type="file" accept=".csv" onChange={handleImport} style={{ display: 'none' }} />
          </label>
          <button
            onClick={handleBorrarTodas}
            style={{ ...btnSecondaryStyle, color: 'var(--nz-danger)', borderColor: 'color-mix(in oklch, var(--nz-danger) 30%, var(--border))' }}
          >
            🗑
          </button>
        </div>
      </div>

      {/* Progreso global */}
      {totalTareas > 0 && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px', marginBottom: '24px' }}>
          <div className="flex items-center justify-between" style={{ marginBottom: '8px' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: '500' }}>
              Progreso global del proyecto
            </span>
            <span style={{ color: 'var(--primary)', fontSize: '20px', fontWeight: '700', fontFamily: 'var(--font-mono)' }}>
              {progresoGlobal}%
            </span>
          </div>
          <div style={{ height: '8px', backgroundColor: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${progresoGlobal}%`, height: '100%', background: 'var(--primary)', borderRadius: '4px', transition: 'width 0.5s ease' }} />
          </div>
          <div style={{ color: 'var(--text-subtle)', fontSize: '12px', marginTop: '6px' }}>
            {completadasTotal} de {totalTareas} tareas completadas
          </div>
        </div>
      )}

      {/* Sin bloques */}
      {bloquesActivos.length === 0 && !showArchivar && (
        <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--text-subtle)', fontSize: '14px' }}>
          <p style={{ marginBottom: '16px' }}>No hay bloques creados todavía.</p>
          <button onClick={() => setShowNuevoBloque(true)} style={btnPrimaryStyle}>
            ＋ Crear primer bloque
          </button>
        </div>
      )}

      {/* Bloques activos */}
      <div className="flex flex-col gap-4">
        {bloquesActivos.map((bloque, idx) => (
          <BloqueSection
            key={bloque.id}
            bloque={bloque}
            idx={idx}
            tareas={tareas.filter((t) => t.bloque === bloque.id)}
            esBloqueActivo={esBloqueActivo(idx)}
            readonly={false}
            viewMode={viewMode}
            onUpdateEstado={handleUpdateEstado}
            onToggleFlag={handleToggleFlag}
            onUpdateNotas={handleUpdateNotas}
            onDelete={handleDelete}
            onAddTarea={handleAddTarea}
            onArchivar={handleArchivar}
            onOpenDetail={setSelectedTarea}
            onReorder={handleReorder}
            bloqueDragHandlers={makeBloqueDragHandlers(bloque)}
            isDragOver={bloqueDragOver === bloque.id}
          />
        ))}
      </div>

      {/* Bloques archivados */}
      {showArchivar && bloquesArchivados.length > 0 && (
        <div style={{ marginTop: '32px' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
            Archivados
          </div>
          <div className="flex flex-col gap-4">
            {bloquesArchivados.map((bloque, idx) => (
              <BloqueSection
                key={bloque.id}
                bloque={bloque}
                idx={idx}
                tareas={tareas.filter((t) => t.bloque === bloque.id)}
                esBloqueActivo={true}
                readonly={true}
                viewMode={viewMode}
                onUpdateEstado={() => {}}
                onToggleFlag={() => {}}
                onUpdateNotas={() => {}}
                onDelete={() => {}}
                onAddTarea={() => {}}
                onArchivar={() => {}}
                onOpenDetail={setSelectedTarea}
                onReorder={() => {}}
              />
            ))}
          </div>
        </div>
      )}

      {showArchivar && bloquesArchivados.length === 0 && (
        <p style={{ color: 'var(--text-subtle)', fontSize: '13px', textAlign: 'center', marginTop: '24px' }}>
          No hay bloques archivados.
        </p>
      )}
    </div>
  )
}
