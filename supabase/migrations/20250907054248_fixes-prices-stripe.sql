-- Mensual
UPDATE subscription_plans
SET stripe_price_id = 'price_1S4bLxQojnZODoVYdByDlz8R'
WHERE name = 'Premium Monthly';

-- Anual
UPDATE subscription_plans
SET stripe_price_id = 'price_1S4bPTQojnZODoVY82NX8Ni6'
WHERE name = 'Premium Yearly';