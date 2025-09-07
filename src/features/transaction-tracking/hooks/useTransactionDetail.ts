import { useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import { transactionDetailService, TransactionDetail } from '../services/transactionDetailService';

export const useTransactionDetail = (transactionId: string) => {
  const [transaction, setTransaction] = useState<TransactionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTransaction = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await transactionDetailService.getTransactionById(transactionId);
      setTransaction(data);
    } catch (err) {
      console.error('Error fetching transaction:', err);
      setError(err instanceof Error ? err : new Error('Error al cargar la transacción'));
      Alert.alert('Error', 'No se pudo cargar la transacción');
    } finally {
      setIsLoading(false);
    }
  }, [transactionId]);

  const deleteTransaction = useCallback(async () => {
    try {
      setIsLoading(true);
      await transactionDetailService.deleteTransaction(transactionId);
      return true;
    } catch (err) {
      console.error('Error deleting transaction:', err);
      setError(err instanceof Error ? err : new Error('Error al eliminar la transacción'));
      Alert.alert('Error', 'No se pudo eliminar la transacción');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [transactionId]);

  useEffect(() => {
    fetchTransaction();
  }, [fetchTransaction]);

  const refetch = useCallback(() => {
    return fetchTransaction();
  }, [fetchTransaction]);

  return {
    transaction,
    isLoading,
    error,
    refetch,
    deleteTransaction,
  };
};
