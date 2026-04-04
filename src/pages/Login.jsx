import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

export function Login() {
  const { signInWithGoogle, signInWithMagicLink } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleGoogleSignIn = async () => {
    setLoading(true)
    const { error } = await signInWithGoogle()
    if (error) {
      setMessage(`Error: ${error.message}`)
    }
    setLoading(false)
  }

  const handleMagicLink = async (e) => {
    e.preventDefault()
    if (!email) {
      setMessage('Por favor ingresa tu email')
      return
    }

    setLoading(true)
    const { error } = await signInWithMagicLink(email)
    if (error) {
      setMessage(`Error: ${error.message}`)
    } else {
      setMessage('Link de acceso enviado a tu email')
      setEmail('')
    }
    setLoading(false)
  }

  return (
    <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#0A0A0F' }}>
      <div className="w-full max-w-sm px-6">
        {/* Logo */}
        <div className="text-center mb-12">
          <h1 style={{ color: '#00E5A0' }} className="text-5xl font-bold mb-2">
            NZTech
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.45)' }} className="text-lg">
            Dashboard
          </p>
        </div>

        {/* Google OAuth Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full mb-6 px-4 py-3 rounded-lg flex items-center justify-center gap-3 transition-colors"
          style={{
            border: '1px solid rgba(255,255,255,0.12)',
            backgroundColor: '#13131A',
            color: 'white',
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#1C1C26'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#13131A'}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <span>Continuar con Google</span>
        </button>

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div style={{ backgroundColor: 'rgba(255,255,255,0.08)' }} className="flex-1 h-px"></div>
          <span style={{ color: 'rgba(255,255,255,0.45)' }} className="text-sm">o</span>
          <div style={{ backgroundColor: 'rgba(255,255,255,0.08)' }} className="flex-1 h-px"></div>
        </div>

        {/* Magic Link Form */}
        <form onSubmit={handleMagicLink} className="space-y-3">
          <input
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className="w-full px-4 py-3 rounded-lg text-white placeholder-gray-500 transition-colors"
            style={{
              backgroundColor: '#13131A',
              border: '1px solid rgba(255,255,255,0.12)',
            }}
            onFocus={(e) => e.target.style.borderColor = 'rgba(0,229,160,0.3)'}
            onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 rounded-lg font-medium transition-colors"
            style={{
              backgroundColor: '#00E5A0',
              color: '#0A0A0F',
            }}
            onMouseEnter={(e) => e.target.style.opacity = '0.9'}
            onMouseLeave={(e) => e.target.style.opacity = '1'}
          >
            {loading ? 'Enviando...' : 'Enviar link'}
          </button>
        </form>

        {/* Message */}
        {message && (
          <p
            style={{
              color: message.includes('Error') ? '#FF6B6B' : '#00E5A0',
            }}
            className="mt-4 text-center text-sm"
          >
            {message}
          </p>
        )}
      </div>
    </div>
  )
}
