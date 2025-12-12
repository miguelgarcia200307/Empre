import { useState } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useStore } from '../hooks/useStore'
import { useToast } from '../hooks/useToast'
import BrandLogo from '../components/BrandLogo'
import {
  LayoutDashboard,
  Package,
  FolderOpen,
  Palette,
  Settings,
  QrCode,
  CreditCard,
  HelpCircle,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Bell,
  User,
  BarChart3,
  ExternalLink,
  Lock,
  Crown,
  Sparkles,
  Zap,
  Star,
} from 'lucide-react'

// ============================================
// PLAN STYLE HELPER
// ============================================
const getPlanStyles = (planName) => {
  const name = (planName || '').toLowerCase()
  
  // Plan Pro - Premium dorado elegante
  if (name.includes('pro')) {
    return {
      container: 'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200 shadow-amber-100/50',
      text: 'text-amber-900',
      subtext: 'text-amber-700',
      badge: 'bg-amber-100 text-amber-800 border-amber-300',
      badgeText: 'PREMIUM',
      icon: Crown,
      iconClass: 'text-amber-500',
      hoverClass: 'hover:border-amber-300 hover:shadow-md hover:shadow-amber-100/50',
    }
  }
  
  // Plan Emprendedor - Verde/Teal elegante
  if (name.includes('emprendedor')) {
    return {
      container: 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200 shadow-emerald-100/50',
      text: 'text-emerald-900',
      subtext: 'text-emerald-700',
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      badgeText: 'PLUS',
      icon: Sparkles,
      iconClass: 'text-emerald-500',
      hoverClass: 'hover:border-emerald-300 hover:shadow-md hover:shadow-emerald-100/50',
    }
  }
  
  // Plan Básico - Azul/Slate neutral
  if (name.includes('básico') || name.includes('basico')) {
    return {
      container: 'bg-gradient-to-br from-slate-50 to-blue-50 border-slate-200 shadow-slate-100/50',
      text: 'text-slate-900',
      subtext: 'text-slate-600',
      badge: 'bg-slate-100 text-slate-700 border-slate-300',
      badgeText: 'BASE',
      icon: Zap,
      iconClass: 'text-slate-500',
      hoverClass: 'hover:border-slate-300 hover:shadow-md hover:shadow-slate-100/50',
    }
  }
  
  // Plan Gratis - Rojo suave de alerta
  return {
    container: 'bg-gradient-to-br from-rose-50 to-red-50 border-rose-200 shadow-rose-100/50',
    text: 'text-rose-900',
    subtext: 'text-rose-600',
    badge: 'bg-rose-100 text-rose-700 border-rose-200',
    badgeText: 'FREE',
    icon: Star,
    iconClass: 'text-rose-400',
    hoverClass: 'hover:border-rose-300 hover:shadow-md hover:shadow-rose-100/50',
  }
}

// Configuración de navegación con features requeridos
const navigation = [
  { name: 'Dashboard', href: '/panel', icon: LayoutDashboard, feature: null },
  { name: 'Productos', href: '/panel/productos', icon: Package, feature: null },
  { name: 'Categorías', href: '/panel/categorias', icon: FolderOpen, feature: null },
  { name: 'Diseño', href: '/panel/diseno', icon: Palette, feature: null },
  { name: 'Mi Negocio', href: '/panel/negocio', icon: Settings, feature: null },
  { name: 'Enlaces y QR', href: '/panel/enlaces', icon: QrCode, feature: 'qrCode', minPlan: 'Básico' },
  { name: 'Finanzas', href: '/panel/finanzas', icon: BarChart3, feature: 'finances', minPlan: 'Emprendedor' },
  { name: 'Plan', href: '/panel/plan', icon: CreditCard, feature: null },
  { name: 'Soporte', href: '/panel/soporte', icon: HelpCircle, feature: null },
]

const PanelLayout = () => {
  const { user, signOut } = useAuth()
  const { store, plan, hasFeature } = useStore()
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/auth/login')
  }

  // Handler para items bloqueados
  const handleLockedClick = (e, item) => {
    e.preventDefault()
    toast.info(`${item.name} requiere plan ${item.minPlan || 'superior'}`)
    navigate('/panel/plan')
  }

  const storeUrl = store?.slug ? `${window.location.origin}/tienda/${store.slug}` : null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200
          transform transition-transform duration-200 ease-out
          lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
          <BrandLogo size="sm" linkToHome />
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Store info */}
        {store && (
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              {store.logo_url && store.logo_url.startsWith('http') ? (
                <img
                  src={store.logo_url}
                  alt={store.name}
                  className="w-10 h-10 rounded-xl object-cover"
                  onError={(e) => { 
                    e.target.onerror = null
                    e.target.src = '' 
                    e.target.style.display = 'none'
                  }}
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {store.name?.charAt(0)?.toUpperCase() || 'T'}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{store.name}</p>
                <p className="text-xs text-gray-500 truncate">{store.slug}</p>
              </div>
            </div>
            {storeUrl && (
              <a
                href={storeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex items-center justify-center gap-2 w-full px-3 py-2 text-sm bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Ver tienda
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        )}

        {/* Navigation */}
        <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
          {navigation.map((item) => {
            // Verificar si el item requiere un feature y si el usuario lo tiene
            const isLocked = item.feature && !hasFeature(item.feature)
            
            if (isLocked) {
              // Item bloqueado - no navega, muestra tooltip/toast
              return (
                <button
                  key={item.name}
                  onClick={(e) => handleLockedClick(e, item)}
                  className="
                    flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium w-full
                    text-gray-400 hover:bg-gray-50 cursor-not-allowed
                    transition-colors duration-150
                  "
                >
                  <item.icon className="w-5 h-5" />
                  <span className="flex-1 text-left">{item.name}</span>
                  <div className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" />
                    <span className="px-1.5 py-0.5 text-xs bg-amber-100 text-amber-700 rounded font-medium">
                      {item.minPlan}
                    </span>
                  </div>
                </button>
              )
            }

            // Item normal - navega normalmente
            return (
              <NavLink
                key={item.name}
                to={item.href}
                end={item.href === '/panel'}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                  transition-colors duration-150
                  ${isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <item.icon className="w-5 h-5" />
                <span className="flex-1">{item.name}</span>
              </NavLink>
            )
          })}
        </nav>

        {/* Plan info - Enhanced visual hierarchy */}
        <div className="p-4 border-t border-gray-100">
          {(() => {
            const styles = getPlanStyles(plan.name)
            const IconComponent = styles.icon
            return (
              <NavLink
                to="/panel/plan"
                className={`
                  block p-3 rounded-xl border transition-all duration-200
                  ${styles.container} ${styles.hoverClass}
                `}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`p-1.5 rounded-lg ${styles.badge} border`}>
                      <IconComponent className={`w-4 h-4 ${styles.iconClass}`} />
                    </div>
                    <div className="min-w-0">
                      <p className={`text-sm font-semibold ${styles.text} truncate`}>
                        Plan {plan.name}
                      </p>
                      <p className={`text-xs ${styles.subtext}`}>
                        {plan.maxProducts === -1 
                          ? 'Ilimitado' 
                          : `${plan.maxProducts} productos`}
                      </p>
                    </div>
                  </div>
                  <span className={`
                    px-2 py-0.5 text-[10px] font-bold rounded-full border shrink-0
                    ${styles.badge}
                  `}>
                    {styles.badgeText}
                  </span>
                </div>
                {plan.id === 'gratis' && (
                  <div className="mt-2 pt-2 border-t border-rose-100">
                    <p className="text-xs text-rose-600 font-medium flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      Mejora para más funciones
                    </p>
                  </div>
                )}
              </NavLink>
            )
          })()}
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between h-full px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-lg text-gray-500 hover:bg-gray-100"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Right side */}
            <div className="flex items-center gap-3 ml-auto">
              {/* Notifications */}
              <button className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              </button>

              {/* User menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 hidden sm:block">
                    {user?.email?.split('@')[0]}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>

                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-20">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {user?.email}
                        </p>
                        <p className="text-xs text-gray-500">Plan {plan.name}</p>
                      </div>
                      <NavLink
                        to="/panel/negocio"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Settings className="w-4 h-4" />
                        Configuración
                      </NavLink>
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="w-4 h-4" />
                        Cerrar sesión
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default PanelLayout
