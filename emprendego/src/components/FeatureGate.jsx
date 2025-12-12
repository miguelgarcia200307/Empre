import { Link } from 'react-router-dom'
import { useStore } from '../hooks/useStore'
import { Card, Button } from './ui'
import { Lock, Sparkles, Crown } from 'lucide-react'

/**
 * FeatureGate - Componente para controlar acceso a features según el plan
 * 
 * Uso:
 * <FeatureGate feature="qrCode">
 *   <ContenidoProtegido />
 * </FeatureGate>
 * 
 * <FeatureGate feature="finances" fallback={<MiComponenteBlocked />}>
 *   <ModuloFinanzas />
 * </FeatureGate>
 */

// Configuración de features para mostrar en el bloqueo
const FEATURE_CONFIG = {
  templates: {
    title: 'Plantillas Prediseñadas',
    description: 'Elige entre plantillas profesionales diseñadas para tu industria y personalízalas con tus colores.',
    icon: Sparkles,
    minPlan: 'Básico',
  },
  qrCode: {
    title: 'Código QR Dinámico',
    description: 'Genera códigos QR personalizados para compartir tu tienda en redes, tarjetas de presentación o flyers.',
    icon: Sparkles,
    minPlan: 'Básico',
  },
  finances: {
    title: 'Módulo de Finanzas',
    description: 'Lleva un control detallado de tus ingresos y gastos, con gráficos y reportes para tomar mejores decisiones.',
    icon: Crown,
    minPlan: 'Emprendedor',
  },
  ai: {
    title: 'Asistente con IA',
    description: 'Genera títulos y descripciones atractivas para tus productos con inteligencia artificial.',
    icon: Sparkles,
    minPlan: 'Emprendedor',
  },
  advancedStats: {
    title: 'Estadísticas Avanzadas',
    description: 'Accede a análisis detallados de productos más vistos, tendencias de ventas y comportamiento de clientes.',
    icon: Crown,
    minPlan: 'Básico',
  },
  recommendations: {
    title: 'Sistema de Recomendaciones',
    description: 'Muestra "Te puede interesar" a tus clientes para aumentar las ventas cruzadas.',
    icon: Sparkles,
    minPlan: 'Emprendedor',
  },
  multiCatalog: {
    title: 'Multi-catálogo',
    description: 'Crea catálogos especiales como Ofertas, Novedades o colecciones estacionales.',
    icon: Crown,
    minPlan: 'Emprendedor',
  },
  customDomain: {
    title: 'Dominio Personalizado',
    description: 'Conecta tu propio dominio (mitienda.com) para una presencia más profesional.',
    icon: Crown,
    minPlan: 'Pro',
  },
  removeBranding: {
    title: 'Sin Marca EmprendeGo',
    description: 'Elimina el branding de EmprendeGo de tu tienda para una experiencia 100% personalizada.',
    icon: Crown,
    minPlan: 'Pro',
  },
  prioritySupport: {
    title: 'Soporte Prioritario',
    description: 'Recibe atención preferencial con tiempos de respuesta más rápidos.',
    icon: Crown,
    minPlan: 'Pro',
  },
  welcomeMessage: {
    title: 'Mensaje de Bienvenida',
    description: 'Personaliza el mensaje que aparece en tu tienda para dar una mejor primera impresión a tus clientes.',
    icon: Sparkles,
    minPlan: 'Básico',
  },
}

/**
 * Pantalla de bloqueo elegante
 */
const LockedScreen = ({ feature, config, showCard = true }) => {
  const Icon = config?.icon || Lock
  
  const content = (
    <div className="text-center py-8 px-4">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center mx-auto mb-4">
        <Lock className="w-8 h-8 text-amber-600" />
      </div>
      
      <h2 className="text-xl font-bold text-gray-900 mb-2">
        {config?.title || 'Función Premium'}
      </h2>
      
      <p className="text-gray-600 max-w-md mx-auto mb-4">
        {config?.description || 'Esta función no está disponible en tu plan actual.'}
      </p>
      
      {config?.minPlan && (
        <p className="text-sm text-gray-500 mb-6">
          Disponible desde el plan <span className="font-semibold text-amber-600">{config.minPlan}</span>
        </p>
      )}
      
      <Link to="/panel/plan">
        <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
          <Icon className="w-4 h-4 mr-2" />
          Mejorar mi plan
        </Button>
      </Link>
    </div>
  )

  if (showCard) {
    return <Card>{content}</Card>
  }
  
  return content
}

/**
 * Componente principal FeatureGate
 * 
 * @param {Object} props
 * @param {string} props.feature - Nombre del feature a verificar
 * @param {React.ReactNode} props.children - Contenido a mostrar si tiene acceso
 * @param {React.ReactNode} [props.fallback] - Contenido alternativo si no tiene acceso
 * @param {boolean} [props.showLocked=true] - Si mostrar pantalla de bloqueo o nada
 * @param {boolean} [props.showCard=true] - Si envolver en Card la pantalla de bloqueo
 */
const FeatureGate = ({ 
  feature, 
  children, 
  fallback = null, 
  showLocked = true,
  showCard = true,
}) => {
  const { hasFeature, loading } = useStore()
  
  // Mientras carga, no mostrar nada
  if (loading) {
    return null
  }
  
  // Si tiene el feature, mostrar contenido
  if (hasFeature(feature)) {
    return children
  }
  
  // Si hay fallback personalizado, usarlo
  if (fallback) {
    return fallback
  }
  
  // Si no debe mostrar bloqueo, no renderizar nada
  if (!showLocked) {
    return null
  }
  
  // Mostrar pantalla de bloqueo
  const config = FEATURE_CONFIG[feature]
  return <LockedScreen feature={feature} config={config} showCard={showCard} />
}

/**
 * Hook para usar FeatureGate de forma programática
 */
export const useFeatureAccess = (feature) => {
  const { hasFeature, loading, plan } = useStore()
  
  return {
    hasAccess: hasFeature(feature),
    loading,
    currentPlan: plan,
    config: FEATURE_CONFIG[feature],
  }
}

/**
 * Componente para mostrar badge de "PRO" o plan requerido
 */
export const FeatureBadge = ({ feature, className = '' }) => {
  const config = FEATURE_CONFIG[feature]
  
  if (!config?.minPlan) return null
  
  return (
    <span className={`
      px-1.5 py-0.5 text-xs font-medium rounded
      bg-amber-100 text-amber-700
      ${className}
    `}>
      {config.minPlan}
    </span>
  )
}

/**
 * Componente para mostrar icono de candado inline
 */
export const FeatureLock = ({ feature, className = '' }) => {
  const { hasFeature } = useStore()
  
  if (hasFeature(feature)) return null
  
  return (
    <Lock className={`w-4 h-4 text-gray-400 ${className}`} />
  )
}

export default FeatureGate
