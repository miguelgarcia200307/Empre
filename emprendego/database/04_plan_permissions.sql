-- ============================================
-- EMPRENDEGO - Script para Plan Permissions System
-- Ejecutar después de 01_admin_setup.sql
-- ============================================

-- =============================================
-- PARTE 1: Verificar y actualizar estructura de plans
-- =============================================

-- Asegurarse de que la tabla plans tiene todos los campos necesarios
-- (Si ya existen, no hace nada)
DO $$
BEGIN
    -- Verificar que features es JSONB
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'plans' AND column_name = 'features' AND data_type = 'jsonb'
    ) THEN
        ALTER TABLE public.plans 
        ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '{}'::jsonb;
    END IF;
END $$;

-- =============================================
-- PARTE 2: Insertar/Actualizar planes oficiales
-- =============================================

-- Plan Gratuito
INSERT INTO public.plans (slug, name, description, price_monthly, max_products, max_categories, templates, marketplace_priority, is_active, is_featured, sort_order, features)
VALUES (
    'gratis',
    'Gratuito',
    'Perfecto para empezar tu negocio online',
    0,
    10,
    3,
    1,
    'baja',
    true,
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
)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price_monthly = EXCLUDED.price_monthly,
    max_products = EXCLUDED.max_products,
    max_categories = EXCLUDED.max_categories,
    templates = EXCLUDED.templates,
    marketplace_priority = EXCLUDED.marketplace_priority,
    sort_order = EXCLUDED.sort_order,
    features = EXCLUDED.features,
    updated_at = NOW();

-- Plan Básico
INSERT INTO public.plans (slug, name, description, price_monthly, max_products, max_categories, templates, marketplace_priority, is_active, is_featured, sort_order, features)
VALUES (
    'basico',
    'Básico',
    'Ideal para negocios en crecimiento',
    10000,
    50,
    10,
    3,
    'media',
    true,
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
)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price_monthly = EXCLUDED.price_monthly,
    max_products = EXCLUDED.max_products,
    max_categories = EXCLUDED.max_categories,
    templates = EXCLUDED.templates,
    marketplace_priority = EXCLUDED.marketplace_priority,
    sort_order = EXCLUDED.sort_order,
    features = EXCLUDED.features,
    updated_at = NOW();

-- Plan Emprendedor
INSERT INTO public.plans (slug, name, description, price_monthly, max_products, max_categories, templates, marketplace_priority, is_active, is_featured, sort_order, features)
VALUES (
    'emprendedor',
    'Emprendedor',
    'Todo lo que necesitas para vender más',
    15000,
    -1,  -- Ilimitados
    -1,  -- Ilimitadas
    -1,  -- Todas las plantillas
    'alta',
    true,
    true,  -- Plan recomendado
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

-- Plan Pro
INSERT INTO public.plans (slug, name, description, price_monthly, max_products, max_categories, templates, marketplace_priority, is_active, is_featured, sort_order, features)
VALUES (
    'pro',
    'Pro',
    'Para los más exigentes, todo al máximo',
    20000,
    -1,
    -1,
    -1,
    'maxima',
    true,
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
    sort_order = EXCLUDED.sort_order,
    features = EXCLUDED.features,
    updated_at = NOW();

-- =============================================
-- PARTE 3: Políticas RLS para plans (lectura pública)
-- =============================================

ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede ver los planes (necesario para el frontend)
DROP POLICY IF EXISTS "Anyone can read plans" ON public.plans;
CREATE POLICY "Anyone can read plans" ON public.plans 
FOR SELECT USING (true);

-- Solo admins pueden modificar planes (usa función existente de 02_fix_rls_policies.sql)
-- Si la función no existe, la creamos
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Dar permisos de ejecución
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon;

DROP POLICY IF EXISTS "Admins can insert plans" ON public.plans;
CREATE POLICY "Admins can insert plans" ON public.plans 
FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update plans" ON public.plans;
CREATE POLICY "Admins can update plans" ON public.plans 
FOR UPDATE USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete plans" ON public.plans;
CREATE POLICY "Admins can delete plans" ON public.plans 
FOR DELETE USING (public.is_admin());

-- =============================================
-- PARTE 4: Función para verificar permisos (opcional, para uso en RPC)
-- =============================================

CREATE OR REPLACE FUNCTION check_store_feature(store_uuid UUID, feature_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    plan_slug TEXT;
    plan_features JSONB;
    feature_value JSONB;
BEGIN
    -- Obtener el slug del plan de la tienda
    SELECT plan INTO plan_slug 
    FROM public.stores 
    WHERE id = store_uuid;
    
    IF plan_slug IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Obtener los features del plan
    SELECT features INTO plan_features 
    FROM public.plans 
    WHERE slug = plan_slug;
    
    IF plan_features IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Verificar el feature específico
    feature_value := plan_features -> feature_name;
    
    -- Retornar true si el valor es true o un número > 0 o -1 (ilimitado)
    IF feature_value IS NULL THEN
        RETURN FALSE;
    ELSIF feature_value::text = 'true' THEN
        RETURN TRUE;
    ELSIF feature_value::text = '-1' THEN
        RETURN TRUE;
    ELSIF feature_value::text ~ '^[0-9]+$' AND (feature_value::text)::int > 0 THEN
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- PARTE 5: Habilitar Realtime para plans
-- =============================================

-- Habilitar realtime en la tabla plans para que los cambios
-- del admin se reflejen instantáneamente en el frontend
ALTER PUBLICATION supabase_realtime ADD TABLE public.plans;

-- =============================================
-- FIN DEL SCRIPT
-- =============================================
SELECT 'Plan Permissions System configurado exitosamente!' as resultado;
