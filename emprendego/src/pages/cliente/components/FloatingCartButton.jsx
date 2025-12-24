import { memo } from 'react'
import { ShoppingBag } from 'lucide-react'
import { getButtonClasses, getContrastText } from './themeUtils'

/**
 * FloatingCartButton - Premium floating cart button for mobile
 * Features: Safe-area aware, animated badge, responsive visibility
 */
const FloatingCartButton = memo(function FloatingCartButton({
  cartCount,
  cartTotal,
  primaryColor,
  theme,
  formatPrice,
  onClick,
}) {
  if (cartCount === 0) return null

  const buttonClasses = getButtonClasses(theme?.buttonsStyle)
  const textColor = getContrastText(primaryColor)

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pointer-events-none">
      <div className="max-w-lg mx-auto pointer-events-auto">
        <button
          onClick={onClick}
          className={`
            w-full flex items-center justify-between gap-3 px-5 py-4 
            text-white shadow-2xl backdrop-blur-sm
            hover:shadow-xl active:scale-[0.98] transition-all duration-200
            ${buttonClasses}
          `}
          style={{ 
            backgroundColor: primaryColor,
            color: textColor,
            boxShadow: `0 10px 40px ${primaryColor}50, 0 4px 12px rgba(0,0,0,0.15)`
          }}
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 text-[10px] font-bold bg-white rounded-full flex items-center justify-center shadow-sm"
                style={{ color: primaryColor }}
              >
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            </div>
            <span className="font-semibold text-sm sm:text-base">Ver carrito</span>
          </div>
          <span className="font-bold text-sm sm:text-base">{formatPrice(cartTotal)}</span>
        </button>
      </div>
    </div>
  )
})

export default FloatingCartButton
