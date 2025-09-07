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
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')!
    )

    // Log the webhook event
    await supabase
      .from('webhook_logs')
      .insert({
        stripe_event_id: event.id,
        event_type: event.type,
        data: event,
        processed: false,
      })

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
        console.log(`Unhandled event type: ${event.type}`)
    }

    // Mark as processed
    await supabase
      .from('webhook_logs')
      .update({ processed: true })
      .eq('stripe_event_id', event.id)

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Webhook error:', error)
    
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
  const { data: customer } = await supabase
    .from('stripe_customers')
    .select('user_id')
    .eq('stripe_customer_id', subscription.customer)
    .single()

  if (!customer) {
    throw new Error('Customer not found')
  }

  const { data: plan } = await supabase
    .from('subscription_plans')
    .select('id')
    .eq('stripe_price_id', subscription.items.data[0].price.id)
    .single()

  await supabase
    .from('subscriptions')
    .upsert({
      user_id: customer.user_id,
      stripe_subscription_id: subscription.id,
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000),
      current_period_end: new Date(subscription.current_period_end * 1000),
      plan_id: plan?.id,
    })
}

async function handleSubscriptionCancellation(subscription: any) {
  await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      premium_features_enabled: false,
    })
    .eq('stripe_subscription_id', subscription.id)
}

async function handlePaymentSuccess(invoice: any) {
  if (invoice.subscription) {
    await supabase
      .from('subscriptions')
      .update({
        status: 'active',
        premium_features_enabled: true,
      })
      .eq('stripe_subscription_id', invoice.subscription)
  }
}

async function handlePaymentFailed(invoice: any) {
  if (invoice.subscription) {
    await supabase
      .from('subscriptions')
      .update({
        status: 'past_due',
        premium_features_enabled: false,
      })
      .eq('stripe_subscription_id', invoice.subscription)
  }
}