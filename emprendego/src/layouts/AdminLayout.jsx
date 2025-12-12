import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useTicketCount } from '../hooks/useTicketCount'
import BrandLogo from '../components/BrandLogo'
import {
  Shield,
  LayoutDashboard,
  Users,
  Store,
  CreditCard,
  ShoppingBag,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Bell,
  Search,
  ChevronRight,
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Usuarios', href: '/admin/usuarios', icon: Users },
  { name: 'Tiendas', href: '/admin/tiendas', icon: Store },
  { name: 'Planes', href: '/admin/planes', icon: CreditCard },
  { name: 'Marketplace', href: '/admin/marketplace', icon: ShoppingBag },
  { name: 'Soporte', href: '/admin/soporte', icon: MessageSquare },
  { name: 'Configuración', href: '/admin/configuracion', icon: Settings },
]

const AdminLayout = () => {
  const { user, profile, signOut, isAdmin } = useAuth()
  const { count: ticketCount } = useTicketCount()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [notifications, setNotifications] = useState([])

  // Obtener título de la página actual
  const getCurrentPageTitle = () => {
    const currentNav = navigation.find(item => {
      if (item.href === '/admin') {
        return location.pathname === '/admin'
      }
      return location.pathname.startsWith(item.href)
    })
    return currentNav?.name || 'Admin'
  }

  // Obtener breadcrumbs
  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean)
    return paths.map((path, index) => ({
      name: path.charAt(0).toUpperCase() + path.slice(1),
      href: '/' + paths.slice(0, index + 1).join('/'),
      current: index === paths.length - 1
    }))
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/auth/login')
  }

  // Cerrar sidebar al hacer click fuera en móvil
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-72 bg-slate-900
          transform transition-transform duration-300 ease-out
          lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <BrandLogo size="md" showText={false} />
            <div>
              <span className="font-bold text-white text-lg">EmprendeGo</span>
              <span className="block text-xs text-slate-400">Panel Admin</span>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Admin info */}
        <div className="p-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {profile?.full_name?.charAt(0)?.toUpperCase() || 'A'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-white truncate">
                {profile?.full_name || 'Administrador'}
              </p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
          <p className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Gestión
          </p>
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              end={item.href === '/admin'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-200
                ${isActive
                  ? 'bg-blue-500/10 text-blue-400 shadow-lg shadow-blue-500/5'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }
              `}
            >
              <item.icon className="w-5 h-5" />
              <span className="flex-1">{item.name}</span>
              {item.name === 'Soporte' && ticketCount > 0 && (
                <span className="px-2 py-0.5 text-xs bg-red-500/20 text-red-400 rounded-full font-medium">
                  {ticketCount > 99 ? '99+' : ticketCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom section */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 shadow-sm">
          <div className="flex items-center justify-between h-full px-4 lg:px-6">
            {/* Left side - Mobile menu + Breadcrumbs */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>

              {/* Breadcrumbs - Hidden on mobile */}
              <nav className="hidden md:flex items-center gap-1 text-sm">
                {getBreadcrumbs().map((crumb, index) => (
                  <div key={crumb.href} className="flex items-center gap-1">
                    {index > 0 && <ChevronRight className="w-4 h-4 text-slate-400" />}
                    {crumb.current ? (
                      <span className="font-medium text-slate-900">{crumb.name}</span>
                    ) : (
                      <NavLink
                        to={crumb.href}
                        className="text-slate-500 hover:text-slate-700 transition-colors"
                      >
                        {crumb.name}
                      </NavLink>
                    )}
                  </div>
                ))}
              </nav>

              {/* Mobile title */}
              <h1 className="md:hidden font-semibold text-slate-900">
                {getCurrentPageTitle()}
              </h1>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2">
              {/* Search - Hidden on mobile */}
              <div className="hidden lg:flex items-center">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar..."
                    className="w-64 pl-9 pr-4 py-2 bg-slate-100 border-0 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Notifications */}
              <button className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 relative transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
              </button>

              {/* User menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {profile?.full_name?.charAt(0)?.toUpperCase() || 'A'}
                    </span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown */}
                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-20">
                      <div className="px-4 py-3 border-b border-slate-100">
                        <p className="font-medium text-slate-900">
                          {profile?.full_name || 'Administrador'}
                        </p>
                        <p className="text-sm text-slate-500 truncate">{user?.email}</p>
                      </div>
                      <div className="py-1">
                        <button
                          onClick={() => {
                            navigate('/admin/configuracion')
                            setUserMenuOpen(false)
                          }}
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <Settings className="w-4 h-4" />
                          Configuración
                        </button>
                      </div>
                      <div className="border-t border-slate-100 pt-1">
                        <button
                          onClick={() => {
                            setUserMenuOpen(false)
                            handleSignOut()
                          }}
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <LogOut className="w-4 h-4" />
                          Cerrar sesión
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
