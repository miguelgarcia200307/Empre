import { useEffect } from 'react'
import { Input, Textarea } from '../../components/ui'
import { Store, Phone, Link as LinkIcon } from 'lucide-react'
import { generateSlug } from '../../lib/helpers'

const Step1Datos = ({ data, onChange }) => {
  // Auto-generar slug cuando cambia el nombre
  useEffect(() => {
    if (data.name && !data.slugManual) {
      const slug = generateSlug(data.name)
      onChange({ slug })
    }
  }, [data.name])

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">
        Cuéntanos sobre tu negocio
      </h2>
      <p className="text-gray-600 mb-6">
        Esta información aparecerá en tu tienda pública
      </p>

      <div className="space-y-5">
        <Input
          label="Nombre de tu tienda"
          icon={Store}
          placeholder="Ej: Dulces María, Artesanías del Valle"
          value={data.name}
          onChange={(e) => onChange({ name: e.target.value })}
          hint="Este nombre verán tus clientes"
        />

        <Textarea
          label="Descripción corta (opcional)"
          placeholder="Ej: Los mejores postres artesanales de la ciudad. Endulzamos tus momentos especiales."
          value={data.description}
          onChange={(e) => onChange({ description: e.target.value })}
          rows={3}
          hint="Un breve texto sobre lo que ofreces"
        />

        <Input
          label="WhatsApp de contacto"
          icon={Phone}
          type="tel"
          placeholder="3001234567"
          value={data.whatsapp}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, '')
            onChange({ whatsapp: value })
          }}
          hint="Aquí recibirás los pedidos de tus clientes"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            URL de tu tienda
          </label>
          <div className="flex items-stretch">
            <span className="inline-flex items-center px-4 py-3 bg-gray-100 border border-r-0 border-gray-200 rounded-l-xl text-gray-500 text-sm">
              emprendego.com/tienda/
            </span>
            <input
              type="text"
              value={data.slug}
              onChange={(e) => {
                const slug = generateSlug(e.target.value)
                onChange({ slug, slugManual: true })
              }}
              placeholder="mi-tienda"
              className="flex-1 px-4 py-3 border border-gray-200 rounded-r-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>
          <p className="mt-1.5 text-sm text-gray-500">
            Este será el enlace que compartirás con tus clientes
          </p>
        </div>
      </div>

      {/* Preview */}
      <div className="mt-8 p-4 bg-blue-50 rounded-xl">
        <p className="text-sm font-medium text-blue-900 mb-2">Vista previa del enlace:</p>
        <p className="text-blue-700 font-mono text-sm break-all">
          emprendego.com/tienda/{data.slug || 'tu-tienda'}
        </p>
      </div>
    </div>
  )
}

export default Step1Datos
