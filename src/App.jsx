import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Login } from './pages/Login'
import { AuthGuard } from './components/layout/AuthGuard'
import { Sidebar } from './components/layout/Sidebar'
import { TopBar } from './components/layout/TopBar'

// Layout wrapper para rutas protegidas
function ProtectedLayout({ children, title = 'Dashboard' }) {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-[220px]">
        <TopBar title={title} />
        <main className="pt-[56px]" style={{ backgroundColor: '#0A0A0F', minHeight: '100vh' }}>
          {children}
        </main>
      </div>
    </div>
  )
}

// Páginas placeholder
function Home() {
  return (
    <div className="p-6">
      <h2 style={{ color: '#00E5A0' }} className="text-2xl font-bold">
        Home
      </h2>
      <p style={{ color: 'rgba(255,255,255,0.45)' }} className="mt-2">
        Bienvenido al dashboard
      </p>
    </div>
  )
}

function Apps() {
  return (
    <div className="p-6">
      <h2 style={{ color: '#00E5A0' }} className="text-2xl font-bold">
        Apps
      </h2>
      <p style={{ color: 'rgba(255,255,255,0.45)' }} className="mt-2">
        Gestiona tus apps móviles
      </p>
    </div>
  )
}

function AppDetail() {
  return (
    <div className="p-6">
      <h2 style={{ color: '#00E5A0' }} className="text-2xl font-bold">
        Detalles de la App
      </h2>
      <p style={{ color: 'rgba(255,255,255,0.45)' }} className="mt-2">
        Detalles específicos de la app
      </p>
    </div>
  )
}

function Finanzas() {
  return (
    <div className="p-6">
      <h2 style={{ color: '#00E5A0' }} className="text-2xl font-bold">
        Finanzas
      </h2>
      <p style={{ color: 'rgba(255,255,255,0.45)' }} className="mt-2">
        Métricas financieras
      </p>
    </div>
  )
}

function Notificaciones() {
  return (
    <div className="p-6">
      <h2 style={{ color: '#00E5A0' }} className="text-2xl font-bold">
        Notificaciones
      </h2>
      <p style={{ color: 'rgba(255,255,255,0.45)' }} className="mt-2">
        Centro de notificaciones
      </p>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta pública */}
        <Route path="/login" element={<Login />} />

        {/* Rutas protegidas */}
        <Route
          path="/"
          element={
            <AuthGuard>
              <ProtectedLayout title="Home">
                <Home />
              </ProtectedLayout>
            </AuthGuard>
          }
        />
        <Route
          path="/apps"
          element={
            <AuthGuard>
              <ProtectedLayout title="Apps">
                <Apps />
              </ProtectedLayout>
            </AuthGuard>
          }
        />
        <Route
          path="/apps/:id"
          element={
            <AuthGuard>
              <ProtectedLayout title="Detalles de la App">
                <AppDetail />
              </ProtectedLayout>
            </AuthGuard>
          }
        />
        <Route
          path="/finanzas"
          element={
            <AuthGuard>
              <ProtectedLayout title="Finanzas">
                <Finanzas />
              </ProtectedLayout>
            </AuthGuard>
          }
        />
        <Route
          path="/notificaciones"
          element={
            <AuthGuard>
              <ProtectedLayout title="Notificaciones">
                <Notificaciones />
              </ProtectedLayout>
            </AuthGuard>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
