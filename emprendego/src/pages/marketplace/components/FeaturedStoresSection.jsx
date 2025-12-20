import { memo, useRef } from 'react'
import { Star, ChevronLeft, ChevronRight } from 'lucide-react'
import StoreCard from './StoreCard'

/**
 * Sección de tiendas destacadas - Diseño editorial premium
 * Desktop: grid destacado con tienda principal más grande
 * Móvil: carrusel horizontal con snap
 */
function FeaturedStoresSection({
  featuredStores = [],
  favorites = [],
  onToggleFavorite,
}) {
  const scrollRef = useRef(null)

  if (featuredStores.length === 0) return null

  // Obtener stores de los featured
  const stores = featuredStores
    .map(f => f.stores)
    .filter(Boolean)

  if (stores.length === 0) return null

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 320
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  return (
    <section className="py-8" aria-labelledby="featured-title">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-sm">
            <Star className="w-5 h-5 text-white" fill="white" />
          </div>
          <div>
            <h2 id="featured-title" className="text-xl font-bold text-slate-900">
              Tiendas destacadas
            </h2>
            <p className="text-sm text-slate-500">Las mejores seleccionadas para ti</p>
          </div>
        </div>

        {/* Controles de scroll - Desktop */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={() => scroll('left')}
            className="p-2 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm"
            aria-label="Anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-2 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm"
            aria-label="Siguiente"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Carrusel horizontal con snap */}
      <div className="relative -mx-4 px-4 md:mx-0 md:px-0">
        <div
          ref={scrollRef}
          className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-pl-4 md:scroll-pl-0 pb-4"
        >
          {stores.map((store, index) => (
            <div 
              key={store.id} 
              className={`flex-shrink-0 snap-start ${
                // Primera tienda más grande en desktop
                index === 0 && stores.length > 2
                  ? 'w-[300px] md:w-[380px]'
                  : 'w-[280px] md:w-[320px]'
              }`}
            >
              <StoreCard
                store={store}
                featured
                isFavorite={favorites.includes(store.id)}
                onToggleFavorite={() => onToggleFavorite(store.id)}
                size={index === 0 && stores.length > 2 ? 'large' : 'normal'}
              />
            </div>
          ))}
        </div>

        {/* Gradiente fade derecho - móvil */}
        <div className="absolute right-0 top-0 bottom-4 w-12 bg-gradient-to-l from-slate-50 to-transparent pointer-events-none md:hidden" />
      </div>
    </section>
  )
}

export default memo(FeaturedStoresSection)
