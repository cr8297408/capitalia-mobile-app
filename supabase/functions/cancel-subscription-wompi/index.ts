// Supabase Edge Function: cancel-subscription-wompi
// Cancela la suscripción del usuario en Wompi

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
    const WOMPI_PRIVATE_KEY = Deno.env.get('WOMPI_PRIVATE_KEY');
    const WOMPI_API_URL = Deno.env.get('WOMPI_API_URL') || 'https://production.wompi.co/v1';
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!WOMPI_PRIVATE_KEY) {
      throw new Error('Missing Wompi private key');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get user ID from request
    const { userId } = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Missing userId parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get current subscription
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (subError || !subscription) {
      return new Response(
        JSON.stringify({ error: 'No active subscription found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Cancel subscription in Wompi (if API supports it)
    // Note: Wompi primarily handles one-time payments, so cancellation 
    // might just mean updating our database
    
    // Update subscription status in database
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        status: 'canceled',
        premium_features_enabled: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', subscription.id);

    if (updateError) {
      throw updateError;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Subscription canceled successfully' 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('Error canceling subscription:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
