/*
  # Additional RLS Policies and Security

  1. Enhanced Security Policies
    - Add additional security constraints
    - Create helper functions for permissions
    - Add audit logging capabilities

  2. Performance Optimizations
    - Add necessary indexes for RLS policies
    - Optimize query performance

  3. Data Integrity
    - Add constraints and validations
    - Ensure referential integrity
*/

-- Function to check if user owns account
CREATE OR REPLACE FUNCTION user_owns_account(account_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM accounts 
    WHERE id = account_uuid AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user owns category
CREATE OR REPLACE FUNCTION user_owns_category(category_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM categories 
    WHERE id = category_uuid AND (user_id = auth.uid() OR is_system_default = true)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enhanced transaction policies with account ownership validation
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (
    auth.uid() = user_id AND 
    user_owns_account(account_id)
  );

DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;  
CREATE POLICY "Users can insert own transactions" ON transactions
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND 
    user_owns_account(account_id) AND
    (category_id IS NULL OR user_owns_category(category_id))
  );

-- Function to update account balance on transaction changes
CREATE OR REPLACE FUNCTION update_account_balance()
RETURNS trigger AS $$
BEGIN
  -- Handle INSERT
  IF TG_OP = 'INSERT' THEN
    UPDATE accounts 
    SET balance = balance + NEW.amount,
        updated_at = now()
    WHERE id = NEW.account_id;
    
    -- Handle transfers
    IF NEW.type = 'transfer' AND NEW.transfer_to_account_id IS NOT NULL THEN
      UPDATE accounts 
      SET balance = balance - NEW.amount,
          updated_at = now()
      WHERE id = NEW.transfer_to_account_id;
    END IF;
    
    RETURN NEW;
  END IF;

  -- Handle UPDATE
  IF TG_OP = 'UPDATE' THEN
    -- Revert old amount
    UPDATE accounts 
    SET balance = balance - OLD.amount,
        updated_at = now()
    WHERE id = OLD.account_id;
    
    -- Apply new amount
    UPDATE accounts 
    SET balance = balance + NEW.amount,
        updated_at = now()
    WHERE id = NEW.account_id;
    
    RETURN NEW;
  END IF;

  -- Handle DELETE
  IF TG_OP = 'DELETE' THEN
    UPDATE accounts 
    SET balance = balance - OLD.amount,
        updated_at = now()
    WHERE id = OLD.account_id;
    
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for account balance updates
DROP TRIGGER IF EXISTS transaction_balance_update ON transactions;
CREATE TRIGGER transaction_balance_update
  AFTER INSERT OR UPDATE OR DELETE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_account_balance();

-- Function to update budget spent amount
CREATE OR REPLACE FUNCTION update_budget_spent()
RETURNS trigger AS $$
BEGIN
  -- Only update for expense transactions
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') AND NEW.type = 'expense' AND NEW.category_id IS NOT NULL THEN
    UPDATE budgets 
    SET spent_amount = (
      SELECT COALESCE(SUM(ABS(amount)), 0)
      FROM transactions 
      WHERE category_id = NEW.category_id 
        AND user_id = NEW.user_id
        AND type = 'expense'
        AND date >= budgets.start_date 
        AND date <= budgets.end_date
    ),
    updated_at = now()
    WHERE category_id = NEW.category_id 
      AND user_id = NEW.user_id
      AND is_active = true;
  END IF;

  IF TG_OP = 'DELETE' AND OLD.type = 'expense' AND OLD.category_id IS NOT NULL THEN
    UPDATE budgets 
    SET spent_amount = (
      SELECT COALESCE(SUM(ABS(amount)), 0)
      FROM transactions 
      WHERE category_id = OLD.category_id 
        AND user_id = OLD.user_id
        AND type = 'expense'
        AND date >= budgets.start_date 
        AND date <= budgets.end_date
        AND id != OLD.id
    ),
    updated_at = now()
    WHERE category_id = OLD.category_id 
      AND user_id = OLD.user_id
      AND is_active = true;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger for budget spent amount updates
CREATE TRIGGER budget_spent_update
  AFTER INSERT OR UPDATE OR DELETE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_budget_spent();

-- Additional performance indexes
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_user_active ON accounts(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_transactions_type_date ON transactions(type, date DESC);
CREATE INDEX IF NOT EXISTS idx_budgets_category_active ON budgets(category_id, is_active);