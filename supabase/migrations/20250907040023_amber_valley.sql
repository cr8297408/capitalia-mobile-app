/*
  # Performance Optimization Indexes

  1. Query Performance
    - Add indexes for common query patterns
    - Optimize dashboard queries
    - Improve analytics performance

  2. Composite Indexes
    - Multi-column indexes for complex queries
    - Date range queries optimization

  3. Monitoring
    - Add statistics collection
    - Query performance tracking
*/

-- Dashboard performance indexes
-- Note: Avoid volatile functions (CURRENT_DATE) in predicates; use a general index instead
CREATE INDEX IF NOT EXISTS idx_transactions_user_month 
  ON transactions(user_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_transactions_amount_type
  ON transactions(user_id, type, amount DESC, date DESC);

CREATE INDEX IF NOT EXISTS idx_budgets_user_period
  ON budgets(user_id, start_date, end_date) 
  WHERE is_active = true;

-- Analytics performance indexes  
CREATE INDEX IF NOT EXISTS idx_transactions_category_month
  ON transactions(category_id, date DESC)
  WHERE type = 'expense';

CREATE INDEX IF NOT EXISTS idx_accounts_user_balance
  ON accounts(user_id, balance DESC)
  WHERE is_active = true;

-- Subscription-related performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_active
  ON subscriptions(user_id, status, current_period_end DESC)
  WHERE premium_features_enabled = true;

-- Text search indexes for descriptions and notes
CREATE INDEX IF NOT EXISTS idx_transactions_description_search
  ON transactions USING gin(to_tsvector('english', description))
  WHERE description IS NOT NULL;

-- Recurring transactions optimization
CREATE INDEX IF NOT EXISTS idx_transactions_recurring
  ON transactions(user_id, is_recurring, recurring_frequency)
  WHERE is_recurring = true;

-- Goals progress tracking
CREATE INDEX IF NOT EXISTS idx_goals_user_progress
  ON goals(user_id, target_date, is_achieved)
  WHERE is_active = true;

-- Categories usage statistics
CREATE INDEX IF NOT EXISTS idx_categories_usage
  ON transactions(category_id)
  WHERE category_id IS NOT NULL;

-- Account balance history (for trends)
CREATE INDEX IF NOT EXISTS idx_transactions_account_balance
  ON transactions(account_id, date DESC, amount);