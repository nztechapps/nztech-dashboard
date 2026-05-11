import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
const CLIENT_SECRET = import.meta.env.VITE_GOOGLE_CLIENT_SECRET
const REDIRECT_URI = window.location.origin + '/oauth/callback'

export default function OAuthCallback() {
  const navigate = useNavigate()
  const processed = useRef(false)

  useEffect(() => {
    if (processed.current) return
    processed.current = true

    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    const error = params.get('error')

    if (error || !code) {
      if (window.opener) window.close()
      else navigate('/apps')
      return
    }

    const exchangeCode = async () => {
      try {
        const res = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            code,
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            redirect_uri: REDIRECT_URI,
            grant_type: 'authorization_code',
          }),
        })
        const data = await res.json()
        if (data.access_token) {
          localStorage.setItem('play_console_token', data.access_token)
          // Fetch email from userinfo
          try {
            const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${data.access_token}` },
            })
            const user = await userRes.json()
            if (user.email) localStorage.setItem('play_console_email', user.email)
          } catch {}
        }
      } catch {}
      if (window.opener) {
        window.close()
      } else {
        navigate('/apps')
      }
    }

    exchangeCode()
  }, [navigate])

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0A0A0F', color: '#fff', fontFamily: 'sans-serif', fontSize: '14px' }}>
      Conectando con Google Play Console...
    </div>
  )
}
