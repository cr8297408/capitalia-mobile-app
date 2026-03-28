-- Migration: Add AI Insights table and profile tracking
-- Date: 2025-11-05
-- Description: Creates a table for storing AI-generated insights and adds a column to profiles to track the last generation.

-- Create enum for insight types if needed, or just use text check
-- Using text check for simplicity and consistency with existing patterns

CREATE TABLE IF NOT EXISTS public.ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('savings', 'spending', 'goal', 'budget')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_text TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own insights" ON public.ai_insights
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all insights" ON public.ai_insights
  FOR ALL USING (true)
  WITH CHECK (true);

-- Add tracking to profiles to avoid over-generating insights
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS last_ai_insight_at TIMESTAMPTZ;

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_ai_insights_user_id ON public.ai_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_insights_created_at ON public.ai_insights(created_at DESC);

COMMENT ON TABLE public.ai_insights IS 'Stores AI-generated financial insights for users.';
