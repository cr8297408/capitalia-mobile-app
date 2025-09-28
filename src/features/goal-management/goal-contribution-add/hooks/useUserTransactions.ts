/**
 * Hook to get user transactions for goal contribution linking
 * Following Scope Rule Pattern - Hook specific to goal-contribution-add subdirectory
 */

import { useState, useEffect } from 'react';
import { TransactionService } from '@/shared/services/transactionService';
import type { TransactionWithCategory } from '@/shared/types/transaction.d';

interface UseUserTransactionsOptions {
  limit?: number;
  enabled?: boolean;
  excludeLinkedTransactions?: boolean;
}

export const useUserTransactions = (options: UseUserTransactionsOptions = {}) => {
  const { 
    limit = 50, 
    enabled = true, 
    excludeLinkedTransactions = true 
  } = options;

  const [transactions, setTransactions] = useState<TransactionWithCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const fetchTransactions = async () => {
      try {
        setLoading(true);
        setError(null);

        const transactionService = TransactionService.getInstance();
        const result = await transactionService.getTransactions({
          limit,
          isActiveAccount: true,
        });

        let filteredTransactions = result.data;

        // Optionally filter out transactions that are already linked to goal contributions
        if (excludeLinkedTransactions) {
          // This would require a more complex query or post-processing
          // For now, we'll return all transactions
          filteredTransactions = result.data;
        }

        // Sort by date descending (most recent first)
        filteredTransactions.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        setTransactions(filteredTransactions);
      } catch (err) {
        console.error('Error fetching user transactions:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [limit, enabled, excludeLinkedTransactions]);

  return {
    transactions,
    loading,
    error,
    refetch: () => {
      if (enabled) {
        const fetchTransactions = async () => {
          try {
            setLoading(true);
            setError(null);

            const transactionService = TransactionService.getInstance();
            const result = await transactionService.getTransactions({
              limit,
              isActiveAccount: true,
            });

            let filteredTransactions = result.data;
            filteredTransactions.sort((a, b) => 
              new Date(b.date).getTime() - new Date(a.date).getTime()
            );

            setTransactions(filteredTransactions);
          } catch (err) {
            console.error('Error refetching user transactions:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
          } finally {
            setLoading(false);
          }
        };

        fetchTransactions();
      }
    },
  };
};