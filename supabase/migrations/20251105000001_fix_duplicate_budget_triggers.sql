/*
  # Fix Duplicate Budget Update Triggers

  1. Problem
    - Two triggers are updating budget spent_amount simultaneously:
      - budget_spent_update (category-based, updates ALL budgets with that category)
      - budget_balance_update (budget_id-based, updates ONLY the specific budget)
    - This causes all budgets with the same category to be updated instead of just the one related to the transaction

  2. Solution
    - Drop the old category-based trigger (budget_spent_update)
    - Keep only the new budget_id-based trigger (budget_balance_update)
    - This ensures only the budget associated via budget_id is updated
*/

-- Drop the old category-based trigger and function
DROP TRIGGER IF EXISTS budget_spent_update ON transactions;
DROP FUNCTION IF EXISTS update_budget_spent();

-- Ensure the new trigger is active (it should already be created by migration 20250928061612)
-- This is just for verification/safety
DROP TRIGGER IF EXISTS budget_balance_update ON transactions;

CREATE TRIGGER budget_balance_update
  AFTER INSERT OR UPDATE OR DELETE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_budget_balance();

-- Add comment to document the change
COMMENT ON TRIGGER budget_balance_update ON transactions IS 
  'Updates budget spent_amount only for the specific budget associated via budget_id. Replaces old category-based logic.';
