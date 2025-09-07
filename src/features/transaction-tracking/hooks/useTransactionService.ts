import { useCallback } from 'react';
import { transactionService } from '../services/transactionService';
import type { TransactionType } from '@/types/supabase';

type CreateTransactionParams = {
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
      return await transactionService.createTransaction(transaction as any);
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  }, []);

  return {
    createTransaction,
  };
};
