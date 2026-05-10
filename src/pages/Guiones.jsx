import { useState } from 'react'
import { useGuiones } from '../hooks/useGuiones'

/* ── helpers ─────────────────────────────────────────── */
const STATUS_COLORS = {
  borrador:  { bg: 'rgba(255,193,7,0.15)',  text: '#FFC107' },
  listo:     { bg: 'rgba(0,229,160,0.15)',  text: '#00E5A0' },
  publicado: { bg: 'rgba(99,102,241,0.15)', text: '#818CF8' },
}

const FORMAT_COLORS = {
  short:   { bg: 'rgba(236,72,153,0.15)', text: '#F472B6' },
  youtube: { bg: 'rgba(239,68,68,0.15)',  text: '#F87171' },
}

const PLATAFORMAS_SHORT   = ['TikTok', 'Instagram Reels', 'YouTube Shorts']
const PLATAFORMAS_YOUTUBE = ['YouTube']

function Chip({ map, value }) {
  const c = map[value] || { bg: 'rgba(255,255,255,0.1)', text: '#aaa' }
  return (
    <span style={{ background: c.bg, color: c.text, fontSize: 11, fontWeight: 600,
      padding: '2px 8px', borderRadius: 999, textTransform: 'capitalize' }}>
      {value}
    </span>
  )
}

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: '2-digit' })
}

/* ── Unified modal (create + edit) ───────────────────── */
function GuionModal({ guion, onClose, onSave }) {
  const isEdit = Boolean(guion)
  const [tema, setTema]           = useState(guion?.tema     || '')
  const [formato, setFormato]     = useState(guion?.formato  || 'short')
  const [plataforma, setPlat]     = useState(guion?.plataforma || 'TikTok')
  const [hook, setHook]           = useState(guion?.hook     || '')
  const [body, setBody]           = useState(guion?.guion    || '')
  const [status, setStatus]       = useState(guion?.status   || 'borrador')

  const plataformas = formato === 'short' ? PLATAFORMAS_SHORT : PLATAFORMAS_YOUTUBE

  const handleFormato = (val) => {
    setFormato(val)
    setPlat(val === 'short' ? 'TikTok' : 'YouTube')
  }

  const handleSave = () => {
    if (!tema.trim()) return
    onSave({ tema, formato, plataforma, hook, guion: body, status })
  }

  return (
    <Overlay onClose={onClose}>
      <ModalBox title={isEdit ? guion.tema : 'Nuevo guion'} onClose={onClose}>
        <Field label="Tema">
          <input className="nz-input" value={tema} onChange={e => setTema(e.target.value)}
            placeholder="Ej: cómo ganar seguidores en TikTok" />
        </Field>
        <Field label="Formato">
          <select className="nz-input" value={formato} onChange={e => handleFormato(e.target.value)}>
            <option value="short">Short</option>
            <option value="youtube">YouTube</option>
          </select>
        </Field>
        <Field label="Plataforma">
          <select className="nz-input" value={plataforma} onChange={e => setPlat(e.target.value)}>
            {plataformas.map(p => <option key={p}>{p}</option>)}
          </select>
        </Field>
        <Field label="Hook">
          <textarea className="nz-input" value={hook} onChange={e => setHook(e.target.value)}
            placeholder="Primera oración o idea gancho…" rows={2}
            style={{ resize: 'vertical' }} />
        </Field>
        <Field label="Guion">
          <textarea className="nz-input" value={body} onChange={e => setBody(e.target.value)}
            placeholder="Contenido completo del guion…" rows={12}
            style={{ resize: 'vertical', fontFamily: 'var(--font-mono)', fontSize: 13 }} />
        </Field>
        <Field label="Status">
          <select className="nz-input" value={status} onChange={e => setStatus(e.target.value)}>
            {['borrador', 'listo', 'publicado'].map(s => <option key={s}>{s}</option>)}
          </select>
        </Field>
        <button className="nz-btn nz-btn-primary" onClick={handleSave} disabled={!tema.trim()}>
          {isEdit ? 'Guardar cambios' : 'Guardar'}
        </button>
      </ModalBox>
    </Overlay>
  )
}

/* ── shared small components ─────────────────────────── */
function Overlay({ onClose, children }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1050, background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={onClose}>
      <div onClick={e => e.stopPropagation()}>{children}</div>
    </div>
  )
}

function ModalBox({ title, onClose, children }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12,
      padding: 24, width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto',
      display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>{title}</h2>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)',
          cursor: 'pointer', fontSize: 20, lineHeight: 1, padding: 4 }}>×</button>
      </div>
      {children}
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
        {label}
      </label>
      {children}
    </div>
  )
}

/* ── Delete icon ─────────────────────────────────────── */
function TrashIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
      <path d="M10 11v6"/><path d="M14 11v6"/>
      <path d="M9 6V4h6v2"/>
    </svg>
  )
}

/* ── Main page ───────────────────────────────────────── */
export default function Guiones() {
  const { guiones, loading, createGuion, updateGuion, deleteGuion } = useGuiones()
  const [modal, setModal] = useState(null) // null | 'new' | guion-object
  const [filterFormato, setFilterFormato] = useState('')
  const [filterStatus, setFilterStatus]   = useState('')

  const handleSaveNew = async (data) => {
    await createGuion(data)
    setModal(null)
  }

  const handleSaveEdit = async (updates) => {
    await updateGuion(modal.id, updates)
    setModal(null)
  }

  const handleDelete = async (e, id) => {
    e.stopPropagation()
    if (!confirm('¿Eliminar este guión?')) return
    await deleteGuion(id)
  }

  const filtered = guiones.filter(g => {
    if (filterFormato && g.formato !== filterFormato) return false
    if (filterStatus  && g.status  !== filterStatus)  return false
    return true
  })

  return (
    <div style={{ padding: '28px 32px', maxWidth: 860, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: 'var(--text)' }}>Guiones</h1>
        <button className="nz-btn nz-btn-primary" onClick={() => setModal('new')}
          style={{ fontSize: 13 }}>
          + Nuevo guion
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <select className="nz-input" value={filterFormato}
          onChange={e => setFilterFormato(e.target.value)}
          style={{ width: 'auto', fontSize: 13 }}>
          <option value="">Todos los formatos</option>
          <option value="short">Short</option>
          <option value="youtube">YouTube</option>
        </select>
        <select className="nz-input" value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          style={{ width: 'auto', fontSize: 13 }}>
          <option value="">Todos los estados</option>
          <option value="borrador">Borrador</option>
          <option value="listo">Listo</option>
          <option value="publicado">Publicado</option>
        </select>
      </div>

      {/* List */}
      {loading ? (
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Cargando…</p>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-subtle)' }}>
          <p style={{ fontSize: 15, margin: 0 }}>No hay guiones todavía.</p>
          <p style={{ fontSize: 13, marginTop: 6 }}>Usá el botón de arriba para crear uno.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(g => (
            <div key={g.id} onClick={() => setModal(g)}
              style={{ background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 10, padding: '14px 16px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 12,
                transition: 'border-color var(--dur-fast)' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {g.tema}
                </div>
                {g.hook && (
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {g.hook}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0, alignItems: 'center' }}>
                <Chip map={FORMAT_COLORS} value={g.formato} />
                <Chip map={STATUS_COLORS} value={g.status} />
                <span style={{ fontSize: 12, color: 'var(--text-subtle)', marginLeft: 4 }}>
                  {fmtDate(g.created_at)}
                </span>
                <button onClick={e => handleDelete(e, g.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-subtle)', padding: '2px 4px', display: 'flex',
                    alignItems: 'center' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#F87171'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-subtle)'}>
                  <TrashIcon />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal === 'new' && (
        <GuionModal onClose={() => setModal(null)} onSave={handleSaveNew} />
      )}
      {modal && typeof modal === 'object' && (
        <GuionModal guion={modal} onClose={() => setModal(null)} onSave={handleSaveEdit} />
      )}
    </div>
  )
}
