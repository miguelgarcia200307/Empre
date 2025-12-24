import { useState, memo } from 'react'
import { Package, Star, Plus, Check, Eye } from 'lucide-react'
import {
  isProductWithVariants,
  getActiveVariants,
  getMinVariantPrice,
  hasPriceRange,
  getProductAvailability,
} from '../../../lib/variants'
import { getCardClasses, getButtonClasses, withAlpha } from './themeUtils'

/**
 * ProductGrid - Premium product grid with responsive columns
 */
const ProductGrid = memo(function ProductGrid({
  products,
  primaryColor,
  theme,
  formatPrice,
  onView,
  onAddToCart,
  isLoading,
}) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
      {products.map(product => (
        <ProductCard
          key={product.id}
          product={product}
          primaryColor={primaryColor}
          theme={theme}
          formatPrice={formatPrice}
          onView={() => onView(product)}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  )
})

/**
 * ProductCard - Premium product card with variants support
 */
const ProductCard = memo(function ProductCard({
  product,
  primaryColor,
  theme,
  formatPrice,
  onView,
  onAddToCart,
}) {
  const [added, setAdded] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  
  // Detectar si tiene variantes
  const hasVariants = isProductWithVariants(product)
  const activeVariants = hasVariants ? getActiveVariants(product) : []
  
  // Calcular precios para variantes
  const displayPrice = hasVariants ? getMinVariantPrice(product) : product.price
  const showPriceRange = hasVariants && hasPriceRange(product)
  
  // Descuento (solo aplica a productos sin variantes)
  const hasDiscount = !hasVariants && product.compare_price && product.compare_price > product.price
  const discountPercent = hasDiscount ? Math.round((1 - product.price / product.compare_price) * 100) : 0
  
  // Stock
  const isLowStock = product.track_inventory && !hasVariants && product.stock_quantity > 0 && product.stock_quantity <= 5
  const isOutOfStock = !getProductAvailability(product)

  const cardClasses = getCardClasses(theme?.cardsStyle)
  const buttonClasses = getButtonClasses(theme?.buttonsStyle)

  const handleAdd = (e) => {
    e.stopPropagation()
    if (isOutOfStock) return
    
    // Si tiene variantes, abrir modal para elegir
    if (hasVariants && activeVariants.length > 1) {
      onView()
      return
    }
    
    // Si tiene 1 sola variante, agregar esa directamente
    if (hasVariants && activeVariants.length === 1) {
      onAddToCart(product, activeVariants[0])
    } else {
      // Producto sin variantes
      onAddToCart(product, null)
    }
    
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <article 
      className={`
        group relative overflow-hidden transition-all duration-300
        hover:shadow-xl hover:-translate-y-0.5
        ${cardClasses}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Imagen - Contenedor con aspect ratio */}
      <div 
        className="relative w-full overflow-hidden cursor-pointer"
        onClick={onView}
      >
        {/* Aspect ratio container */}
        <div className="relative w-full aspect-square sm:aspect-[4/5]">
          {product.main_image_url ? (
            <img
              src={product.main_image_url}
              alt={product.name}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-50">
              <Package className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300" />
            </div>
          )}
        </div>
        
        {/* Badges apilados */}
        <div className="absolute top-2 left-2 flex flex-col gap-1.5 z-10">
          {/* Badge de descuento */}
          {hasDiscount && (
            <span className="px-2 py-1 text-[10px] sm:text-xs font-bold text-white rounded-lg shadow-md bg-gradient-to-r from-red-500 to-red-600">
              -{discountPercent}%
            </span>
          )}
          
          {/* Badge de variantes */}
          {hasVariants && activeVariants.length > 1 && (
            <span 
              className="px-2 py-1 text-[10px] sm:text-xs font-medium rounded-lg shadow-sm"
              style={{ 
                backgroundColor: withAlpha(primaryColor, 0.15),
                color: primaryColor
              }}
            >
              {activeVariants.length} opciones
            </span>
          )}
          
          {/* Badge de destacado */}
          {product.is_featured && (
            <span className="px-2 py-1 text-[10px] sm:text-xs font-bold text-amber-700 bg-amber-100 rounded-lg flex items-center gap-1 shadow-sm">
              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
              <span className="hidden sm:inline">Destacado</span>
            </span>
          )}
          
          {/* Badge de stock bajo */}
          {isLowStock && (
            <span className="px-2 py-1 text-[10px] sm:text-xs font-medium text-orange-700 bg-orange-100 rounded-lg shadow-sm">
              ¡Últimas {product.stock_quantity}!
            </span>
          )}
        </div>

        {/* Quick view button - Desktop only */}
        <button
          onClick={onView}
          className={`
            absolute bottom-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-xl
            shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200
            hover:bg-white hover:scale-105 hidden sm:flex items-center justify-center
          `}
          aria-label="Vista rápida"
        >
          <Eye className="w-4 h-4 text-gray-700" />
        </button>

        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="px-3 py-1.5 bg-gray-900/80 text-white text-xs font-semibold rounded-full">
              Agotado
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 sm:p-4">
        <h3 
          className="font-medium text-gray-900 text-sm leading-snug mb-2 line-clamp-2 cursor-pointer group-hover:text-gray-700 transition-colors min-h-[2.5rem]"
          onClick={onView}
        >
          {product.name}
        </h3>
        
        {/* Precio - CON SOPORTE VARIANTES */}
        <div className="flex items-baseline gap-2 mb-3">
          {showPriceRange ? (
            <span className="font-bold text-gray-900 text-sm sm:text-base">
              Desde {formatPrice(displayPrice)}
            </span>
          ) : (
            <>
              <span 
                className="font-bold text-sm sm:text-base"
                style={{ color: hasDiscount ? '#dc2626' : 'inherit' }}
              >
                {formatPrice(displayPrice)}
              </span>
              {hasDiscount && (
                <span className="text-[11px] sm:text-xs text-gray-400 line-through">
                  {formatPrice(product.compare_price)}
                </span>
              )}
            </>
          )}
        </div>

        {/* Botón de agregar - Premium */}
        <button
          onClick={handleAdd}
          disabled={isOutOfStock}
          className={`
            w-full py-2.5 sm:py-3 text-sm font-semibold transition-all duration-200 
            flex items-center justify-center gap-2
            ${buttonClasses}
            ${isOutOfStock 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : added 
                ? 'bg-green-500 text-white shadow-lg' 
                : 'text-white hover:shadow-lg active:scale-[0.98]'
            }
          `}
          style={!isOutOfStock && !added ? { 
            backgroundColor: primaryColor,
          } : {}}
        >
          {isOutOfStock ? (
            'Agotado'
          ) : added ? (
            <>
              <Check className="w-4 h-4" />
              <span>¡Agregado!</span>
            </>
          ) : hasVariants && activeVariants.length > 1 ? (
            'Ver opciones'
          ) : (
            <>
              <Plus className="w-4 h-4" />
              <span>Agregar</span>
            </>
          )}
        </button>
      </div>
    </article>
  )
})

/**
 * ProductCardSkeleton - Loading skeleton for product card
 */
const ProductCardSkeleton = memo(function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
      {/* Image skeleton */}
      <div className="w-full aspect-square sm:aspect-[4/5] bg-gray-200" />
      
      {/* Content skeleton */}
      <div className="p-3 sm:p-4 space-y-3">
        {/* Title */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-3/4" />
        </div>
        
        {/* Price */}
        <div className="h-5 bg-gray-200 rounded w-1/2" />
        
        {/* Button */}
        <div className="h-10 sm:h-11 bg-gray-200 rounded-xl" />
      </div>
    </div>
  )
})

/**
 * EmptyProductsState - Empty state when no products found
 */
export const EmptyProductsState = memo(function EmptyProductsState({
  searchQuery,
  primaryColor,
  onClearSearch,
}) {
  return (
    <div className="text-center py-16 sm:py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
      <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-5">
        <Package className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300" />
      </div>
      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
        {searchQuery ? 'Sin resultados' : 'No hay productos'}
      </h3>
      <p className="text-gray-500 max-w-sm mx-auto mb-4 px-4">
        {searchQuery 
          ? 'Intenta con otra búsqueda o explora otras categorías' 
          : 'Esta tienda aún no tiene productos disponibles'}
      </p>
      {searchQuery && onClearSearch && (
        <button
          onClick={onClearSearch}
          className="px-5 py-2.5 text-sm font-medium rounded-xl hover:bg-gray-100 transition-colors"
          style={{ color: primaryColor }}
        >
          Limpiar búsqueda
        </button>
      )}
    </div>
  )
})

export { ProductCard, ProductCardSkeleton }
export default ProductGrid
