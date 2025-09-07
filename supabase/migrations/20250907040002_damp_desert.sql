/*
  # Financial Goals Table

  1. New Tables
    - `goals`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `name` (text) - Goal name
      - `target_amount` (decimal) - Target amount to save
      - `current_amount` (decimal) - Current saved amount
      - `target_date` (date) - Target completion date
      - `description` (text) - Goal description
      - `is_achieved` (boolean) - Whether goal is completed
      - `is_active` (boolean) - Whether goal is active
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `goals` table
    - Add policies for user data access
*/

-- Goals table
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  target_amount DECIMAL(15,2) NOT NULL CHECK (target_amount > 0),
  current_amount DECIMAL(15,2) DEFAULT 0.00 CHECK (current_amount >= 0),
  target_date DATE,
  description TEXT,
  is_achieved BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- Goals policies
CREATE POLICY "Users can view own goals" ON goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals" ON goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals" ON goals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals" ON goals
  FOR DELETE USING (auth.uid() = user_id);

-- Apply update trigger
CREATE TRIGGER update_goals_updated_at 
  BEFORE UPDATE ON goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically mark goal as achieved
CREATE OR REPLACE FUNCTION check_goal_achievement()
RETURNS trigger AS $$
BEGIN
  IF NEW.current_amount >= NEW.target_amount AND OLD.is_achieved = false THEN
    NEW.is_achieved = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for goal achievement
CREATE TRIGGER on_goal_amount_update
  BEFORE UPDATE ON goals
  FOR EACH ROW EXECUTE FUNCTION check_goal_achievement();

-- Index for performance
CREATE INDEX idx_goals_user_active ON goals(user_id, is_active);
CREATE INDEX idx_goals_target_date ON goals(target_date);