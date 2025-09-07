/*
  # Stripe Customer Integration

  1. New Tables
    - `stripe_customers`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles.user_id)
      - `stripe_customer_id` (varchar) - Stripe customer ID
      - `email` (varchar) - Customer email
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `stripe_customers` table
    - Add policy for user data access only
*/

CREATE TABLE stripe_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE UNIQUE NOT NULL,
  stripe_customer_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE stripe_customers ENABLE ROW LEVEL SECURITY;

-- Stripe customers policies - users can only see their own data
CREATE POLICY "Users can only see their own stripe customer data" 
  ON stripe_customers FOR ALL 
  USING (auth.uid() = user_id);

-- Index for performance
CREATE INDEX idx_stripe_customers_user_id ON stripe_customers(user_id);
CREATE INDEX idx_stripe_customers_stripe_id ON stripe_customers(stripe_customer_id);