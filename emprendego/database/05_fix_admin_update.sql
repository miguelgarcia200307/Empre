-- ============================================
-- EMPRENDEGO - Fix Admin Update Stores
-- Ejecutar si el admin no puede actualizar tiendas
-- ============================================

-- PASO 1: CORREGIR EL CHECK CONSTRAINT DEL PLAN
-- El constraint actual solo permite 'gratis' y 'pro', necesitamos agregar 'basico' y 'emprendedor'
ALTER TABLE public.stores DROP CONSTRAINT IF EXISTS stores_plan_check;
ALTER TABLE public.stores ADD CONSTRAINT stores_plan_check 
    CHECK (plan IN ('gratis', 'basico', 'emprendedor', 'pro'));

-- PASO 2: Recrear función is_admin() correctamente
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

-- Dar permisos
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon;

-- PASO 3: Verificar y recrear política de stores para admin
DROP POLICY IF EXISTS "stores_update_policy" ON public.stores;
CREATE POLICY "stores_update_policy" ON public.stores
    FOR UPDATE USING (
        owner_id = auth.uid() 
        OR public.is_admin()
    );

-- PASO 4: Verificar que exista la columna plan_changed_at
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'stores' AND column_name = 'plan_changed_at'
    ) THEN
        ALTER TABLE public.stores 
        ADD COLUMN plan_changed_at TIMESTAMPTZ;
    END IF;
END $$;

SELECT 'Fix aplicado correctamente. Ahora puedes usar los planes: gratis, basico, emprendedor, pro' as resultado;
