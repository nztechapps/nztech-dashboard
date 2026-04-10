import { useState } from 'react'
import { useTareas } from '../hooks/useTareas'
import { supabase } from '../lib/supabase'

const ESTADOS = ['pendiente', 'en_progreso', 'completado', 'bloqueado']

const ESTADO_CONFIG = {
  pendiente:   { label: 'Pendiente',   bg: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' },
  en_progreso: { label: 'En progreso', bg: 'rgba(59,130,246,0.15)',  color: '#3B82F6' },
  completado:  { label: 'Completado',  bg: 'rgba(0,229,160,0.15)',   color: '#00E5A0' },
  bloqueado:   { label: 'Bloqueado',   bg: 'rgba(239,68,68,0.15)',   color: '#EF4444' },
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
  A: { nombre: 'Bloque A — Ensamblador',                  color: '#00E5A0', orden: 0 },
  B: { nombre: 'Bloque B — Dashboard prioritario',        color: '#3B82F6', orden: 1 },
  C: { nombre: 'Bloque C — Perfiles freelance',           color: '#F59E0B', orden: 2 },
  D: { nombre: 'Bloque D — Dashboard segunda prioridad',  color: '#EC4899', orden: 3 },
  E: { nombre: 'Bloque E — Optimizaciones del ciclo',     color: '#8B5CF6', orden: 4 },
}

// ---- Shared styles ----
const inputStyle = {
  width: '100%',
  backgroundColor: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '6px',
  color: 'white',
  fontSize: '13px',
  padding: '8px 10px',
  outline: 'none',
}

const btnPrimaryStyle = {
  padding: '6px 16px',
  borderRadius: '6px',
  backgroundColor: '#00E5A0',
  color: '#0A0A0F',
  fontSize: '13px',
  fontWeight: '600',
  border: 'none',
  cursor: 'pointer',
}

const btnSecondaryStyle = {
  padding: '6px 14px',
  borderRadius: '6px',
  backgroundColor: 'rgba(255,255,255,0.08)',
  color: 'rgba(255,255,255,0.6)',
  fontSize: '13px',
  border: 'none',
  cursor: 'pointer',
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
        backgroundColor: 'rgba(0,0,0,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        backgroundColor: '#13131A',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '14px',
        padding: '24px',
        width: '360px',
      }}>
        <h3 style={{ color: 'white', fontWeight: '700', fontSize: '16px', margin: '0 0 16px' }}>
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
            <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', whiteSpace: 'nowrap' }}>
              Color
            </label>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              style={{
                width: '40px', height: '32px',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '6px',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                padding: '2px',
              }}
            />
            <span style={{
              flex: 1,
              height: '8px',
              borderRadius: '4px',
              backgroundColor: color,
              opacity: 0.7,
            }} />
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

// ---- Task card ----
function TareaCard({ tarea, bloqueActivo, readonly, onUpdateEstado, onToggleFlag, onUpdateNotas, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const [notas, setNotas] = useState(tarea.notas || '')
  const [editingNotas, setEditingNotas] = useState(false)
  const cfg = ESTADO_CONFIG[tarea.estado] || ESTADO_CONFIG.pendiente
  const isLocked = !bloqueActivo || readonly

  return (
    <div style={{
      backgroundColor: '#13131A',
      border: `1px solid ${tarea.flag ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.06)'}`,
      borderRadius: '10px',
      padding: '14px 16px',
      opacity: 1,
      transition: 'opacity 0.2s',
    }}>
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
            color: tarea.estado === 'completado' ? 'rgba(255,255,255,0.35)' : 'white',
            textDecoration: tarea.estado === 'completado' ? 'line-through' : 'none',
            fontSize: '14px', fontWeight: '500', cursor: 'pointer',
          }}
          onClick={() => setExpanded((e) => !e)}
        >
          {tarea.titulo}
        </span>

        {tarea.tiempo_estimado && (
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', flexShrink: 0 }}>
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
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'rgba(255,255,255,0.3)', fontSize: '12px',
            padding: '0 2px', flexShrink: 0,
          }}
        >
          {expanded ? '▲' : '▼'}
        </button>
      </div>

      {tarea.tags && tarea.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2 ml-1">
          {tarea.tags.map((tag) => (
            <span key={tag} style={{
              fontSize: '10px', padding: '2px 7px', borderRadius: '10px',
              backgroundColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)',
            }}>
              {tag}
            </span>
          ))}
        </div>
      )}

      {expanded && (
        <div style={{ marginTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px' }}>
          {tarea.descripcion && (
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginBottom: '10px' }}>
              {tarea.descripcion}
            </p>
          )}

          <div>
            <div style={{
              color: 'rgba(255,255,255,0.3)', fontSize: '11px', marginBottom: '4px',
              fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em',
            }}>
              Notas / Aprendizajes
            </div>
            {editingNotas && !readonly ? (
              <div className="flex flex-col gap-2">
                <textarea
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  rows={3}
                  style={{
                    width: '100%', backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(0,229,160,0.3)', borderRadius: '6px',
                    color: 'white', fontSize: '13px', padding: '8px', resize: 'vertical',
                  }}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => { onUpdateNotas(tarea.id, notas); setEditingNotas(false) }}
                    style={btnPrimaryStyle}
                  >
                    Guardar
                  </button>
                  <button
                    onClick={() => { setNotas(tarea.notas || ''); setEditingNotas(false) }}
                    style={btnSecondaryStyle}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => !isLocked && setEditingNotas(true)}
                style={{
                  minHeight: '36px', backgroundColor: 'rgba(255,255,255,0.03)',
                  border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '6px',
                  padding: '8px',
                  color: notas ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.2)',
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
                style={{
                  background: 'none', border: '1px solid rgba(239,68,68,0.2)',
                  borderRadius: '6px', color: 'rgba(239,68,68,0.5)',
                  fontSize: '11px', padding: '3px 10px', cursor: 'pointer',
                }}
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

// ---- Bloque section ----
function BloqueSection({
  bloque, tareas, idx, esBloqueActivo, readonly,
  onUpdateEstado, onToggleFlag, onUpdateNotas, onDelete, onAddTarea, onArchivar,
}) {
  const [collapsed, setCollapsed] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [newTarea, setNewTarea] = useState({ titulo: '', descripcion: '', tiempo_estimado: '', tags: '' })

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

  // Badge: first letter of name, or index
  const badge = bloque.nombre.trim()[0]?.toUpperCase() || String(idx + 1)

  const borderColor = readonly
    ? 'rgba(255,255,255,0.06)'
    : esBloqueActivo
      ? bloque.color + '33'
      : 'rgba(255,255,255,0.06)'

  return (
    <div style={{
      backgroundColor: readonly ? 'rgba(255,255,255,0.02)' : '#0D0D14',
      border: `1px solid ${borderColor}`,
      borderRadius: '14px', overflow: 'hidden',
      opacity: readonly ? 0.7 : 1,
    }}>
      {/* Header */}
      <div
        style={{
          padding: '16px 20px',
          borderBottom: collapsed ? 'none' : '1px solid rgba(255,255,255,0.06)',
          cursor: 'pointer',
        }}
        onClick={() => setCollapsed((c) => !c)}
      >
        <div className="flex items-center gap-3">
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
            backgroundColor: (readonly ? '#888' : bloque.color) + '20',
            border: `1px solid ${readonly ? '#888' : bloque.color}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: readonly ? '#888' : bloque.color,
            fontWeight: '700', fontSize: '14px',
          }}>
            {badge}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="flex items-center gap-2 flex-wrap">
              <span style={{ color: readonly ? 'rgba(255,255,255,0.4)' : 'white', fontWeight: '600', fontSize: '15px' }}>
                {bloque.nombre}
              </span>
              {readonly && (
                <span style={{
                  fontSize: '10px', padding: '2px 7px', borderRadius: '10px',
                  backgroundColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.3)',
                }}>
                  Archivado
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div style={{ flex: 1, height: '4px', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{
                  width: `${progreso}%`, height: '100%',
                  backgroundColor: readonly ? '#666' : bloque.color,
                  borderRadius: '2px', transition: 'width 0.4s ease',
                }} />
              </div>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', whiteSpace: 'nowrap' }}>
                {completadas}/{total} · {progreso}%
              </span>
            </div>
          </div>

          {/* Archivar button */}
          {puedeArchivar && (
            <button
              onClick={(e) => { e.stopPropagation(); onArchivar(bloque.id) }}
              style={{
                padding: '4px 10px', borderRadius: '6px', fontSize: '11px',
                backgroundColor: 'rgba(0,229,160,0.1)', color: '#00E5A0',
                border: '1px solid rgba(0,229,160,0.25)', cursor: 'pointer',
                whiteSpace: 'nowrap', flexShrink: 0,
              }}
            >
              Archivar bloque
            </button>
          )}

          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', flexShrink: 0 }}>
            {collapsed ? '▼' : '▲'}
          </span>
        </div>
      </div>

      {/* Tasks */}
      {!collapsed && (
        <div style={{ padding: '12px 16px 16px' }}>
          <div className="flex flex-col gap-2">
            {tareas.map((t) => (
              <TareaCard
                key={t.id}
                tarea={t}
                bloqueActivo={esBloqueActivo}
                readonly={readonly}
                onUpdateEstado={onUpdateEstado}
                onToggleFlag={onToggleFlag}
                onUpdateNotas={onUpdateNotas}
                onDelete={onDelete}
              />
            ))}
            {tareas.length === 0 && (
              <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '13px', textAlign: 'center', padding: '12px 0' }}>
                Sin tareas
              </p>
            )}
          </div>

          {esBloqueActivo && !readonly && (
            <div style={{ marginTop: '10px' }}>
              {showForm ? (
                <div style={{
                  backgroundColor: '#13131A', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '10px', padding: '14px',
                }}>
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
                    border: '1px dashed rgba(255,255,255,0.12)',
                    backgroundColor: 'transparent', color: 'rgba(255,255,255,0.3)',
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
  const { tareas, bloques, loading, error, addBloque, archivarBloque, updateTarea, addTarea, deleteTarea, importTareas, refetch } = useTareas()
  const [showArchivar, setShowArchivar] = useState(false)
  const [showNuevoBloque, setShowNuevoBloque] = useState(false)

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

  // Lógica de desbloqueo secuencial por campo "orden"
  const bloquesActivos = bloques.filter((b) => !b.archivado).sort((a, b) => a.orden - b.orden)
  const bloquesArchivados = bloques.filter((b) => b.archivado).sort((a, b) => a.orden - b.orden)

  const bloqueCompletado = (bloqueId) => {
    const t = tareas.filter((t) => t.bloque === bloqueId)
    return t.length > 0 && t.every((t) => t.estado === 'completado')
  }

  const esBloqueActivo = () => true

  // Progreso global (solo tareas no archivadas)
  const tareasActivas = tareas.filter((t) => bloquesActivos.some((b) => b.id === t.bloque))
  const totalTareas = tareasActivas.length
  const completadasTotal = tareasActivas.filter((t) => t.estado === 'completado').length
  const progresoGlobal = totalTareas > 0 ? Math.round((completadasTotal / totalTareas) * 100) : 0

  // CSV export
  const handleExport = () => {
    const csv = tareasToCSV(tareas)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'tareas_nztech.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (ev) => {
      try {
        const parsed = csvToTareas(ev.target.result)
        console.log('[Import] CSV parseado:', parsed)

        // 1. Valores únicos de la columna bloque
        const bloqueValues = [...new Set(parsed.map((t) => t.bloque).filter(Boolean))]

        // 2. Traer todos los bloques existentes
        const { data: existentes, error: bErr } = await supabase.from('bloques_tareas').select('*')
        if (bErr) throw bErr

        // 3. Para cada valor, resolver o crear el bloque y obtener su uuid
        const bloqueMap = {}
        for (const val of bloqueValues) {
          // Si ya es un uuid existente, usarlo directo
          if (existentes.find((b) => b.id === val)) {
            bloqueMap[val] = val
            continue
          }
          // Tratar como letra (A, B, C…) — buscar por nombre o crear
          const defaults = BLOQUES_DEFAULT[val.toUpperCase()] || {
            nombre: `Bloque ${val}`, color: '#888780', orden: 99,
          }
          const porNombre = existentes.find((b) => b.nombre === defaults.nombre)
          if (porNombre) {
            bloqueMap[val] = porNombre.id
          } else {
            const { data: nuevo, error: cErr } = await supabase
              .from('bloques_tareas')
              .insert(defaults)
              .select()
              .single()
            if (cErr) throw cErr
            console.log('[Import] Bloque creado:', nuevo)
            bloqueMap[val] = nuevo.id
          }
        }

        // 4. Reemplazar letra/valor por uuid en las tareas e insertar
        const tareasConUUID = parsed.map((t) => ({ ...t, bloque: bloqueMap[t.bloque] || t.bloque }))
        const result = await importTareas(tareasConUUID)
        console.log('[Import] Resultado Supabase:', result)
        await refetch()
      } catch (err) {
        console.error('[Import] Error:', err)
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
    return (
      <div style={{ padding: '32px', color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>
        Cargando tareas…
      </div>
    )
  }

  if (error) {
    return <div style={{ padding: '32px', color: '#EF4444' }}>Error: {error}</div>
  }

  return (
    <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
      {showNuevoBloque && (
        <NuevoBloqueModal onClose={() => setShowNuevoBloque(false)} onSave={handleAddBloque} />
      )}

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4" style={{ marginBottom: '24px' }}>
        <div>
          <h1 style={{ color: 'white', fontSize: '22px', fontWeight: '700', margin: 0 }}>
            Tareas del Proyecto
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', marginTop: '4px' }}>
            Bloques secuenciales — completa uno para desbloquear el siguiente.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={() => setShowNuevoBloque(true)}
            style={{ ...btnPrimaryStyle, padding: '6px 14px' }}
          >
            ＋ Nuevo bloque
          </button>
          <button
            onClick={() => setShowArchivar((v) => !v)}
            style={{
              ...btnSecondaryStyle,
              color: showArchivar ? '#00E5A0' : 'rgba(255,255,255,0.6)',
              border: showArchivar ? '1px solid rgba(0,229,160,0.3)' : '1px solid transparent',
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
            style={{ ...btnSecondaryStyle, color: 'rgba(239,68,68,0.7)', border: '1px solid rgba(239,68,68,0.2)' }}
          >
            🗑
          </button>
        </div>
      </div>

      {/* Progreso global */}
      {totalTareas > 0 && (
        <div style={{
          backgroundColor: '#13131A', border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '12px', padding: '16px 20px', marginBottom: '24px',
        }}>
          <div className="flex items-center justify-between" style={{ marginBottom: '8px' }}>
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', fontWeight: '500' }}>
              Progreso global del proyecto
            </span>
            <span style={{ color: '#00E5A0', fontSize: '20px', fontWeight: '700', fontFamily: 'DM Mono, monospace' }}>
              {progresoGlobal}%
            </span>
          </div>
          <div style={{ height: '8px', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{
              width: `${progresoGlobal}%`, height: '100%',
              backgroundColor: '#00E5A0', borderRadius: '4px', transition: 'width 0.5s ease',
            }} />
          </div>
          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', marginTop: '6px' }}>
            {completadasTotal} de {totalTareas} tareas completadas
          </div>
        </div>
      )}

      {/* Sin bloques */}
      {bloquesActivos.length === 0 && !showArchivar && (
        <div style={{
          textAlign: 'center', padding: '60px 24px',
          color: 'rgba(255,255,255,0.2)', fontSize: '14px',
        }}>
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
            onUpdateEstado={handleUpdateEstado}
            onToggleFlag={handleToggleFlag}
            onUpdateNotas={handleUpdateNotas}
            onDelete={handleDelete}
            onAddTarea={handleAddTarea}
            onArchivar={handleArchivar}
          />
        ))}
      </div>

      {/* Bloques archivados */}
      {showArchivar && bloquesArchivados.length > 0 && (
        <div style={{ marginTop: '32px' }}>
          <div style={{
            color: 'rgba(255,255,255,0.3)', fontSize: '11px', fontWeight: '600',
            textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px',
          }}>
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
                onUpdateEstado={() => {}}
                onToggleFlag={() => {}}
                onUpdateNotas={() => {}}
                onDelete={() => {}}
                onAddTarea={() => {}}
                onArchivar={() => {}}
              />
            ))}
          </div>
        </div>
      )}

      {showArchivar && bloquesArchivados.length === 0 && (
        <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '13px', textAlign: 'center', marginTop: '24px' }}>
          No hay bloques archivados.
        </p>
      )}
    </div>
  )
}
