import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(
  SUPABASE_URL!,
  SUPABASE_SERVICE_ROLE_KEY!
);

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { userId } = await req.json().catch(() => ({ userId: null }));
    
    // If no userId provided, we might want to iterate over all active users (Cron mode)
    // For now, let's focus on a single user implementation which can be called by a cron per user
    // or we can fetch a list of users who haven't had an insight in 24h.
    
    let targetUsers = [];
    if (userId) {
      targetUsers = [userId];
    } else {
      // Cron mode: Fetch users who haven't had an insight in the last 24 hours
      // and have at least some transactions
      const { data: usersToProcess, error: userError } = await supabase
        .from('profiles')
        .select('user_id')
        .or(`last_ai_insight_at.is.null,last_ai_insight_at.lt.${new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()}`)
        .limit(10); // Process in batches of 10 to avoid timeouts

      if (userError) throw userError;
      targetUsers = usersToProcess?.map(u => u.user_id) || [];
    }

    if (targetUsers.length === 0) {
      return new Response(JSON.stringify({ message: 'No users to process' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const results = [];

    for (const id of targetUsers) {
      const insightResult = await generateUserInsights(id);
      results.push({ userId: id, ...insightResult });
    }

    return new Response(JSON.stringify({ results }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error generating AI insights:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateUserInsights(userId: string) {
  try {
    // 1. Fetch user data
    const [transactions, budgets, goals, profile] = await Promise.all([
      supabase.from('transactions').select('amount, type, date, category_id, categories(name)').eq('user_id', userId).order('date', { ascending: false }).limit(50),
      supabase.from('budgets').select('*, categories(name)').eq('user_id', userId).eq('is_active', true),
      supabase.from('goals').select('*').eq('user_id', userId).eq('is_active', true),
      supabase.from('profiles').select('first_name').eq('user_id', userId).single()
    ]);

    // 2. Prepare data for Groq
    const userData = {
      transactions: transactions.data || [],
      budgets: budgets.data || [],
      goals: goals.data || [],
      userName: profile.data?.first_name || 'Usuario'
    };

    // We generate insights if the user has AT LEAST one of: transactions, budgets, or goals
    const hasData = userData.transactions.length > 0 || userData.budgets.length > 0 || userData.goals.length > 0;
    
    if (!hasData) {
      return { status: 'skipped', reason: 'No financial data found (transactions, budgets, or goals)' };
    }

    // 3. Call Groq
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `Eres un asistente financiero experto llamado Capitalia AI. 
            Analiza los datos financieros del usuario (transacciones, presupuestos y metas) y genera 2-3 "insights" cortos y accionables en ESPAÑOL.
            
            IMPORTANTE:
            - Si el usuario no tiene transacciones, enfócate en motivarlo a alcanzar sus metas y cumplir con sus presupuestos.
            - Si no tiene presupuestos o metas, sugiérele crearlos para mejorar su salud financiera.
            
            Cada insight debe tener:
            - type: uno de ['savings', 'spending', 'goal', 'budget']
            - title: Un título corto y directo.
            - message: Un consejo de máximo 2 frases.
            - action_text: (opcional) Texto para un botón de acción.
            
            Responde ÚNICAMENTE en formato JSON con la siguiente estructura:
            { "insights": [ { "type": "...", "title": "...", "message": "...", "action_text": "..." } ] }`
          },
          {
            role: 'user',
            content: `Datos del usuario ${userData.userName}: ${JSON.stringify(userData)}`
          }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      })
    });

    const completion = await response.json();
    const insights = JSON.parse(completion.choices[0].message.content).insights;

    // 4. Save to DB
    // First, delete old insights (optional, or keep a history)
    // For now, let's keep it simple and just insert new ones
    const { error: insertError } = await supabase.from('ai_insights').insert(
      insights.map((ins: any) => ({
        user_id: userId,
        type: ins.type,
        title: ins.title,
        message: ins.message,
        action_text: ins.action_text
      }))
    );

    if (insertError) throw insertError;

    // Update last_ai_insight_at
    await supabase.from('profiles').update({ last_ai_insight_at: new Date().toISOString() }).eq('user_id', userId);

    return { status: 'success', count: insights.length };

  } catch (error: any) {
    console.error(`Error for user ${userId}:`, error);
    return { status: 'error', error: error.message };
  }
}
