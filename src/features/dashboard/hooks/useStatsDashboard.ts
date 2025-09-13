import { useCallback, useEffect, useState } from 'react';
import { TransactionService } from '@/shared/services/transactionService';
import { accountService } from '@/shared/services/accountService';
import { endOfMonth, startOfMonth, subMonths, isWithinInterval } from 'date-fns';

export const useStatsDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [stats, setStats] = useState({
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
  });

  const calculateMonthlyTransactions = useCallback((transactions: any[], startDate: Date, endDate: Date) => {
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
  }, []);

  const calculateChange = useCallback((current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return parseFloat((((current - previous) / Math.abs(previous)) * 100).toFixed(1));
  }, []);

  const refreshStats = useCallback(async (userId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const now = new Date();
      const currentMonthStart = startOfMonth(now);
      const currentMonthEnd = endOfMonth(now);
      const previousMonthStart = startOfMonth(subMonths(now, 1));
      const previousMonthEnd = endOfMonth(subMonths(now, 1));

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
      
      // Get total balance from accounts
      const totalBalance = await accountService.getTotalBalance(userId);
      
      // Calculate changes
      const monthlyIncomeChange = calculateChange(currentMonthIncome, previousMonthIncome);
      const monthlyExpensesChange = calculateChange(currentMonthExpenses, previousMonthExpenses);
      const savingsRateChange = calculateChange(currentSavingsRate, previousSavingsRate);

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
      });

      return true;
    } catch (err) {
      console.error('Error refreshing dashboard stats:', err);
      setError(err instanceof Error ? err : new Error('Failed to load dashboard stats'));
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [calculateChange, calculateMonthlyTransactions]);

  return {
    ...stats,
    isLoading,
    error,
    refresh: refreshStats,
  };
};
