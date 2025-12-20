import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from './useAuth'
import { buildSubscriptionInfo } from '../lib/subscription'

const StoreContext = createContext({})

// ============================================
// FEATURE MAP - Mapeo de features a claves de la DB
// ============================================
const FEATURE_MAP = {
  // Formato: 'featureKey': 'key en plan.features de la DB'
  whatsappButton: 'whatsappButton',
  customUrl: 'customUrl',
  marketplace: 'marketplace',
  basicStats: 'basicStats',
  templates: 'templates',
  qrCode: 'qrCode',
  advancedStats: 'advancedStats',
  ai: 'ai',
  finances: 'finances',
  recommendations: 'recommendations',
  multiCatalog: 'multiCatalog',
  customDomain: 'customDomain',
  removeBranding: 'removeBranding',
  prioritySupport: 'prioritySupport',
  welcomeMessage: 'welcomeMessage',
}

// Plan fallback cuando no hay plan en DB
const DEFAULT_PLAN = {
  id: 'gratis',
  slug: 'gratis',
  name: 'Gratuito',
  description: 'Plan gratuito por defecto',
  price: 0,
  maxProducts: 10,
  maxCategories: 3,
  templates: 1,
  marketplacePriority: 'baja',
  isActive: true,
  isFeatured: false,
  features: {
    whatsappButton: true,
    customUrl: true,
    marketplace: true,
    basicStats: true,
    qrCode: false,
    advancedStats: false,
    ai: false,
    finances: false,
    recommendations: false,
    multiCatalog: false,
    customDomain: false,
    removeBranding: false,
    prioritySupport: false,
    welcomeMessage: false,
  },
}

/**
 * Transforma un plan de la DB al formato del frontend
 */
const transformPlan = (dbPlan) => {
  if (!dbPlan) return null
  
  return {
    id: dbPlan.slug,
    dbId: dbPlan.id,
    slug: dbPlan.slug,
    name: dbPlan.name,
    description: dbPlan.description,
    price: dbPlan.price_monthly || 0,
    maxProducts: dbPlan.max_products ?? 10,
    maxCategories: dbPlan.max_categories ?? 3,
    templates: dbPlan.templates ?? 1,
    marketplacePriority: dbPlan.marketplace_priority || 'baja',
    isActive: dbPlan.is_active,
    isFeatured: dbPlan.is_featured,
    sortOrder: dbPlan.sort_order,
    features: dbPlan.features || {},
    createdAt: dbPlan.created_at,
    updatedAt: dbPlan.updated_at,
  }
}

export const StoreProvider = ({ children }) => {
  const { user, loading: authLoading } = useAuth()
  const [store, setStore] = useState(null)
  const [plan, setPlan] = useState(DEFAULT_PLAN)
  const [allPlans, setAllPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [planLoading, setPlanLoading] = useState(false)

  // ============================================
  // FETCH PLAN (dinámico desde DB)
  // ============================================
  const fetchPlan = useCallback(async (planSlug) => {
    if (!planSlug) {
      setPlan(DEFAULT_PLAN)
      return
    }

    setPlanLoading(true)
    try {
      // Obtener plan desde Supabase (incluir inactivos para plan actual del user)
      const { data: planData, error: planError } = await supabase
        .from('plans')
        .select('*')
        .eq('slug', planSlug)
        .single()

      if (planError) {
        // Si el plan no existe en DB, usar default
        if (planError.code === 'PGRST116') {
          console.warn(`Plan '${planSlug}' no encontrado en DB, usando default`)
          setPlan(DEFAULT_PLAN)
        } else {
          console.error('Error fetching plan:', planError)
          setPlan(DEFAULT_PLAN)
        }
        return
      }

      const transformedPlan = transformPlan(planData)
      setPlan(transformedPlan || DEFAULT_PLAN)
    } catch (error) {
      console.error('Error fetching plan:', error)
      setPlan(DEFAULT_PLAN)
    } finally {
      setPlanLoading(false)
    }
  }, [])

  // ============================================
  // FETCH STORE + PLAN
  // ============================================
  const fetchStore = useCallback(async () => {
    if (!user) {
      setStore(null)
      setPlan(DEFAULT_PLAN)
      setLoading(false)
      return
    }
    
    setLoading(true)
    try {
      // 1. Obtener tienda del usuario
      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .select('*')
        .eq('owner_id', user.id)
        .maybeSingle()
      
      if (storeError && storeError.code !== 'PGRST116') {
        console.error('Error fetching store:', storeError)
      }
      
      if (storeData) {
        setStore(storeData)
        localStorage.setItem('emprendego_store_id', storeData.id)
        
        // 2. Obtener plan REAL desde la tabla plans
        await fetchPlan(storeData.plan)
      } else {
        localStorage.removeItem('emprendego_store_id')
        setStore(null)
        setPlan(DEFAULT_PLAN)
      }
    } catch (error) {
      console.error('Error fetching store:', error)
    } finally {
      setLoading(false)
    }
  }, [user, fetchPlan])

  // ============================================
  // FETCH ALL PLANS (para página de planes)
  // ============================================
  const fetchAllPlans = useCallback(async (includeInactive = false) => {
    try {
      let query = supabase
        .from('plans')
        .select('*')
        .order('sort_order', { ascending: true })

      if (!includeInactive) {
        query = query.eq('is_active', true)
      }

      const { data, error } = await query

      if (error) throw error

      const transformed = (data || []).map(transformPlan)
      setAllPlans(transformed)
      return transformed
    } catch (error) {
      console.error('Error fetching all plans:', error)
      return []
    }
  }, [])

  // ============================================
  // EFECTOS
  // ============================================
  useEffect(() => {
    if (authLoading) return
    
    if (user) {
      fetchStore()
    } else {
      setStore(null)
      setPlan(DEFAULT_PLAN)
      setLoading(false)
    }
  }, [user, authLoading, fetchStore])

  // Suscripción a cambios en el plan (Realtime)
  useEffect(() => {
    if (!store?.plan) return

    const channel = supabase
      .channel('store_plan_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'plans',
          filter: `slug=eq.${store.plan}`,
        },
        (payload) => {
          console.log('Plan updated via Realtime:', payload)
          // Refetch plan cuando el admin lo modifica
          fetchPlan(store.plan)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [store?.plan, fetchPlan])

  // ============================================
  // CRUD OPERATIONS
  // ============================================
  const createStore = async (storeData) => {
    if (!user) return { data: null, error: new Error('No autenticado') }
    
    try {
      const { data, error } = await supabase
        .from('stores')
        .insert({
          ...storeData,
          owner_id: user.id,
          plan: 'gratis', // Siempre empezar con plan gratuito
          created_at: new Date().toISOString(),
        })
        .select()
        .single()
      
      if (error) throw error
      
      setStore(data)
      localStorage.setItem('emprendego_store_id', data.id)
      await fetchPlan('gratis')
      
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const updateStore = async (updates) => {
    if (!store) return { data: null, error: new Error('No hay tienda') }
    
    try {
      const { data, error } = await supabase
        .from('stores')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', store.id)
        .select()
        .single()
      
      if (error) throw error
      
      setStore(data)
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const changePlan = async (newPlanSlug) => {
    if (!store) return { data: null, error: new Error('No hay tienda') }
    
    try {
      const { data, error } = await supabase
        .from('stores')
        .update({
          plan: newPlanSlug,
          plan_changed_at: new Date().toISOString(),
        })
        .eq('id', store.id)
        .select()
        .single()
      
      if (error) throw error
      
      setStore(data)
      // Fetch el nuevo plan desde DB
      await fetchPlan(newPlanSlug)
      
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  // ============================================
  // PERMISSION HELPERS (Dinámicos desde DB)
  // ============================================
  
  /**
   * Verifica si el plan actual tiene un feature específico
   * @param {string} featureName - Nombre del feature (qrCode, finances, ai, etc.)
   * @returns {boolean}
   */
  const hasFeature = useCallback((featureName) => {
    const featureKey = FEATURE_MAP[featureName] || featureName
    const featureValue = plan.features?.[featureKey]
    
    // Si es boolean, retornarlo directamente
    if (typeof featureValue === 'boolean') return featureValue
    // Si es -1, significa ilimitado (permitido)
    if (featureValue === -1) return true
    // Si es número > 0, significa permitido con límite
    if (typeof featureValue === 'number' && featureValue > 0) return true
    // Si no existe o es null/undefined, no tiene el feature
    return false
  }, [plan.features])

  /**
   * Verifica si puede agregar un producto basándose en el límite del plan
   * @param {number} currentCount - Cantidad actual de productos
   * @returns {boolean}
   */
  const canAddProduct = useCallback((currentCount) => {
    const maxProducts = plan.maxProducts
    // -1 significa ilimitado
    if (maxProducts === -1) return true
    return currentCount < maxProducts
  }, [plan.maxProducts])

  /**
   * Verifica si puede agregar una categoría basándose en el límite del plan
   * @param {number} currentCount - Cantidad actual de categorías
   * @returns {boolean}
   */
  const canAddCategory = useCallback((currentCount) => {
    const maxCategories = plan.maxCategories
    // -1 significa ilimitado
    if (maxCategories === -1) return true
    return currentCount < maxCategories
  }, [plan.maxCategories])

  /**
   * Alias para hasFeature, más semántico para módulos completos
   * @param {string} moduleName - Nombre del módulo (qrCode, finances, etc.)
   * @returns {boolean}
   */
  const canUse = useCallback((moduleName) => {
    return hasFeature(moduleName)
  }, [hasFeature])

  /**
   * Obtiene información del límite de un recurso
   * @param {string} resourceType - 'products' | 'categories' | 'templates'
   * @returns {{ max: number, isUnlimited: boolean }}
   */
  const getLimit = useCallback((resourceType) => {
    const limitMap = {
      products: plan.maxProducts,
      categories: plan.maxCategories,
      templates: plan.templates,
    }
    const limit = limitMap[resourceType] ?? 0
    return {
      max: limit,
      isUnlimited: limit === -1,
    }
  }, [plan])

  /**
   * Verifica múltiples features a la vez
   * @param {string[]} features - Array de nombres de features
   * @returns {Object.<string, boolean>}
   */
  const checkFeatures = useCallback((features) => {
    return features.reduce((acc, feature) => {
      acc[feature] = hasFeature(feature)
      return acc
    }, {})
  }, [hasFeature])

  // ============================================
  // MEMOIZED VALUES
  // ============================================
  const permissions = useMemo(() => ({
    qrCode: hasFeature('qrCode'),
    finances: hasFeature('finances'),
    ai: hasFeature('ai'),
    advancedStats: hasFeature('advancedStats'),
    basicStats: hasFeature('basicStats'),
    recommendations: hasFeature('recommendations'),
    multiCatalog: hasFeature('multiCatalog'),
    customDomain: hasFeature('customDomain'),
    removeBranding: hasFeature('removeBranding'),
    prioritySupport: hasFeature('prioritySupport'),
    marketplace: hasFeature('marketplace'),
  }), [hasFeature])

  const limits = useMemo(() => ({
    products: getLimit('products'),
    categories: getLimit('categories'),
    templates: getLimit('templates'),
  }), [getLimit])

  // ============================================
  // SUBSCRIPTION INFO (Memoized)
  // ============================================
  const subscription = useMemo(() => buildSubscriptionInfo(store), [store])

  // ============================================
  // CONTEXT VALUE
  // ============================================
  const value = useMemo(() => ({
    // State
    store,
    loading,
    plan,
    planLoading,
    allPlans,
    
    // Boolean helpers
    hasStore: !!store,
    
    // CRUD
    createStore,
    updateStore,
    changePlan,
    fetchStore,
    fetchAllPlans,
    
    // Permission helpers (DINÁMICOS)
    hasFeature,
    canAddProduct,
    canAddCategory,
    canUse,
    getLimit,
    checkFeatures,
    
    // Pre-computed permissions
    permissions,
    limits,
    
    // Subscription info
    subscription,
  }), [
    store,
    loading,
    plan,
    planLoading,
    allPlans,
    hasFeature,
    canAddProduct,
    canAddCategory,
    canUse,
    getLimit,
    checkFeatures,
    permissions,
    limits,
    subscription,
    fetchStore,
    fetchAllPlans,
  ])

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  )
}

export const useStore = () => {
  const context = useContext(StoreContext)
  if (!context) {
    throw new Error('useStore debe usarse dentro de StoreProvider')
  }
  return context
}
