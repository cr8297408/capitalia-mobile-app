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

// Mock AI insights (as requested to keep only AI insights as mock)
const MOCK_AI_INSIGHTS: AIInsight[] = [
  {
    id: '1',
    type: 'savings',
    title: 'Oportunidad de ahorro',
    message: 'Podrías ahorrar hasta 150€ reduciendo gastos en comida este mes',
    actionText: 'Ver sugerencias',
  },
  {
    id: '2',
    type: 'goal',
    title: 'Meta de Vacaciones casi alcanzada',
    message: 'Vas 75% hacia tu objetivo de 5.000€. ¡Solo 1.250€ más!',
    actionText: 'Ver meta',
  },
  {
    id: '3',
    type: 'spending',
    title: 'Alto gasto en Comida',
    message: 'Los gastos en comida han aumentado 15% este mes comparado con el anterior',
    actionText: 'Ver detalles',
  },
];

export function useDashboardInsights() {
  const { user } = useAuth();
  const [categoryExpenses, setCategoryExpenses] = useState<CategoryExpense[]>([]);
  const [aiInsights, setAIInsights] = useState<AIInsight[]>([]);
  const [goalProgress, setGoalProgress] = useState<GoalProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('this_month');

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
      const { data, error } = await supabase
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

      if (error) {
        throw new Error(`Error fetching category expenses: ${error.message}`);
      }

      if (!data || data.length === 0) {
        setCategoryExpenses([]);
        return;
      }

      // Group expenses by category
      const categoryTotals: Record<string, {
        name: string;
        total: number;
        icon: string;
        color: string;
      }> = {};

      data.forEach((transaction: any) => {
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

      // Calculate total expenses and percentages
      const totalExpenses = Object.values(categoryTotals).reduce(
        (sum, category) => sum + category.total, 0
      );

      // Create category expenses array with percentages
      const categories = Object.entries(categoryTotals)
        .map(([categoryId, categoryData]) => ({
          category: categoryData.name,
          categoryId,
          amount: categoryData.total,
          percentage: totalExpenses > 0 ? Math.round((categoryData.total / totalExpenses) * 100) : 0,
          color: categoryData.color,
          icon: categoryData.icon,
        }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5); // Top 5 categories

      setCategoryExpenses(categories);
    } catch (err) {
      console.error('Error loading category expenses:', err);
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

  const generateAIInsights = useCallback((categories: CategoryExpense[], goals: GoalProgress[]) => {
    // Use mock AI insights for now (as requested)
    setAIInsights(MOCK_AI_INSIGHTS);
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
      ]);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error loading dashboard data';
      setError(errorMessage);
      console.error('Dashboard insights error:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id, selectedPeriod, loadCategoryExpenses, loadGoalProgress]);

  // Generate insights when data changes
  useEffect(() => {
    generateAIInsights(categoryExpenses, goalProgress);
  }, [categoryExpenses, goalProgress, generateAIInsights]);

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