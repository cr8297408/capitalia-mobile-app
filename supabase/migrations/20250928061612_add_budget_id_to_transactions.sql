/*
  # Add Budget Association to Transactions

  1. Changes
    - Add optional `budget_id` column to `transactions` table
    - Create foreign key relationship to `budgets` table
    - Add index for performance
    - Update triggers to modify budget balance only when budget_id is not null

  2. Migration Strategy
    - Add column with NULL default (existing transactions won't be affected)
    - Only new transactions with explicit budget association will update budgets
    - Preserve existing category-based logic for backward compatibility
*/

-- Add budget_id column to transactions table
ALTER TABLE transactions 
ADD COLUMN budget_id UUID REFERENCES budgets(id) ON DELETE SET NULL;

-- Add index for performance
CREATE INDEX idx_transactions_budget ON transactions(budget_id);

-- Add comment to clarify the new association model
COMMENT ON COLUMN transactions.budget_id IS 'Optional budget association. When set, transaction will update this budget instead of category-based budget.';

-- Update the existing budget balance trigger to handle the new logic
DROP TRIGGER IF EXISTS budget_balance_update ON transactions;

-- Create new trigger function that handles both category-based and direct budget association
CREATE OR REPLACE FUNCTION update_budget_balance()
RETURNS TRIGGER AS $$
BEGIN
  -- Handle INSERT
  IF TG_OP = 'INSERT' THEN
    -- If transaction is directly associated with a budget
    IF NEW.budget_id IS NOT NULL AND NEW.type = 'expense' THEN
      UPDATE budgets 
      SET spent_amount = spent_amount + NEW.amount,
          updated_at = now()
      WHERE id = NEW.budget_id
        AND NEW.date >= start_date 
        AND NEW.date <= end_date;
    -- Fallback to category-based logic for backward compatibility
    ELSIF NEW.budget_id IS NULL AND NEW.category_id IS NOT NULL AND NEW.type = 'expense' THEN
      UPDATE budgets 
      SET spent_amount = spent_amount + NEW.amount,
          updated_at = now()
      WHERE category_id = NEW.category_id
        AND user_id = NEW.user_id
        AND is_active = true
        AND NEW.date >= start_date 
        AND NEW.date <= end_date;
    END IF;
    
    RETURN NEW;
  END IF;

  -- Handle UPDATE
  IF TG_OP = 'UPDATE' THEN
    -- Remove old amount from previous budget (if any)
    IF OLD.budget_id IS NOT NULL AND OLD.type = 'expense' THEN
      UPDATE budgets 
      SET spent_amount = spent_amount - OLD.amount,
          updated_at = now()
      WHERE id = OLD.budget_id
        AND OLD.date >= start_date 
        AND OLD.date <= end_date;
    ELSIF OLD.budget_id IS NULL AND OLD.category_id IS NOT NULL AND OLD.type = 'expense' THEN
      UPDATE budgets 
      SET spent_amount = spent_amount - OLD.amount,
          updated_at = now()
      WHERE category_id = OLD.category_id
        AND user_id = OLD.user_id
        AND is_active = true
        AND OLD.date >= start_date 
        AND OLD.date <= end_date;
    END IF;

    -- Add new amount to new budget (if any)
    IF NEW.budget_id IS NOT NULL AND NEW.type = 'expense' THEN
      UPDATE budgets 
      SET spent_amount = spent_amount + NEW.amount,
          updated_at = now()
      WHERE id = NEW.budget_id
        AND NEW.date >= start_date 
        AND NEW.date <= end_date;
    ELSIF NEW.budget_id IS NULL AND NEW.category_id IS NOT NULL AND NEW.type = 'expense' THEN
      UPDATE budgets 
      SET spent_amount = spent_amount + NEW.amount,
          updated_at = now()
      WHERE category_id = NEW.category_id
        AND user_id = NEW.user_id
        AND is_active = true
        AND NEW.date >= start_date 
        AND NEW.date <= end_date;
    END IF;

    RETURN NEW;
  END IF;

  -- Handle DELETE
  IF TG_OP = 'DELETE' THEN
    -- Remove amount from budget
    IF OLD.budget_id IS NOT NULL AND OLD.type = 'expense' THEN
      UPDATE budgets 
      SET spent_amount = spent_amount - OLD.amount,
          updated_at = now()
      WHERE id = OLD.budget_id
        AND OLD.date >= start_date 
        AND OLD.date <= end_date;
    ELSIF OLD.budget_id IS NULL AND OLD.category_id IS NOT NULL AND OLD.type = 'expense' THEN
      UPDATE budgets 
      SET spent_amount = spent_amount - OLD.amount,
          updated_at = now()
      WHERE category_id = OLD.category_id
        AND user_id = OLD.user_id
        AND is_active = true
        AND OLD.date >= start_date 
        AND OLD.date <= end_date;
    END IF;

    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create the new trigger
CREATE TRIGGER budget_balance_update
  AFTER INSERT OR UPDATE OR DELETE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_budget_balance();
