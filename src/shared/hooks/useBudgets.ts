import { useState, useEffect } from 'react';
import { supabase } from '@/infrastructure/supabase/client';
import type { Budget, BudgetWithCategory } from '@/shared/types/budget';

export const useBudgets = () => {
  const [budgets, setBudgets] = useState<BudgetWithCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('budgets')
        .select(`
          *,
          categories:category_id (
            id,
            name,
            icon,
            color
          )
        `)
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) {
        throw error;
      }

      setBudgets(data || []);
    } catch (err) {
      console.error('Error fetching budgets:', err);
      setError(err instanceof Error ? err.message : 'Failed to load budgets');
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveBudgets = async () => {
    try {
      const { data, error } = await supabase
        .from('budgets')
        .select(`
          *,
          categories:category_id (
            id,
            name,
            icon,
            color
          )
        `)
        .eq('is_active', true)
        .gte('end_date', new Date().toISOString().split('T')[0])
        .order('name', { ascending: true });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (err) {
      console.error('Error fetching active budgets:', err);
      return [];
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const refetch = () => {
    fetchBudgets();
  };

  return {
    budgets,
    loading,
    error,
    refetch,
    fetchActiveBudgets,
  };
};