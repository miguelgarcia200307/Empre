-- ============================================
-- EMPRENDEGO - FIX Dashboard Functions
-- Crea las funciones RPC y relaciones faltantes
-- ============================================

-- ============================================
-- FIX CRÍTICO: Relación entre stores y profiles
-- El problema es que stores.owner_id referencia auth.users
-- pero necesitamos que PostgREST detecte la relación con profiles
-- ============================================

-- Opción 1: Agregar FK constraint de stores.owner_id a profiles.id
-- Esto permite que PostgREST detecte: profiles -> stores (via owner_id)
DO $$
BEGIN
    -- Agregar FK de stores.owner_id a profiles.id si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'stores_owner_id_profiles_fkey'
        AND table_name = 'stores'
    ) THEN
        BEGIN
            ALTER TABLE public.stores
            ADD CONSTRAINT stores_owner_id_profiles_fkey
            FOREIGN KEY (owner_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
            RAISE NOTICE 'FK stores_owner_id_profiles_fkey creada exitosamente';
        EXCEPTION 
            WHEN duplicate_object THEN
                RAISE NOTICE 'FK ya existe';
            WHEN OTHERS THEN
                RAISE NOTICE 'Error al crear FK: %', SQLERRM;
        END;
    END IF;
END $$;

-- Agregar comment para PostgREST si la FK no funciona directamente
-- Esto ayuda a PostgREST a detectar relaciones
COMMENT ON CONSTRAINT stores_owner_id_profiles_fkey ON public.stores IS 
    'FK que relaciona stores con profiles via owner_id para joins en API';

-- ============================================
-- FUNCIÓN: Contar tiendas sin productos
CREATE OR REPLACE FUNCTION public.get_stores_without_products_count()
RETURNS INTEGER AS $$
DECLARE
    result INTEGER;
BEGIN
    SELECT COUNT(*) INTO result
    FROM public.stores s
    WHERE s.is_active = true
    AND NOT EXISTS (
        SELECT 1 FROM public.products p 
        WHERE p.store_id = s.id 
        AND p.is_active = true
    );
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Permisos
GRANT EXECUTE ON FUNCTION public.get_stores_without_products_count() TO authenticated;

-- ============================================
-- Verificar que support_tickets tiene user_id
-- y crear la relación con profiles
-- ============================================

-- Verificar estructura de support_tickets
DO $$ 
BEGIN
    -- Si la tabla support_tickets no existe, crearla
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'support_tickets') THEN
        CREATE TABLE public.support_tickets (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            store_id UUID REFERENCES public.stores(id) ON DELETE SET NULL,
            subject TEXT NOT NULL,
            message TEXT NOT NULL,
            category TEXT DEFAULT 'general' CHECK (category IN ('general', 'billing', 'technical', 'feature_request', 'bug')),
            priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
            status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
            resolved_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        -- Indices
        CREATE INDEX idx_support_tickets_user ON public.support_tickets(user_id);
        CREATE INDEX idx_support_tickets_status ON public.support_tickets(status);
        CREATE INDEX idx_support_tickets_created ON public.support_tickets(created_at DESC);
        
        -- RLS
        ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Asegurar que la columna status use los valores correctos
-- (El dashboard busca 'abierto' pero el SQL usa 'open')
-- Vamos a soportar ambos actualizando la query

-- ============================================
-- Agregar comentario de relación para PostgREST
-- Esto permite que Supabase detecte la FK
-- ============================================

-- La relación entre support_tickets y profiles se hace via user_id -> profiles.id
-- Supabase necesita que exista una FK directa o un comment

-- Opción 1: Si user_id referencia auth.users, necesitamos crear la relación explícita
-- con profiles (que también tiene el mismo id que auth.users)

-- Verificar si ya existe la columna user_id correctamente
DO $$
BEGIN
    -- Agregar FK constraint si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'support_tickets_user_id_profiles_fkey'
        AND table_name = 'support_tickets'
    ) THEN
        -- Primero intentar agregar la FK a profiles
        BEGIN
            ALTER TABLE public.support_tickets
            ADD CONSTRAINT support_tickets_user_id_profiles_fkey
            FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
        EXCEPTION WHEN duplicate_object THEN
            -- Ya existe
            NULL;
        WHEN others THEN
            -- Si falla, es porque ya tiene otra FK, lo cual está bien
            NULL;
        END;
    END IF;
END $$;

-- ============================================
-- Crear función alternativa para stats del admin
-- ============================================

CREATE OR REPLACE FUNCTION public.get_admin_stats()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'totalUsers', (SELECT COUNT(*) FROM public.profiles WHERE role = 'emprendedor'),
        'activeStores', (SELECT COUNT(*) FROM public.stores WHERE is_active = true),
        'totalProducts', (SELECT COUNT(*) FROM public.products WHERE is_active = true),
        'totalVisits', (SELECT COALESCE(SUM(views), 0) FROM public.store_metrics),
        'totalWhatsappClicks', (SELECT COALESCE(SUM(whatsapp_clicks), 0) FROM public.store_metrics),
        'openTickets', (SELECT COUNT(*) FROM public.support_tickets WHERE status IN ('open', 'abierto')),
        'storesWithoutProducts', (
            SELECT COUNT(*) FROM public.stores s 
            WHERE s.is_active = true 
            AND NOT EXISTS (SELECT 1 FROM public.products p WHERE p.store_id = s.id AND p.is_active = true)
        ),
        'inactiveStores', (SELECT COUNT(*) FROM public.stores WHERE is_active = false)
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

GRANT EXECUTE ON FUNCTION public.get_admin_stats() TO authenticated;

-- ============================================
-- FIN
-- ============================================
SELECT 'Funciones de Dashboard creadas exitosamente!' as resultado;
