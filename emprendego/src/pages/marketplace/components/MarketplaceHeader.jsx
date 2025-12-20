import { memo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Menu } from 'lucide-react'
import BrandLogo from '../../../components/BrandLogo'
import { Button } from '../../../components/ui'

/**
 * Header del Marketplace - Diseño premium minimalista
 * Sticky con blur, navegación limpia
 */
function MarketplaceHeader({ onMobileMenuOpen }) {
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo + Volver */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link 
              to="/" 
              className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors group"
              aria-label="Volver al inicio"
            >
              <div className="p-1.5 rounded-lg group-hover:bg-slate-100 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </div>
              <span className="hidden sm:inline text-sm font-medium">Inicio</span>
            </Link>
            <div className="h-5 w-px bg-slate-200 hidden sm:block" />
            <BrandLogo size="md" linkToHome />
          </div>

          {/* Desktop: Botones Auth */}
          <div className="hidden md:flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/auth/login')}
              className="text-slate-600 hover:text-slate-900"
            >
              Ingresar
            </Button>
            <Button 
              variant="primary" 
              size="sm"
              onClick={() => navigate('/auth/registro')}
              className="shadow-sm"
            >
              Crear tienda
            </Button>
          </div>

          {/* Mobile: Botón menú */}
          <button
            onClick={onMobileMenuOpen}
            className="md:hidden p-2 -mr-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Abrir menú"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
    </header>
  )
}

export default memo(MarketplaceHeader)
