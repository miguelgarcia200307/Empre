import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../hooks/useStore'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import { supabase } from '../../lib/supabaseClient'
import { generateSlug, isValidPhone } from '../../lib/helpers'
import {
  Card,
  Button,
  Input,
  Textarea,
  Skeleton,
  CitySelect,
  Modal,
} from '../../components/ui'
import { findOfficialCity } from '../../data/colombiaCities'
import {
  Store,
  Phone,
  MapPin,
  Clock,
  Instagram,
  Facebook,
  Save,
  Video,
  AlertTriangle,
  Trash2,
} from 'lucide-react'

// Función para mapear datos del store (DB) al formulario
const mapStoreToForm = (store) => {
  if (!store) return null
  
  // social_links es JSONB en la DB
  const socialLinks = store.social_links || {}
  // business_hours puede ser JSONB o string
  const businessHours = typeof store.business_hours === 'object' 
    ? store.business_hours?.text || '' 
    : store.business_hours || ''
  
  return {
    name: store.name || '',
    description: store.description || '',
    slug: store.slug || '',
    whatsapp: store.whatsapp || '',
    address: store.address || '',
    city: store.city || '',
    business_hours: businessHours,
    instagram: socialLinks.instagram || '',
    facebook: socialLinks.facebook || '',
    tiktok: socialLinks.tiktok || '',
  }
}

const Negocio = () => {
  const navigate = useNavigate()
  const { store, updateStore, loading: storeLoading } = useStore()
  const { signOut } = useAuth()
  const toast = useToast()
  const [saving, setSaving] = useState(false)
  const [formLoaded, setFormLoaded] = useState(false)
  
  // Estados para Zona de Riesgo
  const [riskModalOpen, setRiskModalOpen] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  
  // Estado del formulario - inicializa vacío hasta que llegue store
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    slug: '',
    whatsapp: '',
    address: '',
    city: '',
    business_hours: '',
    instagram: '',
    facebook: '',
    tiktok: '',
  })

  // Estado original para detectar cambios (dirty state)
  const [originalData, setOriginalData] = useState(null)

  // Poblar formulario cuando store llegue
  useEffect(() => {
    if (store?.id && !formLoaded) {
      const mapped = mapStoreToForm(store)
      if (mapped) {
        setFormData(mapped)
        setOriginalData(mapped)
        setFormLoaded(true)
      }
    }
  }, [store?.id, formLoaded])

  // Si el store cambia externamente, actualizar
  useEffect(() => {
    if (store?.id && formLoaded && originalData) {
      const mapped = mapStoreToForm(store)
      // Solo actualizar si hay cambios reales desde el servidor
      if (mapped && store.updated_at !== originalData.updated_at) {
        setFormData(mapped)
        setOriginalData(mapped)
      }
    }
  }, [store?.updated_at])

  // Detectar si hay cambios (dirty state)
  const hasChanges = useMemo(() => {
    if (!originalData) return false
    return JSON.stringify(formData) !== JSON.stringify(originalData)
  }, [formData, originalData])

  const handleSave = async () => {
    // Validar nombre
    const nameToValidate = formData.name.trim() || store?.name
    if (!nameToValidate) {
      toast.error('El nombre de la tienda es requerido')
      return
    }

    // Validar WhatsApp
    const whatsappToValidate = formData.whatsapp.trim() || store?.whatsapp
    if (!whatsappToValidate) {
      toast.error('El número de WhatsApp es requerido')
      return
    }

    if (whatsappToValidate && !isValidPhone(whatsappToValidate)) {
      toast.error('Número de WhatsApp inválido')
      return
    }

    // Validar ciudad (si se ingresó, debe ser de la lista)
    if (formData.city && !findOfficialCity(formData.city)) {
      toast.error('Selecciona una ciudad válida de la lista')
      return
    }

    setSaving(true)
    try {
      // Construir payload con nombres de columnas correctos de la DB
      const payload = {
        name: formData.name.trim() || store?.name,
        description: formData.description.trim(),
        slug: formData.slug.trim() || generateSlug(formData.name.trim() || store?.name),
        whatsapp: formData.whatsapp.trim() || store?.whatsapp,
        address: formData.address.trim(),
        city: formData.city.trim(),
        // business_hours como JSONB
        business_hours: formData.business_hours.trim() 
          ? { text: formData.business_hours.trim() } 
          : null,
        // social_links como JSONB
        social_links: {
          ...(formData.instagram.trim() && { instagram: formData.instagram.trim() }),
          ...(formData.facebook.trim() && { facebook: formData.facebook.trim() }),
          ...(formData.tiktok.trim() && { tiktok: formData.tiktok.trim() }),
        },
      }

      // Limpiar social_links si está vacío
      if (Object.keys(payload.social_links).length === 0) {
        payload.social_links = null
      }

      const { error } = await updateStore(payload)
      
      if (error) throw error
      
      // Actualizar estado original para resetear dirty state
      setOriginalData({ ...formData })
      toast.success('Datos guardados correctamente')
    } catch (error) {
      console.error('Error updating store:', error)
      toast.error('Error al guardar cambios')
    } finally {
      setSaving(false)
    }
  }

  // Handler para eliminar cuenta permanentemente
  const handleDeleteAccount = async () => {
    if (confirmText !== 'ELIMINAR') return
    
    setDeleteLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('delete-account')
      
      if (error) throw error
      if (!data?.ok) throw new Error('Error al eliminar cuenta')
      
      toast.success('Tu cuenta ha sido eliminada exitosamente')
      
      // Cerrar sesión y limpiar localStorage
      await signOut()
      localStorage.removeItem('emprendego_store_id')
      
      // Redirigir a la página de inicio
      navigate('/marketplace', { replace: true })
    } catch (error) {
      console.error('Error eliminando cuenta:', error)
      toast.error('No se pudo eliminar la cuenta. Intenta de nuevo.')
    } finally {
      setDeleteLoading(false)
      setRiskModalOpen(false)
      setConfirmText('')
    }
  }

  // Loading skeleton mientras carga el store
  if (storeLoading || !formLoaded) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mi Negocio</h1>
            <p className="text-gray-600 mt-1">Configura la información de tu tienda</p>
          </div>
          <Skeleton className="w-40 h-10 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <Skeleton className="w-32 h-5 mb-4" />
              <div className="space-y-5">
                <Skeleton className="w-full h-12 rounded-xl" />
                <Skeleton className="w-full h-12 rounded-xl" />
                <Skeleton className="w-full h-12 rounded-xl" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mi Negocio</h1>
          <p className="text-gray-600 mt-1">
            Configura la información de tu tienda
          </p>
        </div>
        <Button 
          onClick={handleSave} 
          loading={saving} 
          icon={Save}
          disabled={!hasChanges}
        >
          {hasChanges ? 'Guardar cambios' : 'Sin cambios'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic info */}
        <Card>
          <h2 className="font-semibold text-gray-900 mb-4">Información básica</h2>
          <div className="space-y-5">
            <Input
              label="Nombre de la tienda"
              icon={Store}
              placeholder="Mi Tienda"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />

            <Textarea
              label="Descripción"
              placeholder="Cuéntale a tus clientes qué ofreces..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
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
                  value={formData.slug}
                  onChange={(e) => {
                    const slug = generateSlug(e.target.value)
                    setFormData({ ...formData, slug })
                  }}
                  placeholder="mi-tienda"
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-r-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Actual: {window.location.origin}/tienda/{formData.slug || 'mi-tienda'}
              </p>
            </div>
          </div>
        </Card>

        {/* Contact */}
        <Card>
          <h2 className="font-semibold text-gray-900 mb-4">Contacto</h2>
          <div className="space-y-5">
            <Input
              label="WhatsApp"
              icon={Phone}
              type="tel"
              placeholder="3001234567"
              value={formData.whatsapp}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '')
                setFormData({ ...formData, whatsapp: value })
              }}
              hint="Este número recibirá los pedidos"
              required
            />

            <CitySelect
              label="Ciudad"
              placeholder="Buscar ciudad..."
              value={formData.city}
              onChange={(city) => setFormData({ ...formData, city })}
              hint="Selecciona una ciudad para resultados más precisos en el Marketplace."
            />

            <Input
              label="Dirección (opcional)"
              icon={MapPin}
              placeholder="Calle 123 #45-67"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />

            <Input
              label="Horario de atención (opcional)"
              icon={Clock}
              placeholder="Lunes a Sábado: 9am - 6pm"
              value={formData.business_hours}
              onChange={(e) => setFormData({ ...formData, business_hours: e.target.value })}
            />
          </div>
        </Card>

        {/* Social media */}
        <Card>
          <h2 className="font-semibold text-gray-900 mb-4">Redes sociales</h2>
          <p className="text-sm text-gray-500 mb-4">
            Conecta tus redes para que tus clientes te encuentren
          </p>
          <div className="space-y-5">
            <Input
              label="Instagram (opcional)"
              icon={Instagram}
              placeholder="@mitienda"
              value={formData.instagram}
              onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
            />

            <Input
              label="Facebook (opcional)"
              icon={Facebook}
              placeholder="facebook.com/mitienda"
              value={formData.facebook}
              onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
            />

            <Input
              label="TikTok (opcional)"
              icon={Video}
              placeholder="@mitienda"
              value={formData.tiktok}
              onChange={(e) => setFormData({ ...formData, tiktok: e.target.value })}
            />
          </div>
        </Card>

        {/* Preview card */}
        <Card variant="flat">
          <h2 className="font-semibold text-gray-900 mb-4">Vista previa del contacto</h2>
          <div className="space-y-3">
            {formData.whatsapp && (
              <div className="flex items-center gap-3 text-gray-600">
                <Phone className="w-5 h-5 text-green-600" />
                <span>+57 {formData.whatsapp}</span>
              </div>
            )}
            {(formData.city || formData.address) && (
              <div className="flex items-center gap-3 text-gray-600">
                <MapPin className="w-5 h-5 text-red-500" />
                <span>{[formData.address, formData.city].filter(Boolean).join(', ')}</span>
              </div>
            )}
            {formData.business_hours && (
              <div className="flex items-center gap-3 text-gray-600">
                <Clock className="w-5 h-5 text-blue-500" />
                <span>{formData.business_hours}</span>
              </div>
            )}
            {formData.instagram && (
              <div className="flex items-center gap-3 text-gray-600">
                <Instagram className="w-5 h-5 text-pink-500" />
                <span>{formData.instagram}</span>
              </div>
            )}
            {formData.facebook && (
              <div className="flex items-center gap-3 text-gray-600">
                <Facebook className="w-5 h-5 text-blue-600" />
                <span>{formData.facebook}</span>
              </div>
            )}
            {formData.tiktok && (
              <div className="flex items-center gap-3 text-gray-600">
                <Video className="w-5 h-5 text-gray-900" />
                <span>{formData.tiktok}</span>
              </div>
            )}
            {!formData.whatsapp && !formData.instagram && !formData.facebook && (
              <p className="text-gray-400 text-sm italic">
                Agrega información de contacto para ver la vista previa
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* ============================================
          ZONA DE RIESGO
          ============================================ */}
      <div className="mt-8 pt-8 border-t border-gray-200">
        <Card className="border-red-200 bg-red-50/30">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-xl bg-red-100 shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">Zona de Riesgo</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Eliminar tu cuenta y todos los datos asociados de forma permanente.
                  Esta acción no se puede deshacer.
                </p>
              </div>
            </div>
            <Button
              variant="danger"
              onClick={() => setRiskModalOpen(true)}
              icon={Trash2}
              className="shrink-0"
            >
              Eliminar cuenta
            </Button>
          </div>
        </Card>
      </div>

      {/* Modal de confirmación de eliminación */}
      <Modal
        isOpen={riskModalOpen}
        onClose={() => {
          if (!deleteLoading) {
            setRiskModalOpen(false)
            setConfirmText('')
          }
        }}
        title="¿Eliminar cuenta permanentemente?"
        size="md"
      >
        <div className="space-y-4">
          {/* Advertencias */}
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="text-sm text-red-800 space-y-2">
                <p className="font-semibold">Esta acción es irreversible. Se eliminará:</p>
                <ul className="list-disc list-inside space-y-1 text-red-700">
                  <li>Tu usuario y perfil</li>
                  <li>Tu tienda, productos y categorías</li>
                  <li>Todos los pedidos y finanzas</li>
                  <li>Tickets de soporte y estadísticas</li>
                  <li>Cualquier otro dato asociado</li>
                </ul>
                <p className="font-medium pt-2">
                  No hay vuelta atrás. Todos tus datos se perderán permanentemente.
                </p>
              </div>
            </div>
          </div>

          {/* Input de confirmación */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Para confirmar, escribe <span className="font-bold text-red-600">ELIMINAR</span> a continuación:
            </label>
            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="ELIMINAR"
              disabled={deleteLoading}
              className="font-mono"
            />
          </div>

          {/* Botones */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={() => {
                setRiskModalOpen(false)
                setConfirmText('')
              }}
              disabled={deleteLoading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteAccount}
              loading={deleteLoading}
              disabled={confirmText !== 'ELIMINAR' || deleteLoading}
              className="flex-1"
              icon={Trash2}
            >
              Eliminar permanentemente
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Negocio
