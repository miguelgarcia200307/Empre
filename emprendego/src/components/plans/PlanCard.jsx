import { Check, X, Zap, TrendingUp, Rocket, Crown } from 'lucide-react'
import { Button, Badge } from '../ui'
import { formatPrice } from '../../lib/helpers'

// ============================================
// COMPONENTE COMPARTIDO DE TARJETA DE PLAN
// Usado en: Landing (público) y Panel Emprendedor
// ============================================

// Mapeo de iconos por slug de plan
export const PLAN_ICONS = {
  gratis: Zap,
  basico: TrendingUp,
  emprendedor: Rocket,
  pro: Crown,
}

// Gradientes por slug de plan
export const PLAN_GRADIENTS = {
  gratis: 'bg-gray-100',
  basico: 'bg-gradient-to-br from-emerald-500 to-teal-500',
  emprendedor: 'bg-gradient-to-br from-blue-500 to-cyan-500',
  pro: 'bg-gradient-to-br from-purple-500 to-blue-600',
}

// Colores de borde por plan (para landing)
export const PLAN_BORDER_COLORS = {
  gratis: 'border-slate-200 bg-white',
  basico: 'border-blue-200 bg-blue-50/30',
  emprendedor: 'border-purple-200 bg-purple-50/30',
  pro: 'border-amber-200 bg-amber-50/30',
}

// Componente para mostrar una característica incluida o no
export const FeatureItem = ({ included, children, highlight = false }) => (
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

// Helper para verificar si un valor es ilimitado
const isUnlimited = (value) => value === -1

/**
 * PlanCard - Componente unificado para mostrar tarjetas de plan
 * 
 * @param {Object} plan - Objeto del plan transformado de usePlans
 * @param {string} variant - 'public' (landing) o 'panel' (emprendedor)
 * @param {boolean} isCurrentPlan - Solo para variant='panel', indica si es el plan actual
 * @param {boolean} isDiscontinued - Si el plan está descontinuado
 * @param {Function} onSelect - Handler para selección (panel)
 * @param {Function} onCtaClick - Handler para CTA (público)
 * @param {boolean} disabled - Si el botón está deshabilitado
 * @param {number} delay - Delay para animaciones (ms)
 */
const PlanCard = ({
  plan,
  variant = 'public',
  isCurrentPlan = false,
  isDiscontinued = false,
  onSelect,
  onCtaClick,
  disabled = false,
  delay = 0,
}) => {
  const Icon = PLAN_ICONS[plan.slug] || Zap
  const isPublic = variant === 'public'

  // Determinar clases del contenedor según variante
  const containerClasses = isPublic
    ? `relative rounded-2xl border-2 p-6 h-full flex flex-col transition-all duration-300 hover:shadow-xl ${
        plan.isFeatured
          ? 'border-blue-500 bg-blue-50/30 shadow-lg scale-[1.02]'
          : PLAN_BORDER_COLORS[plan.slug] || 'border-slate-200 bg-white'
      }`
    : `relative rounded-2xl border-2 transition-all duration-200 ${
        isCurrentPlan
          ? 'border-blue-500 shadow-lg shadow-blue-100'
          : plan.isFeatured
            ? 'border-purple-300 shadow-lg shadow-purple-100'
            : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
      } ${isDiscontinued ? 'opacity-75' : ''} bg-white`

  // Handler del CTA
  const handleCtaClick = () => {
    if (isPublic) {
      onCtaClick?.(plan)
    } else {
      onSelect?.(plan)
    }
  }

  // Texto del CTA según contexto
  const getCtaText = () => {
    if (!isPublic) {
      // Panel emprendedor
      if (isCurrentPlan) {
        return isDiscontinued ? 'Plan actual (no disponible)' : 'Plan actual'
      }
      return plan.price === 0 ? 'Cambiar a Gratis' : 'Mejorar plan'
    }
    // Público / Landing
    return plan.price === 0 ? 'Crear mi tienda gratis' : 'Empezar'
  }

  // Variante del botón
  const getButtonVariant = () => {
    if (!isPublic) {
      return 'primary'
    }
    return plan.isFeatured ? 'primary' : 'secondary'
  }

  // Clase extra del botón para gradientes
  const getButtonClass = () => {
    if (isPublic) return 'w-full'
    
    return `w-full ${
      plan.slug === 'pro'
        ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
        : plan.slug === 'emprendedor'
          ? 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600'
          : ''
    }`
  }

  return (
    <div
      className={containerClasses}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* Badges superiores */}
      {isPublic ? (
        // Landing - Badge "Más popular" centrado arriba
        plan.isFeatured && (
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold rounded-full shadow-lg whitespace-nowrap">
            Más popular
          </div>
        )
      ) : (
        // Panel - Badges a la izquierda
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
      )}

      <div className={isPublic ? 'flex flex-col h-full' : 'p-6'}>
        {/* Header del plan */}
        {isPublic ? (
          // Landing style header
          <div className="mb-4">
            <Badge
              variant={
                plan.slug === 'pro'
                  ? 'amber'
                  : plan.slug === 'emprendedor'
                    ? 'purple'
                    : plan.slug === 'basico'
                      ? 'blue'
                      : 'default'
              }
              size="md"
              className="mb-3"
            >
              {plan.name}
            </Badge>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl md:text-4xl font-bold text-slate-900">
                {plan.price === 0 ? 'Gratis' : `$${plan.price.toLocaleString()}`}
              </span>
              {plan.price > 0 && (
                <span className="text-slate-500 text-sm">/mes</span>
              )}
            </div>
          </div>
        ) : (
          // Panel style header
          <>
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
          </>
        )}

        {/* Descripción (solo landing) */}
        {isPublic && plan.description && (
          <p className="text-sm text-slate-600 mb-4">{plan.description}</p>
        )}

        {/* Lista de características */}
        <ul className={`space-y-3 ${isPublic ? 'mb-6 flex-grow' : 'mb-6'} text-sm`}>
          {/* Productos */}
          <FeatureItem included={true}>
            {isUnlimited(plan.maxProducts)
              ? <><strong className="text-purple-600">Productos ilimitados</strong></>
              : <>Hasta <strong>{plan.maxProducts}</strong> productos</>
            }
          </FeatureItem>

          {/* Categorías (solo mostrar si es relevante) */}
          {plan.maxCategories && (
            <FeatureItem included={true}>
              {isUnlimited(plan.maxCategories)
                ? <><strong className="text-purple-600">Categorías ilimitadas</strong></>
                : <>Hasta <strong>{plan.maxCategories}</strong> categorías</>
              }
            </FeatureItem>
          )}

          {/* Plantillas */}
          <FeatureItem included={true}>
            {isUnlimited(plan.templates)
              ? <><strong className="text-purple-600">Todas las plantillas</strong></>
              : <>{plan.templates} plantilla{plan.templates > 1 ? 's' : ''}</>
            }
          </FeatureItem>

          {/* WhatsApp */}
          <FeatureItem included={plan.features?.whatsappButton !== false}>
            Pedidos por WhatsApp
          </FeatureItem>

          {/* QR Code */}
          <FeatureItem included={plan.features?.qrCode || plan.features?.qr}>
            Código QR personalizado
          </FeatureItem>

          {/* Estadísticas */}
          <FeatureItem included={plan.features?.advancedStats || plan.features?.basicStats || plan.features?.analytics}>
            {plan.features?.advancedStats || plan.features?.analytics ? 'Estadísticas avanzadas' : 'Estadísticas básicas'}
          </FeatureItem>

          {/* IA */}
          <FeatureItem included={plan.features?.ai}>
            IA para descripciones
          </FeatureItem>

          {/* Finanzas */}
          <FeatureItem included={plan.features?.finances}>
            Control de finanzas
          </FeatureItem>

          {/* Recomendaciones (solo panel) */}
          {!isPublic && (
            <FeatureItem included={plan.features?.recommendations}>
              "Te puede interesar"
            </FeatureItem>
          )}

          {/* Multi-catálogo (solo panel) */}
          {!isPublic && plan.features?.multiCatalog && (
            <FeatureItem included={plan.features?.multiCatalog}>
              Multi-catálogo
            </FeatureItem>
          )}

          {/* Marketplace priority (solo panel) */}
          {!isPublic && (
            <FeatureItem included={true}>
              Marketplace ({plan.marketplacePriority || 'baja'})
            </FeatureItem>
          )}

          {/* Remove branding (solo panel y si aplica) */}
          {!isPublic && plan.features?.removeBranding && (
            <FeatureItem included={true} highlight>
              Sin marca EmprendeGo
            </FeatureItem>
          )}

          {/* Soporte prioritario (solo panel y si aplica) */}
          {!isPublic && plan.features?.prioritySupport && (
            <FeatureItem included={true} highlight>
              Soporte prioritario
            </FeatureItem>
          )}
        </ul>

        {/* CTA Button */}
        {!isPublic && isCurrentPlan ? (
          <Button
            variant="secondary"
            className="w-full"
            disabled
          >
            {getCtaText()}
          </Button>
        ) : (
          <Button
            variant={getButtonVariant()}
            className={getButtonClass()}
            onClick={handleCtaClick}
            disabled={disabled || (!isPublic && isCurrentPlan)}
          >
            {getCtaText()}
          </Button>
        )}

        {/* Subtexto bajo CTA (solo landing para planes pagos) */}
        {isPublic && plan.price > 0 && (
          <p className="text-xs text-slate-500 text-center mt-3">
            Empieza gratis y actualiza cuando quieras
          </p>
        )}
      </div>
    </div>
  )
}

export default PlanCard
