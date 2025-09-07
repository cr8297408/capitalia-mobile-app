/*
  # Budgets Table

  1. New Tables
    - `budgets`
      - `id` (uuid, primary key)  
      - `user_id` (uuid, foreign key)
      - `name` (text) - Budget name
      - `amount` (decimal) - Budget amount limit
      - `spent_amount` (decimal) - Current spent amount
      - `category_id` (uuid, foreign key to categories)
      - `period` (enum) - weekly, monthly, yearly
      - `start_date` (date) - Budget period start
      - `end_date` (date) - Budget period end
      - `alert_threshold` (decimal) - Alert when spent reaches this percentage (0.8 = 80%)
      - `is_active` (boolean) - Whether budget is active
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `budgets` table  
    - Add policies for user data access
*/

-- Budget period enum
CREATE TYPE budget_period AS ENUM ('weekly', 'monthly', 'quarterly', 'yearly');

-- Budgets table
CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
  spent_amount DECIMAL(15,2) DEFAULT 0.00,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  period budget_period NOT NULL DEFAULT 'monthly',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  alert_threshold DECIMAL(3,2) DEFAULT 0.80 CHECK (alert_threshold >= 0 AND alert_threshold <= 1),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CHECK (end_date > start_date)
);

-- Enable RLS
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

-- Budgets policies
CREATE POLICY "Users can view own budgets" ON budgets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own budgets" ON budgets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budgets" ON budgets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own budgets" ON budgets
  FOR DELETE USING (auth.uid() = user_id);

-- Apply update trigger
CREATE TRIGGER update_budgets_updated_at 
  BEFORE UPDATE ON budgets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Index for performance
CREATE INDEX idx_budgets_user_active ON budgets(user_id, is_active);
CREATE INDEX idx_budgets_date_range ON budgets(start_date, end_date);