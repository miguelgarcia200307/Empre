import { memo } from 'react'
import { Sparkles } from 'lucide-react'
import { ProductCard } from './ProductGrid'
import { withAlpha } from './themeUtils'

/**
 * RecommendedSection - "Te puede interesar" section with premium styling
 * Features: Responsive grid, smart recommendations display
 */
const RecommendedSection = memo(function RecommendedSection({
  products,
  primaryColor,
  theme,
  formatPrice,
  onView,
  onAddToCart,
}) {
  if (!products || products.length === 0) return null

  return (
    <section className="mt-10 sm:mt-12 pt-8 sm:pt-10 border-t border-gray-200">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-6 sm:mb-8">
        <div 
          className="p-2.5 rounded-xl"
          style={{ backgroundColor: withAlpha(primaryColor, 0.12) }}
        >
          <Sparkles className="w-5 h-5" style={{ color: primaryColor }} />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">Te puede interesar</h2>
          <p className="text-sm text-gray-500 hidden sm:block">Basado en lo que has visto</p>
        </div>
      </div>

      {/* Products Grid - Max 4 recommendations */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {products.slice(0, 4).map(product => (
          <ProductCard
            key={product.id}
            product={product}
            primaryColor={primaryColor}
            theme={theme}
            formatPrice={formatPrice}
            onView={() => onView(product)}
            onAddToCart={(p, v) => onAddToCart(p || product, v)}
          />
        ))}
      </div>
    </section>
  )
})

export default RecommendedSection
