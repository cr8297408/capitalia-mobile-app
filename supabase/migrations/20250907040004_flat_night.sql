/*
  # Categories Table

  1. New Tables
    - `categories`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key) - NULL for system/default categories
      - `name` (text) - Category name
      - `icon` (text) - Icon name/identifier
      - `color` (text) - Hex color code
      - `parent_category_id` (uuid) - For subcategories
      - `is_system_default` (boolean) - Whether it's a default category
      - `transaction_type` (enum) - income, expense, both
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Default Categories
    - Insert common expense and income categories

  3. Security
    - Enable RLS on `categories` table
    - Add policies for user and system categories
*/

-- Ensure transaction_type enum exists before creating categories
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'transaction_type'
  ) THEN
    CREATE TYPE transaction_type AS ENUM ('income', 'expense', 'transfer');
  END IF;
END
$$;

-- Categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT DEFAULT 'tag',
  color TEXT DEFAULT '#6B7280',
  parent_category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  is_system_default BOOLEAN DEFAULT false,
  transaction_type transaction_type DEFAULT 'expense',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, name) -- Prevent duplicate category names per user
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Categories policies
CREATE POLICY "Users can view own and system categories" ON categories
  FOR SELECT USING (auth.uid() = user_id OR is_system_default = true);

CREATE POLICY "Users can insert own categories" ON categories
  FOR INSERT WITH CHECK (auth.uid() = user_id AND is_system_default = false);

CREATE POLICY "Users can update own categories" ON categories
  FOR UPDATE USING (auth.uid() = user_id AND is_system_default = false);

CREATE POLICY "Users can delete own categories" ON categories
  FOR DELETE USING (auth.uid() = user_id AND is_system_default = false);

-- Apply update trigger
CREATE TRIGGER update_categories_updated_at 
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default categories
INSERT INTO categories (name, icon, color, is_system_default, transaction_type) VALUES
-- Expense categories
('Food & Dining', 'utensils', '#EF4444', true, 'expense'),
('Transportation', 'car', '#3B82F6', true, 'expense'),
('Shopping', 'shopping-bag', '#8B5CF6', true, 'expense'),
('Entertainment', 'gamepad-2', '#F59E0B', true, 'expense'),
('Bills & Utilities', 'zap', '#10B981', true, 'expense'),
('Healthcare', 'heart-pulse', '#EC4899', true, 'expense'),
('Housing', 'home', '#6B7280', true, 'expense'),
('Travel', 'plane', '#06B6D4', true, 'expense'),
('Education', 'graduation-cap', '#8B5CF6', true, 'expense'),
('Personal Care', 'user', '#F97316', true, 'expense'),
-- Income categories  
('Salary', 'briefcase', '#10B981', true, 'income'),
('Freelance', 'laptop', '#3B82F6', true, 'income'),
('Investment', 'trending-up', '#059669', true, 'income'),
('Rental Income', 'building', '#6B7280', true, 'income'),
('Other Income', 'plus-circle', '#8B5CF6', true, 'income');

-- Index for performance
CREATE INDEX idx_categories_user ON categories(user_id);
CREATE INDEX idx_categories_type ON categories(transaction_type);