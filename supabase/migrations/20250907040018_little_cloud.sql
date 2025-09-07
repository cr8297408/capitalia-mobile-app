/*
  # Realtime Configuration

  1. Realtime Publications
    - Enable realtime for all main tables
    - Configure row level security for realtime

  2. Realtime Subscriptions Setup
    - Configure tables for realtime updates
    - Set appropriate security policies
*/

-- Enable realtime for main tables
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE accounts;
ALTER PUBLICATION supabase_realtime ADD TABLE transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE budgets;
ALTER PUBLICATION supabase_realtime ADD TABLE categories;
ALTER PUBLICATION supabase_realtime ADD TABLE goals;

-- Grant realtime permissions
GRANT SELECT ON profiles TO anon, authenticated;
GRANT SELECT ON accounts TO anon, authenticated;  
GRANT SELECT ON transactions TO anon, authenticated;
GRANT SELECT ON budgets TO anon, authenticated;
GRANT SELECT ON categories TO anon, authenticated;
GRANT SELECT ON goals TO anon, authenticated;

-- Realtime security is handled by existing RLS policies
-- No additional configuration needed as RLS policies will apply to realtime