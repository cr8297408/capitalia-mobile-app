/*
  # Update New User Handler to Include Free Subscription

  1. Changes
    - Modify existing `handle_new_user()` function to also create a free subscription
    - Assign new users to the free plan automatically
    - Set appropriate subscription status and dates

  2. Security
    - Function runs with SECURITY DEFINER to ensure proper permissions
    - Uses existing trigger on auth.users table
*/

-- Update the existing function to also create a free subscription
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
DECLARE
  free_plan_id UUID;
BEGIN
  -- Create user profile (existing functionality)
  INSERT INTO public.profiles (user_id, email, first_name)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'first_name', ''));

  -- Get the free plan ID
  SELECT id INTO free_plan_id 
  FROM subscription_plans 
  WHERE stripe_price_id = 'price_free' 
  AND is_active = true 
  LIMIT 1;

  -- Create free subscription for the new user
  IF free_plan_id IS NOT NULL THEN
    INSERT INTO public.subscriptions (
      user_id,
      stripe_subscription_id,
      status,
      current_period_start,
      current_period_end,
      premium_features_enabled,
      plan_id
    ) VALUES (
      new.id,
      'free_' || new.id, -- Generate a unique identifier for free subscriptions
      'active'::subscription_status,
      now(),
      now() + interval '100 years', -- Free plan never expires
      false,
      free_plan_id
    );
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- The trigger already exists, no need to recreate it
-- Just add a comment to document the updated functionality
COMMENT ON FUNCTION handle_new_user() IS 
'Creates user profile and assigns free subscription when a new user registers via Supabase Auth';
