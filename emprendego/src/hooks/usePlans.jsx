import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'

/**
 * Hook para obtener planes dinámicos desde Supabase
 * 
 * Características:
 * - Obtiene planes activos ordenados por sort_order
 * - Suscripción a cambios en tiempo real
 * - Cache básico con refetch al entrar a la página
 * - Manejo de estados loading/error
 */
export const usePlans = () => {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Obtener todos los planes activos
  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('plans')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })

      if (fetchError) throw fetchError

      // Transformar datos para compatibilidad con el frontend
      const transformedPlans = (data || []).map(plan => ({
        id: plan.slug, // Usar slug como id para compatibilidad
        dbId: plan.id, // ID real de la base de datos
        slug: plan.slug,
        name: plan.name,
        description: plan.description,
        price: plan.price_monthly,
        maxProducts: plan.max_products,
        maxCategories: plan.max_categories,
        templates: plan.templates,
        marketplacePriority: plan.marketplace_priority,
        isActive: plan.is_active,
        isFeatured: plan.is_featured,
        sortOrder: plan.sort_order,
        features: plan.features || {},
        createdAt: plan.created_at,
      }))

      setPlans(transformedPlans)
    } catch (err) {
      console.error('Error fetching plans:', err)
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Obtener un plan específico por slug (incluyendo inactivos para plan actual)
  const getPlanBySlug = useCallback(async (slug) => {
    if (!slug) return null

    try {
      const { data, error: fetchError } = await supabase
        .from('plans')
        .select('*')
        .eq('slug', slug)
        .single()

      if (fetchError) {
        // Si no existe en DB, retornar null
        if (fetchError.code === 'PGRST116') return null
        throw fetchError
      }

      if (!data) return null

      // Transformar para compatibilidad
      return {
        id: data.slug,
        dbId: data.id,
        slug: data.slug,
        name: data.name,
        description: data.description,
        price: data.price_monthly,
        maxProducts: data.max_products,
        maxCategories: data.max_categories,
        templates: data.templates,
        marketplacePriority: data.marketplace_priority,
        isActive: data.is_active,
        isFeatured: data.is_featured,
        sortOrder: data.sort_order,
        features: data.features || {},
      }
    } catch (err) {
      console.error('Error fetching plan by slug:', err)
      return null
    }
  }, [])

  // Efecto inicial y suscripción a cambios
  useEffect(() => {
    fetchPlans()

    // Suscripción a cambios en tiempo real
    const channel = supabase
      .channel('plans_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'plans',
        },
        () => {
          // Refetch cuando hay cambios
          fetchPlans()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchPlans])

  // Helpers
  const getActivePlans = () => plans.filter(p => p.isActive)
  
  const getFeaturedPlan = () => plans.find(p => p.isFeatured && p.isActive)

  const getPlanById = (id) => plans.find(p => p.id === id || p.slug === id)

  return {
    plans,
    loading,
    error,
    refetch: fetchPlans,
    getActivePlans,
    getFeaturedPlan,
    getPlanById,
    getPlanBySlug,
  }
}

export default usePlans
