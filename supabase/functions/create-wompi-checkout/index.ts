// Supabase Edge Function: create-wompi-checkout
// Crea una transacción de checkout en Wompi

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get environment variables
    const WOMPI_PRIVATE_KEY = Deno.env.get('WOMPI_PRIVATE_KEY');
    const WOMPI_PUBLIC_KEY = Deno.env.get('WOMPI_PUBLIC_KEY');
    const WOMPI_API_URL = Deno.env.get('WOMPI_API_URL') || 'https://production.wompi.co/v1';
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!WOMPI_PRIVATE_KEY || !WOMPI_PUBLIC_KEY) {
      throw new Error('Missing Wompi API keys');
    }

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get request body
    const { priceId, userId, email, customerName } = await req.json();

    if (!priceId || !userId || !email) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get plan details from database
    const { data: plan, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('wompi_price_id', priceId)
      .single();

    if (planError || !plan) {
      return new Response(
        JSON.stringify({ error: 'Plan not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get or create Wompi customer
    let wompiCustomerId;
    const { data: existingCustomer } = await supabase
      .from('payment_customers')
      .select('wompi_customer_id')
      .eq('user_id', userId)
      .single();

    if (existingCustomer?.wompi_customer_id) {
      wompiCustomerId = existingCustomer.wompi_customer_id;
    } else {
      // Create customer in Wompi (if API supports it)
      // For now, we'll use the email as reference
      wompiCustomerId = `customer_${userId}`;
      
      // Save to database
      await supabase.from('payment_customers').insert({
        user_id: userId,
        wompi_customer_id: wompiCustomerId,
        email: email,
        payment_provider: 'wompi'
      });
    }

    // Create payment link with Wompi
    // Wompi uses payment links or acceptance tokens
    const amountInCents = plan.amount * 100; // Convert to cents
    const reference = `sub_${userId}_${Date.now()}`;

    const wompiPayload = {
      acceptance_token: null, // Will be generated client-side
      amount_in_cents: amountInCents,
      currency: plan.currency || 'COP',
      customer_email: email,
      payment_method: {
        type: 'CARD',
        installments: 1,
      },
      reference: reference,
      redirect_url: `${Deno.env.get('APP_URL')}/subscription/success?reference=${reference}`,
    };

    // For Wompi, we typically generate acceptance tokens client-side
    // Here we return the necessary data for the client to complete the payment
    const response = {
      success: true,
      publicKey: WOMPI_PUBLIC_KEY,
      amount: amountInCents,
      currency: plan.currency || 'COP',
      reference: reference,
      customerEmail: email,
      redirectUrl: wompiPayload.redirect_url,
      planId: plan.id,
      wompiCustomerId: wompiCustomerId,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error creating Wompi checkout:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
