import { ImageUpload } from '../../components/ui'
import { colorPalettes } from '../../lib/helpers'

const Step2Identidad = ({ data, onChange }) => {
  // Solo guardar el File, NO crear blob URL para persistencia
  const handleLogoChange = (file) => {
    if (file) {
      // Guardar solo el archivo - se subirá a Storage en el finish
      onChange({ logoFile: file })
    }
  }

  const handleLogoRemove = () => {
    onChange({ logo_url: null, logoFile: null })
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">
        Dale identidad a tu tienda
      </h2>
      <p className="text-gray-600 mb-6">
        Personaliza cómo se verá tu catálogo (puedes cambiarlo después)
      </p>

      <div className="space-y-8">
        {/* Logo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Logo de tu tienda (opcional)
          </label>
          <ImageUpload
            value={data.logo_url}
            onChange={handleLogoChange}
            onRemove={handleLogoRemove}
            aspectRatio="1:1"
            className="max-w-[200px]"
            placeholder="Sube tu logo"
          />
          <p className="mt-2 text-sm text-gray-500">
            Recomendado: imagen cuadrada, mínimo 200x200px
          </p>
        </div>

        {/* Color palette selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Paleta de colores
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {colorPalettes.map((palette) => {
              const isSelected = data.primary_color === palette.primary
              return (
                <button
                  key={palette.id}
                  type="button"
                  onClick={() => onChange({
                    primary_color: palette.primary,
                    secondary_color: palette.secondary,
                  })}
                  className={`
                    p-4 rounded-xl border-2 text-left transition-all
                    ${isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  <div className="flex gap-1.5 mb-2">
                    <div
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: palette.primary }}
                    />
                    <div
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: palette.secondary }}
                    />
                    <div
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: palette.accent }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {palette.name}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Custom colors */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            O elige colores personalizados
          </label>
          <div className="flex gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">
                Color principal
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={data.primary_color}
                  onChange={(e) => onChange({ primary_color: e.target.value })}
                  className="w-12 h-12 rounded-lg border border-gray-200 cursor-pointer"
                />
                <span className="text-sm text-gray-600 font-mono">
                  {data.primary_color}
                </span>
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">
                Color secundario
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={data.secondary_color}
                  onChange={(e) => onChange({ secondary_color: e.target.value })}
                  className="w-12 h-12 rounded-lg border border-gray-200 cursor-pointer"
                />
                <span className="text-sm text-gray-600 font-mono">
                  {data.secondary_color}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Vista previa
          </label>
          <div className="border border-gray-200 rounded-2xl overflow-hidden">
            {/* Header preview */}
            <div
              className="p-4 flex items-center gap-3"
              style={{ backgroundColor: data.primary_color }}
            >
              {data.logo_url ? (
                <img
                  src={data.logo_url}
                  alt="Logo"
                  className="w-10 h-10 rounded-lg object-cover bg-white"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-white/20" />
              )}
              <span className="text-white font-bold">
                {data.name || 'Tu tienda'}
              </span>
            </div>
            {/* Content preview */}
            <div className="p-4 bg-gray-50">
              <div className="flex gap-2">
                <button
                  className="px-4 py-2 rounded-lg text-white text-sm font-medium"
                  style={{ backgroundColor: data.primary_color }}
                >
                  Botón principal
                </button>
                <button
                  className="px-4 py-2 rounded-lg text-white text-sm font-medium"
                  style={{ backgroundColor: data.secondary_color }}
                >
                  Botón secundario
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Step2Identidad
