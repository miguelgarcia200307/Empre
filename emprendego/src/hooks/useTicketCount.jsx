import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'

/**
 * Hook para obtener el conteo de tickets nuevos/abiertos
 * - Polling cada 20 segundos
 * - Suscripción a cambios en tiempo real
 * - Manejo de errores con fallback (oculta badge si falla)
 */
export const useTicketCount = () => {
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Función para obtener el conteo
  const fetchCount = useCallback(async () => {
    try {
      // Buscar tickets con status 'open', 'nuevo' o 'abierto' (soportar ambos)
      const { count: ticketCount, error: fetchError } = await supabase
        .from('support_tickets')
        .select('*', { count: 'exact', head: true })
        .in('status', ['open', 'nuevo', 'abierto'])

      if (fetchError) {
        console.warn('Error fetching ticket count:', fetchError)
        setError(fetchError)
        // En caso de error, mantener el último valor válido o 0
        return
      }

      setCount(ticketCount || 0)
      setError(null)
    } catch (err) {
      console.warn('Error in useTicketCount:', err)
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Fetch inicial
    fetchCount()

    // Polling cada 20 segundos
    const pollInterval = setInterval(fetchCount, 20000)

    // Suscripción a Realtime para cambios en support_tickets
    const channel = supabase
      .channel('support_tickets_changes')
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'support_tickets',
        },
        (payload) => {
          // Refetch cuando hay cambios
          fetchCount()
        }
      )
      .subscribe()

    // Cleanup
    return () => {
      clearInterval(pollInterval)
      supabase.removeChannel(channel)
    }
  }, [fetchCount])

  // Retornar 0 si hay error para ocultar el badge
  return {
    count: error ? 0 : count,
    loading,
    error,
    refetch: fetchCount,
  }
}

export default useTicketCount
