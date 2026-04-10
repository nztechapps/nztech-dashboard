import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Login } from './pages/Login'
import Home from './pages/Home'
import Apps from './pages/Apps'
import AppDetail from './pages/AppDetail'
import Finanzas from './pages/Finanzas'
import Notificaciones from './pages/Notificaciones'
import Agentes from './pages/Agentes'
import Calendario from './pages/Calendario'
import Pipeline from './pages/Pipeline'
import Reportes from './pages/Reportes'
import Ideas from './pages/Ideas'
import IdeaDetail from './pages/IdeaDetail'
import Tareas from './pages/Tareas'
import { AuthGuard } from './components/layout/AuthGuard'
import { Sidebar } from './components/layout/Sidebar'
import { TopBar } from './components/layout/TopBar'


// Layout wrapper para rutas protegidas
function ProtectedLayout({ children, title = 'Dashboard' }) {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <div className="flex" style={{ flexDirection: isMobile ? 'column' : 'row' }}>
      <Sidebar />
      <div className="flex-1" style={{ marginLeft: isMobile ? 0 : '220px' }}>
        <TopBar title={title} />
        <main
          className="pt-[56px]"
          style={{
            backgroundColor: '#0A0A0F',
            minHeight: '100vh',
            paddingBottom: isMobile ? '80px' : '0',
          }}
        >
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
        <Route
          path="/agentes"
          element={
            <AuthGuard>
              <ProtectedLayout title="Agentes">
                <Agentes />
              </ProtectedLayout>
            </AuthGuard>
          }
        />
        <Route
          path="/calendario"
          element={
            <AuthGuard>
              <ProtectedLayout title="Calendario">
                <Calendario />
              </ProtectedLayout>
            </AuthGuard>
          }
        />
        <Route
          path="/pipeline"
          element={
            <AuthGuard>
              <ProtectedLayout title="Pipeline">
                <Pipeline />
              </ProtectedLayout>
            </AuthGuard>
          }
        />
        <Route
          path="/reportes"
          element={
            <AuthGuard>
              <ProtectedLayout title="Reportes">
                <Reportes />
              </ProtectedLayout>
            </AuthGuard>
          }
        />
        <Route
          path="/ideas"
          element={
            <AuthGuard>
              <ProtectedLayout title="Ideas">
                <Ideas />
              </ProtectedLayout>
            </AuthGuard>
          }
        />
        <Route
          path="/tareas"
          element={
            <AuthGuard>
              <ProtectedLayout title="Tareas">
                <Tareas />
              </ProtectedLayout>
            </AuthGuard>
          }
        />
        <Route
          path="/ideas/:id"
          element={
            <AuthGuard>
              <ProtectedLayout title="Detalle de la Idea">
                <IdeaDetail />
              </ProtectedLayout>
            </AuthGuard>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
