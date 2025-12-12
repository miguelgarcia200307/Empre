import { Lock, Check } from 'lucide-react'

/**
 * TemplateCard - Card de vista previa de una plantilla
 */
const TemplateCard = ({ 
  template, 
  isSelected = false,
  isLocked = false,
  lockReason = null,
  onClick,
}) => {
  const { palette, layout } = template

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLocked}
      className={`
        relative w-full text-left rounded-2xl overflow-hidden
        border-2 transition-all duration-200
        ${isSelected 
          ? 'border-blue-500 ring-4 ring-blue-500/20' 
          : isLocked
          ? 'border-gray-200 opacity-70 cursor-not-allowed'
          : 'border-gray-200 hover:border-gray-300 hover:shadow-md cursor-pointer'
        }
      `}
    >
      {/* Mini Preview */}
      <div 
        className="aspect-[4/3] p-3"
        style={{ backgroundColor: palette.background }}
      >
        {/* Mini Header */}
        <div 
          className="h-6 rounded-lg mb-2 flex items-center px-2 gap-1.5"
          style={{ backgroundColor: palette.surface }}
        >
          <div 
            className="w-4 h-4 rounded-md"
            style={{ background: `linear-gradient(135deg, ${palette.primary}, ${palette.secondary})` }}
          />
          <div className="flex-1 h-2 bg-gray-200 rounded" />
        </div>

        {/* Mini Products Grid */}
        <div className="grid grid-cols-2 gap-1.5">
          {[1, 2, 3, 4].map((i) => (
            <div 
              key={i}
              className="rounded-lg overflow-hidden"
              style={{ backgroundColor: palette.surface }}
            >
              <div 
                className="aspect-square"
                style={{ backgroundColor: `${palette.primary}15` }}
              />
              <div className="p-1.5">
                <div className="h-1.5 bg-gray-200 rounded w-3/4 mb-1" />
                <div 
                  className="h-1.5 rounded w-1/2"
                  style={{ backgroundColor: `${palette.primary}30` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Mini Button */}
        <div 
          className={`mt-2 h-5 flex items-center justify-center text-white text-[8px] font-medium ${
            layout.buttonsStyle === 'pill' ? 'rounded-full' :
            layout.buttonsStyle === 'rounded' ? 'rounded-lg' : 'rounded'
          }`}
          style={{ backgroundColor: palette.primary }}
        >
          WhatsApp
        </div>
      </div>

      {/* Info */}
      <div className="p-3 bg-white border-t border-gray-100">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 text-sm truncate">
              {template.name}
            </h3>
            <p className="text-xs text-gray-500 line-clamp-1">
              {template.description}
            </p>
          </div>
          
          {/* Palette preview */}
          <div className="flex -space-x-1">
            {[palette.primary, palette.secondary, palette.accent].map((color, i) => (
              <div
                key={i}
                className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mt-2">
          {template.tags.slice(0, 2).map(tag => (
            <span 
              key={tag}
              className="px-1.5 py-0.5 text-[10px] bg-gray-100 text-gray-600 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
          <Check className="w-4 h-4 text-white" />
        </div>
      )}

      {/* Lock overlay */}
      {isLocked && (
        <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg p-3 text-center">
            <Lock className="w-5 h-5 text-gray-400 mx-auto mb-1" />
            <p className="text-xs text-gray-600 font-medium">
              {lockReason === 'tier' ? 'Plan superior' : 
               lockReason === 'limit' ? 'Límite alcanzado' : 
               'Premium'}
            </p>
          </div>
        </div>
      )}
    </button>
  )
}

export default TemplateCard
