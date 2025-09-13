import { useCallback } from 'react';
import { TransactionService } from '../../../shared/services/transactionService';
import type { TransactionType } from '@/shared/types/supabase';

type CreateTransactionParams = {
  user_id: string;
  account_id: string;
  amount: number;
  type: TransactionType;
  description: string;
  category_id: string;
  date: string;
  is_recurring: boolean;
  notes?: string;
};

export const useTransactionService = () => {
  const createTransaction = useCallback(async (transaction: CreateTransactionParams) => {
    console.log("🚀 ~ createTransaction ~ transaction:", transaction)
    try {
      return await TransactionService.getInstance().createTransaction(transaction as any);
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  }, []);

  return {
    createTransaction,
  };
};
