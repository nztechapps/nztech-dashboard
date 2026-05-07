import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
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

const Guiones = lazy(() => import('./pages/Guiones'))
const Social = lazy(() => import('./pages/Social'))
const KnowledgeBase = lazy(() => import('./pages/KnowledgeBase'))
const Productividad = lazy(() => import('./pages/Productividad'))


// Layout wrapper para rutas protegidas
function ProtectedLayout({ children, title = 'Dashboard' }) {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  if (isMobile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <TopBar title={title} />
        <main style={{ flex: 1, overflowY: 'auto', paddingBottom: '80px' }}>
          {children}
        </main>
        <Sidebar />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <TopBar title={title} />
        <main style={{ flex: 1, overflowY: 'auto' }}>
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
        <Route
          path="/guiones"
          element={
            <AuthGuard>
              <ProtectedLayout title="Guiones">
                <Suspense fallback={null}><Guiones /></Suspense>
              </ProtectedLayout>
            </AuthGuard>
          }
        />
        <Route
          path="/social"
          element={
            <AuthGuard>
              <ProtectedLayout title="Social">
                <Suspense fallback={null}><Social /></Suspense>
              </ProtectedLayout>
            </AuthGuard>
          }
        />
        <Route
          path="/manuales"
          element={
            <AuthGuard>
              <ProtectedLayout title="Manuales">
                <Suspense fallback={null}><KnowledgeBase /></Suspense>
              </ProtectedLayout>
            </AuthGuard>
          }
        />
        <Route
          path="/productividad"
          element={
            <AuthGuard>
              <ProtectedLayout title="Productividad">
                <Suspense fallback={null}><Productividad /></Suspense>
              </ProtectedLayout>
            </AuthGuard>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
