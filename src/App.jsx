import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Login } from './pages/Login'
import Home from './pages/Home'
import Apps from './pages/Apps'
import AppDetail from './pages/AppDetail'
import Finanzas from './pages/Finanzas'
import Notificaciones from './pages/Notificaciones'
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
