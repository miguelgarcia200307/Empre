-- ============================================
-- MIGRACIÓN: Sistema de Plantillas Prediseñadas
-- Fecha: 2025-12-12
-- ============================================

-- 1. Agregar campos de plantilla a stores
ALTER TABLE public.stores
ADD COLUMN IF NOT EXISTS template_id TEXT;

ALTER TABLE public.stores
ADD COLUMN IF NOT EXISTS template_overrides JSONB DEFAULT '{}'::jsonb;

ALTER TABLE public.stores
ADD COLUMN IF NOT EXISTS accent_color TEXT DEFAULT '#f59e0b';

ALTER TABLE public.stores
ADD COLUMN IF NOT EXISTS font_family TEXT DEFAULT 'Inter';

-- 2. Comentarios descriptivos
COMMENT ON COLUMN public.stores.template_id IS 'ID de la plantilla prediseñada seleccionada';
COMMENT ON COLUMN public.stores.template_overrides IS 'Personalizaciones sobre la plantilla base (colores, tipografía, etc.)';
COMMENT ON COLUMN public.stores.accent_color IS 'Color de acento para la tienda';
COMMENT ON COLUMN public.stores.font_family IS 'Familia tipográfica de la tienda';

-- 3. Actualizar planes para incluir feature "templates"
-- Plan Gratuito: sin templates
UPDATE public.plans 
SET features = features || '{"templates": false}'::jsonb
WHERE slug = 'gratis';

-- Plan Básico: con templates (límite según templates column)
UPDATE public.plans 
SET features = features || '{"templates": true}'::jsonb
WHERE slug = 'basico';

-- Plan Emprendedor: con templates
UPDATE public.plans 
SET features = features || '{"templates": true}'::jsonb
WHERE slug = 'emprendedor';

-- Plan Pro: con templates (ilimitado)
UPDATE public.plans 
SET features = features || '{"templates": true}'::jsonb
WHERE slug = 'pro';

-- 4. Asegurar que templates tiene valores correctos
-- gratis: 0 plantillas
-- basico: 5 plantillas
-- emprendedor: 10 plantillas  
-- pro: -1 (ilimitado)
UPDATE public.plans SET templates = 0 WHERE slug = 'gratis';
UPDATE public.plans SET templates = 5 WHERE slug = 'basico';
UPDATE public.plans SET templates = 10 WHERE slug = 'emprendedor';
UPDATE public.plans SET templates = -1 WHERE slug = 'pro';

-- 5. Índice para búsquedas por template
CREATE INDEX IF NOT EXISTS idx_stores_template_id ON public.stores(template_id);

-- ============================================
-- FIN MIGRACIÓN
-- ============================================
