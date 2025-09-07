-- Add the adjustment category
INSERT INTO categories (name, icon, color, is_system_default, transaction_type, created_at, updated_at)
VALUES 
  ('Ajuste', 'adjust', '#9CA3AF', true, 'expense', now(), now())