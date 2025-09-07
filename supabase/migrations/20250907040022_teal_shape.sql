/*
  # Subscriptions Management

  1. New Tables
    - `subscriptions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `stripe_subscription_id` (varchar) - Stripe subscription ID
      - `status` (enum) - active, past_due, unpaid, canceled, etc.
      - `current_period_start` (timestamp) - Current billing period start
      - `current_period_end` (timestamp) - Current billing period end
      - `premium_features_enabled` (boolean) - Whether premium features are enabled
      - `plan_id` (uuid) - Reference to subscription plan
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `subscriptions` table
    - Add policy for user subscription access
*/

-- Subscription status enum matching Stripe statuses
CREATE TYPE subscription_status AS ENUM (
  'active', 
  'past_due', 
  'unpaid', 
  'canceled', 
  'incomplete', 
  'incomplete_expired', 
  'trialing',
  'paused'
);

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE NOT NULL,
  stripe_subscription_id VARCHAR(255) UNIQUE NOT NULL,
  status subscription_status NOT NULL,
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  premium_features_enabled BOOLEAN DEFAULT FALSE,
  plan_id UUID REFERENCES subscription_plans(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Subscriptions policies
CREATE POLICY "Users can only see their own subscriptions" 
  ON subscriptions FOR ALL 
  USING (auth.uid() = user_id);

-- Apply update trigger
CREATE TRIGGER update_subscriptions_updated_at 
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically enable/disable premium features based on status
CREATE OR REPLACE FUNCTION update_premium_features()
RETURNS trigger AS $$
BEGIN
  NEW.premium_features_enabled = (NEW.status = 'active' OR NEW.status = 'trialing');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for premium features
CREATE TRIGGER subscription_premium_features_update
  BEFORE INSERT OR UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_premium_features();

-- Index for performance
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);