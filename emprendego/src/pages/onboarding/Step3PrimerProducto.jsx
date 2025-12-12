import { useState } from 'react'
import { Input, Textarea, ImageUpload, Button } from '../../components/ui'
import { Package, DollarSign, Plus, X } from 'lucide-react'
import { formatPrice } from '../../lib/helpers'

const Step3PrimerProducto = ({ data, onChange }) => {
  const [producto, setProducto] = useState(data.primerProducto || {
    nombre: '',
    descripcion: '',
    precio: '',
    imagen_url: null,
  })

  const updateProducto = (updates) => {
    const newProducto = { ...producto, ...updates }
    setProducto(newProducto)
    onChange({ primerProducto: newProducto })
  }

  const handleImageChange = (file) => {
    if (file) {
      const url = URL.createObjectURL(file)
      updateProducto({ imagen_url: url, imagenFile: file })
    }
  }

  const handleImageRemove = () => {
    updateProducto({ imagen_url: null, imagenFile: null })
  }

  const clearProduct = () => {
    setProducto({
      nombre: '',
      descripcion: '',
      precio: '',
      imagen_url: null,
    })
    onChange({ primerProducto: null })
  }

  const hasProduct = producto.nombre || producto.precio

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">
        Agrega tu primer producto
      </h2>
      <p className="text-gray-600 mb-6">
        Opcional: puedes agregar más productos después desde tu panel
      </p>

      <div className="space-y-5">
        <div className="flex items-start gap-4">
          <ImageUpload
            value={producto.imagen_url}
            onChange={handleImageChange}
            onRemove={handleImageRemove}
            aspectRatio="1:1"
            className="w-32 shrink-0"
            placeholder="Foto"
          />
          
          <div className="flex-1 space-y-4">
            <Input
              label="Nombre del producto"
              icon={Package}
              placeholder="Ej: Torta de chocolate"
              value={producto.nombre}
              onChange={(e) => updateProducto({ nombre: e.target.value })}
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Precio
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  $
                </span>
                <input
                  type="text"
                  placeholder="0"
                  value={producto.precio}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '')
                    updateProducto({ precio: value })
                  }}
                  className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
              </div>
            </div>
          </div>
        </div>

        <Textarea
          label="Descripción (opcional)"
          placeholder="Describe tu producto: ingredientes, tamaño, etc."
          value={producto.descripcion}
          onChange={(e) => updateProducto({ descripcion: e.target.value })}
          rows={3}
        />

        {hasProduct && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearProduct}
              icon={X}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              Quitar producto
            </Button>
          </div>
        )}
      </div>

      {/* Preview */}
      {hasProduct && (
        <div className="mt-8">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Vista previa del producto
          </label>
          <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white max-w-xs">
            {producto.imagen_url ? (
              <img
                src={producto.imagen_url}
                alt={producto.nombre}
                className="w-full aspect-square object-cover"
              />
            ) : (
              <div className="w-full aspect-square bg-gray-100 flex items-center justify-center">
                <Package className="w-12 h-12 text-gray-300" />
              </div>
            )}
            <div className="p-4">
              <h3 className="font-semibold text-gray-900">
                {producto.nombre || 'Nombre del producto'}
              </h3>
              {producto.descripcion && (
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                  {producto.descripcion}
                </p>
              )}
              <p className="text-lg font-bold text-blue-600 mt-2">
                {producto.precio ? formatPrice(parseInt(producto.precio)) : '$0'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="mt-8 p-4 bg-gray-50 rounded-xl">
        <p className="text-sm text-gray-600">
          💡 <strong>Tip:</strong> Puedes omitir este paso si prefieres agregar tus productos 
          más tarde desde el panel de administración. Ahí tendrás acceso a más opciones como 
          categorías, variantes y más.
        </p>
      </div>
    </div>
  )
}

export default Step3PrimerProducto
