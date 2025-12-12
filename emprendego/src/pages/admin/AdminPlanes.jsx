import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import {
  Button,
  Input,
  Modal,
  Toggle,
  EmptyState,
} from '../../components/ui'
import { useToast } from '../../hooks/useToast'
import {
  CreditCard,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Star,
  Package,
  FolderOpen,
  Palette,
  Zap,
  BarChart3,
  MessageSquare,
  Globe,
  Shield,
  Sparkles,
  GripVertical,
  Store,
  Users,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'

// Feature list with icons
const FEATURE_LIST = [
  { key: 'whatsappButton', label: 'Botón WhatsApp', icon: MessageSquare },
  { key: 'customUrl', label: 'URL personalizada', icon: Globe },
  { key: 'marketplace', label: 'Marketplace', icon: Store },
  { key: 'basicStats', label: 'Estadísticas básicas', icon: BarChart3 },
  { key: 'qrCode', label: 'Código QR dinámico', icon: Zap },
  { key: 'advancedStats', label: 'Estadísticas avanzadas', icon: BarChart3 },
  { key: 'ai', label: 'Asistente IA', icon: Sparkles },
  { key: 'finances', label: 'Módulo Finanzas', icon: CreditCard },
  { key: 'recommendations', label: 'Recomendaciones', icon: Star },
  { key: 'multiCatalog', label: 'Multi-catálogo', icon: FolderOpen },
  { key: 'customDomain', label: 'Dominio personalizado', icon: Globe },
  { key: 'removeBranding', label: 'Sin marca EmprendeGo', icon: Shield },
  { key: 'prioritySupport', label: 'Soporte prioritario', icon: MessageSquare },
]

const AdminPlanes = () => {
  const toast = useToast()
  const [loading, setLoading] = useState(true)
  const [plans, setPlans] = useState([])
  const [storesByPlan, setStoresByPlan] = useState({})
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [formData, setFormData] = useState({
    slug: '',
    name: '',
    description: '',
    price_monthly: 0,
    max_products: 10,
    max_categories: 3,
    templates: 1,
    marketplace_priority: 'baja',
    is_active: true,
    is_featured: false,
    sort_order: 0,
    features: {},
  })
  const [errors, setErrors] = useState({})

  const fetchPlans = async () => {
    setLoading(true)
    try {
      // Obtener planes de la base de datos
      const { data: plansData, error: plansError } = await supabase
        .from('plans')
        .select('*')
        .order('sort_order', { ascending: true })

      if (plansError) throw plansError

      // Obtener conteo de tiendas por plan
      const { data: storesData } = await supabase
        .from('stores')
        .select('plan')
        .eq('is_active', true)

      const counts = {}
      storesData?.forEach(store => {
        const plan = store.plan || 'gratis'
        counts[plan] = (counts[plan] || 0) + 1
      })
      
      setPlans(plansData || [])
      setStoresByPlan(counts)
    } catch (error) {
      console.error('Error fetching plans:', error)
      toast.error('Error al cargar planes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlans()
  }, [])

  const handleOpenModal = (plan = null) => {
    if (plan) {
      setFormData({
        slug: plan.slug,
        name: plan.name,
        description: plan.description || '',
        price_monthly: plan.price_monthly,
        max_products: plan.max_products,
        max_categories: plan.max_categories,
        templates: plan.templates,
        marketplace_priority: plan.marketplace_priority || 'baja',
        is_active: plan.is_active,
        is_featured: plan.is_featured,
        sort_order: plan.sort_order,
        features: plan.features || {},
      })
      setSelectedPlan(plan)
    } else {
      setFormData({
        slug: '',
        name: '',
        description: '',
        price_monthly: 0,
        max_products: 10,
        max_categories: 3,
        templates: 1,
        marketplace_priority: 'baja',
        is_active: true,
        is_featured: false,
        sort_order: plans.length + 1,
        features: {},
      })
      setSelectedPlan(null)
    }
    setErrors({})
    setModalOpen(true)
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.slug) newErrors.slug = 'El slug es requerido'
    if (!formData.name) newErrors.name = 'El nombre es requerido'
    if (formData.price_monthly < 0) newErrors.price_monthly = 'El precio no puede ser negativo'
    if (formData.max_products < -1) newErrors.max_products = 'Valor inválido'
    if (formData.max_categories < -1) newErrors.max_categories = 'Valor inválido'
    if (formData.templates < -1) newErrors.templates = 'Valor inválido'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSavePlan = async () => {
    if (!validateForm()) return

    try {
      const planData = {
        ...formData,
        slug: formData.slug.toLowerCase().replace(/[^a-z0-9]/g, ''),
      }

      if (selectedPlan) {
        // Actualizar plan existente
        const { error } = await supabase
          .from('plans')
          .update(planData)
          .eq('id', selectedPlan.id)

        if (error) throw error
        toast.success('Plan actualizado correctamente')
      } else {
        // Crear nuevo plan
        const { error } = await supabase
          .from('plans')
          .insert([planData])

        if (error) throw error
        toast.success('Plan creado correctamente')
      }

      setModalOpen(false)
      fetchPlans()
    } catch (error) {
      console.error('Error saving plan:', error)
      if (error.code === '23505') {
        toast.error('Ya existe un plan con ese slug')
      } else {
        toast.error('Error al guardar el plan')
      }
    }
  }

  const handleDeletePlan = async () => {
    if (!selectedPlan) return

    // Verificar si hay tiendas usando este plan
    const count = storesByPlan[selectedPlan.slug] || 0
    if (count > 0) {
      toast.error(`No puedes eliminar este plan. Hay ${count} tienda${count > 1 ? 's' : ''} usándolo.`)
      setDeleteModalOpen(false)
      return
    }

    try {
      const { error } = await supabase
        .from('plans')
        .delete()
        .eq('id', selectedPlan.id)

      if (error) throw error

      toast.success('Plan eliminado correctamente')
      setDeleteModalOpen(false)
      setSelectedPlan(null)
      fetchPlans()
    } catch (error) {
      toast.error('Error al eliminar el plan')
    }
  }

  const handleToggleActive = async (plan) => {
    try {
      const { error } = await supabase
        .from('plans')
        .update({ is_active: !plan.is_active })
        .eq('id', plan.id)

      if (error) throw error

      toast.success(`Plan ${plan.is_active ? 'desactivado' : 'activado'}`)
      fetchPlans()
    } catch (error) {
      toast.error('Error al cambiar estado')
    }
  }

  const handleToggleFeatured = async (plan) => {
    try {
      // Si vamos a marcar como destacado, desmarcar los demás
      if (!plan.is_featured) {
        await supabase
          .from('plans')
          .update({ is_featured: false })
          .neq('id', plan.id)
      }

      const { error } = await supabase
        .from('plans')
        .update({ is_featured: !plan.is_featured })
        .eq('id', plan.id)

      if (error) throw error

      toast.success(`Plan ${plan.is_featured ? 'desmarcado como' : 'marcado como'} recomendado`)
      fetchPlans()
    } catch (error) {
      toast.error('Error al cambiar destacado')
    }
  }

  const handleMoveOrder = async (plan, direction) => {
    const currentIndex = plans.findIndex(p => p.id === plan.id)
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    
    if (newIndex < 0 || newIndex >= plans.length) return

    const otherPlan = plans[newIndex]

    try {
      // Intercambiar sort_order
      await Promise.all([
        supabase.from('plans').update({ sort_order: otherPlan.sort_order }).eq('id', plan.id),
        supabase.from('plans').update({ sort_order: plan.sort_order }).eq('id', otherPlan.id),
      ])

      toast.success('Orden actualizado')
      fetchPlans()
    } catch (error) {
      toast.error('Error al cambiar orden')
    }
  }

  const handleFeatureToggle = (featureKey) => {
    setFormData({
      ...formData,
      features: {
        ...formData.features,
        [featureKey]: !formData.features[featureKey],
      },
    })
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const priorityColors = {
    baja: 'bg-slate-100 text-slate-700',
    media: 'bg-blue-100 text-blue-700',
    alta: 'bg-purple-100 text-purple-700',
    maxima: 'bg-amber-100 text-amber-700',
  }

  const priorityNames = {
    baja: 'Baja',
    media: 'Media',
    alta: 'Alta',
    maxima: 'Máxima',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Planes</h1>
          <p className="text-slate-500 mt-1">Gestiona los planes de suscripción de la plataforma</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo plan
        </Button>
      </div>

      {/* Plans Grid */}
      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse">
              <div className="h-6 bg-slate-200 rounded w-1/2 mb-4" />
              <div className="h-8 bg-slate-200 rounded w-3/4 mb-4" />
              <div className="space-y-2">
                <div className="h-4 bg-slate-200 rounded" />
                <div className="h-4 bg-slate-200 rounded w-5/6" />
                <div className="h-4 bg-slate-200 rounded w-4/6" />
              </div>
            </div>
          ))}
        </div>
      ) : plans.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No hay planes"
          description="Crea tu primer plan de suscripción"
          action={
            <Button onClick={() => handleOpenModal()}>
              <Plus className="w-4 h-4 mr-2" />
              Crear plan
            </Button>
          }
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan, index) => (
            <div
              key={plan.id}
              className={`
                relative bg-white rounded-2xl border-2 p-6
                ${plan.is_featured ? 'border-purple-500 shadow-lg shadow-purple-500/10' : 'border-slate-200'}
                ${!plan.is_active ? 'opacity-60' : ''}
              `}
            >
              {/* Featured Badge */}
              {plan.is_featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-500 text-white text-xs font-medium rounded-full">
                    <Star className="w-3 h-3" />
                    Recomendado
                  </span>
                </div>
              )}

              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{plan.name}</h3>
                  <p className="text-xs text-slate-500">/{plan.slug}</p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleMoveOrder(plan, 'up')}
                    disabled={index === 0}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 disabled:opacity-30"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleMoveOrder(plan, 'down')}
                    disabled={index === plans.length - 1}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 disabled:opacity-30"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Price */}
              <div className="mb-4">
                <span className="text-3xl font-bold text-slate-900">
                  {plan.price_monthly === 0 ? 'Gratis' : formatPrice(plan.price_monthly)}
                </span>
                {plan.price_monthly > 0 && (
                  <span className="text-slate-500 text-sm">/mes</span>
                )}
              </div>

              {/* Limits */}
              <div className="space-y-2 mb-4 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <Package className="w-4 h-4 text-slate-400" />
                  <span>
                    {plan.max_products === -1 ? 'Productos ilimitados' : `${plan.max_products} productos`}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <FolderOpen className="w-4 h-4 text-slate-400" />
                  <span>
                    {plan.max_categories === -1 ? 'Categorías ilimitadas' : `${plan.max_categories} categorías`}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Palette className="w-4 h-4 text-slate-400" />
                  <span>
                    {plan.templates === -1 ? 'Todas las plantillas' : `${plan.templates} plantilla${plan.templates > 1 ? 's' : ''}`}
                  </span>
                </div>
              </div>

              {/* Priority */}
              <div className="mb-4">
                <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${priorityColors[plan.marketplace_priority]}`}>
                  Prioridad {priorityNames[plan.marketplace_priority]}
                </span>
              </div>

              {/* Store count */}
              <div className="mb-4 p-3 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-2 text-slate-600">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">
                    <strong>{storesByPlan[plan.slug] || 0}</strong> tienda{(storesByPlan[plan.slug] || 0) !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {/* Features summary */}
              <div className="mb-4">
                <p className="text-xs text-slate-500 mb-2">Características principales:</p>
                <div className="flex flex-wrap gap-1">
                  {FEATURE_LIST.filter(f => plan.features?.[f.key]).slice(0, 4).map(feature => (
                    <span
                      key={feature.key}
                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs rounded"
                    >
                      <CheckCircle className="w-3 h-3" />
                      {feature.label}
                    </span>
                  ))}
                  {Object.values(plan.features || {}).filter(Boolean).length > 4 && (
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded">
                      +{Object.values(plan.features || {}).filter(Boolean).length - 4} más
                    </span>
                  )}
                </div>
              </div>

              {/* Status toggles */}
              <div className="space-y-2 mb-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Activo</span>
                  <Toggle
                    checked={plan.is_active}
                    onChange={() => handleToggleActive(plan)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Recomendado</span>
                  <Toggle
                    checked={plan.is_featured}
                    onChange={() => handleToggleFeatured(plan)}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleOpenModal(plan)}
                >
                  <Edit2 className="w-4 h-4 mr-1" />
                  Editar
                </Button>
                <button
                  onClick={() => {
                    setSelectedPlan(plan)
                    setDeleteModalOpen(true)
                  }}
                  className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Notes */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h4 className="font-medium text-blue-900 mb-2">📝 Notas sobre planes</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• El valor <strong>-1</strong> significa ilimitado (ej: productos ilimitados)</li>
          <li>• Solo puede haber un plan marcado como "Recomendado" a la vez</li>
          <li>• Los planes desactivados no se mostrarán a los usuarios</li>
          <li>• No puedes eliminar un plan que tenga tiendas asignadas</li>
          <li>• La integración con pasarela de pagos está pendiente de implementación</li>
        </ul>
      </div>

      {/* Plan Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedPlan ? 'Editar plan' : 'Nuevo plan'}
        size="lg"
      >
        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
          {/* Basic Info */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Slug (identificador)"
              placeholder="ej: emprendedor"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              error={errors.slug}
              disabled={selectedPlan?.slug === 'gratis' || selectedPlan?.slug === 'basico' || selectedPlan?.slug === 'emprendedor' || selectedPlan?.slug === 'pro'}
            />
            <Input
              label="Nombre"
              placeholder="ej: Plan Emprendedor"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={errors.name}
            />
          </div>

          <Input
            label="Descripción"
            placeholder="Breve descripción del plan..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Precio mensual (COP)"
              type="number"
              min="0"
              value={formData.price_monthly}
              onChange={(e) => setFormData({ ...formData, price_monthly: parseInt(e.target.value) || 0 })}
              error={errors.price_monthly}
            />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Prioridad en Marketplace
              </label>
              <select
                value={formData.marketplace_priority}
                onChange={(e) => setFormData({ ...formData, marketplace_priority: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
                <option value="maxima">Máxima</option>
              </select>
            </div>
          </div>

          {/* Limits */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-3">Límites</h4>
            <p className="text-xs text-slate-500 mb-3">Usa -1 para indicar ilimitado</p>
            <div className="grid gap-4 sm:grid-cols-3">
              <Input
                label="Máx. productos"
                type="number"
                min="-1"
                value={formData.max_products}
                onChange={(e) => setFormData({ ...formData, max_products: parseInt(e.target.value) || 0 })}
                error={errors.max_products}
              />
              <Input
                label="Máx. categorías"
                type="number"
                min="-1"
                value={formData.max_categories}
                onChange={(e) => setFormData({ ...formData, max_categories: parseInt(e.target.value) || 0 })}
                error={errors.max_categories}
              />
              <Input
                label="Plantillas"
                type="number"
                min="-1"
                value={formData.templates}
                onChange={(e) => setFormData({ ...formData, templates: parseInt(e.target.value) || 0 })}
                error={errors.templates}
              />
            </div>
          </div>

          {/* Features */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-3">Características incluidas</h4>
            <div className="grid gap-2 sm:grid-cols-2">
              {FEATURE_LIST.map((feature) => (
                <label
                  key={feature.key}
                  className={`
                    flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all
                    ${formData.features[feature.key]
                      ? 'bg-emerald-50 border-emerald-200'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                    }
                  `}
                >
                  <input
                    type="checkbox"
                    checked={formData.features[feature.key] || false}
                    onChange={() => handleFeatureToggle(feature.key)}
                    className="sr-only"
                  />
                  <div className={`
                    w-5 h-5 rounded flex items-center justify-center
                    ${formData.features[feature.key] ? 'bg-emerald-500' : 'bg-slate-200'}
                  `}>
                    {formData.features[feature.key] && (
                      <CheckCircle className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <feature.icon className={`w-4 h-4 ${formData.features[feature.key] ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span className={`text-sm ${formData.features[feature.key] ? 'text-emerald-700 font-medium' : 'text-slate-600'}`}>
                    {feature.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSavePlan}>
              {selectedPlan ? 'Guardar cambios' : 'Crear plan'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Eliminar plan"
      >
        <div className="space-y-4">
          <p className="text-slate-600">
            ¿Estás seguro de que deseas eliminar el plan <strong>{selectedPlan?.name}</strong>?
            Esta acción no se puede deshacer.
          </p>
          
          {(storesByPlan[selectedPlan?.slug] || 0) > 0 && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-sm text-amber-800">
                ⚠️ Este plan tiene <strong>{storesByPlan[selectedPlan?.slug]}</strong> tienda{(storesByPlan[selectedPlan?.slug] || 0) !== 1 ? 's' : ''} asignada{(storesByPlan[selectedPlan?.slug] || 0) !== 1 ? 's' : ''}.
                No puedes eliminarlo hasta reasignar las tiendas a otro plan.
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => setDeleteModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={handleDeletePlan}
              disabled={(storesByPlan[selectedPlan?.slug] || 0) > 0}
            >
              Eliminar plan
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default AdminPlanes
