-- Migration: Migrar de Stripe a Wompi como procesador de pagos
-- Fecha: 2025-10-11
-- Descripción: Actualiza las tablas y campos relacionados con Stripe para usar Wompi

-- Paso 1: Renombrar tabla stripe_customers a payment_customers (genérico)
ALTER TABLE IF EXISTS stripe_customers RENAME TO payment_customers;

-- Paso 2: Renombrar columna stripe_customer_id a wompi_customer_id
ALTER TABLE IF EXISTS payment_customers 
  RENAME COLUMN stripe_customer_id TO wompi_customer_id;

-- Paso 3: Agregar columna payment_provider para flexibilidad futura
ALTER TABLE payment_customers 
  ADD COLUMN IF NOT EXISTS payment_provider VARCHAR(50) DEFAULT 'wompi';

-- Paso 4: Actualizar tabla subscriptions - renombrar columna stripe_subscription_id
ALTER TABLE subscriptions 
  RENAME COLUMN stripe_subscription_id TO wompi_subscription_id;

-- Paso 5: Actualizar índice de subscriptions
DROP INDEX IF EXISTS idx_subscriptions_stripe_id;
CREATE INDEX idx_subscriptions_wompi_id ON subscriptions(wompi_subscription_id);

-- Paso 6: Actualizar tabla subscription_plans - renombrar stripe_price_id
ALTER TABLE subscription_plans 
  RENAME COLUMN stripe_price_id TO wompi_price_id;

-- Paso 7: Actualizar índice de subscription_plans
DROP INDEX IF EXISTS idx_subscription_plans_stripe_price;
CREATE INDEX idx_subscription_plans_wompi_price ON subscription_plans(wompi_price_id);

-- Paso 8: Actualizar tabla webhook_logs - renombrar stripe_event_id
ALTER TABLE webhook_logs 
  RENAME COLUMN stripe_event_id TO wompi_event_id;

-- Paso 9: Agregar columna payment_provider a webhook_logs
ALTER TABLE webhook_logs 
  ADD COLUMN IF NOT EXISTS payment_provider VARCHAR(50) DEFAULT 'wompi';

-- Paso 10: Actualizar índice de webhook_logs
DROP INDEX IF EXISTS idx_webhook_logs_stripe_event;
CREATE INDEX idx_webhook_logs_wompi_event ON webhook_logs(wompi_event_id);

-- Paso 11: Agregar columnas específicas de Wompi a payment_customers
ALTER TABLE payment_customers 
  ADD COLUMN IF NOT EXISTS wompi_acceptance_token TEXT,
  ADD COLUMN IF NOT EXISTS wompi_payment_source_id TEXT;

-- Paso 12: Actualizar plan gratuito con wompi_price_id
UPDATE subscription_plans 
SET wompi_price_id = 'price_free_wompi' 
WHERE wompi_price_id = 'price_free' OR name = 'Free';

-- Paso 13: Comentarios actualizados en las tablas
COMMENT ON TABLE payment_customers IS 'Gestión de clientes en Wompi (anteriormente Stripe)';
COMMENT ON COLUMN payment_customers.wompi_customer_id IS 'ID del cliente en Wompi';
COMMENT ON COLUMN payment_customers.payment_provider IS 'Proveedor de pagos: wompi, stripe, etc.';

COMMENT ON COLUMN subscriptions.wompi_subscription_id IS 'ID de la suscripción en Wompi';
COMMENT ON COLUMN subscription_plans.wompi_price_id IS 'ID del precio/plan en Wompi';
COMMENT ON COLUMN webhook_logs.wompi_event_id IS 'ID del evento de webhook de Wompi';

-- Paso 14: Actualizar políticas RLS (mantienen la misma lógica de seguridad)
-- Las políticas existentes siguen funcionando porque solo verifican user_id

-- NOTA: Los datos existentes se mantienen. Solo cambian los nombres de columnas.
-- Las Edge Functions deberán actualizarse para usar la API de Wompi.
