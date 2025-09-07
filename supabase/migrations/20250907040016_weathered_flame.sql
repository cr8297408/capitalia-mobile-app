/*
  # Transactions Table

  1. New Tables
    - `transactions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `account_id` (uuid, foreign key to accounts)
      - `category_id` (uuid, foreign key to categories)
      - `amount` (decimal) - Transaction amount (positive for income, negative for expense)
      - `description` (text) - Transaction description
      - `date` (date) - Transaction date
      - `type` (enum) - income, expense, transfer
      - `is_recurring` (boolean) - Whether it's a recurring transaction
      - `recurring_frequency` (enum) - daily, weekly, monthly, yearly
      - `tags` (text array) - Tags for categorization
      - `receipt_url` (text) - URL to receipt image
      - `notes` (text) - Additional notes
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `transactions` table
    - Add policies for user data access
*/

-- Transaction type enum (ensure exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'transaction_type'
  ) THEN
    CREATE TYPE transaction_type AS ENUM ('income', 'expense', 'transfer');
  END IF;
END
$$;

-- Recurring frequency enum (ensure exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'recurring_frequency'
  ) THEN
    CREATE TYPE recurring_frequency AS ENUM ('daily', 'weekly', 'bi_weekly', 'monthly', 'quarterly', 'yearly');
  END IF;
END
$$;

-- Transactions table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE NOT NULL,
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  amount DECIMAL(15,2) NOT NULL,
  description TEXT NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  type transaction_type NOT NULL,
  is_recurring BOOLEAN DEFAULT false,
  recurring_frequency recurring_frequency,
  tags TEXT[] DEFAULT '{}',
  receipt_url TEXT,
  notes TEXT,
  transfer_to_account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Transactions policies
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" ON transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions" ON transactions
  FOR DELETE USING (auth.uid() = user_id);

-- Apply update trigger
CREATE TRIGGER update_transactions_updated_at 
  BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Index for performance
CREATE INDEX idx_transactions_user_date ON transactions(user_id, date DESC);
CREATE INDEX idx_transactions_category ON transactions(category_id);
CREATE INDEX idx_transactions_account ON transactions(account_id);