import { useState, useCallback, useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import { TransactionService } from '../services/transactionService';
import { Transaction } from '../types/transaction';

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
  
  // Use a ref to prevent concurrent loads which cause duplicates
  const loadingRef = useRef(false);

  const loadTransactions = useCallback(
    async (shouldRefresh = false) => {
      if (loadingRef.current) return;
      
      try {
        loadingRef.current = true;
        if (shouldRefresh) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }

        const currentPage = shouldRefresh ? 0 : page;
        const { data, count } = await TransactionService.getInstance().getTransactions({
          accountId,
          categoryId,
          fromDate,
          toDate,
          limit,
          offset: currentPage * limit,
        });

        setTransactions(prev => {
          if (shouldRefresh) return data;
          
          // De-duplicate items by ID to prevent repeats in the UI
          const existingIds = new Set(prev.map(t => t.id));
          const newItems = data.filter(t => !existingIds.has(t.id));
          return [...prev, ...newItems];
        });
        
        setTotalCount(count);
        setError(null);
      } catch (err) {
        console.error('Failed to load transactions:', err);
        setError(err instanceof Error ? err : new Error('Failed to load transactions'));
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
        loadingRef.current = false;
      }
    },
    [accountId, categoryId, fromDate, toDate, limit, page]
  );

  const handleRefresh = useCallback(() => {
    // If already loading, ignore refresh
    if (loadingRef.current) return;
    
    setPage(0);
    loadTransactions(true);
  }, [loadTransactions]);

  const handleLoadMore = useCallback(() => {
    if (!isLoading && !isRefreshing && !loadingRef.current && transactions.length < totalCount) {
      setPage(prev => prev + 1);
    }
  }, [isLoading, isRefreshing, transactions.length, totalCount]);

  const handleDeleteTransaction = useCallback(
    async (transactionId: string) => {
      try {
        await TransactionService.getInstance().deleteTransaction(transactionId);
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
