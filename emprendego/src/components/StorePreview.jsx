import { useState, useMemo } from 'react'
import TiendaPublica from '../pages/cliente/TiendaPublica'
import { Smartphone, Monitor, Eye, EyeOff } from 'lucide-react'

/**
 * StorePreview - Componente de vista previa de tienda
 * 
 * Renderiza TiendaPublica en modo preview con escalado responsive.
 * Permite alternar entre vista mobile y desktop.
 * 
 * @param {Object} previewStore - Datos del store para preview (fuente única de verdad)
 * @param {Array} products - Productos para mostrar en preview
 * @param {Array} categories - Categorías para mostrar en preview
 * @param {boolean} showDeviceToggle - Mostrar toggle mobile/desktop
 * @param {string} className - Clases adicionales para el contenedor
 */
export default function StorePreview({ 
  previewStore, 
  products = [],
  categories = [],
  showDeviceToggle = true,
  className = ''
}) {
  const [viewMode, setViewMode] = useState('mobile') // 'mobile' | 'desktop'
  const [isExpanded, setIsExpanded] = useState(true)

  // Calcular dimensiones según modo
  const dimensions = useMemo(() => {
    if (viewMode === 'mobile') {
      return {
        width: 375,
        height: 667,
        scale: 0.55, // Escala para caber en el panel
        containerHeight: '400px'
      }
    }
    return {
      width: 800,
      height: 600,
      scale: 0.45,
      containerHeight: '320px'
    }
  }, [viewMode])

  if (!previewStore) {
    return (
      <div className={`bg-gray-50 rounded-2xl p-8 text-center ${className}`}>
        <Eye className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">Cargando vista previa...</p>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header con controles */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Vista previa</span>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Toggle expand/collapse */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
            title={isExpanded ? 'Ocultar preview' : 'Mostrar preview'}
          >
            {isExpanded ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>

          {/* Device toggle */}
          {showDeviceToggle && isExpanded && (
            <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
              <button
                onClick={() => setViewMode('mobile')}
                className={`p-1.5 rounded-md transition-all ${
                  viewMode === 'mobile' 
                    ? 'bg-white shadow-sm text-blue-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                title="Vista móvil"
              >
                <Smartphone className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('desktop')}
                className={`p-1.5 rounded-md transition-all ${
                  viewMode === 'desktop' 
                    ? 'bg-white shadow-sm text-blue-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                title="Vista desktop"
              >
                <Monitor className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Preview container */}
      {isExpanded && (
        <div 
          className="relative bg-gray-100 rounded-2xl overflow-hidden transition-all duration-300"
          style={{ height: dimensions.containerHeight }}
        >
          {/* Device frame */}
          <div 
            className={`absolute left-1/2 top-1/2 bg-white shadow-2xl overflow-hidden transition-all duration-300 ${
              viewMode === 'mobile' 
                ? 'rounded-[32px] border-[8px] border-gray-800' 
                : 'rounded-xl border border-gray-300'
            }`}
            style={{
              width: dimensions.width,
              height: dimensions.height,
              transform: `translate(-50%, -50%) scale(${dimensions.scale})`,
              transformOrigin: 'center center'
            }}
          >
            {/* Mobile notch */}
            {viewMode === 'mobile' && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-gray-800 rounded-b-2xl z-10" />
            )}
            
            {/* Desktop browser bar */}
            {viewMode === 'desktop' && (
              <div className="h-8 bg-gray-100 border-b border-gray-200 flex items-center px-3 gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 mx-2">
                  <div className="bg-white border border-gray-200 rounded px-3 py-0.5 text-[10px] text-gray-400 truncate">
                    emprendego.co/{previewStore.slug || 'tu-tienda'}
                  </div>
                </div>
              </div>
            )}
            
            {/* TiendaPublica en modo preview */}
            <div 
              className="overflow-y-auto overflow-x-hidden"
              style={{ 
                height: viewMode === 'desktop' ? 'calc(100% - 32px)' : '100%',
                paddingTop: viewMode === 'mobile' ? '24px' : 0
              }}
            >
              <TiendaPublica
                isPreview={true}
                previewStore={previewStore}
                previewProducts={products}
                previewCategories={categories}
              />
            </div>
          </div>
        </div>
      )}

      {/* Info text */}
      <p className="text-xs text-center text-gray-400">
        {isExpanded 
          ? 'Vista previa en tiempo real • Los cambios se reflejan automáticamente'
          : 'Click en el ojo para mostrar la vista previa'
        }
      </p>
    </div>
  )
}
