-- =====================================================
-- 08_security_hardening.sql
-- Políticas de seguridad para Storage y Orders
-- Ejecutar en Supabase SQL Editor
-- =====================================================

-- ============================================
-- PASO 1: Funciones helper SECURITY DEFINER
-- ============================================

-- Función para extraer el primer segmento del path
CREATE OR REPLACE FUNCTION public.first_path_segment(object_name text)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT split_part(object_name, '/', 1);
$$;

-- Función para validar si el usuario es dueño de una tienda
CREATE OR REPLACE FUNCTION public.is_store_owner(store_id_text text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.stores s
    WHERE s.id::text = store_id_text
      AND s.owner_id = auth.uid()
  );
$$;

-- ============================================
-- PASO 2: Eliminar políticas de Storage inseguras
-- ============================================

-- Eliminar políticas antiguas genéricas
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete" ON storage.objects;
DROP POLICY IF EXISTS "Public can view" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view public assets" ON storage.objects;

-- ============================================
-- PASO 3: Políticas seguras para AVATARS
-- ============================================

-- INSERT: Solo en tu propia carpeta (avatars/<user_id>/...)
CREATE POLICY "storage_insert_avatars_own_folder"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'avatars'
  AND auth.uid() IS NOT NULL
  AND public.first_path_segment(name) = auth.uid()::text
);

-- UPDATE: Solo tus propios avatars
CREATE POLICY "storage_update_avatars_own_folder"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'avatars'
  AND auth.uid() IS NOT NULL
  AND public.first_path_segment(name) = auth.uid()::text
);

-- DELETE: Solo tus propios avatars
CREATE POLICY "storage_delete_avatars_own_folder"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'avatars'
  AND auth.uid() IS NOT NULL
  AND public.first_path_segment(name) = auth.uid()::text
);

-- ============================================
-- PASO 4: Políticas seguras para STORE-ASSETS
-- ============================================

-- INSERT: Solo si eres dueño de la tienda (store-assets/<store_id>/...)
CREATE POLICY "storage_insert_store_assets_store_owner"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'store-assets'
  AND auth.uid() IS NOT NULL
  AND public.is_store_owner(public.first_path_segment(name))
);

-- UPDATE: Solo si eres dueño de la tienda
CREATE POLICY "storage_update_store_assets_store_owner"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'store-assets'
  AND auth.uid() IS NOT NULL
  AND public.is_store_owner(public.first_path_segment(name))
);

-- DELETE: Solo si eres dueño de la tienda
CREATE POLICY "storage_delete_store_assets_store_owner"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'store-assets'
  AND auth.uid() IS NOT NULL
  AND public.is_store_owner(public.first_path_segment(name))
);

-- ============================================
-- PASO 5: Políticas seguras para PRODUCT-IMAGES
-- ============================================

-- INSERT: Solo si eres dueño de la tienda (product-images/<store_id>/...)
CREATE POLICY "storage_insert_product_images_store_owner"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'product-images'
  AND auth.uid() IS NOT NULL
  AND public.is_store_owner(public.first_path_segment(name))
);

-- UPDATE: Solo si eres dueño de la tienda
CREATE POLICY "storage_update_product_images_store_owner"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'product-images'
  AND auth.uid() IS NOT NULL
  AND public.is_store_owner(public.first_path_segment(name))
);

-- DELETE: Solo si eres dueño de la tienda
CREATE POLICY "storage_delete_product_images_store_owner"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'product-images'
  AND auth.uid() IS NOT NULL
  AND public.is_store_owner(public.first_path_segment(name))
);

-- ============================================
-- PASO 6: Política de lectura pública (SELECT)
-- ============================================

-- Lectura pública para todos los assets (las tiendas son públicas)
CREATE POLICY "storage_public_read"
ON storage.objects
FOR SELECT
USING (true);

-- ============================================
-- PASO 7: Orders - Solo en tiendas activas
-- ============================================

-- Eliminar política insegura de INSERT
DROP POLICY IF EXISTS "orders_insert_policy" ON public.orders;
DROP POLICY IF EXISTS "Anyone can insert orders" ON public.orders;
DROP POLICY IF EXISTS "Clientes pueden crear orders" ON public.orders;

-- Nueva política: INSERT solo si la tienda existe y está activa
CREATE POLICY "orders_insert_active_store_only"
ON public.orders
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.stores s
    WHERE s.id = store_id
      AND s.is_active = true
  )
);

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Listar políticas de storage
SELECT schemaname, tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage'
ORDER BY policyname;

-- Listar políticas de orders
SELECT schemaname, tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename = 'orders'
ORDER BY policyname;
