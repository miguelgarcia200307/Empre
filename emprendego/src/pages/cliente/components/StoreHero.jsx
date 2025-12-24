import { memo } from 'react'

/**
 * StoreHero - Premium hero/banner component
 * Features: Responsive height, overlay gradients, fallback gradient, store info overlay
 */
const StoreHero = memo(function StoreHero({
  store,
  primaryColor,
  secondaryColor,
}) {
  const hasBanner = !!store.banner_url

  if (hasBanner) {
    return (
      <section className="relative h-40 sm:h-48 md:h-64 lg:h-72 overflow-hidden">
        {/* Banner Image */}
        <img 
          src={store.banner_url} 
          alt={`Banner de ${store.name}`}
          className="w-full h-full object-cover"
          loading="eager"
        />
        
        {/* Overlay con gradiente elegante multi-capa */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />
        
        {/* Contenido sobre el banner (solo desktop) */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 hidden sm:block">
          <div className="max-w-7xl mx-auto">
            {store.description && (
              <p className="text-white/90 text-sm md:text-base max-w-xl line-clamp-2 drop-shadow-lg">
                {store.description}
              </p>
            )}
          </div>
        </div>

        {/* Decorative gradient at bottom for smooth transition */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-8 sm:h-12"
          style={{
            background: `linear-gradient(to top, var(--eg-bg, #f9fafb) 0%, transparent 100%)`
          }}
        />
      </section>
    )
  }

  // Hero sin banner - Gradiente elegante generado
  return (
    <section 
      className="relative h-32 sm:h-40 md:h-48 overflow-hidden"
    >
      {/* Fondo con gradiente generado */}
      <div 
        className="absolute inset-0"
        style={{ 
          background: `linear-gradient(135deg, ${primaryColor}12 0%, ${secondaryColor}18 50%, ${primaryColor}08 100%)` 
        }}
      />
      
      {/* Patrón decorativo sutil */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 30%, ${primaryColor}15 0%, transparent 50%), 
                           radial-gradient(circle at 80% 70%, ${secondaryColor}15 0%, transparent 50%),
                           radial-gradient(circle at 50% 50%, ${primaryColor}08 0%, transparent 70%)`
        }}
      />

      {/* Decorative shapes */}
      <div 
        className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-20 blur-3xl"
        style={{ backgroundColor: primaryColor }}
      />
      <div 
        className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full opacity-15 blur-3xl"
        style={{ backgroundColor: secondaryColor }}
      />
      
      {/* Contenido del hero */}
      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 flex flex-col justify-center">
        {store.description && (
          <p className="text-gray-600 text-sm md:text-base max-w-xl line-clamp-2">
            {store.description}
          </p>
        )}
      </div>

      {/* Decorative gradient at bottom for smooth transition */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-6 sm:h-8"
        style={{
          background: `linear-gradient(to top, var(--eg-bg, #f9fafb) 0%, transparent 100%)`
        }}
      />
    </section>
  )
})

export default StoreHero
