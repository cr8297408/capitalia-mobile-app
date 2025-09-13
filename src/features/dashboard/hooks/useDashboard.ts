import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/shared/hooks/useAuth';
import { usePremiumFeatures } from '@/shared/hooks/usePremiumFeatures';
import { TransactionService } from '@/shared/services/transactionService';
import { Transaction } from '@/shared/types/transaction';

type DashboardStats = {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
  topCategories: Array<{ name: string; amount: number; percentage: number }>;
  recentTransactions: Transaction[];
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<boolean>;
};

export const useDashboard = (): DashboardStats => {
  const { user } = useAuth();
  const { isPremium } = usePremiumFeatures();
  const [stats, setStats] = useState<Omit<DashboardStats, 'refresh'>>({
    totalBalance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    savingsRate: 0,
    topCategories: [],
    recentTransactions: [],
    isLoading: true,
    error: null,
  });

  const refresh = useCallback(async () => {
    try {
      // Fetch recent transactions with proper typing
      // Fetch transactions without sort parameter since it's not in GetTransactionsParams
      const { data } = await TransactionService.getInstance().getTransactions({
        limit: 5,
      });
      const transactions = data || [];

        // Calculate metrics (simplified - you'd want to implement proper calculations)
        const monthlyIncome = 0;
        const monthlyExpenses = 0;
        const totalBalance = 0; // This should come from accounts
        const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0;
        
        // Mock top categories (implement actual aggregation in your backend)
        const topCategories = [
          { name: 'Food & Dining', amount: 350, percentage: 25 },
          { name: 'Shopping', amount: 280, percentage: 20 },
          { name: 'Transportation', amount: 180, percentage: 13 },
        ];

      setStats({
        totalBalance,
        monthlyIncome,
        monthlyExpenses,
        savingsRate,
        topCategories,
        recentTransactions: transactions as Transaction[] || [],
        isLoading: false,
        error: null,
      });
      return true;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setStats(prev => ({
        ...prev,
        isLoading: false,
        error: error as Error,
      }));
      return false;
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      refresh();
    }
  }, [user, refresh]);

  return {
    ...stats,
    refresh,
  };
};
