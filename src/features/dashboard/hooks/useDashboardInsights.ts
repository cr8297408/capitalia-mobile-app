/**
 * Dashboard Insights Hook - Hook for AI insights and category data
 * Following Scope Rule Pattern - Hook local to dashboard feature
 */

import { useState, useEffect, useCallback } from 'react';
import { TransactionService } from '@/shared/services/transactionService';
import { GoalService } from '@/features/goal-management/services/goalService';
import { supabase } from '@/infrastructure/supabase/client';
import { useAuth } from '@/shared/hooks/useAuth';

interface CategoryExpense {
  category: string;
  categoryId: string;
  amount: number;
  percentage: number;
  color: string;
  icon: string;
  type?: 'expense' | 'budget';  // Para diferenciar gastos reales de presupuestos
  budgetAmount?: number;  // Monto total del presupuesto (solo para type: 'budget')
}

interface AIInsight {
  id: string;
  type: 'savings' | 'spending' | 'goal' | 'budget';
  title: string;
  message: string;
  actionText?: string;
}

interface GoalProgress {
  id: string;
  name: string;
  currentAmount: number;
  targetAmount: number;
  progress: number;
}

export type PeriodType = 'this_month' | 'last_month' | 'last_3_months' | 'last_6_months' | 'this_year';

export function useDashboardInsights() {
  const { user } = useAuth();
  const [categoryExpenses, setCategoryExpenses] = useState<CategoryExpense[]>([]);
  const [aiInsights, setAIInsights] = useState<AIInsight[]>([]);
  const [goalProgress, setGoalProgress] = useState<GoalProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('this_month');

  // Load AI Insights from Supabase
  const loadAIInsights = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('ai_insights')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) {
        console.warn('Error fetching AI insights:', error.message);
        return;
      }

      const formattedInsights: AIInsight[] = data?.map((insight: any) => ({
        id: insight.id,
        type: insight.type as AIInsight['type'],
        title: insight.title,
        message: insight.message,
        actionText: insight.action_text,
      })) || [];

      setAIInsights(formattedInsights);
    } catch (err) {
      console.error('Error loading AI insights:', err);
    }
  }, [user?.id]);

  // Get date range based on selected period
  const getDateRange = useCallback((period: PeriodType) => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    switch (period) {
      case 'this_month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'last_month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'last_3_months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        break;
      case 'last_6_months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        break;
      case 'this_year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    return {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };
  }, []);

  const loadCategoryExpenses = useCallback(async (period: PeriodType) => {
    try {
      const { startDate, endDate } = getDateRange(period);
      
      // Query to get category expenses with real data from database
      const { data: expenseData, error: expenseError } = await supabase
        .from('transactions')
        .select(`
          id,
          amount,
          category_id,
          categories (
            id,
            name,
            icon,
            color
          )
        `)
        .eq('type', 'expense')
        .gte('date', startDate.split('T')[0])
        .lte('date', endDate.split('T')[0])
        .not('categories', 'is', null);

      if (expenseError) {
        throw new Error(`Error fetching category expenses: ${expenseError.message}`);
      }

      // Query to get active budgets with their categories
      const { data: budgetData, error: budgetError } = await supabase
        .from('budgets')
        .select(`
          id,
          name,
          amount,
          spent_amount,
          category_id,
          categories (
            id,
            name,
            icon,
            color
          )
        `)
        .eq('is_active', true)
        .gte('end_date', startDate.split('T')[0])
        .lte('start_date', endDate.split('T')[0])
        .not('categories', 'is', null);

      if (budgetError) {
        console.warn('Error fetching budgets:', budgetError.message);
      }

      // Group expenses by category
      const categoryTotals: Record<string, {
        name: string;
        total: number;
        icon: string;
        color: string;
      }> = {};

      // Process expense data
      if (expenseData && expenseData.length > 0) {
        expenseData.forEach((transaction: any) => {
          const category = transaction.categories;
          if (category && category.name) {
            const categoryId = category.id;
            const amount = Math.abs(transaction.amount); // Convert to positive for expenses
            
            if (!categoryTotals[categoryId]) {
              categoryTotals[categoryId] = {
                name: category.name,
                total: 0,
                icon: category.icon || 'tag',
                color: category.color || '#6B7280',
              };
            }
            
            categoryTotals[categoryId].total += amount;
          }
        });
      }

      // Calculate total expenses for percentage calculation
      const totalExpenses = Object.values(categoryTotals).reduce(
        (sum, category) => sum + category.total, 0
      );

      // Create category expenses array
      const expenseCategories = Object.entries(categoryTotals)
        .map(([categoryId, categoryData]) => ({
          category: categoryData.name,
          categoryId,
          amount: categoryData.total,
          percentage: totalExpenses > 0 ? Math.round((categoryData.total / totalExpenses) * 100) : 0,
          color: categoryData.color,
          icon: categoryData.icon,
          type: 'expense' as const,
        }));

      // Process budget data and add to the mix
      const budgetCategories: CategoryExpense[] = [];
      if (budgetData && budgetData.length > 0) {
        budgetData.forEach((budget: any) => {
          const category = budget.categories;
          if (category && category.name) {
            const spentAmount = budget.spent_amount || 0;
            const budgetAmount = budget.amount || 0;
            const percentage = budgetAmount > 0 ? Math.round((spentAmount / budgetAmount) * 100) : 0;
            
            budgetCategories.push({
              category: `${category.name} (Presupuesto)`,
              categoryId: budget.id, // Use budget ID for uniqueness
              amount: spentAmount,
              percentage,
              color: category.color || '#6B7280',
              icon: category.icon || 'tag',
              type: 'budget' as const,
              budgetAmount,
            });
          }
        });
      }

      // Combine expenses and budgets, sort by amount
      const allCategories = [...expenseCategories, ...budgetCategories]
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 8); // Show more items since we have both expenses and budgets

      setCategoryExpenses(allCategories);
    } catch (err) {
      console.error('Error loading category expenses and budgets:', err);
      throw err;
    }
  }, [getDateRange]);

  const loadGoalProgress = useCallback(async () => {
    try {
      const goals = await GoalService.getGoals();
      
      const activeGoals = goals
        .filter(goal => goal.status === 'active' && goal.is_active)
        .slice(0, 3) // Top 3 active goals
        .map(goal => ({
          id: goal.id,
          name: goal.name,
          currentAmount: goal.current_amount,
          targetAmount: goal.target_amount,
          progress: goal.target_amount > 0 ? goal.current_amount / goal.target_amount : 0,
        }));

      setGoalProgress(activeGoals);
    } catch (err) {
      console.error('Error loading goal progress:', err);
      throw err;
    }
  }, []);


  const loadData = useCallback(async (period?: PeriodType) => {
    const currentPeriod = period || selectedPeriod;
    
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await Promise.all([
        loadCategoryExpenses(currentPeriod),
        loadGoalProgress(),
        loadAIInsights(),
      ]);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error loading dashboard data';
      setError(errorMessage);
      console.error('Dashboard insights error:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id, selectedPeriod, loadCategoryExpenses, loadGoalProgress, loadAIInsights]);


  // Load data on mount and when user changes
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Function to change period and reload data
  const changePeriod = useCallback((newPeriod: PeriodType) => {
    setSelectedPeriod(newPeriod);
    loadData(newPeriod);
  }, [loadData]);

  return {
    categoryExpenses,
    aiInsights,
    goalProgress,
    loading,
    error,
    selectedPeriod,
    refresh: () => loadData(selectedPeriod),
    changePeriod,
  };
}