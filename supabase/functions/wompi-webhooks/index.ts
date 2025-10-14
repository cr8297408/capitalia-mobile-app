// Supabase Edge Function: wompi-webhooks
// Procesa webhooks de eventos de Wompi

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createHmac } from 'https://deno.land/std@0.168.0/node/crypto.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-wompi-signature, x-wompi-timestamp',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const WOMPI_EVENT_SECRET = Deno.env.get('WOMPI_EVENT_SECRET');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!WOMPI_EVENT_SECRET) {
      throw new Error('Missing Wompi event secret');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get webhook payload
    const payload = await req.text();
    const event = JSON.parse(payload);

    // Verify Wompi signature
    const signature = req.headers.get('x-wompi-signature');
    const timestamp = req.headers.get('x-wompi-timestamp');

    if (signature && timestamp) {
      const signedPayload = `${timestamp}.${payload}`;
      const expectedSignature = createHmac('sha256', WOMPI_EVENT_SECRET)
        .update(signedPayload)
        .digest('hex');

      if (signature !== expectedSignature) {
        console.error('Invalid Wompi signature');
        return new Response(JSON.stringify({ error: 'Invalid signature' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Log webhook event
    await supabase.from('webhook_logs').insert({
      wompi_event_id: event.id || `event_${Date.now()}`,
      event_type: event.event,
      payload: event,
      payment_provider: 'wompi',
      processed_at: new Date().toISOString(),
    });

    // Process event based on type
    switch (event.event) {
      case 'transaction.updated':
        await handleTransactionUpdated(event.data, supabase);
        break;
      
      case 'subscription.created':
        await handleSubscriptionCreated(event.data, supabase);
        break;
      
      case 'subscription.updated':
        await handleSubscriptionUpdated(event.data, supabase);
        break;
      
      case 'subscription.canceled':
        await handleSubscriptionCanceled(event.data, supabase);
        break;

      default:
        console.log(`Unhandled event type: ${event.event}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Event handlers
async function handleTransactionUpdated(transaction: any, supabase: any) {
  console.log('Processing transaction update:', transaction);

  const reference = transaction.reference;
  const status = transaction.status;

  if (status === 'APPROVED') {
    // Transaction approved - create or update subscription
    const { data: customer } = await supabase
      .from('payment_customers')
      .select('user_id')
      .eq('email', transaction.customer_email)
      .single();

    if (customer) {
      // Create subscription record
      const subscriptionId = `wompi_sub_${transaction.id}`;
      
      await supabase.from('subscriptions').upsert({
        user_id: customer.user_id,
        wompi_subscription_id: subscriptionId,
        status: 'active',
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // +30 days
        premium_features_enabled: true,
      });
    }
  } else if (status === 'DECLINED' || status === 'ERROR') {
    console.log('Transaction failed:', transaction);
  }
}

async function handleSubscriptionCreated(subscription: any, supabase: any) {
  console.log('Subscription created:', subscription);
  // Handle subscription creation if Wompi supports recurring subscriptions
}

async function handleSubscriptionUpdated(subscription: any, supabase: any) {
  console.log('Subscription updated:', subscription);
  
  const { data: existingSub } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('wompi_subscription_id', subscription.id)
    .single();

  if (existingSub) {
    await supabase
      .from('subscriptions')
      .update({
        status: mapWompiStatus(subscription.status),
        current_period_end: subscription.current_period_end,
        premium_features_enabled: subscription.status === 'active',
      })
      .eq('wompi_subscription_id', subscription.id);
  }
}

async function handleSubscriptionCanceled(subscription: any, supabase: any) {
  console.log('Subscription canceled:', subscription);
  
  await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      premium_features_enabled: false,
    })
    .eq('wompi_subscription_id', subscription.id);
}

function mapWompiStatus(wompiStatus: string): string {
  const statusMap: Record<string, string> = {
    'ACTIVE': 'active',
    'PENDING': 'incomplete',
    'CANCELED': 'canceled',
    'EXPIRED': 'canceled',
  };
  return statusMap[wompiStatus] || 'incomplete';
}
