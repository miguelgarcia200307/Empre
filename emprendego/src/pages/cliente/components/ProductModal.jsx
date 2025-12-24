import { useState, useMemo, useEffect, useCallback, memo } from 'react'
import { X, ChevronLeft, ChevronRight, Package, AlertCircle, ChevronDown, ChevronUp, Check } from 'lucide-react'
import {
  isProductWithVariants,
  getActiveVariants,
  getMinVariantPrice,
  hasPriceRange,
  getProductAvailability,
  getVariantAvailability,
  findMatchingVariant,
  getAvailableStock,
} from '../../../lib/variants'
import { getButtonClasses, withAlpha, getContrastText } from './themeUtils'

/**
 * ProductModal - Premium product detail modal
 * Features: Bottom-sheet on mobile, centered modal on desktop, expandable description,
 * accordion for long content, variant selector with availability indicators
 */
const ProductModal = memo(function ProductModal({
  product,
  primaryColor,
  secondaryColor,
  theme,
  formatPrice,
  imageIndex,
  setImageIndex,
  onClose,
  onAddToCart,
}) {
  // Estado para variantes
  const hasVariants = isProductWithVariants(product)
  const activeVariants = hasVariants ? getActiveVariants(product) : []
  const productOptions = hasVariants && Array.isArray(product.options) ? product.options : []
  
  // Estado de selección de opciones
  const [selectedOptions, setSelectedOptions] = useState(() => {
    // Inicializar con la primera opción disponible de cada tipo si solo hay una variante
    if (hasVariants && activeVariants.length === 1) {
      return activeVariants[0].options || {}
    }
    return {}
  })
  
  // Estados UI
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)
  
  // Encontrar variante seleccionada
  const selectedVariant = useMemo(() => {
    if (!hasVariants) return null
    return findMatchingVariant(activeVariants, selectedOptions)
  }, [hasVariants, activeVariants, selectedOptions])
  
  // Determinar precio a mostrar
  const displayPrice = selectedVariant?.price ?? (hasVariants ? getMinVariantPrice(product) : product.price)
  const showPriceRange = hasVariants && !selectedVariant && hasPriceRange(product)
  
  // Descuento (solo productos sin variantes)
  const hasDiscount = !hasVariants && product.compare_price && product.compare_price > product.price
  const discountPercent = hasDiscount ? Math.round((1 - product.price / product.compare_price) * 100) : 0
  
  // Disponibilidad
  const isOutOfStock = hasVariants 
    ? (selectedVariant ? !getVariantAvailability(product, selectedVariant) : !getProductAvailability(product))
    : (product.track_inventory && product.stock_quantity === 0)
  
  // Stock disponible
  const availableStock = selectedVariant 
    ? getAvailableStock(product, selectedVariant)
    : getAvailableStock(product)
  
  // Validar si puede agregar al carrito
  const canAddToCart = hasVariants 
    ? (selectedVariant && !isOutOfStock)
    : !isOutOfStock
  
  // Galería de imágenes (incluir imagen de variante si existe)
  const images = useMemo(() => {
    const baseImages = [
      product.main_image_url,
      ...(Array.isArray(product.gallery_urls) ? product.gallery_urls : [])
    ].filter(Boolean)
    
    // Si hay variante seleccionada con imagen, ponerla primero
    if (selectedVariant?.image_url && !baseImages.includes(selectedVariant.image_url)) {
      return [selectedVariant.image_url, ...baseImages]
    }
    
    return baseImages
  }, [product, selectedVariant])
  
  // Reset image index cuando cambia la variante
  useEffect(() => {
    if (selectedVariant?.image_url) {
      setImageIndex(0)
    }
  }, [selectedVariant, setImageIndex])
  
  // Manejar selección de opción
  const handleOptionSelect = (optionName, value) => {
    setSelectedOptions(prev => ({
      ...prev,
      [optionName]: value
    }))
  }
  
  // Verificar si un valor está disponible
  const isValueAvailable = useCallback((optionName, value) => {
    // Crear opciones hipotéticas
    const testOptions = { ...selectedOptions, [optionName]: value }
    
    // Buscar si existe alguna variante activa con esas opciones (parciales)
    return activeVariants.some(variant => {
      const variantOptions = variant.options || {}
      // Verificar que todos los valores seleccionados coincidan
      return Object.entries(testOptions).every(([key, val]) => 
        variantOptions[key] === val || testOptions[key] === undefined
      )
    })
  }, [selectedOptions, activeVariants])
  
  // Manejar agregar al carrito
  const handleAddToCart = () => {
    if (!canAddToCart) return
    
    if (hasVariants) {
      onAddToCart(product, selectedVariant)
    } else {
      onAddToCart(product, null)
    }
    
    setAddedToCart(true)
    setTimeout(() => {
      onClose()
    }, 800)
  }

  // Description analysis for accordion
  const descriptionLength = product.description?.length || 0
  const isLongDescription = descriptionLength > 200
  const shouldShowExpandButton = isLongDescription && !isDescriptionExpanded

  const buttonClasses = getButtonClasses(theme?.buttonsStyle)

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Container - Fixed height on desktop to prevent image stretching */}
      <div 
        className="relative w-full sm:max-w-2xl lg:max-w-3xl bg-white 
                   rounded-t-[28px] sm:rounded-3xl overflow-hidden shadow-2xl
                   animate-slide-up sm:animate-scale-in flex flex-col
                   max-h-[95vh] sm:max-h-[85vh] sm:h-[85vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-modal-title"
      >
        {/* Drag handle - Mobile only */}
        <div className="sm:hidden flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 p-2.5 bg-white/95 backdrop-blur-sm rounded-full shadow-lg hover:bg-white hover:scale-105 transition-all"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        {/* Body - Two column layout on desktop */}
        {/* Mobile: vertical scroll of everything */}
        {/* Desktop: fixed image left, scrollable details right */}
        <div className="flex-1 min-h-0 flex flex-col sm:flex-row overflow-hidden">
          
          {/* Image Column - Fixed width on desktop, centers the image wrapper */}
          <div className="relative w-full sm:w-[45%] lg:w-[420px] flex-shrink-0 bg-gradient-to-br from-gray-50 to-gray-100/80 
                          sm:flex sm:items-center sm:justify-center sm:p-5 lg:p-6">
            {/* Image Wrapper - Fixed aspect ratio to prevent stretching */}
            <div className="relative w-full aspect-square sm:aspect-[4/5] sm:max-w-[380px] 
                            sm:rounded-2xl overflow-hidden bg-white sm:shadow-lg group">
              {images.length > 0 ? (
                <>
                  <img
                    src={images[imageIndex]}
                    alt={product.name}
                    className="w-full h-full object-contain sm:object-cover sm:object-center 
                               transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                  />
                
                {/* Image navigation */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setImageIndex(i => i > 0 ? i - 1 : images.length - 1)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 bg-white/95 backdrop-blur-sm rounded-full shadow-lg hover:bg-white hover:scale-105 transition-all"
                      aria-label="Imagen anterior"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-700" />
                    </button>
                    <button
                      onClick={() => setImageIndex(i => i < images.length - 1 ? i + 1 : 0)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-white/95 backdrop-blur-sm rounded-full shadow-lg hover:bg-white hover:scale-105 transition-all"
                      aria-label="Siguiente imagen"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-700" />
                    </button>
                    
                    {/* Image indicators */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/20 backdrop-blur-sm rounded-full px-3 py-2">
                      {images.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setImageIndex(i)}
                          className={`transition-all duration-200 rounded-full ${
                            i === imageIndex 
                              ? 'w-6 h-2' 
                              : 'w-2 h-2 bg-white/60 hover:bg-white/80'
                          }`}
                          style={i === imageIndex ? { backgroundColor: primaryColor } : {}}
                          aria-label={`Ver imagen ${i + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}

                {/* Discount badge */}
                {hasDiscount && (
                  <div className="absolute top-4 left-4 px-3 py-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-bold rounded-xl shadow-lg">
                    -{discountPercent}% OFF
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full min-h-[300px] sm:min-h-0 flex items-center justify-center bg-white">
                <Package className="w-20 h-20 text-gray-300" />
              </div>
            )}
            </div>
          </div>

          {/* Product Details - Scrollable on desktop when content expands */}
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            {/* Scrollable content area */}
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-5 sm:p-6 lg:p-8">
              {/* Title */}
              <h2 
                id="product-modal-title"
                className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 pr-8"
              >
                {product.name}
              </h2>
              
              {/* Price */}
              <div className="flex items-center flex-wrap gap-3 mb-4">
                {showPriceRange ? (
                  <span 
                    className="text-2xl sm:text-3xl font-bold"
                    style={{ color: primaryColor }}
                  >
                    Desde {formatPrice(displayPrice)}
                  </span>
                ) : (
                  <>
                    <span 
                      className="text-2xl sm:text-3xl font-bold"
                      style={{ color: primaryColor }}
                    >
                      {formatPrice(displayPrice)}
                    </span>
                    {hasDiscount && (
                      <>
                        <span className="text-lg text-gray-400 line-through">
                          {formatPrice(product.compare_price)}
                        </span>
                        <span 
                          className="px-2.5 py-1 text-xs font-bold text-white rounded-lg"
                          style={{ backgroundColor: secondaryColor }}
                        >
                          -{discountPercent}%
                        </span>
                      </>
                    )}
                  </>
                )}
              </div>
              
              {/* Selected variant info */}
              {hasVariants && selectedVariant && (
                <p className="text-sm text-gray-600 mb-4 flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="font-medium">Seleccionado:</span> 
                  {selectedVariant.title}
                </p>
              )}

              {/* Description with expand/collapse */}
              {product.description && (
                <div className="mb-5">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Descripción</h3>
                  <div className={`relative ${!isDescriptionExpanded && isLongDescription ? 'max-h-24 overflow-hidden' : ''}`}>
                    <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-line">
                      {product.description}
                    </p>
                    {/* Gradient fade for collapsed state */}
                    {shouldShowExpandButton && (
                      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent" />
                    )}
                  </div>
                  {isLongDescription && (
                    <button
                      onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                      className="mt-2 text-sm font-medium flex items-center gap-1 hover:underline transition-colors"
                      style={{ color: primaryColor }}
                    >
                      {isDescriptionExpanded ? (
                        <>
                          <ChevronUp className="w-4 h-4" />
                          Ver menos
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4" />
                          Ver más
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}
              
              {/* Variant Selector */}
              {hasVariants && productOptions.length > 0 && (
                <div className="space-y-4 mb-5">
                  {productOptions.map((option) => (
                    <div key={option.name}>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2.5">
                        {option.name}
                        {!selectedOptions[option.name] && (
                          <span className="text-red-500 text-xs font-normal">(Requerido)</span>
                        )}
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {option.values.map((value) => {
                          const isSelected = selectedOptions[option.name] === value
                          const isAvailable = isValueAvailable(option.name, value)
                          
                          return (
                            <button
                              key={value}
                              type="button"
                              onClick={() => handleOptionSelect(option.name, value)}
                              disabled={!isAvailable}
                              className={`
                                px-4 py-2.5 text-sm font-medium border-2 transition-all duration-200
                                ${buttonClasses}
                                ${isSelected 
                                  ? 'shadow-md scale-[1.02]' 
                                  : isAvailable
                                    ? 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:shadow-sm'
                                    : 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed line-through opacity-60'
                                }
                              `}
                              style={isSelected ? { 
                                backgroundColor: primaryColor, 
                                borderColor: primaryColor,
                                color: getContrastText(primaryColor)
                              } : {}}
                            >
                              {value}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                  
                  {/* Selection required indicator */}
                  {hasVariants && !selectedVariant && (
                    <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>Selecciona una opción para continuar</span>
                    </div>
                  )}
                </div>
              )}

              {/* Stock info */}
              {product.track_inventory && (
                <div className={`text-sm flex items-center gap-2 ${
                  availableStock > 0 && availableStock <= 5 
                    ? 'text-orange-600' 
                    : availableStock > 0 
                      ? 'text-green-600' 
                      : 'text-red-500'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${
                    availableStock > 0 ? 'bg-current' : 'bg-red-500'
                  }`} />
                  {availableStock > 0 
                    ? availableStock === Infinity 
                      ? 'Disponible' 
                      : availableStock <= 5
                        ? `¡Solo quedan ${availableStock}!`
                        : `${availableStock} disponibles`
                    : 'Agotado'}
                </div>
              )}
            </div>

            {/* Fixed Footer - Add to cart button inside details column on desktop */}
            <div className="hidden sm:block flex-shrink-0 p-4 sm:p-5 bg-white border-t border-gray-100">
              <button
                onClick={handleAddToCart}
                disabled={!canAddToCart}
                className={`
                  w-full py-4 text-base font-semibold transition-all duration-200
                  flex items-center justify-center gap-2
                  ${buttonClasses}
                  ${addedToCart 
                    ? 'bg-green-500 text-white' 
                    : canAddToCart 
                      ? 'hover:shadow-lg active:scale-[0.98]' 
                      : 'opacity-50 cursor-not-allowed'
                  }
                `}
                style={!addedToCart ? { 
                  backgroundColor: canAddToCart ? primaryColor : '#9ca3af',
                  color: canAddToCart ? getContrastText(primaryColor) : '#ffffff'
                } : {}}
              >
                {addedToCart ? (
                  <>
                    <Check className="w-5 h-5" />
                    ¡Agregado al carrito!
                  </>
                ) : isOutOfStock ? (
                  'Agotado'
                ) : hasVariants && !selectedVariant ? (
                  'Selecciona una opción'
                ) : (
                  'Agregar al carrito'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Footer - Full width sticky at bottom */}
        <div className="sm:hidden flex-shrink-0 p-4 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          <button
            onClick={handleAddToCart}
            disabled={!canAddToCart}
            className={`
              w-full py-4 text-base font-semibold transition-all duration-200
              flex items-center justify-center gap-2
              ${buttonClasses}
              ${addedToCart 
                ? 'bg-green-500 text-white' 
                : canAddToCart 
                  ? 'hover:shadow-lg active:scale-[0.98]' 
                  : 'opacity-50 cursor-not-allowed'
              }
            `}
            style={!addedToCart ? { 
              backgroundColor: canAddToCart ? primaryColor : '#9ca3af',
              color: canAddToCart ? getContrastText(primaryColor) : '#ffffff'
            } : {}}
          >
            {addedToCart ? (
              <>
                <Check className="w-5 h-5" />
                ¡Agregado al carrito!
              </>
            ) : isOutOfStock ? (
              'Agotado'
            ) : hasVariants && !selectedVariant ? (
              'Selecciona una opción'
            ) : (
              'Agregar al carrito'
            )}
          </button>
          
          {/* Safe area padding for iOS */}
          <div className="h-[env(safe-area-inset-bottom)]" />
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes scale-in {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  )
})

export default ProductModal
