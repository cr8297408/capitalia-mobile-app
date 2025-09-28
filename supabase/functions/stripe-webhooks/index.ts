import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@12.0.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2022-11-15',
})

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, stripe-signature',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders })
  }

  try {
    const signature = req.headers.get('stripe-signature')
    if (!signature) {
      throw new Error('Missing stripe-signature header')
    }

    const body = await req.text()
    console.log('🔔 [webhook] Raw body length:', body?.length)
    console.log('🔐 [webhook] Received signature header')
    // In Edge/Deno runtimes, use the async variant to avoid SubtleCrypto sync restrictions
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')!
    )

    console.log('🧾 [webhook] Constructed event:', {
      id: event.id,
      type: event.type,
      api_version: (event as any).api_version,
    })

    // Log the webhook event
    const { error: insertLogError } = await supabase
      .from('webhook_logs')
      .insert({
        stripe_event_id: event.id,
        event_type: event.type,
        data: event,
        processed: false,
      })
    if (insertLogError) {
      console.error('❌ [webhook] Failed inserting webhook_logs:', insertLogError)
      throw new Error('Insert webhook_logs failed')
    } else {
      console.log('📝 [webhook] Inserted webhook_logs for event:', event.id)
    }

    // Handle different event types
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object)
        break
        
      case 'customer.subscription.deleted':
        await handleSubscriptionCancellation(event.data.object)
        break
        
      case 'invoice.payment_succeeded':
        await handlePaymentSuccess(event.data.object)
        break
        
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object)
        break
        
      default:
        console.log(`🤷 [webhook] Unhandled event type: ${event.type}`)
    }

    // Mark as processed
    const { error: processedMarkError } = await supabase
      .from('webhook_logs')
      .update({ processed: true })
      .eq('stripe_event_id', event.id)
    if (processedMarkError) {
      console.error('❌ [webhook] Failed marking webhook as processed:', processedMarkError)
      throw new Error('Mark webhook as processed failed')
    } else {
      console.log('🔄 [webhook] Marked webhook as processed:', event.id)
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error: any) {
    console.error('🧨 Webhook error (outer catch):', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

async function handleSubscriptionUpdate(subscription: any) {
  console.log('🚀 [handleSubscriptionUpdate] Start:', {
    subscription_id: subscription?.id,
    customer: subscription?.customer,
    status: subscription?.status,
    price_id: subscription?.items?.data?.[0]?.price?.id,
  })
  const { data: customer } = await supabase
    .from('stripe_customers')
    .select('user_id')
    .eq('stripe_customer_id', subscription.customer)
    .single()

  if (!customer) {
    console.error('⚠️ [handleSubscriptionUpdate] Customer not found for stripe_customer_id:', subscription.customer)
    throw new Error('Customer not found')
  }

  const { data: plan, error: planErr } = await supabase
    .from('subscription_plans')
    .select('id')
    .eq('stripe_price_id', subscription.items.data[0].price.id)
    .single()
  if (planErr) {
    console.error('❌ [handleSubscriptionUpdate] Error fetching plan by price id:', planErr)
    throw new Error('Fetch plan by price id failed')
  }
  console.log('🗺️ [handleSubscriptionUpdate] Mapping to plan id:', plan?.id)

  // Some events (e.g., created with status 'incomplete') may not include top-level current_period_* yet.
  // Fallback order: subscription.current_period_* -> item.current_period_* -> now
  const now = new Date()
  const item = subscription?.items?.data?.[0]
  const startEpoch = subscription?.current_period_start
    ?? item?.current_period_start
  const endEpoch = subscription?.current_period_end
    ?? item?.current_period_end
  const currentPeriodStart = startEpoch ? new Date(startEpoch * 1000) : now
  const currentPeriodEnd = endEpoch ? new Date(endEpoch * 1000) : now
  console.log('🕒 [handleSubscriptionUpdate] Computed period:', {
    source_start: subscription?.current_period_start ? 'subscription' : (item?.current_period_start ? 'item' : 'fallback_now'),
    source_end: subscription?.current_period_end ? 'subscription' : (item?.current_period_end ? 'item' : 'fallback_now'),
    currentPeriodStart,
    currentPeriodEnd,
  })

  const { error: upsertErr } = await supabase
    .from('subscriptions')
    .upsert({
      user_id: customer.user_id,
      stripe_subscription_id: subscription.id,
      status: subscription.status,
      current_period_start: currentPeriodStart,
      current_period_end: currentPeriodEnd,
      plan_id: plan?.id,
    })
  if (upsertErr) {
    console.error('❌ [handleSubscriptionUpdate] Upsert subscriptions error:', upsertErr)
    throw new Error('Upsert subscriptions failed')
  } else {
    console.log('✅ [handleSubscriptionUpdate] Upsert subscriptions OK for user:', customer.user_id)
  }
}

async function handleSubscriptionCancellation(subscription: any) {
  console.log('🗑️ [handleSubscriptionCancellation] Start:', {
    subscription_id: subscription?.id,
  })
  const { error: cancelErr } = await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      premium_features_enabled: false,
    })
    .eq('stripe_subscription_id', subscription.id)
  if (cancelErr) {
    console.error('❌ [handleSubscriptionCancellation] Update error:', cancelErr)
    throw new Error('Cancel subscription update failed')
  } else {
    console.log('✅ [handleSubscriptionCancellation] Marked canceled for subscription:', subscription.id)
  }
}

async function handlePaymentSuccess(invoice: any) {
  console.log('💰 [handlePaymentSuccess] Start:', {
    subscription: invoice?.subscription,
    invoice_id: invoice?.id,
  })
  // Derive subscription id from multiple possible locations depending on Stripe api_version
  const lineItem = invoice?.lines?.data?.[0]
  const subFromInvoice = invoice?.subscription
  const subFromLineParent = lineItem?.parent?.subscription_item_details?.subscription
  const subFromParent = invoice?.parent?.subscription_details?.subscription
  const subscriptionId = subFromInvoice ?? subFromLineParent ?? subFromParent
  console.log('🧭 [handlePaymentSuccess] Resolved subscription id source:', {
    subFromInvoice: !!subFromInvoice,
    subFromLineParent: !!subFromLineParent,
    subFromParent: !!subFromParent,
    subscriptionId,
  })

  if (!subscriptionId) {
    console.error('❌ [handlePaymentSuccess] Unable to resolve subscription id from invoice payload')
    throw new Error('Missing subscription id in invoice')
  }

  if (subscriptionId) {
    const { error: successErr } = await supabase
      .from('subscriptions')
      .update({
        status: 'active',
        premium_features_enabled: true,
      })
      .eq('stripe_subscription_id', subscriptionId)
    if (successErr) {
      console.error('❌ [handlePaymentSuccess] Update error:', successErr)
      throw new Error('Payment success update failed')
    } else {
      console.log('✅ [handlePaymentSuccess] Marked active for subscription:', subscriptionId)
    }
  }
}

async function handlePaymentFailed(invoice: any) {
  console.log('🚫 [handlePaymentFailed] Start:', {
    subscription: invoice?.subscription,
    invoice_id: invoice?.id,
  })
  if (invoice.subscription) {
    const { error: failedErr } = await supabase
      .from('subscriptions')
      .update({
        status: 'past_due',
        premium_features_enabled: false,
      })
      .eq('stripe_subscription_id', invoice.subscription)
    if (failedErr) {
      console.error('❌ [handlePaymentFailed] Update error:', failedErr)
      throw new Error('Payment failed update failed')
    } else {
      console.log('✅ [handlePaymentFailed] Marked past_due for subscription:', invoice.subscription)
    }
  }
}