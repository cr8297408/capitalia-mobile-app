// Supabase Edge Function: get-subscription-status-wompi
// Obtiene el estado actual de la suscripción del usuario

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get user ID from request
    const { userId } = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Missing userId parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get subscription with plan details
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select(`
        *,
        subscription_plans (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      throw error;
    }

    // Check if subscription is active
    const isPremium = subscription?.status === 'active' && 
                     new Date(subscription.current_period_end) > new Date();

    // Get subscription limits from plan
    const limits = {
      maxTransactions: subscription?.subscription_plans?.max_transactions || 1000000,
      maxAccounts: subscription?.subscription_plans?.max_accounts || 3,
      maxBudgets: subscription?.subscription_plans?.max_budgets || 5,
      maxGoals: subscription?.subscription_plans?.max_goals || 3,
      canExportData: subscription?.subscription_plans?.can_export_data || false,
      canUseAdvancedAnalytics: subscription?.subscription_plans?.can_use_advanced_analytics || false,
      canUseRecurringTransactions: subscription?.subscription_plans?.can_use_recurring_transactions || false,
      canAttachReceipts: subscription?.subscription_plans?.can_attach_receipts || false,
      canSetCustomCategories: subscription?.subscription_plans?.can_set_custom_categories || false,
    };

    const response = {
      subscription: subscription || null,
      isPremium,
      limits,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error getting subscription status:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
