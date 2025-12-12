-- ============================================
-- EMPRENDEGO - Panel Administrador (Setup SQL)
-- Este script agrega las tablas y datos necesarios
-- para el Panel Administrador
-- ============================================

-- =============================================
-- PARTE 1: TABLAS ADICIONALES
-- =============================================

-- TABLA: plans (Planes dinámicos gestionados desde admin)
CREATE TABLE IF NOT EXISTS public.plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price_monthly INTEGER NOT NULL DEFAULT 0,
    max_products INTEGER DEFAULT 10,
    max_categories INTEGER DEFAULT 3,
    templates INTEGER DEFAULT 1,
    marketplace_priority TEXT DEFAULT 'baja' CHECK (marketplace_priority IN ('baja', 'media', 'alta', 'maxima')),
    features JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_plans_slug ON public.plans(slug);
CREATE INDEX IF NOT EXISTS idx_plans_active ON public.plans(is_active);

-- TABLA: app_settings (Configuración global de la plataforma)
CREATE TABLE IF NOT EXISTS public.app_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT UNIQUE NOT NULL,
    value_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_app_settings_key ON public.app_settings(key);

-- TABLA: support_replies (Respuestas a tickets de soporte)
CREATE TABLE IF NOT EXISTS public.support_replies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_replies_ticket ON public.support_replies(ticket_id);

-- TABLA: marketplace_featured (Tiendas destacadas en Marketplace)
CREATE TABLE IF NOT EXISTS public.marketplace_featured (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    sort_order INTEGER DEFAULT 0,
    featured_until TIMESTAMPTZ,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    UNIQUE(store_id)
);

CREATE INDEX IF NOT EXISTS idx_marketplace_featured_store ON public.marketplace_featured(store_id);

-- =============================================
-- PARTE 2: MODIFICAR TABLA stores PARA PLAN DINÁMICO
-- =============================================

-- Agregar columna plan_id si no existe (referencia a tabla plans)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'stores' AND column_name = 'plan_id'
    ) THEN
        ALTER TABLE public.stores ADD COLUMN plan_id UUID REFERENCES public.plans(id);
    END IF;
END $$;

-- Agregar columna marketplace_hidden para ocultar del marketplace sin desactivar
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'stores' AND column_name = 'marketplace_hidden'
    ) THEN
        ALTER TABLE public.stores ADD COLUMN marketplace_hidden BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Agregar columna moderation_status para estado de moderación
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'stores' AND column_name = 'moderation_status'
    ) THEN
        ALTER TABLE public.stores ADD COLUMN moderation_status TEXT DEFAULT 'approved' 
        CHECK (moderation_status IN ('pending', 'approved', 'rejected', 'review'));
    END IF;
END $$;

-- Agregar columna moderation_reason
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'stores' AND column_name = 'moderation_reason'
    ) THEN
        ALTER TABLE public.stores ADD COLUMN moderation_reason TEXT;
    END IF;
END $$;

-- =============================================
-- PARTE 3: TRIGGERS PARA NUEVAS TABLAS
-- =============================================

DROP TRIGGER IF EXISTS update_plans_updated_at ON public.plans;
CREATE TRIGGER update_plans_updated_at 
    BEFORE UPDATE ON public.plans 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_app_settings_updated_at ON public.app_settings;
CREATE TRIGGER update_app_settings_updated_at 
    BEFORE UPDATE ON public.app_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- PARTE 4: RLS PARA NUEVAS TABLAS
-- =============================================

ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_featured ENABLE ROW LEVEL SECURITY;

-- Políticas para plans (público puede ver planes activos, admin puede gestionar)
DROP POLICY IF EXISTS "Public can view active plans" ON public.plans;
CREATE POLICY "Public can view active plans" ON public.plans 
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admin can manage plans" ON public.plans;
CREATE POLICY "Admin can manage plans" ON public.plans 
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Políticas para app_settings
DROP POLICY IF EXISTS "Public can view settings" ON public.app_settings;
CREATE POLICY "Public can view settings" ON public.app_settings 
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin can manage settings" ON public.app_settings;
CREATE POLICY "Admin can manage settings" ON public.app_settings 
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Políticas para support_replies
DROP POLICY IF EXISTS "Users can view own ticket replies" ON public.support_replies;
CREATE POLICY "Users can view own ticket replies" ON public.support_replies 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.support_tickets 
            WHERE support_tickets.id = support_replies.ticket_id 
            AND support_tickets.user_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Users can reply to own tickets" ON public.support_replies;
CREATE POLICY "Users can reply to own tickets" ON public.support_replies 
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.support_tickets 
            WHERE support_tickets.id = support_replies.ticket_id 
            AND support_tickets.user_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Políticas para marketplace_featured
DROP POLICY IF EXISTS "Public can view featured" ON public.marketplace_featured;
CREATE POLICY "Public can view featured" ON public.marketplace_featured 
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin can manage featured" ON public.marketplace_featured;
CREATE POLICY "Admin can manage featured" ON public.marketplace_featured 
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- =============================================
-- PARTE 5: POLÍTICAS ADMIN PARA TABLAS EXISTENTES
-- =============================================

-- Admin puede ver todos los profiles
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;
CREATE POLICY "Admin can view all profiles" ON public.profiles 
    FOR SELECT USING (
        auth.uid() = id
        OR
        EXISTS (
            SELECT 1 FROM public.profiles p 
            WHERE p.id = auth.uid() 
            AND p.role = 'admin'
        )
    );

-- Admin puede ver todas las tiendas
DROP POLICY IF EXISTS "Admin can view all stores" ON public.stores;
CREATE POLICY "Admin can view all stores" ON public.stores 
    FOR SELECT USING (
        auth.uid() = owner_id
        OR is_active = true
        OR EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Admin puede modificar todas las tiendas
DROP POLICY IF EXISTS "Admin can update all stores" ON public.stores;
CREATE POLICY "Admin can update all stores" ON public.stores 
    FOR UPDATE USING (
        auth.uid() = owner_id
        OR
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Admin puede ver todos los productos
DROP POLICY IF EXISTS "Admin can view all products" ON public.products;
CREATE POLICY "Admin can view all products" ON public.products 
    FOR SELECT USING (
        is_active = true
        OR
        EXISTS (SELECT 1 FROM public.stores WHERE stores.id = products.store_id AND stores.owner_id = auth.uid())
        OR
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Admin puede ver todos los tickets
DROP POLICY IF EXISTS "Admin can view all tickets" ON public.support_tickets;
CREATE POLICY "Admin can view all tickets" ON public.support_tickets 
    FOR SELECT USING (
        user_id = auth.uid()
        OR
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Admin puede actualizar todos los tickets
DROP POLICY IF EXISTS "Admin can update all tickets" ON public.support_tickets;
CREATE POLICY "Admin can update all tickets" ON public.support_tickets 
    FOR UPDATE USING (
        user_id = auth.uid()
        OR
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Admin puede ver todas las métricas
DROP POLICY IF EXISTS "Admin can view all metrics" ON public.store_metrics;
CREATE POLICY "Admin can view all metrics" ON public.store_metrics 
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.stores WHERE stores.id = store_metrics.store_id AND stores.owner_id = auth.uid())
        OR
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- =============================================
-- PARTE 6: SEED DE PLANES OFICIALES
-- =============================================

-- Insertar planes iniciales si no existen
INSERT INTO public.plans (slug, name, description, price_monthly, max_products, max_categories, templates, marketplace_priority, is_featured, sort_order, features) 
VALUES 
    (
        'gratis',
        'Gratuito',
        'Ideal para comenzar tu negocio online sin inversión',
        0,
        10,
        3,
        1,
        'baja',
        false,
        1,
        '{
            "whatsappButton": true,
            "customUrl": true,
            "marketplace": true,
            "basicStats": true,
            "qrCode": false,
            "advancedStats": false,
            "ai": false,
            "finances": false,
            "recommendations": false,
            "multiCatalog": false,
            "customDomain": false,
            "removeBranding": false,
            "prioritySupport": false
        }'::jsonb
    ),
    (
        'basico',
        'Básico',
        'Más productos, estadísticas y herramientas para crecer',
        10000,
        50,
        10,
        3,
        'media',
        false,
        2,
        '{
            "whatsappButton": true,
            "customUrl": true,
            "marketplace": true,
            "basicStats": true,
            "qrCode": true,
            "advancedStats": true,
            "ai": false,
            "finances": false,
            "recommendations": false,
            "multiCatalog": false,
            "customDomain": false,
            "removeBranding": false,
            "prioritySupport": false
        }'::jsonb
    ),
    (
        'emprendedor',
        'Emprendedor',
        'Todas las herramientas para un emprendimiento profesional',
        15000,
        -1,
        -1,
        -1,
        'alta',
        true,
        3,
        '{
            "whatsappButton": true,
            "customUrl": true,
            "marketplace": true,
            "basicStats": true,
            "qrCode": true,
            "advancedStats": true,
            "ai": true,
            "finances": true,
            "recommendations": true,
            "multiCatalog": true,
            "customDomain": false,
            "removeBranding": false,
            "prioritySupport": false
        }'::jsonb
    ),
    (
        'pro',
        'Pro',
        'Máximo rendimiento y funcionalidades premium',
        20000,
        -1,
        -1,
        -1,
        'maxima',
        false,
        4,
        '{
            "whatsappButton": true,
            "customUrl": true,
            "marketplace": true,
            "basicStats": true,
            "qrCode": true,
            "advancedStats": true,
            "ai": true,
            "finances": true,
            "recommendations": true,
            "multiCatalog": true,
            "customDomain": true,
            "removeBranding": true,
            "prioritySupport": true
        }'::jsonb
    )
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price_monthly = EXCLUDED.price_monthly,
    max_products = EXCLUDED.max_products,
    max_categories = EXCLUDED.max_categories,
    templates = EXCLUDED.templates,
    marketplace_priority = EXCLUDED.marketplace_priority,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order,
    features = EXCLUDED.features,
    updated_at = NOW();

-- =============================================
-- PARTE 7: SEED DE APP SETTINGS
-- =============================================

INSERT INTO public.app_settings (key, value_json, description) VALUES
    (
        'branding',
        '{
            "logoUrl": "",
            "primaryColor": "#2563eb",
            "secondaryColor": "#7c3aed",
            "accentColor": "#06b6d4",
            "companyName": "EmprendeGo",
            "tagline": "Tu catálogo digital en minutos",
            "contactEmail": "soporte@emprendego.shop",
            "footerText": "© 2025 EmprendeGo. Todos los derechos reservados."
        }'::jsonb,
        'Configuración de marca y estilo global'
    ),
    (
        'legal',
        '{
            "termsOfService": "# Términos de Servicio\n\nPor favor lee estos términos cuidadosamente...",
            "privacyPolicy": "# Política de Privacidad\n\nTu privacidad es importante para nosotros...",
            "lastUpdated": "2025-01-01"
        }'::jsonb,
        'Textos legales de la plataforma'
    ),
    (
        'marketplace',
        '{
            "enabled": true,
            "title": "Marketplace EmprendeGo",
            "description": "Descubre las mejores tiendas de emprendedores",
            "priorityByPlan": true,
            "showFeaturedFirst": true
        }'::jsonb,
        'Configuración del marketplace'
    )
ON CONFLICT (key) DO NOTHING;

-- =============================================
-- PARTE 8: FUNCIONES HELPER PARA ADMIN
-- =============================================

-- Función para obtener estadísticas globales del dashboard admin
CREATE OR REPLACE FUNCTION get_admin_dashboard_stats()
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
        'newTickets', (SELECT COUNT(*) FROM public.support_tickets WHERE status = 'abierto'),
        'storesWithoutProducts', (
            SELECT COUNT(*) FROM public.stores s 
            WHERE s.is_active = true 
            AND NOT EXISTS (SELECT 1 FROM public.products p WHERE p.store_id = s.id AND p.is_active = true)
        ),
        'inactiveStores', (
            SELECT COUNT(*) FROM public.stores 
            WHERE is_active = false OR moderation_status != 'approved'
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener distribución por planes
CREATE OR REPLACE FUNCTION get_stores_by_plan()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_agg(
        json_build_object(
            'plan', COALESCE(p.name, 'Sin plan'),
            'planSlug', COALESCE(p.slug, 'none'),
            'count', COUNT(s.id)
        )
    ) INTO result
    FROM public.stores s
    LEFT JOIN public.plans p ON s.plan_id = p.id
    WHERE s.is_active = true
    GROUP BY p.id, p.name, p.slug, p.sort_order
    ORDER BY p.sort_order NULLS LAST;
    
    RETURN COALESCE(result, '[]'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener top tiendas
CREATE OR REPLACE FUNCTION get_top_stores(limit_count INTEGER DEFAULT 10)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_agg(row_to_json(t)) INTO result
    FROM (
        SELECT 
            s.id,
            s.name,
            s.slug,
            s.logo_url,
            s.city,
            s.is_active,
            p.name as plan_name,
            COALESCE(SUM(sm.views), 0) as total_views,
            COALESCE(SUM(sm.whatsapp_clicks), 0) as total_clicks,
            (SELECT COUNT(*) FROM public.products WHERE store_id = s.id AND is_active = true) as product_count
        FROM public.stores s
        LEFT JOIN public.plans p ON s.plan_id = p.id
        LEFT JOIN public.store_metrics sm ON s.id = sm.store_id
        WHERE s.is_active = true
        GROUP BY s.id, s.name, s.slug, s.logo_url, s.city, s.is_active, p.name
        ORDER BY total_views DESC, total_clicks DESC
        LIMIT limit_count
    ) t;
    
    RETURN COALESCE(result, '[]'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- PARTE 9: INSTRUCCIONES PARA CREAR ADMIN
-- =============================================

/*
INSTRUCCIONES PARA CREAR USUARIO ADMINISTRADOR:

1. Ve a Supabase Dashboard > Authentication > Users
2. Click en "Add user" > "Create new user"
3. Ingresa:
   - Email: tu-email-admin@ejemplo.com
   - Password: [tu contraseña segura]
   - Auto Confirm User: ✅ Activado

4. Una vez creado, copia el UUID del usuario

5. Ejecuta este SQL (reemplaza el UUID y email):

UPDATE public.profiles 
SET 
    role = 'admin',
    full_name = 'Administrador',
    email = 'tu-email-admin@ejemplo.com'
WHERE id = 'AQUI-VA-EL-UUID-DEL-USUARIO';

-- Si el perfil no existe, créalo:
INSERT INTO public.profiles (id, email, full_name, role)
VALUES (
    'AQUI-VA-EL-UUID-DEL-USUARIO',
    'tu-email-admin@ejemplo.com',
    'Administrador',
    'admin'
)
ON CONFLICT (id) DO UPDATE SET
    role = 'admin',
    full_name = 'Administrador';

NOTA IMPORTANTE: 
- NUNCA expongas credenciales de admin en el código
- Usa variables de entorno para emails sensibles
- El admin entra por el mismo login que los emprendedores
- El sistema detecta el rol y redirige automáticamente
*/

-- =============================================
-- FIN DEL SCRIPT
-- =============================================
SELECT 'Panel Administrador configurado exitosamente!' as resultado;
