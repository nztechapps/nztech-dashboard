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

async function callClaude(prompt) {
  const key = import.meta.env.VITE_ANTHROPIC_API_KEY
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    }),
  })
  if (!res.ok) throw new Error(`API error ${res.status}`)
  const json = await res.json()
  const raw = json.content[0].text.trim()
  // strip possible markdown fences
  const cleaned = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
  return JSON.parse(cleaned)
}

/* ── Short modal ─────────────────────────────────────── */
function ShortModal({ onClose, onSave }) {
  const [tema, setTema] = useState('')
  const [plataforma, setPlataforma] = useState('TikTok')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const generate = async () => {
    if (!tema.trim()) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const prompt = `Sos un experto en contenido viral para redes sociales. Generá un guión para un Short de 60 segundos.

Tema: ${tema}
Plataforma: ${plataforma}

Devolvé ÚNICAMENTE este JSON sin markdown:
{
  "hook": "primera oración gancho (máx 10 palabras)",
  "guion": "guión completo con indicaciones de escena entre [corchetes]",
  "status": "borrador"
}`
      setResult(await callClaude(prompt))
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const save = () => {
    onSave({
      tema,
      formato: 'short',
      plataforma,
      hook: result.hook,
      guion: result.guion,
      status: result.status || 'borrador',
    })
  }

  return (
    <Overlay onClose={onClose}>
      <ModalBox title="Nuevo Short" onClose={onClose}>
        <Field label="Tema">
          <input className="nz-input" value={tema} onChange={e => setTema(e.target.value)}
            placeholder="Ej: cómo ganar seguidores en TikTok" />
        </Field>
        <Field label="Plataforma">
          <select className="nz-input" value={plataforma} onChange={e => setPlataforma(e.target.value)}>
            {['TikTok', 'Instagram Reels', 'YouTube Shorts'].map(p =>
              <option key={p}>{p}</option>)}
          </select>
        </Field>
        <button className="nz-btn nz-btn-primary" onClick={generate} disabled={loading || !tema.trim()}>
          {loading ? 'Generando…' : 'Generar'}
        </button>
        {error && <p style={{ color: '#F87171', fontSize: 13, marginTop: 8 }}>{error}</p>}
        {result && (
          <ResultBox hook={result.hook} guion={result.guion}>
            <button className="nz-btn nz-btn-primary" style={{ marginTop: 16 }} onClick={save}>
              Guardar
            </button>
          </ResultBox>
        )}
      </ModalBox>
    </Overlay>
  )
}

/* ── YouTube modal ───────────────────────────────────── */
function YouTubeModal({ onClose, onSave }) {
  const [tema, setTema] = useState('')
  const [duracion, setDuracion] = useState('10 min')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const generate = async () => {
    if (!tema.trim()) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const prompt = `Sos un experto en contenido para YouTube. Generá un guión completo para un video.

Tema: ${tema}
Duración: ${duracion}

Devolvé ÚNICAMENTE este JSON sin markdown:
{
  "hook": "intro gancho de los primeros 15 segundos",
  "guion": "guión completo con timestamps cada 2-3 minutos entre [MM:SS] y indicaciones de escena entre [corchetes]",
  "status": "borrador"
}`
      setResult(await callClaude(prompt))
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const save = () => {
    onSave({
      tema,
      formato: 'youtube',
      duracion,
      hook: result.hook,
      guion: result.guion,
      status: result.status || 'borrador',
    })
  }

  return (
    <Overlay onClose={onClose}>
      <ModalBox title="Nuevo Video YouTube" onClose={onClose}>
        <Field label="Tema">
          <input className="nz-input" value={tema} onChange={e => setTema(e.target.value)}
            placeholder="Ej: las mejores apps de productividad 2025" />
        </Field>
        <Field label="Duración estimada">
          <select className="nz-input" value={duracion} onChange={e => setDuracion(e.target.value)}>
            {['5 min', '10 min', '15 min', '20 min'].map(d => <option key={d}>{d}</option>)}
          </select>
        </Field>
        <button className="nz-btn nz-btn-primary" onClick={generate} disabled={loading || !tema.trim()}>
          {loading ? 'Generando…' : 'Generar'}
        </button>
        {error && <p style={{ color: '#F87171', fontSize: 13, marginTop: 8 }}>{error}</p>}
        {result && (
          <ResultBox hook={result.hook} guion={result.guion}>
            <button className="nz-btn nz-btn-primary" style={{ marginTop: 16 }} onClick={save}>
              Guardar
            </button>
          </ResultBox>
        )}
      </ModalBox>
    </Overlay>
  )
}

/* ── Edit/View modal ─────────────────────────────────── */
function EditModal({ guion, onClose, onSave }) {
  const [hook, setHook]   = useState(guion.hook || '')
  const [body, setBody]   = useState(guion.guion || '')
  const [status, setStatus] = useState(guion.status || 'borrador')

  return (
    <Overlay onClose={onClose}>
      <ModalBox title={guion.tema} onClose={onClose}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <Chip map={FORMAT_COLORS} value={guion.formato} />
          <Chip map={STATUS_COLORS} value={status} />
        </div>
        <Field label="Hook">
          <input className="nz-input" value={hook} onChange={e => setHook(e.target.value)} />
        </Field>
        <Field label="Status">
          <select className="nz-input" value={status} onChange={e => setStatus(e.target.value)}>
            {['borrador', 'listo', 'publicado'].map(s => <option key={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Guión">
          <textarea className="nz-input" value={body} onChange={e => setBody(e.target.value)}
            rows={14} style={{ resize: 'vertical', fontFamily: 'var(--font-mono)', fontSize: 13 }} />
        </Field>
        <button className="nz-btn nz-btn-primary" onClick={() => onSave({ hook, guion: body, status })}>
          Guardar cambios
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

function ResultBox({ hook, guion, children }) {
  return (
    <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
      <div style={{ background: 'rgba(0,229,160,0.08)', border: '1px solid rgba(0,229,160,0.25)',
        borderRadius: 8, padding: '10px 14px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase',
          letterSpacing: '.08em', marginBottom: 4 }}>HOOK</div>
        <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>{hook}</p>
      </div>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase',
          letterSpacing: '.08em', marginBottom: 6 }}>GUIÓN</div>
        <pre style={{ margin: 0, fontSize: 13, color: 'var(--text)', whiteSpace: 'pre-wrap',
          fontFamily: 'var(--font-mono)', lineHeight: 1.7 }}>{guion}</pre>
      </div>
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
  const [modal, setModal] = useState(null) // 'short' | 'youtube' | guion-object
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
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="nz-btn nz-btn-ghost" onClick={() => setModal('short')}
            style={{ fontSize: 13 }}>
            + Nuevo Short
          </button>
          <button className="nz-btn nz-btn-primary" onClick={() => setModal('youtube')}
            style={{ fontSize: 13 }}>
            + Nuevo YouTube
          </button>
        </div>
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
          <p style={{ fontSize: 13, marginTop: 6 }}>Usá los botones de arriba para generar uno.</p>
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

      {/* Modals */}
      {modal === 'short'   && <ShortModal   onClose={() => setModal(null)} onSave={handleSaveNew} />}
      {modal === 'youtube' && <YouTubeModal onClose={() => setModal(null)} onSave={handleSaveNew} />}
      {modal && typeof modal === 'object' && (
        <EditModal guion={modal} onClose={() => setModal(null)} onSave={handleSaveEdit} />
      )}
    </div>
  )
}
