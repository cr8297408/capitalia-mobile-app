import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/shared/hooks/useAuth';
import { usePremiumFeatures } from '@/shared/hooks/usePremiumFeatures';
import { TransactionService } from '@/shared/services/transactionService';
import { accountService } from '@/shared/services/accountService';
import { Transaction } from '@/shared/types/transaction';
import { 
  endOfMonth, 
  startOfMonth, 
  subMonths, 
  format, 
  parseISO, 
  isWithinInterval, 
  subDays,
  isAfter,
  isBefore
} from 'date-fns';

type DashboardStats = {
  totalBalance: number;
  totalBalanceChange: number;
  totalBalanceIsPositive: boolean;
  monthlyIncome: number;
  monthlyIncomeChange: number;
  monthlyIncomeIsPositive: boolean;
  monthlyExpenses: number;
  monthlyExpensesChange: number;
  monthlyExpensesIsPositive: boolean;
  savingsRate: number;
  savingsRateChange: number;
  savingsRateIsPositive: boolean;
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
    totalBalanceChange: 0,
    totalBalanceIsPositive: true,
    monthlyIncome: 0,
    monthlyIncomeChange: 0,
    monthlyIncomeIsPositive: true,
    monthlyExpenses: 0,
    monthlyExpensesChange: 0,
    monthlyExpensesIsPositive: false,
    savingsRate: 0,
    savingsRateChange: 0,
    savingsRateIsPositive: true,
    topCategories: [],
    recentTransactions: [],
    isLoading: true,
    error: null,
  });

  const calculateMonthlyTransactions = (
    transactions: Transaction[], 
    startDate: Date, 
    endDate: Date
  ): { income: number; expenses: number } => {
    return transactions.reduce(
      (acc, transaction) => {
        const transactionDate = new Date(transaction.date);
        if (isWithinInterval(transactionDate, { start: startDate, end: endDate })) {
          if (transaction.type === 'income') {
            acc.income += Math.abs(transaction.amount);
          } else if (transaction.type === 'expense') {
            acc.expenses += Math.abs(transaction.amount);
          }
        }
        return acc;
      },
      { income: 0, expenses: 0 }
    );
  };

  const calculateChange = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return parseFloat((((current - previous) / Math.abs(previous)) * 100).toFixed(1));
  };

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
      setStats((prev) => ({ ...prev, isLoading: true, error: null }));

      const now = new Date();
      
      // Current month date range
      const currentMonthStart = startOfMonth(now);
      const currentMonthEnd = endOfMonth(now);
      
      // Previous month date range
      const previousMonthStart = startOfMonth(subMonths(now, 1));
      const previousMonthEnd = endOfMonth(subMonths(now, 1));

      // Fetch transactions for current and previous month
      const [{ data: currentMonthData }, { data: previousMonthData }] = await Promise.all([
        TransactionService.getInstance().getTransactions({
          fromDate: currentMonthStart.toISOString(),
          toDate: currentMonthEnd.toISOString(),
        }),
        TransactionService.getInstance().getTransactions({
          fromDate: previousMonthStart.toISOString(),
          toDate: previousMonthEnd.toISOString(),
        })
      ]);

      const currentMonthTransactions = currentMonthData || [];
      const previousMonthTransactions = previousMonthData || [];

      // Calculate current month metrics
      const { 
        income: currentMonthIncome, 
        expenses: currentMonthExpenses 
      } = calculateMonthlyTransactions(currentMonthTransactions, currentMonthStart, currentMonthEnd);
      
      // Calculate previous month metrics
      const { 
        income: previousMonthIncome, 
        expenses: previousMonthExpenses 
      } = calculateMonthlyTransactions(previousMonthTransactions, previousMonthStart, previousMonthEnd);

      // Calculate savings rate
      const currentSavingsRate = currentMonthIncome > 0 
        ? Math.max(0, Math.min(100, ((currentMonthIncome - currentMonthExpenses) / currentMonthIncome) * 100))
        : 0;
      
      const previousSavingsRate = previousMonthIncome > 0
        ? Math.max(0, Math.min(100, ((previousMonthIncome - previousMonthExpenses) / previousMonthIncome) * 100))
        : 0;
      
      // Fetch total balance from accounts
      const totalBalance = await accountService.getTotalBalance(user.id);
      
      // Calculate changes
      const monthlyIncomeChange = calculateChange(currentMonthIncome, previousMonthIncome);
      const monthlyExpensesChange = calculateChange(currentMonthExpenses, previousMonthExpenses);
      const savingsRateChange = calculateChange(currentSavingsRate, previousSavingsRate);
      
      // Calculate top categories
      const topCategories = calculateTopCategories(currentMonthTransactions);
      
      // Get recent transactions (first 5)
      const recentTransactions = currentMonthTransactions.slice(0, 5);

      setStats({
        totalBalance,
        totalBalanceChange: 0, // Would need previous balance for this
        totalBalanceIsPositive: totalBalance > 0,
        monthlyIncome: currentMonthIncome,
        monthlyIncomeChange,
        monthlyIncomeIsPositive: monthlyIncomeChange >= 0,
        monthlyExpenses: currentMonthExpenses,
        monthlyExpensesChange,
        monthlyExpensesIsPositive: monthlyExpensesChange < 0, // Lower expenses are better
        savingsRate: parseFloat(currentSavingsRate.toFixed(1)),
        savingsRateChange,
        savingsRateIsPositive: savingsRateChange > 0,
        topCategories,
        recentTransactions,
        isLoading: false,
        error: null,
      });

      return true;
    } catch (error) {
      console.error('Error refreshing dashboard data:', error);
      setStats((prev) => ({
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
    ...stats,
    refresh,
  };
};
