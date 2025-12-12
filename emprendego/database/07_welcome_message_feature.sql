-- =====================================================
-- 07_welcome_message_feature.sql
-- Habilita el feature welcomeMessage en los planes de pago
-- =====================================================

-- Agregar welcomeMessage: true a los 3 planes de pago
-- y welcomeMessage: false al plan gratuito

-- Plan Gratuito (slug = 'gratis' o 'free')
UPDATE plans 
SET features = features || '{"welcomeMessage": false}'::jsonb
WHERE slug IN ('gratis', 'free');

-- Plan Básico
UPDATE plans 
SET features = features || '{"welcomeMessage": true}'::jsonb
WHERE slug = 'basico';

-- Plan Emprendedor
UPDATE plans 
SET features = features || '{"welcomeMessage": true}'::jsonb
WHERE slug = 'emprendedor';

-- Plan Pro
UPDATE plans 
SET features = features || '{"welcomeMessage": true}'::jsonb
WHERE slug = 'pro';

-- Verificar los cambios
SELECT slug, name, features->>'welcomeMessage' as welcome_message_enabled
FROM plans
ORDER BY sort_order;
