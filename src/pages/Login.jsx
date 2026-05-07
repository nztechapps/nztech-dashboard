import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

export function Login() {
  const { signInWithGoogle, signInWithMagicLink } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleGoogleSignIn = async () => {
    setLoading(true)
    const { data, error } = await signInWithGoogle()
    if (error) setMessage(`Error: ${error.message}`)
    else if (data?.user?.email !== 'nztech.apps@outlook.com') setMessage('Acceso restringido')
    setLoading(false)
  }

  const handleMagicLink = async (e) => {
    e.preventDefault()
    if (!email) { setMessage('Por favor ingresa tu email'); return }
    setLoading(true)
    const { error } = await signInWithMagicLink(email)
    if (error) setMessage(`Error: ${error.message}`)
    else { setMessage('Link de acceso enviado a tu email'); setEmail('') }
    setLoading(false)
  }

  const isError = message.includes('Error') || message.includes('restringido')

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ width: '100%', maxWidth: 360, padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h1 style={{ color: 'var(--primary)', fontSize: 48, fontWeight: 700, margin: '0 0 8px 0' }}>NZTech</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 18, margin: 0 }}>Dashboard</p>
        </div>

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          style={{
            width: '100%', marginBottom: 24, padding: '12px 16px',
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', color: 'var(--text)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
            cursor: 'pointer', fontSize: 14, fontWeight: 500,
            transition: 'background var(--dur-fast)',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-hover)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--surface)'}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <span>Continuar con Google</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          <span style={{ color: 'var(--text-subtle)', fontSize: 13 }}>o</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>

        <form onSubmit={handleMagicLink} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            type="email" placeholder="tu@email.com" value={email}
            onChange={e => setEmail(e.target.value)} disabled={loading}
            className="nz-input"
          />
          <button type="submit" disabled={loading} className="nz-btn nz-btn-primary" style={{ justifyContent: 'center', padding: '12px 16px', fontSize: 14 }}>
            {loading ? 'Enviando...' : 'Enviar link'}
          </button>
        </form>

        {message && (
          <p style={{ color: isError ? 'var(--nz-danger)' : 'var(--nz-success)', marginTop: 16, textAlign: 'center', fontSize: 13 }}>
            {message}
          </p>
        )}
      </div>
    </div>
  )
}
