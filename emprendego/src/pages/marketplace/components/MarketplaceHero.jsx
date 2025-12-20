import { memo } from 'react'
import { Store, TrendingUp, Sparkles } from 'lucide-react'

/**
 * Hero compacto del Marketplace
 * Diseño premium, no ocupa media pantalla
 */
function MarketplaceHero({ 
  storeCount = 0, 
  isLoading = false 
}) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Patrón sutil de fondo */}
      <div className="absolute inset-0 bg-grid-slate-100/50 [mask-image:linear-gradient(0deg,transparent,white)]" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          {/* Contenido principal */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                Marketplace
              </div>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-2">
              Descubre tiendas locales
            </h1>
            
            <p className="text-slate-600 text-base md:text-lg max-w-xl">
              Explora negocios de emprendedores, encuentra productos únicos y compra directo por WhatsApp
            </p>
          </div>

          {/* Stats card - Desktop */}
          <div className="hidden md:flex items-center gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 min-w-[180px]">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-sm">
                  <Store className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Tiendas activas</p>
                  {isLoading ? (
                    <div className="h-7 w-12 bg-slate-100 rounded animate-pulse mt-1" />
                  ) : (
                    <p className="text-2xl font-bold text-slate-900">{storeCount}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                <TrendingUp className="w-3.5 h-3.5" />
                Actualizado hoy
              </div>
            </div>
          </div>

          {/* Stats - Mobile (inline) */}
          <div className="flex md:hidden items-center gap-3 p-3 bg-white/80 backdrop-blur rounded-xl border border-slate-100">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Store className="w-4.5 h-4.5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-500">Tiendas activas</p>
              {isLoading ? (
                <div className="h-5 w-10 bg-slate-100 rounded animate-pulse" />
              ) : (
                <p className="text-lg font-bold text-slate-900">{storeCount}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default memo(MarketplaceHero)
