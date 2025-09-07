/*
  # Webhook Logging and Processing

  1. New Tables
    - `webhook_logs`
      - `id` (uuid, primary key)
      - `stripe_event_id` (varchar) - Stripe event ID
      - `event_type` (varchar) - Type of webhook event
      - `processed` (boolean) - Whether event was processed successfully
      - `data` (jsonb) - Full webhook data
      - `error` (text) - Error message if processing failed
      - `created_at` (timestamp)

  2. Security
    - No RLS needed as this is for system use only
    - Admin-only access through service role
*/

CREATE TABLE webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id VARCHAR(255) UNIQUE NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  data JSONB NOT NULL,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for performance and duplicate prevention
CREATE INDEX idx_webhook_logs_stripe_event ON webhook_logs(stripe_event_id);
CREATE INDEX idx_webhook_logs_type_processed ON webhook_logs(event_type, processed);
CREATE INDEX idx_webhook_logs_created_at ON webhook_logs(created_at DESC);

-- No RLS policies - this table is only accessed by edge functions with service role key