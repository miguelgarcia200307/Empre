import { memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Rocket, ArrowRight, Sparkles } from 'lucide-react'

/**
 * CTA final del Marketplace
 * Invita a crear tienda - Diseño premium no intrusivo
 */
function MarketplaceCTA() {
  const navigate = useNavigate()

  return (
    <section className="py-12 md:py-16" aria-labelledby="cta-title">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Patrón de fondo */}
        <div className="absolute inset-0 bg-grid-white/[0.02]" />
        
        {/* Círculos decorativos */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />

        <div className="relative px-6 py-12 md:px-12 md:py-16">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            {/* Contenido */}
            <div className="flex-1 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 text-blue-300 rounded-full text-sm font-medium mb-4">
                <Sparkles className="w-4 h-4" />
                ¡Empieza gratis!
              </div>
              
              <h2 id="cta-title" className="text-2xl md:text-3xl font-bold text-white mb-3">
                ¿Quieres vender con EmprendeGo?
              </h2>
              
              <p className="text-slate-300 text-base md:text-lg">
                Crea tu tienda digital en minutos y empieza a recibir pedidos por WhatsApp. 
                Sin comisiones, sin complicaciones.
              </p>
            </div>

            {/* Botones */}
            <div className="flex flex-col sm:flex-row gap-3 md:flex-shrink-0">
              {/* Botón primario - Diseño blanco sobre fondo oscuro */}
              <button
                onClick={() => navigate('/auth/registro')}
                className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold rounded-xl bg-white text-slate-900 shadow-lg shadow-black/10 hover:bg-slate-50 hover:shadow-xl active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 transition-all duration-200"
              >
                <Rocket className="w-5 h-5 text-blue-600" />
                Crear mi tienda
                <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
              </button>
              
              {/* Botón secundario outline - Claramente un botón, pero secundario */}
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-medium rounded-xl border border-white/30 bg-transparent text-white hover:border-white/50 hover:bg-white/10 active:scale-[0.98] active:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 transition-all duration-200 cursor-pointer"
              >
                Conocer más
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default memo(MarketplaceCTA)
