import { useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import { transactionListService } from '../../features/transaction-tracking/services/transactionListService';
import type { Transaction } from '../services/transactionService';

type UseTransactionListProps = {
  accountId?: string;
  categoryId?: string;
  fromDate?: string;
  toDate?: string;
  limit?: number;
};

export const useTransactionList = ({ 
  accountId, 
  categoryId, 
  fromDate, 
  toDate, 
  limit = 20 
}: UseTransactionListProps = {}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);

  const loadTransactions = useCallback(
    async (isRefreshing = false) => {
      try {
        if (isRefreshing) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }

        const { data, count } = await transactionListService.getTransactions({
          accountId,
          categoryId,
          fromDate,
          toDate,
          limit,
          offset: isRefreshing ? 0 : page * limit,
        });

        setTransactions(prev => (isRefreshing ? data : [...prev, ...data]));
        setTotalCount(count);
        setError(null);
      } catch (err) {
        console.error('Failed to load transactions:', err);
        setError(err instanceof Error ? err : new Error('Failed to load transactions'));
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [accountId, categoryId, fromDate, toDate, limit, page]
  );

  const handleRefresh = useCallback(() => {
    setPage(0);
    loadTransactions(true);
  }, [loadTransactions]);

  const handleLoadMore = useCallback(() => {
    if (!isLoading && !isRefreshing && transactions.length < totalCount) {
      setPage(prev => prev + 1);
    }
  }, [isLoading, isRefreshing, transactions.length, totalCount]);

  const handleDeleteTransaction = useCallback(
    async (transactionId: string) => {
      try {
        await transactionListService.deleteTransaction(transactionId);
        setTransactions(prev => prev.filter(tx => tx.id !== transactionId));
        setTotalCount(prev => prev - 1);
      } catch (err) {
        console.error('Failed to delete transaction:', err);
        Alert.alert('Error', 'Failed to delete transaction');
        throw err;
      }
    },
    []
  );

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  return {
    transactions,
    isLoading,
    isRefreshing,
    error,
    totalCount,
    hasMore: transactions.length < totalCount,
    refresh: handleRefresh,
    loadMore: handleLoadMore,
    deleteTransaction: handleDeleteTransaction,
  };
};
