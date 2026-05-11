import { useState, useEffect, useCallback } from 'react'

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
const REDIRECT_URI = window.location.origin + '/oauth/callback'
const SCOPE = 'https://www.googleapis.com/auth/androidpublisher'
const TOKEN_KEY = 'play_console_token'
const EMAIL_KEY = 'play_console_email'

export function usePlayConsole() {
  const [isConnected, setIsConnected] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [stats, setStats] = useState(null)
  const [email, setEmail] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    const savedEmail = localStorage.getItem(EMAIL_KEY)
    if (token) {
      setIsConnected(true)
      setEmail(savedEmail)
    }
  }, [])

  const connectPlayConsole = useCallback(() => {
    if (!CLIENT_ID) {
      setError('VITE_GOOGLE_CLIENT_ID no está configurado')
      return
    }
    setConnecting(true)
    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: 'code',
      scope: SCOPE,
      access_type: 'offline',
      prompt: 'consent',
    })
    const url = `https://accounts.google.com/o/oauth2/v2/auth?${params}`
    const popup = window.open(url, 'google-oauth', 'width=500,height=600,left=200,top=100')

    const checkClosed = setInterval(() => {
      if (popup?.closed) {
        clearInterval(checkClosed)
        setConnecting(false)
        const token = localStorage.getItem(TOKEN_KEY)
        const savedEmail = localStorage.getItem(EMAIL_KEY)
        if (token) {
          setIsConnected(true)
          setEmail(savedEmail)
        }
      }
    }, 500)
  }, [])

  const disconnectPlayConsole = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(EMAIL_KEY)
    setIsConnected(false)
    setEmail(null)
    setStats(null)
  }, [])

  const fetchStats = useCallback(async (packageName) => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token || !packageName) return null
    setError(null)
    try {
      const today = new Date()
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(today.getDate() - 30)
      const startMonth = `${thirtyDaysAgo.getFullYear()}${String(thirtyDaysAgo.getMonth() + 1).padStart(2, '0')}`

      const installsRes = await fetch(
        `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${packageName}/reviews?maxResults=1`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (installsRes.status === 401) {
        disconnectPlayConsole()
        setError('Sesión expirada, reconectá Play Console')
        return null
      }

      // Stats report endpoint
      const statsRes = await fetch(
        `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${packageName}/reviews?maxResults=100`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const statsData = await statsRes.json()

      const reviews = statsData.reviews || []
      const totalReviews = reviews.length
      const avgRating = totalReviews > 0
        ? (reviews.reduce((acc, r) => acc + (r.comments?.[0]?.userComment?.starRating || 0), 0) / totalReviews).toFixed(1)
        : null

      const result = {
        reviews: totalReviews,
        rating: avgRating,
        installs: null,
        revenue: null,
      }
      setStats(result)
      return result
    } catch (err) {
      setError('Error al obtener datos de Play Console')
      return null
    }
  }, [disconnectPlayConsole])

  return { isConnected, connecting, stats, email, error, connectPlayConsole, disconnectPlayConsole, fetchStats }
}
