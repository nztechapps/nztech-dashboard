import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export function AuthGuard({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ backgroundColor: '#0A0A0F' }}
      >
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-12 h-12 rounded-full border-2 border-transparent animate-spin"
            style={{
              borderTopColor: '#00E5A0',
              borderRightColor: '#00E5A0',
            }}
          ></div>
          <p style={{ color: '#00E5A0' }} className="text-sm font-medium">
            Cargando...
          </p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}
