// ============================================
// EDGE FUNCTION: expire-subscriptions
// Ejecuta downgrade automático de suscripciones vencidas
// Diseñada para ejecutarse via cron job (cada hora o diariamente)
// ============================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ============================================
// CONFIGURACIÓN
// ============================================

// Plan al que se hace downgrade cuando expira la suscripción
const DOWNGRADE_PLAN = 'gratis'

// Secret key para autorizar el cron job (configurar en Supabase Secrets)
const CRON_SECRET = Deno.env.get('CRON_SECRET')

// ============================================
// CORS para peticiones desde dashboard admin
// ============================================
const ALLOWED_ORIGINS = [
  'https://emprendego.shop',
  'https://www.emprendego.shop',
]

function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('origin') || ''
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cron-secret',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }
}

// ============================================
// FUNCIÓN PRINCIPAL
// ============================================
serve(async (req) => {
  const corsHeaders = getCorsHeaders(req)
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      status: 200,
      headers: corsHeaders
    })
  }

  // Solo permitir POST
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Método no permitido' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }

  try {
    // ========================================
    // AUTENTICACIÓN
    // ========================================
    // Puede autenticarse de 2 formas:
    // 1. Header x-cron-secret para cron jobs
    // 2. Bearer token de admin para ejecución manual

    const cronSecret = req.headers.get('x-cron-secret')
    const authHeader = req.headers.get('Authorization')
    
    let isAuthorized = false
    let triggeredBy = 'unknown'

    // Opción 1: Cron secret
    if (CRON_SECRET && cronSecret === CRON_SECRET) {
      isAuthorized = true
      triggeredBy = 'cron'
    }
    
    // Opción 2: Token de admin (verificar rol)
    if (!isAuthorized && authHeader?.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '')
      
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!
      const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
      
      const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: `Bearer ${token}` } }
      })
      
      const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
      
      if (!userError && user) {
        // Verificar que sea admin
        const { data: userData } = await supabaseClient
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single()
        
        if (userData?.role === 'admin') {
          isAuthorized = true
          triggeredBy = `admin:${user.email || user.id}`
        }
      }
    }

    if (!isAuthorized) {
      return new Response(
        JSON.stringify({ error: 'No autorizado' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // ========================================
    // EJECUTAR EXPIRACIÓN DE SUSCRIPCIONES
    // ========================================
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Buscar tiendas con suscripciones expiradas
    // Condiciones:
    // - subscription_end_at < NOW() (ya venció)
    // - plan != 'gratis' (aún no se ha hecho downgrade)
    // - subscription_status in ('active', null) (no fue cancelada manualmente)
    
    const now = new Date().toISOString()
    
    const { data: expiredStores, error: fetchError } = await supabaseAdmin
      .from('stores')
      .select('id, name, plan, owner_id, subscription_end_at, subscription_status')
      .lt('subscription_end_at', now)
      .neq('plan', DOWNGRADE_PLAN)
      .or('subscription_status.is.null,subscription_status.eq.active')
    
    if (fetchError) {
      console.error('Error fetching expired stores:', fetchError)
      throw new Error(`Error al buscar suscripciones: ${fetchError.message}`)
    }

    if (!expiredStores || expiredStores.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'No hay suscripciones expiradas para procesar',
          processed: 0,
          triggeredBy,
          timestamp: now
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Procesar cada tienda expirada
    const results = {
      success: [] as string[],
      failed: [] as { id: string; error: string }[],
    }

    for (const store of expiredStores) {
      try {
        // Actualizar la tienda: downgrade a plan gratis
        const { error: updateError } = await supabaseAdmin
          .from('stores')
          .update({
            plan: DOWNGRADE_PLAN,
            last_paid_plan: store.plan, // Guardar el plan previo
            subscription_status: 'expired',
            // NO borramos subscription_end_at para historial
          })
          .eq('id', store.id)

        if (updateError) {
          results.failed.push({ 
            id: store.id, 
            error: updateError.message 
          })
          console.error(`Error updating store ${store.id}:`, updateError)
        } else {
          results.success.push(store.id)
          console.log(`Downgraded store ${store.id} (${store.name}) from ${store.plan} to ${DOWNGRADE_PLAN}`)
          
          // Registrar en historial de suscripciones
          await supabaseAdmin
            .from('store_subscriptions')
            .insert({
              store_id: store.id,
              plan_slug: DOWNGRADE_PLAN,
              starts_at: now,
              ends_at: null, // Sin fecha de fin (plan gratis permanente)
              status: 'active',
              created_by: 'system:expire-subscriptions',
              notes: `Auto-downgrade from ${store.plan} (expired on ${store.subscription_end_at})`
            })
        }
      } catch (storeError) {
        results.failed.push({ 
          id: store.id, 
          error: storeError instanceof Error ? storeError.message : 'Unknown error' 
        })
      }
    }

    // ========================================
    // RESPUESTA
    // ========================================
    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Procesadas ${expiredStores.length} suscripciones expiradas`,
        processed: expiredStores.length,
        successful: results.success.length,
        failed: results.failed.length,
        details: {
          successIds: results.success,
          failures: results.failed,
        },
        triggeredBy,
        timestamp: now
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in expire-subscriptions:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
