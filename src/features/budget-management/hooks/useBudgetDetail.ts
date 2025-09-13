import { useState, useEffect, useCallback } from 'react';
import { BudgetService, type Budget } from '../services/budgetService';

export interface BudgetProgress {
  spent: number;
  remaining: number;
  percentage: number;
}

export interface UseBudgetDetailReturn {
  budget: Budget | null;
  progress: BudgetProgress | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  updateSpentAmount: (spentAmount: number) => Promise<void>;
}

export const useBudgetDetail = (budgetId: string | undefined): UseBudgetDetailReturn => {
  const [budget, setBudget] = useState<Budget | null>(null);
  const [progress, setProgress] = useState<BudgetProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBudgetDetail = useCallback(async () => {
    if (!budgetId) {
      setBudget(null);
      setProgress(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const budgetData = await BudgetService.getBudgetById(budgetId);
      if (!budgetData) {
        setError('Budget not found');
        setBudget(null);
        setProgress(null);
        return;
      }

      setBudget(budgetData);

      const progressData = await BudgetService.getBudgetProgress(budgetId);
      setProgress(progressData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch budget details';
      setError(errorMessage);
      console.error('Error fetching budget details:', err);
    } finally {
      setLoading(false);
    }
  }, [budgetId]);

  const updateSpentAmount = useCallback(async (spentAmount: number) => {
    if (!budgetId) return;

    try {
      await BudgetService.updateSpentAmount(budgetId, spentAmount);

      // Update local state
      if (budget) {
        const updatedBudget = { ...budget, spent_amount: spentAmount };
        setBudget(updatedBudget);

        // Recalculate progress
        const newProgress: BudgetProgress = {
          spent: spentAmount,
          remaining: Math.max(0, budget.amount - spentAmount),
          percentage: Math.min(100, (spentAmount / budget.amount) * 100),
        };
        setProgress(newProgress);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update spent amount';
      setError(errorMessage);
      throw err;
    }
  }, [budgetId, budget]);

  const refresh = useCallback(async () => {
    await fetchBudgetDetail();
  }, [fetchBudgetDetail]);

  useEffect(() => {
    fetchBudgetDetail();
  }, [fetchBudgetDetail]);

  return {
    budget,
    progress,
    loading,
    error,
    refresh,
    updateSpentAmount,
  };
};