-- ============================================
-- 09_subscriptions.sql
-- Sistema de suscripciones con fechas de inicio/fin
-- ============================================
-- 
-- INSTRUCCIONES:
-- 1. Pega este script completo en el SQL Editor de Supabase
-- 2. Ejecuta todo el script de una vez
-- 3. Verifica que no haya errores en la consola
--
-- CAMBIOS INCLUIDOS:
-- - Nuevas columnas en stores para suscripciones
-- - Tabla store_subscriptions para historial
-- - Función admin_set_store_subscription para cambios seguros
-- - Función expire_subscriptions para downgrade automático
-- - Índices y políticas RLS
-- ============================================

-- ============================================
-- 1. NUEVAS COLUMNAS EN STORES
-- ============================================

-- Agregar columnas de suscripción si no existen
DO $$ 
BEGIN
  -- subscription_start_at: fecha de inicio de la suscripción actual
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stores' AND column_name = 'subscription_start_at'
  ) THEN
    ALTER TABLE stores ADD COLUMN subscription_start_at TIMESTAMPTZ NULL;
  END IF;

  -- subscription_end_at: fecha de fin de la suscripción actual
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stores' AND column_name = 'subscription_end_at'
  ) THEN
    ALTER TABLE stores ADD COLUMN subscription_end_at TIMESTAMPTZ NULL;
  END IF;

  -- subscription_status: estado de la suscripción (active, expired, cancelled)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stores' AND column_name = 'subscription_status'
  ) THEN
    ALTER TABLE stores ADD COLUMN subscription_status TEXT NOT NULL DEFAULT 'active';
  END IF;

  -- last_paid_plan: último plan de pago que tuvo (para restaurar al renovar)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stores' AND column_name = 'last_paid_plan'
  ) THEN
    ALTER TABLE stores ADD COLUMN last_paid_plan TEXT NULL;
  END IF;

  -- last_subscription_end_at: fecha de fin de la última suscripción (auditoría)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stores' AND column_name = 'last_subscription_end_at'
  ) THEN
    ALTER TABLE stores ADD COLUMN last_subscription_end_at TIMESTAMPTZ NULL;
  END IF;
END $$;

-- Agregar constraint para subscription_status si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'stores_subscription_status_check'
  ) THEN
    ALTER TABLE stores ADD CONSTRAINT stores_subscription_status_check 
      CHECK (subscription_status IN ('active', 'expired', 'cancelled'));
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Agregar constraint para last_paid_plan si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'stores_last_paid_plan_check'
  ) THEN
    ALTER TABLE stores ADD CONSTRAINT stores_last_paid_plan_check 
      CHECK (last_paid_plan IS NULL OR last_paid_plan IN ('gratis', 'basico', 'emprendedor', 'pro'));
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- 2. ÍNDICES PARA SUSCRIPCIONES
-- ============================================

-- Índice para buscar suscripciones por fecha de fin (para expiración)
CREATE INDEX IF NOT EXISTS idx_stores_subscription_end_at 
  ON stores (subscription_end_at) 
  WHERE subscription_end_at IS NOT NULL;

-- Índice para buscar por estado de suscripción
CREATE INDEX IF NOT EXISTS idx_stores_subscription_status 
  ON stores (subscription_status);

-- Índice compuesto para la query de expiración
CREATE INDEX IF NOT EXISTS idx_stores_subscription_expiry 
  ON stores (subscription_status, subscription_end_at, plan) 
  WHERE plan != 'gratis' AND subscription_status = 'active';

-- ============================================
-- 3. TABLA DE HISTORIAL DE SUSCRIPCIONES
-- ============================================

CREATE TABLE IF NOT EXISTS store_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  plan TEXT NOT NULL,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active',
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT store_subscriptions_plan_check 
    CHECK (plan IN ('gratis', 'basico', 'emprendedor', 'pro')),
  CONSTRAINT store_subscriptions_status_check 
    CHECK (status IN ('active', 'expired', 'cancelled', 'renewed'))
);

-- Índices para historial
CREATE INDEX IF NOT EXISTS idx_store_subscriptions_store_id 
  ON store_subscriptions (store_id);

CREATE INDEX IF NOT EXISTS idx_store_subscriptions_created_at 
  ON store_subscriptions (created_at DESC);

-- Comentarios
COMMENT ON TABLE store_subscriptions IS 'Historial de cambios de suscripción por tienda';
COMMENT ON COLUMN store_subscriptions.created_by IS 'UUID del admin que realizó el cambio (NULL si fue automático)';
COMMENT ON COLUMN store_subscriptions.status IS 'Estado: active (vigente), expired (venció), cancelled (cancelado), renewed (renovado)';

-- ============================================
-- 4. RLS PARA store_subscriptions
-- ============================================

ALTER TABLE store_subscriptions ENABLE ROW LEVEL SECURITY;

-- Política: Admin puede ver todo
DROP POLICY IF EXISTS "Admin can view all subscriptions" ON store_subscriptions;
CREATE POLICY "Admin can view all subscriptions" ON store_subscriptions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Política: Admin puede insertar
DROP POLICY IF EXISTS "Admin can insert subscriptions" ON store_subscriptions;
CREATE POLICY "Admin can insert subscriptions" ON store_subscriptions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Política: Emprendedor puede ver sus propias suscripciones
DROP POLICY IF EXISTS "Owner can view own subscriptions" ON store_subscriptions;
CREATE POLICY "Owner can view own subscriptions" ON store_subscriptions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM stores 
      WHERE stores.id = store_subscriptions.store_id 
      AND stores.owner_id = auth.uid()
    )
  );

-- ============================================
-- 5. FUNCIÓN: admin_set_store_subscription
-- ============================================

-- Función segura para que el admin asigne suscripciones
CREATE OR REPLACE FUNCTION admin_set_store_subscription(
  p_store_id UUID,
  p_plan TEXT,
  p_start_at TIMESTAMPTZ,
  p_end_at TIMESTAMPTZ DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_id UUID;
  v_store RECORD;
  v_result JSON;
BEGIN
  -- Verificar que el usuario actual es admin
  SELECT id INTO v_admin_id
  FROM profiles
  WHERE id = auth.uid() AND role = 'admin';
  
  IF v_admin_id IS NULL THEN
    RAISE EXCEPTION 'No autorizado: se requiere rol de administrador';
  END IF;
  
  -- Validar que el plan sea válido
  IF p_plan NOT IN ('gratis', 'basico', 'emprendedor', 'pro') THEN
    RAISE EXCEPTION 'Plan inválido: %', p_plan;
  END IF;
  
  -- Obtener la tienda actual
  SELECT * INTO v_store FROM stores WHERE id = p_store_id;
  
  IF v_store IS NULL THEN
    RAISE EXCEPTION 'Tienda no encontrada: %', p_store_id;
  END IF;
  
  -- Validaciones de fechas
  IF p_plan != 'gratis' THEN
    -- Planes de pago requieren fecha de fin
    IF p_end_at IS NULL THEN
      RAISE EXCEPTION 'Los planes de pago requieren fecha de fin';
    END IF;
    
    IF p_end_at <= p_start_at THEN
      RAISE EXCEPTION 'La fecha de fin debe ser posterior a la de inicio';
    END IF;
  END IF;
  
  -- Si había una suscripción activa previa, marcarla como renovada en historial
  IF v_store.subscription_status = 'active' AND v_store.plan != 'gratis' THEN
    UPDATE store_subscriptions
    SET status = 'renewed'
    WHERE store_id = p_store_id 
    AND status = 'active'
    AND plan = v_store.plan;
  END IF;
  
  -- Actualizar la tienda
  UPDATE stores
  SET 
    plan = p_plan,
    plan_changed_at = NOW(),
    subscription_start_at = p_start_at,
    subscription_end_at = CASE WHEN p_plan = 'gratis' THEN NULL ELSE p_end_at END,
    subscription_status = 'active',
    -- Guardar último plan de pago para referencia
    last_paid_plan = CASE 
      WHEN p_plan != 'gratis' THEN p_plan 
      ELSE last_paid_plan 
    END,
    last_subscription_end_at = CASE 
      WHEN p_plan != 'gratis' THEN p_end_at 
      ELSE last_subscription_end_at 
    END
  WHERE id = p_store_id;
  
  -- Insertar registro en historial
  INSERT INTO store_subscriptions (
    store_id, 
    plan, 
    start_at, 
    end_at, 
    status, 
    created_by, 
    notes
  ) VALUES (
    p_store_id,
    p_plan,
    p_start_at,
    CASE WHEN p_plan = 'gratis' THEN NULL ELSE p_end_at END,
    'active',
    v_admin_id,
    p_notes
  );
  
  -- Retornar resultado
  SELECT json_build_object(
    'success', true,
    'store_id', p_store_id,
    'plan', p_plan,
    'start_at', p_start_at,
    'end_at', p_end_at,
    'message', CASE 
      WHEN p_plan = 'gratis' THEN 'Plan gratuito asignado (sin vencimiento)'
      ELSE format('Suscripción %s activa hasta %s', p_plan, p_end_at::date)
    END
  ) INTO v_result;
  
  RETURN v_result;
END;
$$;

-- Comentario
COMMENT ON FUNCTION admin_set_store_subscription IS 
  'Asigna o cambia la suscripción de una tienda. Solo admins pueden ejecutar.';

-- ============================================
-- 6. FUNCIÓN: expire_subscriptions
-- ============================================

-- Función para expirar suscripciones vencidas (ejecutar con cron o Edge Function)
CREATE OR REPLACE FUNCTION expire_subscriptions()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_expired_count INTEGER := 0;
  v_store RECORD;
  v_result JSON;
BEGIN
  -- Buscar tiendas con suscripción vencida
  FOR v_store IN 
    SELECT id, plan, subscription_end_at
    FROM stores
    WHERE plan != 'gratis'
    AND subscription_status = 'active'
    AND subscription_end_at IS NOT NULL
    AND subscription_end_at <= NOW()
  LOOP
    -- Guardar info del plan anterior
    UPDATE stores
    SET 
      last_paid_plan = COALESCE(last_paid_plan, plan),
      last_subscription_end_at = subscription_end_at,
      -- Hacer downgrade a gratis
      plan = 'gratis',
      subscription_status = 'expired',
      plan_changed_at = NOW()
    WHERE id = v_store.id;
    
    -- Marcar suscripción como expirada en historial
    UPDATE store_subscriptions
    SET status = 'expired'
    WHERE store_id = v_store.id 
    AND status = 'active'
    AND plan = v_store.plan;
    
    -- Insertar registro de expiración
    INSERT INTO store_subscriptions (
      store_id, 
      plan, 
      start_at, 
      end_at, 
      status, 
      notes
    ) VALUES (
      v_store.id,
      'gratis',
      NOW(),
      NULL,
      'active',
      format('Downgrade automático desde %s (venció %s)', v_store.plan, v_store.subscription_end_at::date)
    );
    
    v_expired_count := v_expired_count + 1;
  END LOOP;
  
  -- Retornar resultado
  SELECT json_build_object(
    'success', true,
    'expired_count', v_expired_count,
    'executed_at', NOW()
  ) INTO v_result;
  
  RETURN v_result;
END;
$$;

-- Comentario
COMMENT ON FUNCTION expire_subscriptions IS 
  'Hace downgrade automático a plan gratis para tiendas con suscripción vencida. NO borra datos.';

-- ============================================
-- 7. ACTUALIZAR RLS DE STORES (agregar columnas nuevas)
-- ============================================

-- Asegurar que owners puedan leer sus campos de suscripción
-- (ya deberían tener acceso con la política existente de SELECT)

-- ============================================
-- 8. INICIALIZAR DATOS EXISTENTES
-- ============================================

-- Para tiendas existentes con plan de pago sin fechas, 
-- establecer una suscripción de 1 año desde la fecha de creación
-- (Puedes ajustar esto según tu necesidad)

-- UPDATE stores
-- SET 
--   subscription_start_at = COALESCE(plan_changed_at, created_at),
--   subscription_end_at = COALESCE(plan_changed_at, created_at) + INTERVAL '1 year',
--   subscription_status = 'active'
-- WHERE plan != 'gratis'
-- AND subscription_start_at IS NULL;

-- ============================================
-- FIN DEL SCRIPT
-- ============================================

-- Verificación final (comentar en producción)
SELECT 
  'Columnas agregadas' as check_type,
  COUNT(*) as count
FROM information_schema.columns 
WHERE table_name = 'stores' 
AND column_name IN ('subscription_start_at', 'subscription_end_at', 'subscription_status', 'last_paid_plan', 'last_subscription_end_at')

UNION ALL

SELECT 
  'Tabla store_subscriptions creada',
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'store_subscriptions') 
       THEN 1 ELSE 0 END

UNION ALL

SELECT 
  'Función admin_set_store_subscription',
  CASE WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'admin_set_store_subscription') 
       THEN 1 ELSE 0 END

UNION ALL

SELECT 
  'Función expire_subscriptions',
  CASE WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'expire_subscriptions') 
       THEN 1 ELSE 0 END;
