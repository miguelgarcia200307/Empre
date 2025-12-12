import { useState, useEffect } from 'react'
import { useStore } from '../../hooks/useStore'
import { usePlans } from '../../hooks/usePlans'
import { useToast } from '../../hooks/useToast'
import { formatPrice } from '../../lib/helpers'
import {
  Card,
  Button,
  Modal,
  Badge,
  Skeleton,
} from '../../components/ui'
import {
  Check,
  X,
  Zap,
  Crown,
  Rocket,
  Star,
  CreditCard,
  Sparkles,
  TrendingUp,
  BarChart3,
  Brain,
  Wallet,
  QrCode,
  MessageCircle,
  ShoppingBag,
  Layers,
  AlertTriangle,
  RefreshCw,
  Lock,
} from 'lucide-react'

// ============================================
// FEATURE FLAG - Pagos habilitados
// Cambiar a true cuando se integre pasarela de pagos
// ============================================
const PAYMENTS_ENABLED = false

// ============================================
// COMPONENTES DE UI PARA PLANES
// ============================================

// Mapeo de iconos por slug de plan
const PLAN_ICONS = {
  gratis: Zap,
  basico: TrendingUp,
  emprendedor: Rocket,
  pro: Crown,
}

// Gradientes por slug de plan
const PLAN_GRADIENTS = {
  gratis: 'bg-gray-100',
  basico: 'bg-gradient-to-br from-emerald-500 to-teal-500',
  emprendedor: 'bg-gradient-to-br from-blue-500 to-cyan-500',
  pro: 'bg-gradient-to-br from-purple-500 to-blue-600',
}

// Componente para mostrar una característica incluida o no
const FeatureItem = ({ included, children, highlight = false }) => (
  <li className="flex items-start gap-3">
    {included ? (
      <div className={`mt-0.5 p-0.5 rounded-full ${highlight ? 'bg-purple-100' : 'bg-green-100'}`}>
        <Check className={`w-3.5 h-3.5 ${highlight ? 'text-purple-600' : 'text-green-600'}`} />
      </div>
    ) : (
      <div className="mt-0.5 p-0.5 rounded-full bg-gray-100">
        <X className="w-3.5 h-3.5 text-gray-400" />
      </div>
    )}
    <span className={included ? 'text-gray-700' : 'text-gray-400'}>
      {children}
    </span>
  </li>
)

// Componente de tarjeta de plan dinámico
const PlanCard = ({ 
  plan, 
  isCurrentPlan, 
  isDiscontinued = false,
  onSelect,
  disabled = false,
}) => {
  const Icon = PLAN_ICONS[plan.slug] || Zap
  const isUnlimited = (value) => value === -1

  return (
    <div className={`
      relative rounded-2xl border-2 transition-all duration-200
      ${isCurrentPlan 
        ? 'border-blue-500 shadow-lg shadow-blue-100' 
        : plan.isFeatured 
          ? 'border-purple-300 shadow-lg shadow-purple-100'
          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
      }
      ${isDiscontinued ? 'opacity-75' : ''}
      bg-white
    `}>
      {/* Badges */}
      <div className="absolute -top-3 left-4 flex gap-2">
        {isCurrentPlan && (
          <Badge variant="blue">Tu plan</Badge>
        )}
        {isDiscontinued && isCurrentPlan && (
          <Badge variant="amber">Descontinuado</Badge>
        )}
        {plan.isFeatured && !isCurrentPlan && (
          <Badge variant="purple">Recomendado</Badge>
        )}
      </div>

      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2.5 rounded-xl ${PLAN_GRADIENTS[plan.slug] || 'bg-gray-100'}`}>
            <Icon className={`w-5 h-5 ${plan.slug === 'gratis' ? 'text-gray-600' : 'text-white'}`} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg">{plan.name}</h3>
            {plan.description && (
              <p className="text-xs text-gray-500">{plan.description}</p>
            )}
          </div>
        </div>

        {/* Precio */}
        <div className="mb-6">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-gray-900">
              {plan.price === 0 ? 'Gratis' : formatPrice(plan.price)}
            </span>
            {plan.price > 0 && (
              <span className="text-gray-500 text-sm">/mes</span>
            )}
          </div>
          {plan.price === 0 && (
            <p className="text-xs text-gray-500 mt-1">Sin límite de tiempo</p>
          )}
        </div>

        {/* Características principales */}
        <ul className="space-y-3 mb-6 text-sm">
          {/* Productos */}
          <FeatureItem included={true}>
            {isUnlimited(plan.maxProducts) 
              ? <><strong className="text-purple-600">Productos ilimitados</strong></>
              : <>Hasta <strong>{plan.maxProducts}</strong> productos</>
            }
          </FeatureItem>

          {/* Plantillas */}
          <FeatureItem included={true}>
            {isUnlimited(plan.templates)
              ? <><strong className="text-purple-600">Todas las plantillas</strong></>
              : <>{plan.templates} plantilla{plan.templates > 1 ? 's' : ''}</>
            }
          </FeatureItem>

          {/* WhatsApp */}
          <FeatureItem included={plan.features?.whatsappButton}>
            Botón de WhatsApp
          </FeatureItem>

          {/* QR Code */}
          <FeatureItem included={plan.features?.qrCode}>
            Código QR dinámico
          </FeatureItem>

          {/* Estadísticas */}
          <FeatureItem included={plan.features?.advancedStats || plan.features?.basicStats}>
            {plan.features?.advancedStats ? 'Estadísticas avanzadas' : 'Estadísticas básicas'}
          </FeatureItem>

          {/* IA */}
          <FeatureItem included={plan.features?.ai}>
            IA para descripciones
          </FeatureItem>

          {/* Finanzas */}
          <FeatureItem included={plan.features?.finances}>
            Módulo de finanzas
          </FeatureItem>

          {/* Recomendaciones */}
          <FeatureItem included={plan.features?.recommendations}>
            "Te puede interesar"
          </FeatureItem>

          {/* Multi-catálogo */}
          <FeatureItem included={plan.features?.multiCatalog}>
            Multi-catálogo
          </FeatureItem>

          {/* Marketplace priority */}
          <FeatureItem included={true}>
            Marketplace ({plan.marketplacePriority || 'baja'})
          </FeatureItem>

          {/* Remove branding */}
          {plan.features?.removeBranding && (
            <FeatureItem included={true} highlight>
              Sin marca EmprendeGo
            </FeatureItem>
          )}

          {/* Soporte prioritario */}
          {plan.features?.prioritySupport && (
            <FeatureItem included={true} highlight>
              Soporte prioritario
            </FeatureItem>
          )}
        </ul>

        {/* CTA Button */}
        {isCurrentPlan ? (
          <Button 
            variant="secondary" 
            className="w-full" 
            disabled
          >
            {isDiscontinued ? 'Plan actual (no disponible)' : 'Plan actual'}
          </Button>
        ) : (
          <Button
            className={`w-full ${
              plan.slug === 'pro' 
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700' 
                : plan.slug === 'emprendedor'
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600'
                  : ''
            }`}
            onClick={() => onSelect(plan)}
            disabled={disabled}
          >
            {plan.price === 0 ? 'Cambiar a Gratis' : 'Mejorar plan'}
          </Button>
        )}
      </div>
    </div>
  )
}

// Skeleton para carga
const PlanCardSkeleton = () => (
  <div className="rounded-2xl border-2 border-gray-200 p-6 bg-white">
    <div className="flex items-center gap-3 mb-4">
      <Skeleton className="w-12 h-12 rounded-xl" />
      <div>
        <Skeleton className="w-24 h-5 mb-1" />
        <Skeleton className="w-16 h-3" />
      </div>
    </div>
    <Skeleton className="w-28 h-8 mb-6" />
    <div className="space-y-3 mb-6">
      {[...Array(6)].map((_, i) => (
        <Skeleton key={i} className="w-full h-4" />
      ))}
    </div>
    <Skeleton className="w-full h-10 rounded-lg" />
  </div>
)

// ============================================
// PÁGINA PRINCIPAL DE PLAN Y FACTURACIÓN
// ============================================

const Plan = () => {
  const { store, plan: currentPlanFromStore, changePlan } = useStore()
  const { plans, loading: plansLoading, error: plansError, refetch, getPlanBySlug } = usePlans()
  const toast = useToast()
  
  const [currentPlan, setCurrentPlan] = useState(null)
  const [isCurrentPlanDiscontinued, setIsCurrentPlanDiscontinued] = useState(false)
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [processing, setProcessing] = useState(false)

  // Cargar el plan actual del usuario (incluso si está inactivo)
  useEffect(() => {
    const loadCurrentPlan = async () => {
      if (!store?.plan) return

      // Buscar en los planes activos primero
      const activePlan = plans.find(p => p.slug === store.plan || p.id === store.plan)
      
      if (activePlan) {
        setCurrentPlan(activePlan)
        setIsCurrentPlanDiscontinued(false)
      } else {
        // El plan no está en activos, buscarlo en DB (puede estar inactivo)
        const dbPlan = await getPlanBySlug(store.plan)
        if (dbPlan) {
          setCurrentPlan(dbPlan)
          setIsCurrentPlanDiscontinued(!dbPlan.isActive)
        } else {
          // Plan no existe en DB, usar fallback del store
          setCurrentPlan(currentPlanFromStore)
          setIsCurrentPlanDiscontinued(true)
        }
      }
    }

    if (!plansLoading) {
      loadCurrentPlan()
    }
  }, [store?.plan, plans, plansLoading, getPlanBySlug, currentPlanFromStore])

  // Determinar orden de planes para comparación
  const getPlanIndex = (planSlug) => {
    const order = ['gratis', 'basico', 'emprendedor', 'pro']
    const idx = order.indexOf(planSlug)
    return idx >= 0 ? idx : plans.findIndex(p => p.slug === planSlug)
  }

  const currentPlanIndex = currentPlan ? getPlanIndex(currentPlan.slug || currentPlan.id) : 0

  const handleSelectPlan = (selectedPlanData) => {
    setSelectedPlan(selectedPlanData)
    setUpgradeModalOpen(true)
  }

  const handleConfirmChange = async () => {
    if (!selectedPlan) return
    
    // Bloqueo de seguridad: no procesar si pagos están deshabilitados
    if (!PAYMENTS_ENABLED && selectedPlan.price > 0) {
      toast.info('Los planes de pago se activan por invitación. Contacta al administrador.')
      return
    }
    
    setProcessing(true)
    
    // Simulación de proceso de pago (2 segundos)
    // TODO: Integrar pasarela de pagos real
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const { error } = await changePlan(selectedPlan.slug || selectedPlan.id)
    
    if (error) {
      toast.error('Error al cambiar de plan. Intenta de nuevo.')
      setProcessing(false)
      return
    }
    
    const isUpgrade = getPlanIndex(selectedPlan.slug) > currentPlanIndex
    
    toast.success(
      isUpgrade 
        ? `¡Bienvenido al Plan ${selectedPlan.name}! 🎉` 
        : `Has cambiado al Plan ${selectedPlan.name}`
    )
    
    // Actualizar plan actual
    setCurrentPlan(selectedPlan)
    setIsCurrentPlanDiscontinued(false)
    
    setUpgradeModalOpen(false)
    setProcessing(false)
    setSelectedPlan(null)
  }

  // Calcular si es upgrade o downgrade
  const isUpgrade = selectedPlan 
    ? getPlanIndex(selectedPlan.slug) > currentPlanIndex 
    : false

  // Estado de error
  if (plansError) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Plan y Facturación</h1>
          <p className="text-gray-600 mt-1">Elige el plan perfecto para tu negocio</p>
        </div>
        <Card className="text-center py-12">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Error al cargar los planes
          </h3>
          <p className="text-gray-600 mb-4">
            No pudimos obtener la información de los planes. Por favor, intenta de nuevo.
          </p>
          <Button onClick={refetch} icon={RefreshCw}>
            Reintentar
          </Button>
        </Card>
      </div>
    )
  }

  // Estado de carga
  if (plansLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Plan y Facturación</h1>
          <p className="text-gray-600 mt-1">Elige el plan perfecto para tu negocio</p>
        </div>
        <Skeleton className="h-32 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <PlanCardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  // Plan actual para mostrar
  const displayPlan = currentPlan || currentPlanFromStore
  const Icon = displayPlan ? (PLAN_ICONS[displayPlan.slug || displayPlan.id] || Zap) : Zap

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Plan y Facturación</h1>
        <p className="text-gray-600 mt-1">
          Elige el plan perfecto para tu negocio
        </p>
      </div>

      {/* Aviso si el plan actual está descontinuado */}
      {isCurrentPlanDiscontinued && displayPlan && (
        <Card className="bg-amber-50 border-amber-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-amber-900">Plan descontinuado</h3>
              <p className="text-sm text-amber-700 mt-1">
                Tu plan actual <strong>"{displayPlan.name}"</strong> ya no está disponible para nuevos usuarios. 
                Puedes seguir usándolo, pero te recomendamos cambiar a uno de los planes activos.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Plan actual destacado */}
      {displayPlan && (
        <Card className={`
          ${displayPlan.slug === 'pro' || displayPlan.id === 'pro'
            ? 'bg-gradient-to-r from-purple-50 via-blue-50 to-cyan-50 border-purple-200' 
            : displayPlan.slug === 'emprendedor' || displayPlan.id === 'emprendedor'
              ? 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200'
              : displayPlan.slug === 'basico' || displayPlan.id === 'basico'
                ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200'
                : 'bg-gray-50 border-gray-200'
          }
        `}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${PLAN_GRADIENTS[displayPlan.slug || displayPlan.id] || 'bg-gray-200'}`}>
                <Icon className={`w-6 h-6 ${(displayPlan.slug === 'gratis' || displayPlan.id === 'gratis') ? 'text-gray-600' : 'text-white'}`} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-gray-900">Plan {displayPlan.name}</h2>
                  <Badge variant={
                    isCurrentPlanDiscontinued ? 'amber' :
                    (displayPlan.slug === 'pro' || displayPlan.id === 'pro') ? 'purple' : 
                    (displayPlan.slug === 'emprendedor' || displayPlan.id === 'emprendedor') ? 'blue' :
                    (displayPlan.slug === 'basico' || displayPlan.id === 'basico') ? 'green' : 'gray'
                  }>
                    {isCurrentPlanDiscontinued ? 'Descontinuado' : 'Activo'}
                  </Badge>
                </div>
                <p className="text-gray-600 text-sm">
                  {(displayPlan.price === 0 || displayPlan.price === undefined)
                    ? 'Estás usando el plan gratuito' 
                    : `${formatPrice(displayPlan.price)}/mes`
                  }
                </p>
              </div>
            </div>
            
            {/* Resumen rápido de features */}
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-1.5 text-sm text-gray-600 bg-white/60 px-3 py-1.5 rounded-lg">
                <ShoppingBag className="w-4 h-4" />
                <span>{displayPlan.maxProducts === -1 ? '∞' : displayPlan.maxProducts} productos</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-gray-600 bg-white/60 px-3 py-1.5 rounded-lg">
                <Layers className="w-4 h-4" />
                <span>{displayPlan.templates === -1 ? 'Todas' : displayPlan.templates} plantilla{displayPlan.templates !== 1 ? 's' : ''}</span>
              </div>
              {displayPlan.features?.ai && (
                <div className="flex items-center gap-1.5 text-sm text-purple-600 bg-purple-100/60 px-3 py-1.5 rounded-lg">
                  <Brain className="w-4 h-4" />
                  <span>IA</span>
                </div>
              )}
              {displayPlan.features?.finances && (
                <div className="flex items-center gap-1.5 text-sm text-emerald-600 bg-emerald-100/60 px-3 py-1.5 rounded-lg">
                  <Wallet className="w-4 h-4" />
                  <span>Finanzas</span>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Grid de planes dinámicos */}
      {plans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <PlanCard
              key={plan.dbId || plan.id}
              plan={plan}
              isCurrentPlan={
                displayPlan && 
                (plan.slug === displayPlan.slug || plan.slug === displayPlan.id || plan.id === displayPlan.id)
              }
              onSelect={handleSelectPlan}
            />
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay planes disponibles
          </h3>
          <p className="text-gray-500">
            Contacta al soporte para más información.
          </p>
        </Card>
      )}

      {/* Comparación detallada dinámica */}
      {plans.length > 0 && (
        <Card>
          <h3 className="font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-gray-400" />
            Comparación detallada
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Característica</th>
                  {plans.map(plan => (
                    <th 
                      key={plan.dbId || plan.id} 
                      className={`text-center py-3 px-4 font-medium ${
                        plan.slug === 'pro' ? 'text-purple-600' :
                        plan.slug === 'emprendedor' ? 'text-blue-600' :
                        plan.slug === 'basico' ? 'text-emerald-600' :
                        'text-gray-900'
                      }`}
                    >
                      {plan.name}
                      {plan.isFeatured && <Star className="w-3 h-3 inline ml-1 text-amber-500" />}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="py-3 px-4 text-gray-700">Productos</td>
                  {plans.map(plan => (
                    <td key={plan.dbId || plan.id} className="py-3 px-4 text-center">
                      {plan.maxProducts === -1 ? (
                        <span className="font-medium text-purple-600">Ilimitados</span>
                      ) : plan.maxProducts}
                    </td>
                  ))}
                </tr>
                <tr className="bg-gray-50/50">
                  <td className="py-3 px-4 text-gray-700">Plantillas</td>
                  {plans.map(plan => (
                    <td key={plan.dbId || plan.id} className="py-3 px-4 text-center">
                      {plan.templates === -1 ? (
                        <span className="font-medium text-purple-600">Todas</span>
                      ) : plan.templates}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-4 text-gray-700">Código QR</td>
                  {plans.map(plan => (
                    <td key={plan.dbId || plan.id} className="py-3 px-4 text-center">
                      {plan.features?.qrCode ? (
                        <Check className="w-4 h-4 text-green-500 mx-auto" />
                      ) : (
                        <X className="w-4 h-4 text-gray-300 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="bg-gray-50/50">
                  <td className="py-3 px-4 text-gray-700">IA para contenido</td>
                  {plans.map(plan => (
                    <td key={plan.dbId || plan.id} className="py-3 px-4 text-center">
                      {plan.features?.ai ? (
                        <Check className="w-4 h-4 text-green-500 mx-auto" />
                      ) : (
                        <X className="w-4 h-4 text-gray-300 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-4 text-gray-700">Módulo de finanzas</td>
                  {plans.map(plan => (
                    <td key={plan.dbId || plan.id} className="py-3 px-4 text-center">
                      {plan.features?.finances ? (
                        <Check className="w-4 h-4 text-green-500 mx-auto" />
                      ) : (
                        <X className="w-4 h-4 text-gray-300 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="bg-gray-50/50">
                  <td className="py-3 px-4 text-gray-700">Prioridad Marketplace</td>
                  {plans.map(plan => (
                    <td key={plan.dbId || plan.id} className={`py-3 px-4 text-center capitalize ${
                      plan.marketplacePriority === 'maxima' ? 'text-purple-600 font-medium' :
                      plan.marketplacePriority === 'alta' ? 'text-blue-600' :
                      plan.marketplacePriority === 'media' ? 'text-emerald-600' :
                      'text-gray-400'
                    }`}>
                      {plan.marketplacePriority || 'Baja'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-4 text-gray-700">Sin marca EmprendeGo</td>
                  {plans.map(plan => (
                    <td key={plan.dbId || plan.id} className="py-3 px-4 text-center">
                      {plan.features?.removeBranding ? (
                        <Check className="w-4 h-4 text-purple-500 mx-auto" />
                      ) : (
                        <X className="w-4 h-4 text-gray-300 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="bg-gray-50/50">
                  <td className="py-3 px-4 text-gray-700">Soporte prioritario</td>
                  {plans.map(plan => (
                    <td key={plan.dbId || plan.id} className="py-3 px-4 text-center">
                      {plan.features?.prioritySupport ? (
                        <Check className="w-4 h-4 text-purple-500 mx-auto" />
                      ) : (
                        <X className="w-4 h-4 text-gray-300 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="bg-gradient-to-r from-gray-50 to-purple-50/30 font-medium">
                  <td className="py-4 px-4 text-gray-900">Precio mensual</td>
                  {plans.map(plan => (
                    <td key={plan.dbId || plan.id} className={`py-4 px-4 text-center ${
                      plan.slug === 'pro' ? 'text-purple-600' :
                      plan.slug === 'emprendedor' ? 'text-blue-600' :
                      plan.slug === 'basico' ? 'text-emerald-600' :
                      'text-gray-900'
                    }`}>
                      {plan.price === 0 ? 'Gratis' : formatPrice(plan.price)}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* FAQ */}
      <Card>
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-gray-400" />
          Preguntas frecuentes
        </h3>
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="font-medium text-gray-900">¿Puedo cancelar en cualquier momento?</p>
            <p className="text-gray-600 text-sm mt-1">
              Sí, puedes cambiar o cancelar tu plan cuando quieras. 
              Si bajas de plan, mantendrás el acceso hasta fin de mes.
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="font-medium text-gray-900">¿Qué pasa si bajo de plan y tengo más productos del límite?</p>
            <p className="text-gray-600 text-sm mt-1">
              Tus productos se mantienen, pero no podrás crear nuevos hasta estar 
              dentro del límite. Te recomendamos eliminar o desactivar algunos.
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="font-medium text-gray-900">¿Qué métodos de pago aceptan?</p>
            <p className="text-gray-600 text-sm mt-1">
              Aceptamos tarjetas crédito/débito, PSE, Nequi, Daviplata y más métodos locales.
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="font-medium text-gray-900">¿El Plan Gratuito tiene fecha de vencimiento?</p>
            <p className="text-gray-600 text-sm mt-1">
              No, puedes usar el plan gratuito para siempre. Solo tiene límites de productos 
              y funcionalidades, pero nunca expira.
            </p>
          </div>
        </div>
      </Card>

      {/* Modal de confirmación */}
      <Modal
        isOpen={upgradeModalOpen}
        onClose={() => !processing && setUpgradeModalOpen(false)}
        title={isUpgrade ? 'Mejorar plan' : 'Cambiar de plan'}
        size="sm"
      >
        {selectedPlan && (
          <>
            <div className="text-center mb-6">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
                PLAN_GRADIENTS[selectedPlan.slug] || 'bg-gray-200'
              }`}>
                {(() => {
                  const SelectedIcon = PLAN_ICONS[selectedPlan.slug] || Zap
                  return <SelectedIcon className={`w-8 h-8 ${selectedPlan.slug === 'gratis' ? 'text-gray-600' : 'text-white'}`} />
                })()}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                Plan {selectedPlan.name}
              </h3>
              <p className="text-2xl font-bold text-gray-900">
                {selectedPlan.price === 0 ? 'Gratis' : `${formatPrice(selectedPlan.price)}/mes`}
              </p>
            </div>

            {isUpgrade && selectedPlan.price > 0 && displayPlan && (
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 mb-6">
                <p className="text-sm text-gray-700 mb-3 font-medium">
                  Lo que obtendrás:
                </p>
                <ul className="space-y-2 text-sm">
                  {selectedPlan.maxProducts === -1 && displayPlan.maxProducts !== -1 && (
                    <li className="flex items-center gap-2 text-purple-700">
                      <Sparkles className="w-4 h-4" /> Productos ilimitados
                    </li>
                  )}
                  {selectedPlan.features?.ai && !displayPlan.features?.ai && (
                    <li className="flex items-center gap-2 text-purple-700">
                      <Brain className="w-4 h-4" /> IA para descripciones
                    </li>
                  )}
                  {selectedPlan.features?.finances && !displayPlan.features?.finances && (
                    <li className="flex items-center gap-2 text-purple-700">
                      <Wallet className="w-4 h-4" /> Módulo de finanzas
                    </li>
                  )}
                  {selectedPlan.features?.qrCode && !displayPlan.features?.qrCode && (
                    <li className="flex items-center gap-2 text-purple-700">
                      <QrCode className="w-4 h-4" /> Código QR dinámico
                    </li>
                  )}
                  {selectedPlan.features?.removeBranding && !displayPlan.features?.removeBranding && (
                    <li className="flex items-center gap-2 text-purple-700">
                      <Star className="w-4 h-4" /> Sin marca EmprendeGo
                    </li>
                  )}
                </ul>
              </div>
            )}

            {!isUpgrade && displayPlan && selectedPlan.price < displayPlan.price && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-amber-800">
                  <strong>Nota:</strong> Al bajar de plan perderás acceso a algunas funciones. 
                  Tus datos se mantienen, pero no podrás usar características premium.
                </p>
              </div>
            )}

            {/* Mensaje de planes por invitación (cuando pagos están deshabilitados) */}
            {selectedPlan.price > 0 && !PAYMENTS_ENABLED && (
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-amber-100 shrink-0">
                    <Lock className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-medium text-amber-900 mb-1">Planes por invitación</p>
                    <p className="text-sm text-amber-700">
                      Actualmente, el acceso a planes de pago se gestiona de forma manual. 
                      Si deseas activar este plan, contacta al administrador que te invitó a la plataforma.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Método de pago (solo cuando pagos están habilitados) */}
            {selectedPlan.price > 0 && PAYMENTS_ENABLED && (
              <div className="border border-gray-200 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <CreditCard className="w-5 h-5 text-gray-400" />
                  <span className="font-medium text-gray-900">Método de pago</span>
                </div>
                <p className="text-sm text-gray-500">
                  Serás redirigido a nuestra pasarela segura para completar el pago.
                </p>
              </div>
            )}

            <div className="flex flex-col gap-3">
              {/* CTA alternativo: Contactar administrador (cuando pagos deshabilitados) */}
              {selectedPlan.price > 0 && !PAYMENTS_ENABLED && (
                <a
                  href="https://wa.me/573001234567?text=Hola%2C%20me%20interesa%20activar%20el%20plan%20" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-medium text-sm text-white transition-all hover:opacity-90 active:scale-[0.98]"
                  style={{ backgroundColor: '#25D366' }}
                >
                  <MessageCircle className="w-4 h-4" />
                  Contactar administrador
                </a>
              )}

              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setUpgradeModalOpen(false)}
                  disabled={processing}
                >
                  Cancelar
                </Button>
                
                {/* Botón de pago: habilitado solo si PAYMENTS_ENABLED o plan gratuito */}
                {selectedPlan.price === 0 ? (
                  <Button
                    className="flex-1"
                    onClick={handleConfirmChange}
                    loading={processing}
                  >
                    Confirmar cambio
                  </Button>
                ) : PAYMENTS_ENABLED ? (
                  <Button
                    className={`flex-1 ${
                      selectedPlan.slug === 'pro' 
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
                        : ''
                    }`}
                    onClick={handleConfirmChange}
                    loading={processing}
                  >
                    Pagar ahora
                  </Button>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-medium text-sm bg-gray-100 text-gray-400 cursor-not-allowed opacity-60"
                  >
                    <Lock className="w-4 h-4" />
                    Pagar ahora
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </Modal>
    </div>
  )
}

export default Plan
