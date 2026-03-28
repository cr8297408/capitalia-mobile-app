-- Migration: Fix handle_new_user to use Wompi column names
-- Date: 2025-11-05
-- Description: Updates the new user handler trigger function to use the renamed Wompi columns

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
DECLARE
  free_plan_id UUID;
BEGIN
  -- Create user profile (existing functionality)
  INSERT INTO public.profiles (user_id, email, first_name)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'first_name', ''));

  -- Get the free plan ID using the new Wompi column name (renamed from stripe_price_id)
  SELECT id INTO free_plan_id 
  FROM public.subscription_plans 
  WHERE wompi_price_id = 'price_free_wompi' 
  AND is_active = true 
  LIMIT 1;

  -- Create free subscription for the new user using the new Wompi column name (renamed from stripe_subscription_id)
  IF free_plan_id IS NOT NULL THEN
    INSERT INTO public.subscriptions (
      user_id,
      wompi_subscription_id,
      status,
      current_period_start,
      current_period_end,
      premium_features_enabled,
      plan_id
    ) VALUES (
      new.id,
      'free_' || new.id, -- Generate a unique identifier for free subscriptions
      'active'::public.subscription_status,
      now(),
      now() + interval '100 years', -- Free plan never expires
      false,
      free_plan_id
    );
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-add the comment to document the updated functionality
COMMENT ON FUNCTION handle_new_user() IS 
'Creates user profile and assigns free subscription when a new user registers via Supabase Auth (Wompi version)';
