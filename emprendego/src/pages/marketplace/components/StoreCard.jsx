import { memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Star, ChevronRight, Heart, Eye } from 'lucide-react'

// Mapeo de colores por plan
const planColors = {
  gratis: 'bg-slate-100 text-slate-600',
  basico: 'bg-blue-50 text-blue-700',
  emprendedor: 'bg-purple-50 text-purple-700',
  pro: 'bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700',
}

const planLabels = {
  gratis: 'Gratis',
  basico: 'Básico',
  emprendedor: 'Emprendedor',
  pro: 'Pro',
}

/**
 * Card de tienda - Diseño premium
 * Soporta vista grid y list, tamaño normal y large
 */
function StoreCard({ 
  store, 
  featured = false,
  isFavorite = false,
  onToggleFavorite,
  viewMode = 'grid',
  size = 'normal',
}) {
  const navigate = useNavigate()

  if (!store) return null

  const handleClick = () => {
    navigate(`/tienda/${store.slug}`)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }

  const handleFavoriteClick = (e) => {
    e.stopPropagation()
    onToggleFavorite?.()
  }

  // Vista List
  if (viewMode === 'list') {
    return (
      <article
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="link"
        className="group bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 overflow-hidden"
        aria-label={`Ver tienda ${store.name}`}
      >
        <div className="flex items-center gap-4 p-4">
          {/* Logo */}
          <div className="flex-shrink-0">
            {store.logo_url ? (
              <img 
                src={store.logo_url} 
                alt={`Logo de ${store.name}`}
                loading="lazy"
                decoding="async"
                className="w-14 h-14 rounded-xl object-cover ring-2 ring-slate-100"
              />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center ring-2 ring-slate-100">
                <span className="text-xl font-bold text-white">
                  {store.name?.charAt(0)?.toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-slate-900 truncate">{store.name}</h3>
              {featured && (
                <span className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                  <Star className="w-3 h-3" fill="currentColor" />
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-500">
              {store.city && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {store.city}
                </span>
              )}
              {store.total_views > 0 && (
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  {store.total_views}
                </span>
              )}
            </div>
          </div>

          {/* Plan badge + actions */}
          <div className="flex items-center gap-3">
            <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${planColors[store.plan] || planColors.gratis}`}>
              {planLabels[store.plan] || 'Gratis'}
            </span>
            
            {/* Favorito */}
            {onToggleFavorite && (
              <button
                onClick={handleFavoriteClick}
                className={`p-2 rounded-full transition-colors ${
                  isFavorite 
                    ? 'text-rose-500 bg-rose-50 hover:bg-rose-100' 
                    : 'text-slate-400 hover:text-rose-500 hover:bg-slate-100'
                }`}
                aria-label={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
              >
                <Heart className="w-5 h-5" fill={isFavorite ? 'currentColor' : 'none'} />
              </button>
            )}

            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>
      </article>
    )
  }

  // Vista Grid (default)
  const isLarge = size === 'large'

  return (
    <article
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="link"
      className={`group bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 overflow-hidden ${
        featured ? 'ring-1 ring-amber-200' : ''
      }`}
      aria-label={`Ver tienda ${store.name}`}
    >
      {/* Banner */}
      <div className={`relative ${isLarge ? 'h-36 md:h-44' : 'h-28 md:h-32'} bg-gradient-to-br from-slate-100 to-slate-200`}>
        {store.banner_url ? (
          <>
            <img 
              src={store.banner_url} 
              alt=""
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover"
            />
            {/* Overlay sutil para contraste */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50" />
        )}
        
        {/* Badge destacado */}
        {featured && (
          <div className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500 text-white text-xs font-medium rounded-full shadow-sm">
            <Star className="w-3 h-3" fill="white" />
            Destacada
          </div>
        )}

        {/* Botón favorito */}
        {onToggleFavorite && (
          <button
            onClick={handleFavoriteClick}
            className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all ${
              isFavorite 
                ? 'bg-rose-500 text-white shadow-sm' 
                : 'bg-white/90 text-slate-400 hover:text-rose-500 hover:bg-white'
            }`}
            aria-label={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          >
            <Heart className="w-4 h-4" fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
        )}

        {/* Logo flotante */}
        <div className="absolute -bottom-8 left-4">
          {store.logo_url ? (
            <img 
              src={store.logo_url} 
              alt={`Logo de ${store.name}`}
              loading="lazy"
              decoding="async"
              className={`${isLarge ? 'w-18 h-18' : 'w-16 h-16'} rounded-xl border-4 border-white object-cover shadow-sm bg-white`}
            />
          ) : (
            <div className={`${isLarge ? 'w-18 h-18' : 'w-16 h-16'} rounded-xl border-4 border-white bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-sm`}>
              <span className={`${isLarge ? 'text-2xl' : 'text-xl'} font-bold text-white`}>
                {store.name?.charAt(0)?.toUpperCase()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="pt-10 px-4 pb-4">
        <h3 className={`font-semibold text-slate-900 mb-1 truncate ${isLarge ? 'text-lg' : ''}`}>
          {store.name}
        </h3>
        
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
          {store.city && (
            <>
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{store.city}</span>
            </>
          )}
          {store.total_views > 0 && (
            <>
              <span className="text-slate-300">•</span>
              <Eye className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{store.total_views} visitas</span>
            </>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${planColors[store.plan] || planColors.gratis}`}>
            {planLabels[store.plan] || 'Gratis'}
          </span>
          <span className="text-sm text-blue-600 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
            Ver tienda
            <ChevronRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </article>
  )
}

export default memo(StoreCard)
