-- ============================================
-- EMPRENDEGO - FIX RLS Policies
-- Corrige las políticas de seguridad que causan error 500
-- ============================================

-- PASO 1: Crear función helper que evita referencias circulares
-- Esta función usa SECURITY DEFINER para bypass RLS al verificar rol
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

-- ============================================
-- PASO 2: ELIMINAR POLÍTICAS PROBLEMÁTICAS
-- ============================================

-- Profiles
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Stores
DROP POLICY IF EXISTS "Admin can view all stores" ON public.stores;
DROP POLICY IF EXISTS "Admin can update all stores" ON public.stores;
DROP POLICY IF EXISTS "Anyone can view active stores" ON public.stores;
DROP POLICY IF EXISTS "Users can view own stores" ON public.stores;
DROP POLICY IF EXISTS "Users can insert own stores" ON public.stores;
DROP POLICY IF EXISTS "Users can update own stores" ON public.stores;
DROP POLICY IF EXISTS "Users can delete own stores" ON public.stores;

-- Products
DROP POLICY IF EXISTS "Admin can view all products" ON public.products;
DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;
DROP POLICY IF EXISTS "Store owners can manage products" ON public.products;

-- Support tickets
DROP POLICY IF EXISTS "Admin can view all tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Admin can update all tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Users can view own tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Users can create tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Users can update own tickets" ON public.support_tickets;

-- Store metrics
DROP POLICY IF EXISTS "Admin can view all metrics" ON public.store_metrics;
DROP POLICY IF EXISTS "Store owners can view metrics" ON public.store_metrics;
DROP POLICY IF EXISTS "Anyone can insert metrics" ON public.store_metrics;

-- ============================================
-- PASO 3: RECREAR POLÍTICAS CORRECTAS
-- ============================================

-- ==================
-- PROFILES
-- ==================
-- Ver: propio perfil O si es admin
CREATE POLICY "profiles_select_policy" ON public.profiles
    FOR SELECT USING (
        auth.uid() = id 
        OR public.is_admin()
    );

-- Insertar: solo propio perfil
CREATE POLICY "profiles_insert_policy" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Actualizar: propio perfil O si es admin
CREATE POLICY "profiles_update_policy" ON public.profiles
    FOR UPDATE USING (
        auth.uid() = id 
        OR public.is_admin()
    );

-- ==================
-- STORES
-- ==================
-- Ver: tiendas activas públicas O propias O admin
CREATE POLICY "stores_select_policy" ON public.stores
    FOR SELECT USING (
        is_active = true 
        OR owner_id = auth.uid() 
        OR public.is_admin()
    );

-- Insertar: solo propias
CREATE POLICY "stores_insert_policy" ON public.stores
    FOR INSERT WITH CHECK (owner_id = auth.uid());

-- Actualizar: propias O admin
CREATE POLICY "stores_update_policy" ON public.stores
    FOR UPDATE USING (
        owner_id = auth.uid() 
        OR public.is_admin()
    );

-- Eliminar: propias O admin
CREATE POLICY "stores_delete_policy" ON public.stores
    FOR DELETE USING (
        owner_id = auth.uid() 
        OR public.is_admin()
    );

-- ==================
-- PRODUCTS
-- ==================
-- Ver: productos activos O de tienda propia O admin
CREATE POLICY "products_select_policy" ON public.products
    FOR SELECT USING (
        is_active = true
        OR EXISTS (
            SELECT 1 FROM public.stores 
            WHERE stores.id = products.store_id 
            AND stores.owner_id = auth.uid()
        )
        OR public.is_admin()
    );

-- Insertar: en tiendas propias
CREATE POLICY "products_insert_policy" ON public.products
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.stores 
            WHERE stores.id = products.store_id 
            AND stores.owner_id = auth.uid()
        )
    );

-- Actualizar: en tiendas propias O admin
CREATE POLICY "products_update_policy" ON public.products
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.stores 
            WHERE stores.id = products.store_id 
            AND stores.owner_id = auth.uid()
        )
        OR public.is_admin()
    );

-- Eliminar: en tiendas propias O admin
CREATE POLICY "products_delete_policy" ON public.products
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.stores 
            WHERE stores.id = products.store_id 
            AND stores.owner_id = auth.uid()
        )
        OR public.is_admin()
    );

-- ==================
-- CATEGORIES
-- ==================
DROP POLICY IF EXISTS "Store owners can manage categories" ON public.categories;
DROP POLICY IF EXISTS "Anyone can view categories" ON public.categories;

CREATE POLICY "categories_select_policy" ON public.categories
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.stores 
            WHERE stores.id = categories.store_id 
            AND (stores.is_active = true OR stores.owner_id = auth.uid())
        )
        OR public.is_admin()
    );

CREATE POLICY "categories_insert_policy" ON public.categories
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.stores 
            WHERE stores.id = categories.store_id 
            AND stores.owner_id = auth.uid()
        )
    );

CREATE POLICY "categories_update_policy" ON public.categories
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.stores 
            WHERE stores.id = categories.store_id 
            AND stores.owner_id = auth.uid()
        )
        OR public.is_admin()
    );

CREATE POLICY "categories_delete_policy" ON public.categories
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.stores 
            WHERE stores.id = categories.store_id 
            AND stores.owner_id = auth.uid()
        )
        OR public.is_admin()
    );

-- ==================
-- SUPPORT TICKETS
-- ==================
CREATE POLICY "tickets_select_policy" ON public.support_tickets
    FOR SELECT USING (
        user_id = auth.uid() 
        OR public.is_admin()
    );

CREATE POLICY "tickets_insert_policy" ON public.support_tickets
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "tickets_update_policy" ON public.support_tickets
    FOR UPDATE USING (
        user_id = auth.uid() 
        OR public.is_admin()
    );

-- ==================
-- STORE METRICS
-- ==================
CREATE POLICY "metrics_select_policy" ON public.store_metrics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.stores 
            WHERE stores.id = store_metrics.store_id 
            AND stores.owner_id = auth.uid()
        )
        OR public.is_admin()
    );

-- Cualquiera puede insertar métricas (visitantes anónimos)
CREATE POLICY "metrics_insert_policy" ON public.store_metrics
    FOR INSERT WITH CHECK (true);

CREATE POLICY "metrics_update_policy" ON public.store_metrics
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.stores 
            WHERE stores.id = store_metrics.store_id 
            AND stores.owner_id = auth.uid()
        )
        OR public.is_admin()
    );

-- ==================
-- FINANCE ENTRIES
-- ==================
DROP POLICY IF EXISTS "Store owners can manage finances" ON public.finance_entries;

CREATE POLICY "finances_select_policy" ON public.finance_entries
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.stores 
            WHERE stores.id = finance_entries.store_id 
            AND stores.owner_id = auth.uid()
        )
        OR public.is_admin()
    );

CREATE POLICY "finances_insert_policy" ON public.finance_entries
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.stores 
            WHERE stores.id = finance_entries.store_id 
            AND stores.owner_id = auth.uid()
        )
    );

CREATE POLICY "finances_update_policy" ON public.finance_entries
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.stores 
            WHERE stores.id = finance_entries.store_id 
            AND stores.owner_id = auth.uid()
        )
        OR public.is_admin()
    );

CREATE POLICY "finances_delete_policy" ON public.finance_entries
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.stores 
            WHERE stores.id = finance_entries.store_id 
            AND stores.owner_id = auth.uid()
        )
        OR public.is_admin()
    );

-- ==================
-- ORDERS
-- ==================
DROP POLICY IF EXISTS "Store owners can manage orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;

CREATE POLICY "orders_select_policy" ON public.orders
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.stores 
            WHERE stores.id = orders.store_id 
            AND stores.owner_id = auth.uid()
        )
        OR public.is_admin()
    );

CREATE POLICY "orders_insert_policy" ON public.orders
    FOR INSERT WITH CHECK (true);

CREATE POLICY "orders_update_policy" ON public.orders
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.stores 
            WHERE stores.id = orders.store_id 
            AND stores.owner_id = auth.uid()
        )
        OR public.is_admin()
    );

-- ============================================
-- FIN
-- ============================================
SELECT 'Políticas RLS corregidas exitosamente!' as resultado;
