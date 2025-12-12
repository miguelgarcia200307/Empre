import { Link } from 'react-router-dom'

// Logo desde carpeta public (más confiable para assets estáticos en Vite)
const logo = '/logo.png'

/**
 * BrandLogo - Componente reutilizable para el logo de EmprendeGo
 * 
 * @param {Object} props
 * @param {'sm' | 'md' | 'lg' | 'xl'} props.size - Tamaño del logo
 * @param {boolean} props.showText - Mostrar texto "EmprendeGo"
 * @param {boolean} props.linkToHome - Envolver en Link hacia "/"
 * @param {'light' | 'dark'} props.variant - Variante de color del texto
 * @param {string} props.className - Clases adicionales
 */
const BrandLogo = ({ 
  size = 'md', 
  showText = true, 
  linkToHome = false,
  variant = 'dark',
  className = '' 
}) => {
  // Tamaños del logo
  const sizeClasses = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12',
  }

  // Tamaños del texto
  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-xl',
    xl: 'text-2xl',
  }

  // Variantes de color del texto
  const textColorClasses = {
    dark: 'text-slate-900',
    light: 'text-white',
  }

  const content = (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <img 
        src={logo} 
        alt="EmprendeGo" 
        className={`${sizeClasses[size]} object-contain rounded-xl`}
        onError={(e) => {
          // Fallback si la imagen no carga - mostrar iniciales
          e.target.style.display = 'none'
          e.target.nextSibling?.classList?.remove('hidden')
        }}
      />
      <div 
        className={`hidden ${sizeClasses[size]} rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center`}
      >
        <span className="text-white font-bold text-sm">EG</span>
      </div>
      {showText && (
        <span className={`font-bold ${textSizeClasses[size]} ${textColorClasses[variant]}`}>
          Emprende<span className="text-blue-600">Go</span>
        </span>
      )}
    </div>
  )

  if (linkToHome) {
    return (
      <Link to="/" className="hover:opacity-90 transition-opacity">
        {content}
      </Link>
    )
  }

  return content
}

export default BrandLogo
