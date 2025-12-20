import { memo } from 'react'
import { Link } from 'react-router-dom'
import BrandLogo from '../../../components/BrandLogo'

/**
 * Footer del Marketplace - Diseño minimalista
 */
function MarketplaceFooter() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo + Copyright */}
          <div className="flex items-center gap-4">
            <BrandLogo size="sm" />
            <div className="h-5 w-px bg-slate-200" />
            <span className="text-sm text-slate-500">
              © {new Date().getFullYear()} EmprendeGo
            </span>
          </div>

          {/* Links */}
          <nav className="flex items-center gap-6 text-sm" aria-label="Footer">
            <Link 
              to="/" 
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              Inicio
            </Link>
            <Link 
              to="/auth/registro" 
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              Crear tienda
            </Link>
            <Link 
              to="/auth/login" 
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              Ingresar
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}

export default memo(MarketplaceFooter)
