/*
  # Subscription Plans

  1. New Tables
    - `subscription_plans`
      - `id` (uuid, primary key)
      - `stripe_price_id` (varchar) - Stripe price ID
      - `name` (varchar) - Plan name
      - `amount` (integer) - Price in cents
      - `currency` (varchar) - Currency code
      - `interval` (varchar) - Billing interval (month, year)
      - `features` (jsonb) - Plan features list
      - `max_transactions` (integer) - Max transactions per month (null = unlimited)
      - `max_accounts` (integer) - Max accounts (null = unlimited)  
      - `max_budgets` (integer) - Max budgets (null = unlimited)
      - `can_export_data` (boolean) - Can export data
      - `can_use_advanced_analytics` (boolean) - Can use advanced analytics
      - `is_active` (boolean) - Whether plan is available
      - `created_at` (timestamp)

  2. Default Plans
    - Insert Free and Premium plans

  3. Security
    - Enable RLS on `subscription_plans` table
    - Public read access for active plans
*/

CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_price_id VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  amount INTEGER NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  interval VARCHAR(20) DEFAULT 'month',
  features JSONB NOT NULL DEFAULT '[]',
  max_transactions INTEGER DEFAULT NULL,
  max_accounts INTEGER DEFAULT NULL,
  max_budgets INTEGER DEFAULT NULL,
  can_export_data BOOLEAN DEFAULT FALSE,
  can_use_advanced_analytics BOOLEAN DEFAULT FALSE,
  can_use_recurring_transactions BOOLEAN DEFAULT FALSE,
  can_attach_receipts BOOLEAN DEFAULT FALSE,
  can_set_custom_categories BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

-- Subscription plans are viewable by everyone (for plan selection)
CREATE POLICY "Subscription plans are viewable by everyone" 
  ON subscription_plans FOR SELECT 
  USING (is_active = TRUE);

-- Insert default plans
INSERT INTO subscription_plans (
  stripe_price_id, 
  name, 
  amount, 
  currency, 
  interval, 
  features, 
  max_transactions,
  max_accounts,
  max_budgets,
  can_export_data,
  can_use_advanced_analytics,
  can_use_recurring_transactions,
  can_attach_receipts,
  can_set_custom_categories
) VALUES (
  'price_free', 
  'Free', 
  0, 
  'USD', 
  'month',
  '["Basic transaction tracking", "3 accounts", "5 budgets", "Basic categories"]',
  100,
  3,
  5,
  false,
  false,
  false,
  false,
  false
), (
  'price_premium_monthly',
  'Premium Monthly',
  999,
  'USD', 
  'month',
  '["Unlimited transactions", "Unlimited accounts", "Unlimited budgets", "Advanced analytics", "Data export", "Receipt attachments", "Recurring transactions", "Custom categories"]',
  NULL,
  NULL,
  NULL,
  true,
  true,
  true,
  true,
  true
), (
  'price_premium_yearly',
  'Premium Yearly',
  9999,
  'USD',
  'year', 
  '["Unlimited transactions", "Unlimited accounts", "Unlimited budgets", "Advanced analytics", "Data export", "Receipt attachments", "Recurring transactions", "Custom categories", "2 months free"]',
  NULL,
  NULL,
  NULL,
  true,
  true,
  true,
  true,
  true
);

-- Index for performance
CREATE INDEX idx_subscription_plans_active ON subscription_plans(is_active);
CREATE INDEX idx_subscription_plans_stripe_price ON subscription_plans(stripe_price_id);