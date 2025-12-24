import { memo } from 'react'
import { Sparkles, Heart, Gift } from 'lucide-react'
import { getContrastText } from './themeUtils'

/**
 * StoreWelcome - Premium welcome message component
 * Features: Gradient background, decorative elements, responsive design
 */
const StoreWelcome = memo(function StoreWelcome({
  message,
  primaryColor,
  secondaryColor,
}) {
  if (!message) return null

  const textColor = getContrastText(primaryColor)

  return (
    <div 
      className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-4 sm:p-5 lg:p-6"
      style={{ 
        background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
      }}
    >
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 opacity-10">
        <Sparkles className="w-full h-full" />
      </div>
      <div className="absolute bottom-0 left-0 w-16 sm:w-20 h-16 sm:h-20 opacity-10 -translate-x-1/2 translate-y-1/2">
        <Heart className="w-full h-full" />
      </div>
      <div className="absolute top-1/2 right-4 w-12 h-12 opacity-10 hidden sm:block">
        <Gift className="w-full h-full" />
      </div>

      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />

      {/* Content */}
      <div className="relative">
        <p 
          className="text-center font-medium text-sm sm:text-base lg:text-lg leading-relaxed"
          style={{ color: textColor }}
        >
          {message}
        </p>
      </div>
    </div>
  )
})

export default StoreWelcome
