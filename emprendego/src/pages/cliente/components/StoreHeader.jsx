import { memo } from 'react'
import { MapPin, Share2, ShoppingBag, ShieldCheck } from 'lucide-react'
import { getHeaderClasses } from './themeUtils'

/**
 * StoreHeader - Premium sticky header component
 * Features: Glass effect, logo, store name with verified badge, city, share & cart buttons
 */
const StoreHeader = memo(function StoreHeader({
  store,
  theme,
  primaryColor,
  secondaryColor,
  cartCount,
  onCartClick,
  onShare,
  isPreview = false,
}) {
  const headerClasses = getHeaderClasses(theme?.headerStyle)

  const handleShare = () => {
    if (isPreview) return
    if (onShare) {
      onShare()
    } else if (navigator.share) {
      navigator.share({ title: store.name, url: window.location.href })
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  return (
    <header 
      className={`sticky top-0 z-40 transition-all duration-200 ${headerClasses}`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo y nombre - Premium */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
            {/* Logo */}
            {store.logo_url ? (
              <div className="relative shrink-0 group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-200 to-gray-100 rounded-xl blur opacity-50 group-hover:opacity-75 transition-opacity" />
                <img 
                  src={store.logo_url} 
                  alt={store.name}
                  className="relative w-9 h-9 sm:w-11 sm:h-11 rounded-xl object-cover ring-2 ring-white shadow-md"
                />
              </div>
            ) : (
              <div 
                className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-lg ring-2 ring-white/50 shrink-0"
                style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
              >
                {store.name?.charAt(0)?.toUpperCase()}
              </div>
            )}
            
            {/* Info tienda */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 min-w-0">
                <h1 className="font-bold text-gray-900 leading-tight truncate text-sm sm:text-base lg:text-lg">
                  {store.name}
                </h1>
                {store.plan !== 'gratis' && (
                  <div 
                    className="flex-shrink-0 p-0.5 rounded-full"
                    style={{ backgroundColor: `${primaryColor}15` }}
                    title="Tienda verificada"
                  >
                    <ShieldCheck 
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4" 
                      style={{ color: primaryColor }}
                    />
                  </div>
                )}
              </div>
              {store.city && (
                <p className="text-[11px] sm:text-xs text-gray-500 flex items-center gap-1 mt-0.5 truncate">
                  <MapPin className="w-3 h-3 shrink-0 text-gray-400" />
                  <span className="truncate">{store.city}</span>
                </p>
              )}
            </div>
          </div>

          {/* Acciones del header */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* Compartir */}
            <button
              onClick={handleShare}
              className="hidden sm:flex p-2 sm:p-2.5 rounded-xl hover:bg-gray-100/80 active:bg-gray-200/80 transition-all duration-150 group"
              title="Compartir tienda"
              aria-label="Compartir tienda"
            >
              <Share2 className="w-[18px] h-[18px] sm:w-5 sm:h-5 text-gray-500 group-hover:text-gray-700 transition-colors" />
            </button>
            
            {/* Carrito - Premium */}
            <button
              onClick={onCartClick}
              className="relative p-2 sm:p-2.5 rounded-xl hover:bg-gray-100/80 active:bg-gray-200/80 transition-all duration-150 group"
              aria-label={`Carrito${cartCount > 0 ? ` (${cartCount} productos)` : ''}`}
            >
              <ShoppingBag className="w-5 h-5 sm:w-[22px] sm:h-[22px] text-gray-700 group-hover:scale-105 transition-transform" />
              {cartCount > 0 && (
                <span 
                  className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 min-w-[18px] sm:min-w-[20px] h-[18px] sm:h-5 px-1 text-[10px] sm:text-xs font-bold text-white rounded-full flex items-center justify-center shadow-lg ring-2 ring-white animate-in zoom-in-50 duration-200"
                  style={{ backgroundColor: primaryColor }}
                >
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  )
})

export default StoreHeader
