import { supabase } from '@/infrastructure/supabase/client';

export type TransactionType = 'income' | 'expense' | 'transfer';
export type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export type TransactionCreateInput = {
  description: string;
  amount: number;
  date: Date;
  type: TransactionType;
  account_id: string;
  category_id: string | null;
  is_recurring: boolean;
  recurring_frequency: RecurringFrequency | null;
  tags: string[];
  notes: string | null;
  transfer_to_account_id: string | null;
};

export const transactionService = {
  async createTransaction(transaction: Omit<TransactionCreateInput, 'date'> & { date: string }) {
    const { data, error } = await supabase
      .from('transactions')
      .insert([{
        ...transaction,
        tags: transaction.tags || [],
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }

    return data;
  },

  // Add other transaction-related methods here as needed
};
