import { useState, useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import { useKnowledgeBase } from '../hooks/useKnowledgeBase'

const TODAS = '__todas__'

const emptyForm = { titulo: '', categoria: '', contenido: '', tags: '' }

function entryToForm(entry) {
  return {
    titulo: entry.titulo || '',
    categoria: entry.categoria || '',
    contenido: entry.contenido || '',
    tags: Array.isArray(entry.tags) ? entry.tags.join(', ') : (entry.tags || ''),
  }
}

export default function KnowledgeBase() {
  const { entries, loading, error, createEntry, updateEntry, deleteEntry } = useKnowledgeBase()

  const [categoriaActiva, setCategoriaActiva] = useState(TODAS)
  const [selected, setSelected] = useState(null) // entry id or 'new'
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const categorias = useMemo(() => {
    const cats = [...new Set(entries.map((e) => e.categoria).filter(Boolean))]
    return cats.sort()
  }, [entries])

  const filtered = useMemo(() => {
    if (categoriaActiva === TODAS) return entries
    return entries.filter((e) => e.categoria === categoriaActiva)
  }, [entries, categoriaActiva])

  const openNew = () => {
    setSelected('new')
    setForm({ ...emptyForm, categoria: categoriaActiva === TODAS ? '' : categoriaActiva })
  }

  const openEntry = (entry) => {
    setSelected(entry.id)
    setForm(entryToForm(entry))
  }

  const closeEditor = () => {
    setSelected(null)
    setForm(emptyForm)
  }

  const handleSave = async () => {
    if (!form.titulo.trim()) return
    setSaving(true)
    try {
      const payload = {
        titulo: form.titulo.trim(),
        categoria: form.categoria.trim() || null,
        contenido: form.contenido,
        tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      }
      if (selected === 'new') {
        await createEntry(payload)
      } else {
        await updateEntry(selected, payload)
      }
      closeEditor()
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (selected === 'new') { closeEditor(); return }
    if (!window.confirm('¿Eliminar esta entrada?')) return
    setSaving(true)
    try {
      await deleteEntry(selected)
      closeEditor()
    } finally {
      setSaving(false)
    }
  }

  const isEditing = selected !== null

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>

      {/* ── Left sidebar: categories ─────────────────────────── */}
      <aside style={{
        width: 200,
        flexShrink: 0,
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--surface)',
        overflowY: 'auto',
      }}>
        <div style={{ padding: '16px 12px 8px' }}>
          <button
            onClick={openNew}
            style={{
              width: '100%',
              padding: '8px 12px',
              background: 'var(--primary)',
              color: 'var(--primary-fg)',
              border: 'none',
              borderRadius: 'var(--radius)',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            + Nueva entrada
          </button>
        </div>

        <nav style={{ padding: '4px 8px', flex: 1 }}>
          <CatItem
            label="Todas"
            active={categoriaActiva === TODAS}
            count={entries.length}
            onClick={() => setCategoriaActiva(TODAS)}
          />
          {categorias.map((cat) => (
            <CatItem
              key={cat}
              label={cat}
              active={categoriaActiva === cat}
              count={entries.filter((e) => e.categoria === cat).length}
              onClick={() => setCategoriaActiva(cat)}
            />
          ))}
        </nav>
      </aside>

      {/* ── Main panel ──────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Entry list */}
        <div style={{
          width: isEditing ? 240 : '100%',
          flexShrink: 0,
          borderRight: isEditing ? '1px solid var(--border)' : 'none',
          overflowY: 'auto',
          background: 'var(--bg)',
        }}>
          {loading && (
            <p style={{ padding: 24, color: 'var(--text-muted)', fontSize: 13 }}>Cargando…</p>
          )}
          {error && (
            <p style={{ padding: 24, color: 'var(--nz-danger)', fontSize: 13 }}>{error}</p>
          )}
          {!loading && filtered.length === 0 && (
            <p style={{ padding: 24, color: 'var(--text-subtle)', fontSize: 13 }}>Sin entradas.</p>
          )}
          {filtered.map((entry) => (
            <EntryRow
              key={entry.id}
              entry={entry}
              active={selected === entry.id}
              onClick={() => openEntry(entry)}
            />
          ))}
        </div>

        {/* Editor + Preview */}
        {isEditing && (
          <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

            {/* Editor */}
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              padding: 20,
              gap: 12,
              overflowY: 'auto',
              borderRight: '1px solid var(--border)',
              background: 'var(--surface)',
            }}>
              <input
                placeholder="Título"
                value={form.titulo}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                style={inputStyle}
              />

              <input
                placeholder="Categoría"
                value={form.categoria}
                onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                style={inputStyle}
                list="cat-suggestions"
              />
              <datalist id="cat-suggestions">
                {categorias.map((c) => <option key={c} value={c} />)}
              </datalist>

              <textarea
                placeholder="Contenido (Markdown)"
                value={form.contenido}
                onChange={(e) => setForm({ ...form, contenido: e.target.value })}
                style={{ ...inputStyle, flex: 1, minHeight: 240, resize: 'none', fontFamily: 'var(--font-mono)', fontSize: 13 }}
              />

              <input
                placeholder="Tags (separados por coma)"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                style={inputStyle}
              />

              <div style={{ display: 'flex', gap: 8, paddingTop: 4 }}>
                <button
                  onClick={handleSave}
                  disabled={saving || !form.titulo.trim()}
                  style={{
                    flex: 1,
                    padding: '9px 0',
                    background: 'var(--primary)',
                    color: 'var(--primary-fg)',
                    border: 'none',
                    borderRadius: 'var(--radius)',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: saving ? 'not-allowed' : 'pointer',
                    opacity: saving || !form.titulo.trim() ? 0.6 : 1,
                  }}
                >
                  {saving ? 'Guardando…' : 'Guardar'}
                </button>
                {selected !== 'new' && (
                  <button
                    onClick={handleDelete}
                    disabled={saving}
                    style={{
                      padding: '9px 16px',
                      background: 'transparent',
                      color: 'var(--nz-danger)',
                      border: '1px solid var(--nz-danger)',
                      borderRadius: 'var(--radius)',
                      fontSize: 13,
                      cursor: 'pointer',
                    }}
                  >
                    Eliminar
                  </button>
                )}
                <button
                  onClick={closeEditor}
                  style={{
                    padding: '9px 14px',
                    background: 'transparent',
                    color: 'var(--text-muted)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Preview */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '20px 24px',
              background: 'var(--bg)',
            }}>
              <div style={{ fontSize: 11, color: 'var(--text-subtle)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '.08em' }}>
                Preview
              </div>
              {form.titulo && (
                <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 16 }}>
                  {form.titulo}
                </h1>
              )}
              <div className="kb-prose">
                <ReactMarkdown>{form.contenido || '_Sin contenido_'}</ReactMarkdown>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function CatItem({ label, active, count, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '7px 10px',
        borderRadius: 'var(--radius)',
        border: 'none',
        background: active ? 'var(--primary-soft)' : 'transparent',
        color: active ? 'var(--primary)' : 'var(--text-muted)',
        fontSize: 13,
        fontWeight: active ? 500 : 400,
        cursor: 'pointer',
        textAlign: 'left',
      }}
    >
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
      <span style={{ fontSize: 11, color: 'var(--text-subtle)', flexShrink: 0, marginLeft: 6 }}>{count}</span>
    </button>
  )
}

function EntryRow({ entry, active, onClick }) {
  const tags = Array.isArray(entry.tags) ? entry.tags : []
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        padding: '12px 16px',
        borderBottom: '1px solid var(--border)',
        background: active ? 'var(--surface)' : 'transparent',
        border: 'none',
        borderBottom: '1px solid var(--border)',
        textAlign: 'left',
        cursor: 'pointer',
        display: 'block',
      }}
    >
      <div style={{ fontSize: 13.5, fontWeight: 500, color: active ? 'var(--primary)' : 'var(--text)', marginBottom: 3 }}>
        {entry.titulo}
      </div>
      {entry.categoria && (
        <div style={{ fontSize: 11, color: 'var(--text-subtle)', marginBottom: 4 }}>{entry.categoria}</div>
      )}
      {tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {tags.slice(0, 4).map((t) => (
            <span key={t} style={{
              fontSize: 10,
              padding: '2px 6px',
              borderRadius: 'var(--radius-pill)',
              background: 'var(--surface-2)',
              color: 'var(--text-muted)',
            }}>{t}</span>
          ))}
        </div>
      )}
    </button>
  )
}

const inputStyle = {
  width: '100%',
  padding: '9px 12px',
  background: 'var(--surface-2)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  color: 'var(--text)',
  fontSize: 13,
  outline: 'none',
  boxSizing: 'border-box',
}
