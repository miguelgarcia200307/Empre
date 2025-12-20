// ============================================
// subscription.js - Utilidades de suscripción
// ============================================

/**
 * Calcula el tiempo restante de una suscripción
 * @param {string|Date|null} subscriptionEndAt - Fecha de fin de la suscripción
 * @returns {{ days: number, monthsApprox: number, isExpired: boolean, hasSubscription: boolean }}
 */
export const getRemainingTime = (subscriptionEndAt) => {
  if (!subscriptionEndAt) {
    return {
      days: Infinity,
      monthsApprox: Infinity,
      isExpired: false,
      hasSubscription: false,
    }
  }

  const endDate = new Date(subscriptionEndAt)
  const now = new Date()
  const diffMs = endDate.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
  
  return {
    days: diffDays,
    monthsApprox: Math.floor(diffDays / 30),
    isExpired: diffDays <= 0,
    hasSubscription: true,
  }
}

/**
 * Formatea el tiempo restante como texto legible
 * @param {string|Date|null} subscriptionEndAt - Fecha de fin de la suscripción
 * @param {object} options - Opciones de formateo
 * @returns {string}
 */
export const formatRemainingLabel = (subscriptionEndAt, options = {}) => {
  const { shortFormat = false } = options
  const remaining = getRemainingTime(subscriptionEndAt)
  
  // Sin suscripción (plan gratis sin fecha)
  if (!remaining.hasSubscription) {
    return shortFormat ? 'Sin vencimiento' : 'Sin fecha de vencimiento'
  }
  
  // Ya venció
  if (remaining.isExpired) {
    return 'Vencido'
  }
  
  const days = remaining.days
  
  // Menos de 1 día
  if (days < 1) {
    return 'Vence hoy'
  }
  
  // Menos de 7 días (mostrar días exactos)
  if (days < 7) {
    return shortFormat 
      ? `${days}d restantes` 
      : `Te ${days === 1 ? 'queda' : 'quedan'} ${days} día${days !== 1 ? 's' : ''}`
  }
  
  // Menos de 60 días (mostrar días)
  if (days < 60) {
    return shortFormat 
      ? `${days}d restantes` 
      : `Te quedan ${days} días`
  }
  
  // 60+ días (mostrar meses y días opcionales)
  const months = Math.floor(days / 30)
  const extraDays = days % 30
  
  if (shortFormat) {
    return `${months}m restantes`
  }
  
  if (extraDays > 0 && extraDays >= 7) {
    return `Te quedan ${months} mes${months !== 1 ? 'es' : ''} y ${extraDays} días`
  }
  
  return `Te quedan ${months} mes${months !== 1 ? 'es' : ''}`
}

/**
 * Determina el estado visual de la suscripción
 * @param {string|Date|null} subscriptionEndAt - Fecha de fin
 * @param {string} subscriptionStatus - Estado de la suscripción (active, expired, cancelled)
 * @returns {{ status: string, color: string, bgColor: string, borderColor: string, icon: string }}
 */
export const getSubscriptionVisualStatus = (subscriptionEndAt, subscriptionStatus = 'active') => {
  const remaining = getRemainingTime(subscriptionEndAt)
  
  // Estado expired o cancelled desde DB
  if (subscriptionStatus === 'expired' || remaining.isExpired) {
    return {
      status: 'expired',
      label: 'Vencido',
      color: 'text-rose-700',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-200',
      icon: 'alert-circle',
    }
  }
  
  if (subscriptionStatus === 'cancelled') {
    return {
      status: 'cancelled',
      label: 'Cancelado',
      color: 'text-gray-700',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      icon: 'x-circle',
    }
  }
  
  // Sin fecha de fin (plan gratis)
  if (!remaining.hasSubscription) {
    return {
      status: 'free',
      label: 'Sin vencimiento',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      icon: 'infinity',
    }
  }
  
  // Por vencer pronto (7 días o menos)
  if (remaining.days <= 7) {
    return {
      status: 'expiring-soon',
      label: 'Vence pronto',
      color: 'text-amber-700',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      icon: 'alert-triangle',
    }
  }
  
  // Por vencer en 30 días
  if (remaining.days <= 30) {
    return {
      status: 'expiring',
      label: formatRemainingLabel(subscriptionEndAt, { shortFormat: true }),
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-100',
      icon: 'clock',
    }
  }
  
  // Activo y con tiempo
  return {
    status: 'active',
    label: formatRemainingLabel(subscriptionEndAt, { shortFormat: true }),
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    icon: 'check-circle',
  }
}

/**
 * Calcula la fecha de fin basada en una duración
 * @param {Date|string} startDate - Fecha de inicio
 * @param {number} months - Duración en meses
 * @returns {Date}
 */
export const calculateEndDate = (startDate, months) => {
  const start = new Date(startDate)
  const end = new Date(start)
  end.setMonth(end.getMonth() + months)
  return end
}

/**
 * Formatea una fecha para input type="date"
 * @param {Date|string|null} date 
 * @returns {string} - Formato YYYY-MM-DD
 */
export const formatDateForInput = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return d.toISOString().split('T')[0]
}

/**
 * Formatea una fecha para mostrar al usuario
 * @param {Date|string|null} date 
 * @returns {string} - Formato DD/MM/YYYY
 */
export const formatDateDisplay = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

/**
 * Valida las fechas de suscripción
 * @param {string} plan - Plan seleccionado
 * @param {Date|string} startAt - Fecha de inicio
 * @param {Date|string|null} endAt - Fecha de fin
 * @returns {{ isValid: boolean, error: string|null }}
 */
export const validateSubscriptionDates = (plan, startAt, endAt) => {
  // Plan gratis no requiere validación de fechas
  if (plan === 'gratis') {
    return { isValid: true, error: null }
  }
  
  // Planes de pago requieren fecha de fin
  if (!endAt) {
    return { isValid: false, error: 'Los planes de pago requieren fecha de fin' }
  }
  
  const start = new Date(startAt)
  const end = new Date(endAt)
  
  if (end <= start) {
    return { isValid: false, error: 'La fecha de fin debe ser posterior a la de inicio' }
  }
  
  // Validar que no sea más de 5 años en el futuro
  const maxDate = new Date()
  maxDate.setFullYear(maxDate.getFullYear() + 5)
  
  if (end > maxDate) {
    return { isValid: false, error: 'La fecha de fin no puede ser mayor a 5 años' }
  }
  
  return { isValid: true, error: null }
}

/**
 * Opciones de duración predefinidas
 */
export const DURATION_OPTIONS = [
  { value: 1, label: '1 mes', shortLabel: '1m' },
  { value: 3, label: '3 meses', shortLabel: '3m' },
  { value: 6, label: '6 meses', shortLabel: '6m' },
  { value: 12, label: '12 meses', shortLabel: '1 año' },
]

/**
 * Construye un objeto de suscripción desde los datos del store
 * @param {object} store - Datos del store
 * @returns {object}
 */
export const buildSubscriptionInfo = (store) => {
  if (!store) {
    return {
      status: 'unknown',
      startAt: null,
      endAt: null,
      remainingLabel: null,
      visualStatus: null,
      isExpired: false,
      isExpiringSoon: false,
      isPaid: false,
    }
  }
  
  const remaining = getRemainingTime(store.subscription_end_at)
  const visual = getSubscriptionVisualStatus(
    store.subscription_end_at, 
    store.subscription_status
  )
  
  return {
    status: store.subscription_status || 'active',
    startAt: store.subscription_start_at,
    endAt: store.subscription_end_at,
    remainingLabel: formatRemainingLabel(store.subscription_end_at),
    remainingDays: remaining.days,
    visualStatus: visual,
    isExpired: remaining.isExpired || store.subscription_status === 'expired',
    isExpiringSoon: remaining.days <= 7 && remaining.days > 0,
    isPaid: store.plan !== 'gratis',
    lastPaidPlan: store.last_paid_plan,
    lastSubscriptionEndAt: store.last_subscription_end_at,
  }
}
