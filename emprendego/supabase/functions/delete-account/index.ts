// ============================================
// EDGE FUNCTION: delete-account
// Elimina permanentemente la cuenta del usuario autenticado
// ============================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ============================================
// CORS SEGURO - Solo dominios permitidos
// ============================================
const ALLOWED_ORIGINS = [
  'https://emprendego.shop',
  'https://www.emprendego.shop',
  // Descomentar solo para desarrollo local:
  // 'http://localhost:5173',
  // 'http://localhost:3000',
]

function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('origin') || ''
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req)
  
  // Handle CORS preflight - MUST return 200 status for browsers
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      status: 200,
      headers: corsHeaders
    })
  }

  // Validar origin en requests POST
  const origin = req.headers.get('origin') || ''
  if (!ALLOWED_ORIGINS.includes(origin)) {
    return new Response(
      JSON.stringify({ error: 'Origin no permitido' }),
      { 
        status: 403, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }

  try {
    // 1. Validar token de autorización
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Token de autorización requerido' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const token = authHeader.replace('Bearer ', '')

    // 2. Crear cliente admin con SERVICE_ROLE
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // 3. Verificar el token y obtener el usuario
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Token inválido o expirado' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const userId = user.id

    // 4. (Opcional) Obtener stores para limpiar Storage si aplica
    // const { data: stores } = await supabaseAdmin
    //   .from('stores')
    //   .select('id, slug')
    //   .eq('owner_id', userId)
    
    // TODO: Si usas Storage, eliminar archivos del bucket aquí
    // for (const store of stores || []) {
    //   await supabaseAdmin.storage.from('stores').remove([`${store.id}/*`])
    // }

    // 5. Eliminar usuario de Auth (CASCADE borrará profiles, stores, y tablas dependientes)
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (deleteError) {
      console.error('Error eliminando usuario:', deleteError)
      return new Response(
        JSON.stringify({ error: 'Error al eliminar la cuenta' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // 6. Éxito
    return new Response(
      JSON.stringify({ ok: true, message: 'Cuenta eliminada exitosamente' }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error en delete-account:', error)
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
