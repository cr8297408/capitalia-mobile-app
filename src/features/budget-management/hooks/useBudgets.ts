import { useState, useEffect, useCallback } from 'react';
import { BudgetService, type Budget } from '../services/budgetService';
import { useAuth } from '@/shared/hooks/useAuth';

export interface UseBudgetsReturn {
  budgets: Budget[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createBudget: (budgetData: Parameters<typeof BudgetService.createBudget>[0]) => Promise<Budget>;
  deleteBudget: (id: string) => Promise<void>;
}

export const useBudgets = (): UseBudgetsReturn => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchBudgets = useCallback(async () => {
    if (!user) {
      setBudgets([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await BudgetService.getBudgets();
      setBudgets(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch budgets';
      setError(errorMessage);
      console.error('Error fetching budgets:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createBudget = useCallback(async (budgetData: Parameters<typeof BudgetService.createBudget>[0]) => {
    try {
      const newBudget = await BudgetService.createBudget(budgetData);
      setBudgets(prev => [newBudget, ...prev]);
      return newBudget;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create budget';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const deleteBudget = useCallback(async (id: string) => {
    try {
      await BudgetService.deleteBudget(id);
      setBudgets(prev => prev.filter(budget => budget.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete budget';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const refresh = useCallback(async () => {
    await fetchBudgets();
  }, [fetchBudgets]);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  return {
    budgets,
    loading,
    error,
    refresh,
    createBudget,
    deleteBudget,
  };
};