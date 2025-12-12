import { useState, useEffect } from 'react'
import { X, Smartphone, Monitor, Check } from 'lucide-react'
import { Modal, Button } from '../ui'
import { AVAILABLE_FONTS, BUTTON_STYLES } from '../../data/templates'

/**
 * TemplatePreviewModal - Modal de vista previa y personalización de plantilla
 */
const TemplatePreviewModal = ({
  template,
  isOpen,
  onClose,
  onApply,
  currentStoreData = {},
}) => {
  const [viewMode, setViewMode] = useState('mobile') // 'mobile' | 'desktop'
  const [customizations, setCustomizations] = useState({
    primary: '#2563eb',
    secondary: '#7c3aed',
    accent: '#f59e0b',
    fontFamily: 'Inter, system-ui, sans-serif',
    buttonsStyle: 'rounded',
  })

  // ✅ CORRECCIÓN: Sincronizar customizations cuando cambia la plantilla o se abre el modal
  // Usa useEffect en lugar de useState para reaccionar a cambios
  useEffect(() => {
    if (template && isOpen) {
      // Cargar colores base de la plantilla seleccionada
      setCustomizations({
        primary: template.palette?.primary || '#2563eb',
        secondary: template.palette?.secondary || '#7c3aed',
        accent: template.palette?.accent || '#f59e0b',
        fontFamily: template.typography?.fontFamily || 'Inter, system-ui, sans-serif',
        buttonsStyle: template.layout?.buttonsStyle || 'rounded',
      })
    }
  }, [template, isOpen])

  if (!template) return null

  const handleApply = () => {
    onApply({
      templateId: template.id,
      colors: {
        primary: customizations.primary,
        secondary: customizations.secondary,
        accent: customizations.accent,
      },
      fontFamily: customizations.fontFamily,
      buttonsStyle: customizations.buttonsStyle,
      overrides: {
        palette: {
          primary: customizations.primary,
          secondary: customizations.secondary,
          accent: customizations.accent,
        },
        typography: {
          fontFamily: customizations.fontFamily,
        },
        layout: {
          buttonsStyle: customizations.buttonsStyle,
        },
      },
    })
    onClose()
  }

  // Preview colors (usar customizations)
  const previewPalette = {
    ...template.palette,
    primary: customizations.primary,
    secondary: customizations.secondary,
    accent: customizations.accent,
  }

  const buttonRadius = BUTTON_STYLES[customizations.buttonsStyle] || 'rounded-xl'

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      title={template.name}
    >
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Preview Area */}
        <div className="flex-1">
          {/* View Mode Toggle */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <button
              type="button"
              onClick={() => setViewMode('mobile')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'mobile'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              Móvil
            </button>
            <button
              type="button"
              onClick={() => setViewMode('desktop')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'desktop'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Monitor className="w-4 h-4" />
              Escritorio
            </button>
          </div>

          {/* Preview Container */}
          <div 
            className={`
              mx-auto border border-gray-300 rounded-2xl overflow-hidden shadow-xl
              ${viewMode === 'mobile' ? 'max-w-[280px]' : 'max-w-full'}
            `}
          >
            <div 
              className="min-h-[400px]"
              style={{ 
                backgroundColor: previewPalette.background,
                fontFamily: customizations.fontFamily,
              }}
            >
              {/* Preview Header */}
              <div 
                className={`px-4 py-3 border-b ${
                  template.layout.headerStyle === 'glass' 
                    ? 'bg-white/80 backdrop-blur-lg border-gray-100' 
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
                    style={{ background: `linear-gradient(135deg, ${previewPalette.primary}, ${previewPalette.secondary})` }}
                  >
                    {currentStoreData?.name?.charAt(0) || 'T'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">
                      {currentStoreData?.name || 'Tu Tienda'}
                    </h3>
                    <p className="text-xs text-gray-500">Vista previa</p>
                  </div>
                </div>
              </div>

              {/* Preview Banner */}
              <div 
                className="h-24"
                style={{ 
                  background: `linear-gradient(135deg, ${previewPalette.primary}30, ${previewPalette.secondary}30)` 
                }}
              />

              {/* Preview Products */}
              <div className="p-4">
                <div className={`grid gap-3 ${viewMode === 'mobile' ? 'grid-cols-2' : 'grid-cols-3'}`}>
                  {[1, 2, 3, 4].slice(0, viewMode === 'mobile' ? 4 : 3).map((i) => (
                    <div 
                      key={i}
                      className={`overflow-hidden ${
                        template.layout.cardsStyle === 'soft' 
                          ? 'rounded-2xl shadow-sm bg-white/80' 
                          : template.layout.cardsStyle === 'bordered'
                          ? 'rounded-xl border border-gray-200 bg-white'
                          : 'rounded-2xl shadow-lg bg-white'
                      }`}
                    >
                      <div 
                        className="aspect-square"
                        style={{ backgroundColor: `${previewPalette.primary}10` }}
                      />
                      <div className="p-3">
                        <div className="h-3 bg-gray-200 rounded w-3/4 mb-2" />
                        <div 
                          className="h-4 rounded w-1/2 font-bold"
                          style={{ backgroundColor: `${previewPalette.primary}20` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Preview Button */}
                <button
                  className={`w-full mt-4 py-3 text-white font-medium ${buttonRadius}`}
                  style={{ backgroundColor: previewPalette.primary }}
                >
                  Pedir por WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Customization Panel */}
        <div className="w-full lg:w-72 space-y-5">
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Personalizar</h3>
            <p className="text-sm text-gray-500 mb-4">
              Ajusta los colores manteniendo el estilo de la plantilla
            </p>
          </div>

          {/* Color Primary */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color principal
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={customizations.primary}
                onChange={(e) => setCustomizations({ ...customizations, primary: e.target.value })}
                className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
              />
              <input
                type="text"
                value={customizations.primary}
                onChange={(e) => setCustomizations({ ...customizations, primary: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono"
              />
            </div>
          </div>

          {/* Color Secondary */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color secundario
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={customizations.secondary}
                onChange={(e) => setCustomizations({ ...customizations, secondary: e.target.value })}
                className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
              />
              <input
                type="text"
                value={customizations.secondary}
                onChange={(e) => setCustomizations({ ...customizations, secondary: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono"
              />
            </div>
          </div>

          {/* Color Accent */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color de acento
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={customizations.accent}
                onChange={(e) => setCustomizations({ ...customizations, accent: e.target.value })}
                className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
              />
              <input
                type="text"
                value={customizations.accent}
                onChange={(e) => setCustomizations({ ...customizations, accent: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono"
              />
            </div>
          </div>

          {/* Font Family */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipografía
            </label>
            <div className="grid grid-cols-3 gap-2">
              {AVAILABLE_FONTS.map((font) => (
                <button
                  key={font.id}
                  type="button"
                  onClick={() => setCustomizations({ ...customizations, fontFamily: font.value })}
                  className={`px-3 py-2 text-xs rounded-lg border transition-colors ${
                    customizations.fontFamily === font.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  style={{ fontFamily: font.value }}
                >
                  {font.name}
                </button>
              ))}
            </div>
          </div>

          {/* Button Style */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estilo de botones
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'pill', label: 'Pill', class: 'rounded-full' },
                { id: 'rounded', label: 'Rounded', class: 'rounded-xl' },
                { id: 'square', label: 'Square', class: 'rounded-lg' },
              ].map((style) => (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => setCustomizations({ ...customizations, buttonsStyle: style.id })}
                  className={`px-3 py-2 text-xs border transition-colors ${style.class} ${
                    customizations.buttonsStyle === style.id
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {style.label}
                </button>
              ))}
            </div>
          </div>

          {/* Reset to template defaults */}
          <button
            type="button"
            onClick={() => setCustomizations({
              primary: template.palette.primary,
              secondary: template.palette.secondary,
              accent: template.palette.accent,
              fontFamily: template.typography.fontFamily,
              buttonsStyle: template.layout.buttonsStyle,
            })}
            className="w-full text-sm text-gray-500 hover:text-gray-700 py-2"
          >
            Restaurar colores originales
          </button>

          {/* Apply Button */}
          <Button 
            onClick={handleApply} 
            className="w-full"
            icon={Check}
          >
            Aplicar plantilla
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default TemplatePreviewModal
