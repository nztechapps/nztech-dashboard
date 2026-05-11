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

function getBadge(bloque) {
  const match = bloque.nombre.match(/bloque\s+([^\s—–\-]+)/i)
  return match ? match[1].toUpperCase() : (bloque.nombre.trim()[0]?.toUpperCase() || '?')
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

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 300, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '24px', width: '480px', maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <h3 style={{ color: 'var(--text)', fontWeight: '700', fontSize: '16px', margin: 0 }}>Detalle de tarea</h3>
            {bloqueName && <span style={{ color: 'var(--text-subtle)', fontSize: '12px' }}>{bloqueName}</span>}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '18px', lineHeight: 1 }}>✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', marginBottom: '4px' }}>Título</label>
            <input value={form.titulo} onChange={(e) => setForm(f => ({ ...f, titulo: e.target.value }))} style={inputStyle} autoFocus />
          </div>
          <div>
            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', marginBottom: '4px' }}>Descripción</label>
            <input value={form.descripcion} onChange={(e) => setForm(f => ({ ...f, descripcion: e.target.value }))} style={inputStyle} placeholder="Descripción opcional" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', marginBottom: '4px' }}>Estado</label>
              <select value={form.estado} onChange={(e) => setForm(f => ({ ...f, estado: e.target.value }))} style={{ ...inputStyle, padding: '8px 10px' }}>
                {ESTADOS.map(e => <option key={e} value={e}>{ESTADO_CONFIG[e].label}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', marginBottom: '4px' }}>Tiempo estimado</label>
              <input value={form.tiempo_estimado} onChange={(e) => setForm(f => ({ ...f, tiempo_estimado: e.target.value }))} style={inputStyle} placeholder="ej: 3h" />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', marginBottom: '4px' }}>Tags (coma separados)</label>
            <input value={form.tags} onChange={(e) => setForm(f => ({ ...f, tags: e.target.value }))} style={inputStyle} placeholder="ej: frontend, bug, urgente" />
          </div>
          <div>
            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', marginBottom: '6px' }}>Notas</label>
            <textarea value={form.notas} onChange={(e) => setForm(f => ({ ...f, notas: e.target.value }))} rows={4} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'var(--font-mono)', fontSize: '12px' }} placeholder="Notas o aprendizajes..." />
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '13px' }}>
            <input type="checkbox" checked={form.flag} onChange={(e) => setForm(f => ({ ...f, flag: e.target.checked }))} style={{ accentColor: 'var(--nz-danger)', width: '15px', height: '15px' }} />
            🚩 Marcar dificultad
          </label>
          <div style={{ display: 'flex', gap: '8px', paddingTop: '4px' }}>
            <button onClick={handleSave} disabled={saving} style={btnPrimaryStyle}>{saving ? 'Guardando…' : 'Guardar cambios'}</button>
            <button onClick={onClose} style={btnSecondaryStyle}>Cancelar</button>
            <button onClick={handleDelete} style={{ marginLeft: 'auto', padding: '6px 14px', borderRadius: '6px', background: 'transparent', border: '1px solid color-mix(in oklch, var(--nz-danger) 40%, transparent)', color: 'var(--nz-danger)', fontSize: '13px', cursor: 'pointer' }}>
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
      style={{ position: 'fixed', inset: 0, zIndex: 200, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '24px', width: '360px', boxShadow: 'var(--shadow-lg)' }}>
        <h3 style={{ color: 'var(--text)', fontWeight: '700', fontSize: '16px', margin: '0 0 16px' }}>Nuevo bloque</h3>
        <div className="flex flex-col gap-3">
          <input placeholder="Nombre del bloque *" value={nombre} onChange={(e) => setNombre(e.target.value)} autoFocus style={inputStyle} onKeyDown={(e) => e.key === 'Enter' && handleSave()} />
          <div className="flex items-center gap-3">
            <label style={{ color: 'var(--text-muted)', fontSize: '13px', whiteSpace: 'nowrap' }}>Color</label>
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} style={{ width: '40px', height: '32px', border: '1px solid var(--border)', borderRadius: '6px', backgroundColor: 'transparent', cursor: 'pointer', padding: '2px' }} />
            <span style={{ flex: 1, height: '8px', borderRadius: '4px', backgroundColor: color, opacity: 0.7 }} />
          </div>
          <div className="flex gap-2 mt-1">
            <button onClick={handleSave} disabled={saving} style={btnPrimaryStyle}>{saving ? 'Guardando…' : 'Crear bloque'}</button>
            <button onClick={onClose} style={btnSecondaryStyle}>Cancelar</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ---- Bloque Modal (task list) ----
function BloqueModal({ bloque, tareas, readonly, onClose, onUpdateEstado, onAddTarea, onArchivar, onOpenDetail, onReorder, onSaveTarea, onDeleteTarea }) {
  const [showForm, setShowForm] = useState(false)
  const [newTarea, setNewTarea] = useState({ titulo: '', tiempo_estimado: '' })
  const [dragOverId, setDragOverId] = useState(null)
  const draggedId = useRef(null)
  const [expandedId, setExpandedId] = useState(null)
  const [expandForms, setExpandForms] = useState({})
  const [savingId, setSavingId] = useState(null)
  const [copiedTaskId, setCopiedTaskId] = useState(null)

  const toggleExpand = (t) => {
    if (expandedId === t.id) { setExpandedId(null); return }
    setExpandedId(t.id)
    setExpandForms(f => ({
      ...f,
      [t.id]: { notas: t.notas || '', estado: t.estado || 'pendiente', tiempo_estimado: t.tiempo_estimado || '' },
    }))
  }

  const handleSaveInline = async (t) => {
    const form = expandForms[t.id]
    if (!form) return
    setSavingId(t.id)
    try {
      await onSaveTarea(t.id, { notas: form.notas.trim(), estado: form.estado, tiempo_estimado: form.tiempo_estimado.trim() })
      setExpandedId(null)
    } catch (e) { alert('Error: ' + e.message) }
    finally { setSavingId(null) }
  }

  const handleDeleteInline = async (t) => {
    if (!window.confirm('¿Eliminar esta tarea?')) return
    await onDeleteTarea(t.id)
    setExpandedId(null)
  }

  const copyTask = (t) => {
    const check = t.estado === 'completado' ? '✓' : '☐'
    const parts = [t.titulo, t.estado]
    if (t.tiempo_estimado) parts.push(t.tiempo_estimado)
    const text = `${check} ${parts.join(' — ')}`
    navigator.clipboard.writeText(text).then(() => {
      setCopiedTaskId(t.id)
      setTimeout(() => setCopiedTaskId(null), 2000)
    })
  }

  const completadas = tareas.filter(t => t.estado === 'completado').length
  const total = tareas.length
  const progreso = total > 0 ? Math.round((completadas / total) * 100) : 0
  const puedeArchivar = total > 0 && progreso === 100 && !readonly

  const handleAdd = async () => {
    if (!newTarea.titulo.trim()) return
    await onAddTarea({
      titulo: newTarea.titulo.trim(),
      bloque: bloque.id,
      estado: 'pendiente',
      tiempo_estimado: newTarea.tiempo_estimado.trim(),
      descripcion: '', tags: [], flag: false, notas: '',
      orden: tareas.length + 1,
    })
    setNewTarea({ titulo: '', tiempo_estimado: '' })
    setShowForm(false)
  }

  const makeDragHandlers = (tarea) => ({
    onDragStart: (e) => { draggedId.current = tarea.id; e.dataTransfer.effectAllowed = 'move' },
    onDragOver: (e) => { e.preventDefault(); setDragOverId(tarea.id) },
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
      onReorder(reordered.map((t, i) => ({ ...t, orden: i })))
      draggedId.current = null
      setDragOverId(null)
    },
    onDragEnd: () => { draggedId.current = null; setDragOverId(null) },
  })

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 200, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', width: '520px', maxWidth: '100%', maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-lg)' }}>
        {/* Header */}
        <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0, backgroundColor: `color-mix(in oklch, ${bloque.color} 15%, transparent)`, border: `1px solid color-mix(in oklch, ${bloque.color} 30%, transparent)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: bloque.color, fontWeight: '700', fontSize: '14px' }}>
                {getBadge(bloque)}
              </div>
              <div>
                <h3 style={{ color: 'var(--text)', fontWeight: '700', fontSize: '15px', margin: 0 }}>{bloque.nombre}</h3>
                <span style={{ color: 'var(--text-subtle)', fontSize: '12px' }}>{completadas}/{total} tareas · {progreso}%</span>
              </div>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '18px', lineHeight: 1, padding: '4px' }}>✕</button>
          </div>
          <div style={{ height: '4px', backgroundColor: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ width: `${progreso}%`, height: '100%', backgroundColor: bloque.color, borderRadius: '2px', transition: 'width 0.4s ease' }} />
          </div>
        </div>

        {/* Task list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {tareas.slice().sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0)).map(t => {
              const cfg = ESTADO_CONFIG[t.estado] || ESTADO_CONFIG.pendiente
              const handlers = !readonly ? makeDragHandlers(t) : {}
              const isExpanded = expandedId === t.id
              const ef = expandForms[t.id] || {}
              return (
                <div key={t.id}>
                  <div
                    draggable={!readonly}
                    {...handlers}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '8px 10px', borderRadius: isExpanded ? '8px 8px 0 0' : '8px',
                      background: dragOverId === t.id ? 'var(--surface-2)' : isExpanded ? 'color-mix(in oklch, var(--primary) 6%, var(--surface))' : 'transparent',
                      cursor: readonly ? 'default' : 'grab',
                      transition: 'background 0.1s',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={t.estado === 'completado'}
                      disabled={readonly}
                      onChange={() => !readonly && onUpdateEstado(t.id, t.estado === 'completado' ? 'pendiente' : 'completado')}
                      style={{ accentColor: bloque.color, width: '15px', height: '15px', flexShrink: 0, cursor: readonly ? 'default' : 'pointer' }}
                    />
                    <span
                      onClick={() => toggleExpand(t)}
                      style={{ flex: 1, fontSize: '13px', fontWeight: '500', color: t.estado === 'completado' ? 'var(--text-subtle)' : 'var(--text)', textDecoration: t.estado === 'completado' ? 'line-through' : 'none', cursor: 'pointer', lineHeight: '1.4' }}
                    >
                      {t.titulo}
                    </span>
                    {t.flag && <span style={{ fontSize: '12px', flexShrink: 0 }}>🚩</span>}
                    <span style={{ fontSize: '10px', fontWeight: '600', padding: '2px 7px', borderRadius: '6px', background: cfg.bg, color: cfg.color, flexShrink: 0, whiteSpace: 'nowrap' }}>
                      {cfg.label}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); copyTask(t) }}
                      title="Copiar tarea"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: copiedTaskId === t.id ? 'var(--nz-success)' : 'var(--text-subtle)', fontSize: '12px', padding: '2px', flexShrink: 0, lineHeight: 1 }}
                    >
                      {copiedTaskId === t.id ? '✓' : '📋'}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleExpand(t) }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-subtle)', fontSize: '10px', padding: '2px', flexShrink: 0, lineHeight: 1, transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}
                    >
                      ▼
                    </button>
                  </div>
                  {isExpanded && (
                    <div style={{ background: 'color-mix(in oklch, var(--primary) 4%, var(--surface))', border: '1px solid color-mix(in oklch, var(--primary) 15%, var(--border))', borderTop: 'none', borderRadius: '0 0 8px 8px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <div>
                          <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', marginBottom: '3px' }}>Estado</label>
                          <select
                            value={ef.estado || 'pendiente'}
                            onChange={(e) => setExpandForms(f => ({ ...f, [t.id]: { ...f[t.id], estado: e.target.value } }))}
                            disabled={readonly}
                            style={{ ...inputStyle, fontSize: '12px', padding: '5px 8px' }}
                          >
                            {ESTADOS.map(e => <option key={e} value={e}>{ESTADO_CONFIG[e].label}</option>)}
                          </select>
                        </div>
                        <div>
                          <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', marginBottom: '3px' }}>Tiempo estimado</label>
                          <input
                            value={ef.tiempo_estimado || ''}
                            onChange={(e) => setExpandForms(f => ({ ...f, [t.id]: { ...f[t.id], tiempo_estimado: e.target.value } }))}
                            disabled={readonly}
                            placeholder="ej: 3h"
                            style={{ ...inputStyle, fontSize: '12px', padding: '5px 8px' }}
                          />
                        </div>
                      </div>
                      <div>
                        <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', marginBottom: '3px' }}>Notas</label>
                        <textarea
                          value={ef.notas || ''}
                          onChange={(e) => setExpandForms(f => ({ ...f, [t.id]: { ...f[t.id], notas: e.target.value } }))}
                          disabled={readonly}
                          rows={3}
                          placeholder="Notas o aprendizajes…"
                          style={{ ...inputStyle, fontSize: '12px', padding: '5px 8px', resize: 'vertical', fontFamily: 'var(--font-mono)' }}
                        />
                      </div>
                      {!readonly && (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            onClick={() => handleSaveInline(t)}
                            disabled={savingId === t.id}
                            style={{ ...btnPrimaryStyle, fontSize: '12px', padding: '5px 12px' }}
                          >
                            {savingId === t.id ? 'Guardando…' : 'Guardar'}
                          </button>
                          <button onClick={() => setExpandedId(null)} style={{ ...btnSecondaryStyle, fontSize: '12px', padding: '5px 10px' }}>Cancelar</button>
                          <button
                            onClick={() => handleDeleteInline(t)}
                            style={{ marginLeft: 'auto', padding: '5px 10px', borderRadius: '6px', background: 'transparent', border: '1px solid color-mix(in oklch, var(--nz-danger) 40%, transparent)', color: 'var(--nz-danger)', fontSize: '12px', cursor: 'pointer' }}
                          >
                            Eliminar
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
            {tareas.length === 0 && (
              <p style={{ color: 'var(--text-subtle)', fontSize: '13px', textAlign: 'center', padding: '24px 0' }}>Sin tareas</p>
            )}
          </div>
        </div>

        {/* Footer */}
        {!readonly && (
          <div style={{ padding: '12px 16px 16px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
            {showForm ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <input
                  autoFocus
                  placeholder="Título de la tarea *"
                  value={newTarea.titulo}
                  onChange={e => setNewTarea(p => ({ ...p, titulo: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && handleAdd()}
                  style={inputStyle}
                />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    placeholder="Tiempo estimado (ej: 3h)"
                    value={newTarea.tiempo_estimado}
                    onChange={e => setNewTarea(p => ({ ...p, tiempo_estimado: e.target.value }))}
                    style={{ ...inputStyle, flex: 1 }}
                  />
                  <button onClick={handleAdd} style={btnPrimaryStyle}>Agregar</button>
                  <button onClick={() => setShowForm(false)} style={btnSecondaryStyle}>✕</button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setShowForm(true)} style={{ ...btnSecondaryStyle, flex: 1, textAlign: 'center' }}>+ Nueva tarea</button>
                {puedeArchivar && (
                  <button
                    onClick={() => { onArchivar(bloque.id); onClose() }}
                    style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '12px', backgroundColor: 'color-mix(in oklch, var(--primary) 10%, transparent)', color: 'var(--primary)', border: '1px solid color-mix(in oklch, var(--primary) 25%, transparent)', cursor: 'pointer' }}
                  >
                    Archivar
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ---- Bloque Card (grid item) ----
function BloqueCard({ bloque, tareas, isDragOver, bloqueDragHandlers, onClick, readonly }) {
  const isDraggingRef = useRef(false)
  const [blockCopied, setBlockCopied] = useState(false)
  const completadas = tareas.filter(t => t.estado === 'completado').length
  const total = tareas.length
  const progreso = total > 0 ? Math.round((completadas / total) * 100) : 0
  const badge = getBadge(bloque)
  const color = readonly ? 'var(--text-subtle)' : bloque.color

  const copyBlock = (e) => {
    e.stopPropagation()
    const sorted = tareas.slice().sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
    const header = `📦 ${bloque.nombre} (${progreso}% · ${completadas}/${total})`
    const lines = sorted.map(t => {
      const check = t.estado === 'completado' ? '✓' : '☐'
      const pri = t.tiempo_estimado ? ` — ${t.tiempo_estimado}` : ''
      return `${check} ${t.titulo}${pri}`
    })
    const text = [header, '', ...lines].join('\n')
    navigator.clipboard.writeText(text).then(() => {
      setBlockCopied(true)
      setTimeout(() => setBlockCopied(false), 2000)
    })
  }

  return (
    <div
      draggable={!!bloqueDragHandlers}
      onDragStart={(e) => { isDraggingRef.current = true; bloqueDragHandlers?.onDragStart(e) }}
      onDragOver={bloqueDragHandlers?.onDragOver}
      onDrop={bloqueDragHandlers?.onDrop}
      onDragEnd={(e) => { bloqueDragHandlers?.onDragEnd(e); setTimeout(() => { isDraggingRef.current = false }, 0) }}
      onClick={() => { if (!isDraggingRef.current) onClick() }}
      style={{
        background: 'var(--surface)',
        border: `1px solid ${isDragOver ? 'var(--primary)' : 'var(--border)'}`,
        borderRadius: '14px',
        padding: '14px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        height: '160px',
        position: 'relative',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        userSelect: 'none',
        opacity: readonly ? 0.7 : 1,
      }}
      onMouseEnter={e => { if (!isDragOver) e.currentTarget.style.boxShadow = 'var(--shadow-md)' }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none' }}
    >
      {/* Top: avatar + drag handle */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
        <div style={{ width: '30px', height: '30px', borderRadius: '8px', backgroundColor: `color-mix(in oklch, ${color} 15%, transparent)`, border: `1px solid color-mix(in oklch, ${color} 30%, transparent)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, fontWeight: '700', fontSize: '13px', flexShrink: 0 }}>
          {badge}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {readonly && (
            <span style={{ fontSize: '9px', padding: '2px 6px', borderRadius: '8px', background: 'var(--surface-2)', color: 'var(--text-subtle)', border: '1px solid var(--border)' }}>
              arch.
            </span>
          )}
          <button
            onClick={copyBlock}
            title="Copiar bloque"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: blockCopied ? 'var(--nz-success)' : 'var(--text-subtle)', fontSize: '12px', padding: '2px', lineHeight: 1 }}
          >
            {blockCopied ? '✓' : '📋'}
          </button>
          {bloqueDragHandlers && (
            <span style={{ color: 'var(--text-subtle)', fontSize: '13px', cursor: 'grab', letterSpacing: '-1px', lineHeight: 1, userSelect: 'none' }}>
              ⋮⋮
            </span>
          )}
        </div>
      </div>

      {/* Name */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <div style={{ color: 'var(--text)', fontSize: '13px', fontWeight: '600', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {bloque.nombre}
        </div>
        <div style={{ color: 'var(--text-subtle)', fontSize: '11px', marginTop: '3px' }}>
          {total} tarea{total !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Progress */}
      <div style={{ marginTop: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
          <span style={{ color: 'var(--text-subtle)', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>{completadas}/{total}</span>
          <span style={{ color, fontSize: '12px', fontWeight: '700', fontFamily: 'var(--font-mono)' }}>{progreso}%</span>
        </div>
        <div style={{ height: '3px', backgroundColor: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{ width: `${progreso}%`, height: '100%', backgroundColor: color, borderRadius: '2px', transition: 'width 0.4s ease' }} />
        </div>
      </div>
    </div>
  )
}

// ---- Main page ----
export default function Tareas() {
  const { tareas, bloques, loading, error, addBloque, archivarBloque, updateTarea, addTarea, deleteTarea, importTareas, reorderBloques, refetch } = useTareas()
  const [showArchivar, setShowArchivar] = useState(false)
  const [showNuevoBloque, setShowNuevoBloque] = useState(false)
  const [selectedBloque, setSelectedBloque] = useState(null)
  const [selectedTarea, setSelectedTarea] = useState(null)
  const bloqueDragRef = useRef(null)
  const [bloqueDragOver, setBloqueDragOver] = useState(null)

  const handleUpdateEstado = async (id, estado) => {
    try { await updateTarea(id, { estado }) } catch (e) { console.error(e) }
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
  const handleAddBloque = async (data) => { await addBloque(data) }
  const handleSaveDetail = async (id, updates) => { await updateTarea(id, updates) }
  const handleDeleteFromDetail = async (id) => {
    try { await deleteTarea(id) } catch (e) { console.error(e) }
  }
  const handleReorder = async (reorderedTareas) => {
    try {
      await Promise.all(reorderedTareas.map(t => updateTarea(t.id, { orden: t.orden })))
    } catch (e) { console.error(e) }
  }

  const makeBloqueDragHandlers = (bloque) => ({
    onDragStart: (e) => { bloqueDragRef.current = bloque.id; e.dataTransfer.effectAllowed = 'move' },
    onDragOver: (e) => { e.preventDefault(); if (bloqueDragRef.current !== bloque.id) setBloqueDragOver(bloque.id) },
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
    onDragEnd: () => { bloqueDragRef.current = null; setBloqueDragOver(null) },
  })

  const bloquesActivos = bloques.filter((b) => !b.archivado).sort((a, b) => a.orden - b.orden)
  const bloquesArchivados = bloques.filter((b) => b.archivado).sort((a, b) => a.orden - b.orden)

  const tareasActivas = tareas.filter((t) => bloquesActivos.some((b) => b.id === t.bloque))
  const totalTareas = tareasActivas.length
  const completadasTotal = tareasActivas.filter((t) => t.estado === 'completado').length
  const progresoGlobal = totalTareas > 0 ? Math.round((completadasTotal / totalTareas) * 100) : 0

  const getBloqueForTarea = (tarea) => bloques.find(b => b.id === tarea.bloque)

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

  if (loading) {
    return <div style={{ padding: '32px', background: 'var(--bg)', minHeight: '100%', color: 'var(--text-subtle)', textAlign: 'center' }}>Cargando tareas…</div>
  }
  if (error) {
    return <div style={{ padding: '32px', color: 'var(--nz-danger)' }}>Error: {error}</div>
  }

  const selectedBloqueData = selectedBloque ? bloques.find(b => b.id === selectedBloque) : null
  const selectedBloqueTareas = selectedBloque ? tareas.filter(t => t.bloque === selectedBloque) : []
  const isSelectedReadonly = selectedBloqueData?.archivado ?? false

  return (
    <div style={{ padding: '24px', maxWidth: '960px', margin: '0 auto', background: 'var(--bg)', minHeight: '100%' }}>
      {showNuevoBloque && (
        <NuevoBloqueModal onClose={() => setShowNuevoBloque(false)} onSave={handleAddBloque} />
      )}

      {selectedBloqueData && (
        <BloqueModal
          bloque={selectedBloqueData}
          tareas={selectedBloqueTareas}
          readonly={isSelectedReadonly}
          onClose={() => setSelectedBloque(null)}
          onUpdateEstado={handleUpdateEstado}
          onAddTarea={handleAddTarea}
          onArchivar={handleArchivar}
          onOpenDetail={(t) => { setSelectedTarea(t) }}
          onReorder={handleReorder}
          onSaveTarea={handleSaveDetail}
          onDeleteTarea={handleDeleteFromDetail}
        />
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
          <h1 style={{ color: 'var(--text)', fontSize: '22px', fontWeight: '700', margin: 0 }}>Tareas del Proyecto</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>Bloques secuenciales — completa uno para desbloquear el siguiente.</p>
        </div>
        <div className="flex items-center flex-wrap gap-2">
          <button onClick={() => setShowNuevoBloque(true)} style={{ ...btnPrimaryStyle, padding: '6px 14px' }}>＋ Nuevo bloque</button>
          <button
            onClick={() => setShowArchivar((v) => !v)}
            style={{ ...btnSecondaryStyle, color: showArchivar ? 'var(--nz-success)' : 'var(--text-muted)', borderColor: showArchivar ? 'color-mix(in oklch, var(--primary) 30%, var(--border))' : 'var(--border)' }}
          >
            {showArchivar ? '✓ Ver archivados' : 'Ver archivados'}
          </button>
          <button onClick={handleExport} style={btnSecondaryStyle}>↓ CSV</button>
          <label style={{ ...btnSecondaryStyle, cursor: 'pointer', display: 'inline-block' }}>
            ↑ CSV
            <input type="file" accept=".csv" onChange={handleImport} style={{ display: 'none' }} />
          </label>
          <button onClick={handleBorrarTodas} style={{ ...btnSecondaryStyle, color: 'var(--nz-danger)', borderColor: 'color-mix(in oklch, var(--nz-danger) 30%, var(--border))' }}>🗑</button>
        </div>
      </div>

      {/* Progreso global */}
      {totalTareas > 0 && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px', marginBottom: '24px' }}>
          <div className="flex items-center justify-between" style={{ marginBottom: '8px' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: '500' }}>Progreso global del proyecto</span>
            <span style={{ color: 'var(--primary)', fontSize: '20px', fontWeight: '700', fontFamily: 'var(--font-mono)' }}>{progresoGlobal}%</span>
          </div>
          <div style={{ height: '8px', backgroundColor: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${progresoGlobal}%`, height: '100%', background: 'var(--primary)', borderRadius: '4px', transition: 'width 0.5s ease' }} />
          </div>
          <div style={{ color: 'var(--text-subtle)', fontSize: '12px', marginTop: '6px' }}>{completadasTotal} de {totalTareas} tareas completadas</div>
        </div>
      )}

      {/* Sin bloques */}
      {bloquesActivos.length === 0 && !showArchivar && (
        <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--text-subtle)', fontSize: '14px' }}>
          <p style={{ marginBottom: '16px' }}>No hay bloques creados todavía.</p>
          <button onClick={() => setShowNuevoBloque(true)} style={btnPrimaryStyle}>＋ Crear primer bloque</button>
        </div>
      )}

      {/* Grid de bloques activos */}
      {bloquesActivos.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
          {bloquesActivos.map((bloque) => (
            <BloqueCard
              key={bloque.id}
              bloque={bloque}
              tareas={tareas.filter(t => t.bloque === bloque.id)}
              isDragOver={bloqueDragOver === bloque.id}
              bloqueDragHandlers={makeBloqueDragHandlers(bloque)}
              onClick={() => setSelectedBloque(bloque.id)}
              readonly={false}
            />
          ))}
        </div>
      )}

      {/* Bloques archivados */}
      {showArchivar && bloquesArchivados.length > 0 && (
        <div style={{ marginTop: '32px' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>Archivados</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
            {bloquesArchivados.map((bloque) => (
              <BloqueCard
                key={bloque.id}
                bloque={bloque}
                tareas={tareas.filter(t => t.bloque === bloque.id)}
                isDragOver={false}
                bloqueDragHandlers={null}
                onClick={() => setSelectedBloque(bloque.id)}
                readonly={true}
              />
            ))}
          </div>
        </div>
      )}

      {showArchivar && bloquesArchivados.length === 0 && (
        <p style={{ color: 'var(--text-subtle)', fontSize: '13px', textAlign: 'center', marginTop: '24px' }}>No hay bloques archivados.</p>
      )}
    </div>
  )
}
