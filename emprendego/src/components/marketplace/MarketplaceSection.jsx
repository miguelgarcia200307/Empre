import { useNavigate } from 'react-router-dom'
import MarketplaceContent from '../../components/marketplace/MarketplaceContent'
import { Button } from '../../components/ui'
import { ArrowRight } from 'lucide-react'

/**
 * MarketplaceSection - Sección de marketplace embebida para el landing
 * 
 * Este componente envuelve MarketplaceContent en un section con:
 * - ID para scroll navigation
 * - Título y subtítulo integrados con el diseño del landing
 * - Modo embebido (sin hero ni footer propio)
 * - Límite de tiendas mostradas con link a ver más
 */
export default function MarketplaceSection() {
  const navigate = useNavigate()

  return (
    <section id="marketplace" className="py-16 md:py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header de sección */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
            </span>
            Marketplace activo
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Explora tiendas de emprendedores
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Conecta con negocios locales, descubre productos únicos y apoya el comercio de tu ciudad.
          </p>
        </div>
      </div>

      {/* Contenido del marketplace embebido */}
      <MarketplaceContent
        embedded={true}
        showHero={false}
        showHowItWorks={false}
        showCta={false}
        maxStoresInGrid={8}
      />

      {/* CTA para ver marketplace completo */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 text-center">
        <Button
          size="lg"
          variant="outline"
          onClick={() => navigate('/marketplace')}
          className="group"
        >
          Ver todas las tiendas en el Marketplace
          <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </section>
  )
}
