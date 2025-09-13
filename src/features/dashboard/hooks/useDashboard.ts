import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/shared/hooks/useAuth';
import { TransactionService } from '@/shared/services/transactionService';
import { Transaction } from '@/shared/types/transaction';
import { endOfMonth, startOfMonth } from 'date-fns';

type DashboardData = {
  recentTransactions: Transaction[];
  topCategories: Array<{ name: string; amount: number; percentage: number }>;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<boolean>;
};

export const useDashboard = (): DashboardData => {
  const { user } = useAuth();
  const [state, setState] = useState<Omit<DashboardData, 'refresh'>>({
    recentTransactions: [],
    topCategories: [],
    isLoading: true,
    error: null,
  });

  const calculateTopCategories = (
    transactions: Transaction[]
  ): Array<{ name: string; amount: number; percentage: number }> => {
    const categoryMap = new Map<string, number>();
    
    transactions.forEach((transaction) => {
      if (transaction.type === 'expense' && transaction.category_id) {
        const categoryName = transaction.category_id;
        const currentAmount = categoryMap.get(categoryName) || 0;
        categoryMap.set(categoryName, currentAmount + Math.abs(transaction.amount));
      }
    });

    const sortedCategories = Array.from(categoryMap.entries())
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    const totalExpenses = sortedCategories.reduce((sum, cat) => sum + cat.amount, 0);
    
    return sortedCategories.map((category) => ({
      ...category,
      percentage: totalExpenses > 0 ? Math.round((category.amount / totalExpenses) * 100) : 0,
    }));
  };

  const refresh = useCallback(async (): Promise<boolean> => {
    if (!user?.id) return false;
    
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const now = new Date();
      const currentMonthStart = startOfMonth(now);
      const currentMonthEnd = endOfMonth(now);

      const { data: currentMonthData } = await TransactionService.getInstance().getTransactions({
        fromDate: currentMonthStart.toISOString(),
        toDate: currentMonthEnd.toISOString(),
      });

      const currentMonthTransactions = currentMonthData || [];
      
      // Get recent transactions (first 5)
      const recentTransactions = currentMonthTransactions.slice(0, 5);
      const topCategories = calculateTopCategories(currentMonthTransactions);

      setState({
        recentTransactions,
        topCategories,
        isLoading: false,
        error: null,
      });

      return true;
    } catch (error) {
      console.error('Error refreshing dashboard data:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error : new Error('Failed to refresh dashboard data'),
      }));
      return false;
    }
  }, [user?.id]);

  // Initial load
  useEffect(() => {
    if (user?.id) {
      refresh();
    }
  }, [user?.id, refresh]);

  return {
    ...state,
    refresh,
  };
};
