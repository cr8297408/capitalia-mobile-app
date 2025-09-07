import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const userId = url.searchParams.get('userId')

    if (!userId) {
      throw new Error('Missing required parameter: userId')
    }

    // Get subscription with plan details
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select(`
        *,
        subscription_plans (*)
      `)
      .eq('user_id', userId)
      .eq('premium_features_enabled', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error
    }

    // Get plan limits
    let limits = {
      maxTransactions: 100,
      maxAccounts: 3,
      maxBudgets: 5,
      canExportData: false,
      canUseAdvancedAnalytics: false,
      canUseRecurringTransactions: false,
      canAttachReceipts: false,
      canSetCustomCategories: false,
    }

    let isPremium = false

    if (subscription && subscription.subscription_plans) {
      const plan = subscription.subscription_plans
      isPremium = true
      limits = {
        maxTransactions: plan.max_transactions,
        maxAccounts: plan.max_accounts,
        maxBudgets: plan.max_budgets,
        canExportData: plan.can_export_data,
        canUseAdvancedAnalytics: plan.can_use_advanced_analytics,
        canUseRecurringTransactions: plan.can_use_recurring_transactions,
        canAttachReceipts: plan.can_attach_receipts,
        canSetCustomCategories: plan.can_set_custom_categories,
      }
    }

    return new Response(
      JSON.stringify({
        subscription,
        isPremium,
        limits,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Get subscription status error:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})