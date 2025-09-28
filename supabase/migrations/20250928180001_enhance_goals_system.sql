-- Migration: Enhance goals table and add goal_contributions
-- Description: Adds missing columns to goals table and creates goal_contributions table

-- Create enum types for goal management
CREATE TYPE goal_priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE goal_status AS ENUM ('active', 'completed', 'paused', 'cancelled');

-- Add missing columns to existing goals table
ALTER TABLE goals 
  ADD COLUMN IF NOT EXISTS priority goal_priority DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS status goal_status DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS category VARCHAR(100),
  ADD COLUMN IF NOT EXISTS icon VARCHAR(50),
  ADD COLUMN IF NOT EXISTS color VARCHAR(7),
  ADD COLUMN IF NOT EXISTS notification_milestones JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS auto_contribution_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS auto_contribution_amount DECIMAL(15,2),
  ADD COLUMN IF NOT EXISTS auto_contribution_frequency VARCHAR(20);

-- Update existing goals to use new status system
UPDATE goals 
SET status = CASE 
  WHEN is_achieved = true THEN 'completed'::goal_status
  WHEN is_active = false THEN 'paused'::goal_status
  ELSE 'active'::goal_status
END;

-- Create goal_contributions table
CREATE TABLE IF NOT EXISTS goal_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID REFERENCES goals(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE NOT NULL,
  transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL, -- Optional link to transaction
  amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
  contribution_type VARCHAR(20) DEFAULT 'manual', -- 'manual', 'automatic', 'transaction_linked'
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_goals_priority ON goals(priority);
CREATE INDEX IF NOT EXISTS idx_goals_status ON goals(status);
CREATE INDEX IF NOT EXISTS idx_goals_category ON goals(category);
CREATE INDEX IF NOT EXISTS idx_goal_contributions_goal_id ON goal_contributions(goal_id);
CREATE INDEX IF NOT EXISTS idx_goal_contributions_user_id ON goal_contributions(user_id);
CREATE INDEX IF NOT EXISTS idx_goal_contributions_created_at ON goal_contributions(created_at);
CREATE INDEX IF NOT EXISTS idx_goal_contributions_transaction_id ON goal_contributions(transaction_id);

-- Enable RLS on goal_contributions
ALTER TABLE goal_contributions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for goal_contributions
CREATE POLICY "Users can view own goal contributions" ON goal_contributions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goal contributions" ON goal_contributions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goal contributions" ON goal_contributions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goal contributions" ON goal_contributions
  FOR DELETE USING (auth.uid() = user_id);

-- Enhanced function to update goal current_amount and status
CREATE OR REPLACE FUNCTION update_goal_from_contributions()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Add contribution to goal current_amount
    UPDATE goals 
    SET current_amount = current_amount + NEW.amount,
        updated_at = NOW(),
        status = CASE 
          WHEN (current_amount + NEW.amount) >= target_amount THEN 'completed'::goal_status
          ELSE status
        END,
        is_achieved = CASE 
          WHEN (current_amount + NEW.amount) >= target_amount THEN true
          ELSE is_achieved
        END
    WHERE id = NEW.goal_id;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Subtract contribution from goal current_amount
    UPDATE goals 
    SET current_amount = GREATEST(0, current_amount - OLD.amount),
        updated_at = NOW(),
        status = CASE 
          WHEN (current_amount - OLD.amount) < target_amount AND status = 'completed' THEN 'active'::goal_status
          ELSE status
        END,
        is_achieved = CASE 
          WHEN (current_amount - OLD.amount) < target_amount THEN false
          ELSE is_achieved
        END
    WHERE id = OLD.goal_id;
    
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Update goal current_amount with difference
    UPDATE goals 
    SET current_amount = GREATEST(0, current_amount + (NEW.amount - OLD.amount)),
        updated_at = NOW(),
        status = CASE 
          WHEN (current_amount + (NEW.amount - OLD.amount)) >= target_amount THEN 'completed'::goal_status
          WHEN (current_amount + (NEW.amount - OLD.amount)) < target_amount AND status = 'completed' THEN 'active'::goal_status
          ELSE status
        END,
        is_achieved = CASE 
          WHEN (current_amount + (NEW.amount - OLD.amount)) >= target_amount THEN true
          WHEN (current_amount + (NEW.amount - OLD.amount)) < target_amount THEN false
          ELSE is_achieved
        END
    WHERE id = NEW.goal_id;
    
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Drop old trigger and function
DROP TRIGGER IF EXISTS on_goal_amount_update ON goals;
DROP FUNCTION IF EXISTS check_goal_achievement();

-- Create new trigger for goal contributions
DROP TRIGGER IF EXISTS trigger_update_goal_from_contributions ON goal_contributions;
CREATE TRIGGER trigger_update_goal_from_contributions
  AFTER INSERT OR UPDATE OR DELETE ON goal_contributions
  FOR EACH ROW EXECUTE FUNCTION update_goal_from_contributions();

-- Add goal_id column to transactions table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'transactions' AND column_name = 'goal_id'
  ) THEN
    ALTER TABLE transactions ADD COLUMN goal_id UUID REFERENCES goals(id) ON DELETE SET NULL;
    CREATE INDEX idx_transactions_goal_id ON transactions(goal_id);
  END IF;
END $$;

-- Create a constraint to ensure only income/transfer transactions can be linked to goals
ALTER TABLE transactions 
DROP CONSTRAINT IF EXISTS check_goal_transaction_type;

ALTER TABLE transactions 
ADD CONSTRAINT check_goal_transaction_type 
CHECK (goal_id IS NULL OR type IN ('income', 'transfer'));

-- Function to automatically create goal contribution when transaction is linked to goal
CREATE OR REPLACE FUNCTION create_goal_contribution_from_transaction()
RETURNS TRIGGER AS $$
BEGIN
  -- Only for income/transfer transactions linked to goals
  IF NEW.goal_id IS NOT NULL AND NEW.type IN ('income', 'transfer') THEN
    INSERT INTO goal_contributions (
      goal_id,
      user_id,
      transaction_id,
      amount,
      contribution_type,
      notes
    ) VALUES (
      NEW.goal_id,
      NEW.user_id,
      NEW.id,
      NEW.amount,
      'transaction_linked',
      CONCAT('Linked from transaction: ', COALESCE(NEW.description, 'No description'))
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for transaction-goal linking
DROP TRIGGER IF EXISTS trigger_create_goal_contribution_from_transaction ON transactions;
CREATE TRIGGER trigger_create_goal_contribution_from_transaction
  AFTER INSERT OR UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION create_goal_contribution_from_transaction();

-- Function to handle goal contribution deletion when transaction is unlinked or deleted
CREATE OR REPLACE FUNCTION handle_transaction_goal_unlinking()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    -- If goal_id was changed or removed
    IF OLD.goal_id IS NOT NULL AND (NEW.goal_id IS NULL OR NEW.goal_id != OLD.goal_id) THEN
      DELETE FROM goal_contributions 
      WHERE transaction_id = OLD.id AND contribution_type = 'transaction_linked';
    END IF;
    
    -- If amount changed, update the contribution
    IF NEW.goal_id IS NOT NULL AND OLD.goal_id = NEW.goal_id AND OLD.amount != NEW.amount THEN
      UPDATE goal_contributions 
      SET amount = NEW.amount 
      WHERE transaction_id = NEW.id AND contribution_type = 'transaction_linked';
    END IF;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Delete linked contribution when transaction is deleted
    DELETE FROM goal_contributions 
    WHERE transaction_id = OLD.id AND contribution_type = 'transaction_linked';
    
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for handling transaction updates/deletions
DROP TRIGGER IF EXISTS trigger_handle_transaction_goal_unlinking ON transactions;
CREATE TRIGGER trigger_handle_transaction_goal_unlinking
  AFTER UPDATE OR DELETE ON transactions
  FOR EACH ROW EXECUTE FUNCTION handle_transaction_goal_unlinking();