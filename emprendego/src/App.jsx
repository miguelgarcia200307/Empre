import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { StoreProvider } from './hooks/useStore'
import { ToastProvider } from './hooks/useToast'

// Layouts
import { AuthLayout, PanelLayout, AdminLayout } from './layouts'

// Auth Pages
import { Login, Register, ForgotPassword } from './pages/auth'

// Onboarding
import { Onboarding } from './pages/onboarding'

// Emprendedor Pages
import {
  Dashboard,
  Productos,
  Categorias,
  Diseno,
  Negocio,
  EnlacesQR,
  Finanzas,
  Plan,
  Soporte,
} from './pages/emprendedor'

// Admin Pages
import {
  AdminDashboard,
  AdminUsuarios,
  AdminTiendas,
  AdminPlanes,
  AdminMarketplace,
  AdminSoporte,
  AdminConfiguracion,
} from './pages/admin'

// Cliente Pages (Tienda pública)
import { TiendaPublica } from './pages/cliente'

// Marketplace (público)
import { MarketplaceHome, VendeConNosotros } from './pages/marketplace'

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const { user, initializing, isAdmin, profile } = useAuth()
  
  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }
  
  if (!user) {
    return <Navigate to="/auth/login" replace />
  }

  // Si es admin, redirigir al panel admin
  if (isAdmin) {
    return <Navigate to="/admin" replace />
  }
  
  return children
}

// Admin Route wrapper (requires admin role)
const AdminRoute = ({ children }) => {
  const { user, initializing, isAdmin } = useAuth()
  
  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }
  
  if (!user) {
    return <Navigate to="/auth/login" replace />
  }
  
  if (!isAdmin) {
    return <Navigate to="/panel" replace />
  }
  
  return children
}

// Public Route wrapper (redirect if already logged in)
const PublicRoute = ({ children }) => {
  const { user, initializing, isAdmin } = useAuth()
  
  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }
  
  // Verificar si estamos en flujo de registro exitoso (no redirigir)
  const isRegistrationFlow = sessionStorage.getItem('eg_registration_pending')
  
  if (user && !isRegistrationFlow) {
    // Redirigir según rol
    if (isAdmin) {
      return <Navigate to="/admin" replace />
    }
    return <Navigate to="/panel" replace />
  }
  
  return children
}

// Onboarding Route wrapper (solo para emprendedores sin onboarding)
const OnboardingRoute = ({ children }) => {
  const { user, initializing, isAdmin, profile } = useAuth()
  
  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }
  
  if (!user) {
    return <Navigate to="/auth/login" replace />
  }

  // Admin nunca va a onboarding
  if (isAdmin) {
    return <Navigate to="/admin" replace />
  }

  // Si ya completó onboarding, ir al panel
  if (profile?.onboarding_completed) {
    return <Navigate to="/panel" replace />
  }
  
  return children
}

// App Routes
const AppRoutes = () => {
  return (
    <Routes>
      {/* Marketplace público como HOME */}
      <Route path="/" element={<MarketplaceHome />} />
      
      {/* Vende con nosotros - Landing */}
      <Route path="/vende" element={<VendeConNosotros />} />
      
      {/* Auth Routes */}
      <Route path="/auth" element={
        <PublicRoute>
          <AuthLayout />
        </PublicRoute>
      }>
        <Route index element={<Navigate to="login" replace />} />
        <Route path="login" element={<Login />} />
        <Route path="registro" element={<Register />} />
        <Route path="recuperar" element={<ForgotPassword />} />
      </Route>
      
      {/* Onboarding - Solo para emprendedores */}
      <Route path="/onboarding" element={
        <OnboardingRoute>
          <Onboarding />
        </OnboardingRoute>
      } />
      
      {/* Panel Routes */}
      <Route path="/panel" element={
        <ProtectedRoute>
          <PanelLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="productos" element={<Productos />} />
        <Route path="categorias" element={<Categorias />} />
        <Route path="diseno" element={<Diseno />} />
        <Route path="negocio" element={<Negocio />} />
        <Route path="enlaces" element={<EnlacesQR />} />
        <Route path="finanzas" element={<Finanzas />} />
        <Route path="plan" element={<Plan />} />
        <Route path="soporte" element={<Soporte />} />
      </Route>
      
      {/* Ruta pública de tienda */}
      <Route path="/tienda/:slug" element={<TiendaPublica />} />
      
      {/* Admin Routes */}
      <Route path="/admin" element={
        <AdminRoute>
          <AdminLayout />
        </AdminRoute>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="usuarios" element={<AdminUsuarios />} />
        <Route path="tiendas" element={<AdminTiendas />} />
        <Route path="planes" element={<AdminPlanes />} />
        <Route path="marketplace" element={<AdminMarketplace />} />
        <Route path="soporte" element={<AdminSoporte />} />
        <Route path="configuracion" element={<AdminConfiguracion />} />
      </Route>
      
      {/* 404 */}
      <Route path="*" element={
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <p className="text-gray-600 mb-6">Página no encontrada</p>
          <a href="/" className="text-blue-600 hover:underline">
            Volver al inicio
          </a>
        </div>
      } />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <StoreProvider>
            <AppRoutes />
          </StoreProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}

export default App
