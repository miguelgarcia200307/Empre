import { Card, Button } from '../../ui'
import { 
  Palette, 
  QrCode, 
  Image, 
  Link2, 
  Users,
  Square,
  Layout,
  FileImage,
} from 'lucide-react'

/**
 * POSTER_STYLES - Estilos disponibles para el poster
 * 
 * Para agregar un nuevo estilo:
 * 1. Agregar objeto aquí con id, name, description e icon
 * 2. Agregar el case correspondiente en QrPoster.jsx getStyleClasses()
 */
export const POSTER_STYLES = [
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Limpio y elegante',
    icon: Square,
    preview: 'bg-white border border-gray-200',
  },
  {
    id: 'brand',
    name: 'Brand',
    description: 'Con tu color de marca',
    icon: Palette,
    preview: 'bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-400',
  },
  {
    id: 'poster',
    name: 'Poster',
    description: 'Llamativo con CTA',
    icon: FileImage,
    preview: 'bg-white border-2 border-gray-900',
  },
]

/**
 * QR_SIZES - Tamaños disponibles para el QR
 */
export const QR_SIZES = [
  { value: 180, label: 'Pequeño', description: 'Para web' },
  { value: 256, label: 'Mediano', description: 'Multiuso' },
  { value: 360, label: 'Grande', description: 'Impresión' },
]

/**
 * QrCustomizer - Panel de controles para personalizar el poster QR
 * 
 * Props:
 * - config: objeto con la configuración actual
 * - onChange: función para actualizar la configuración
 * - store: datos de la tienda (para obtener colores del diseño)
 */
const QrCustomizer = ({ config, onChange, store }) => {
  // Color primario del diseño de la tienda como default
  const defaultBrandColor = store?.primary_color || '#2563eb'

  const handleChange = (key, value) => {
    onChange({ ...config, [key]: value })
  }

  return (
    <div className="space-y-6">
      {/* Estilo del poster */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
          <Layout className="w-4 h-4" />
          Estilo del poster
        </label>
        <div className="grid grid-cols-3 gap-3">
          {POSTER_STYLES.map((style) => (
            <button
              key={style.id}
              onClick={() => handleChange('style', style.id)}
              className={`
                relative p-3 rounded-xl border-2 transition-all text-left
                ${config.style === style.id 
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                  : 'border-gray-200 hover:border-gray-300 bg-white'
                }
              `}
            >
              <div className={`w-full h-12 rounded-lg mb-2 ${style.preview}`} />
              <p className="font-medium text-gray-900 text-sm">{style.name}</p>
              <p className="text-xs text-gray-500">{style.description}</p>
              {config.style === style.id && (
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-500" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tamaño del QR */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
          <QrCode className="w-4 h-4" />
          Tamaño del QR
        </label>
        <div className="flex gap-2">
          {QR_SIZES.map((size) => (
            <button
              key={size.value}
              onClick={() => handleChange('qrSize', size.value)}
              className={`
                flex-1 py-2.5 px-3 rounded-xl border-2 transition-all
                ${config.qrSize === size.value
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }
              `}
            >
              <p className="font-medium text-sm">{size.label}</p>
              <p className="text-xs opacity-70">{size.value}px</p>
            </button>
          ))}
        </div>
      </div>

      {/* Colores */}
      <div className="grid grid-cols-2 gap-4">
        {/* Color del QR */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Palette className="w-4 h-4" />
            Color del QR
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={config.qrColor}
              onChange={(e) => handleChange('qrColor', e.target.value)}
              className="w-10 h-10 rounded-lg border border-gray-300 cursor-pointer"
            />
            <input
              type="text"
              value={config.qrColor}
              onChange={(e) => handleChange('qrColor', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="#000000"
            />
          </div>
        </div>

        {/* Color de marca/borde */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Palette className="w-4 h-4" />
            Color de marca
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={config.brandColor}
              onChange={(e) => handleChange('brandColor', e.target.value)}
              className="w-10 h-10 rounded-lg border border-gray-300 cursor-pointer"
            />
            <button
              onClick={() => handleChange('brandColor', defaultBrandColor)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors"
              title="Usar color del diseño de tu tienda"
            >
              Usar mi color
            </button>
          </div>
        </div>
      </div>

      {/* Color de fondo */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
          <Square className="w-4 h-4" />
          Color de fondo
        </label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={config.bgColor}
            onChange={(e) => handleChange('bgColor', e.target.value)}
            className="w-10 h-10 rounded-lg border border-gray-300 cursor-pointer"
          />
          <div className="flex gap-2">
            {['#ffffff', '#f9fafb', '#fef3c7', '#dbeafe', '#f3e8ff'].map((color) => (
              <button
                key={color}
                onClick={() => handleChange('bgColor', color)}
                className={`
                  w-8 h-8 rounded-lg border-2 transition-all
                  ${config.bgColor === color ? 'border-blue-500 scale-110' : 'border-gray-300'}
                `}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Toggles */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-700">Mostrar elementos</label>
        
        {/* Toggle: Logo */}
        <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
          <div className="flex items-center gap-3">
            <Image className="w-5 h-5 text-gray-500" />
            <div>
              <p className="font-medium text-gray-900">Logo de la tienda</p>
              <p className="text-xs text-gray-500">Muestra tu logo en el header</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={config.showLogo}
            onChange={(e) => handleChange('showLogo', e.target.checked)}
            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </label>

        {/* Toggle: URL */}
        <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
          <div className="flex items-center gap-3">
            <Link2 className="w-5 h-5 text-gray-500" />
            <div>
              <p className="font-medium text-gray-900">URL de la tienda</p>
              <p className="text-xs text-gray-500">Muestra el enlace debajo del QR</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={config.showUrl}
            onChange={(e) => handleChange('showUrl', e.target.checked)}
            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </label>

        {/* Toggle: Redes sociales */}
        <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-gray-500" />
            <div>
              <p className="font-medium text-gray-900">Contacto y redes</p>
              <p className="text-xs text-gray-500">WhatsApp, Instagram, etc.</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={config.showSocials}
            onChange={(e) => handleChange('showSocials', e.target.checked)}
            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </label>
      </div>
    </div>
  )
}

export default QrCustomizer
