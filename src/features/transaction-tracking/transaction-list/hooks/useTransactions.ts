import { useState, useEffect } from 'react';
import { TransactionService } from '@/shared/services/transactionService';
import type { Transaction } from '@/shared/types/transaction';

export const useTransactions = (accountId: string) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await TransactionService.getInstance().getRecentTransactionsByAccount(accountId);
      setTransactions(data);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Failed to load transactions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (accountId) {
      fetchTransactions();
    }
  }, [accountId]);

  const refresh = () => {
    fetchTransactions();
  };

  return {
    transactions,
    isLoading,
    error,
    refresh,
  };
};
