import { supabase } from '@/infrastructure/supabase/client';
import type { Database, TransactionType } from '@/types/supabase';

type Transaction = Database['public']['Tables']['transactions']['Row'];
type InsertTransaction = Database['public']['Tables']['transactions']['Insert'];
type UpdateTransaction = Database['public']['Tables']['transactions']['Update'];

export type { Transaction, TransactionType };

// Define the transaction type with required fields
type TransactionInsert = Omit<InsertTransaction, 'id' | 'created_at' | 'updated_at'> & {
  user_id: string;
  account_id: string;
  amount: number;
  type: TransactionType;
  description: string;
  category_id: string;
  date: string;
  is_recurring: boolean;
};

export const transactionService = {
  async getRecentTransactionsByAccount(accountId: string, limit = 5): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('account_id', accountId)
      .order('date', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  async getTransactionById(transactionId: string): Promise<Transaction | null> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transactionId)
      .single();

    if (error) return null;
    return data;
  },

  async createTransaction(transaction: TransactionInsert): Promise<Transaction> {
    const { data, error } = await supabase
      .from('transactions')
      .insert(transaction as any) // Type assertion to bypass type checking
      .select()
      .single();

    if (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
    if (!data) throw new Error('No data returned from transaction creation');
    return data;
  },

  async updateTransaction(
    transactionId: string,
    updates: Omit<UpdateTransaction, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Transaction> {
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString(),
    };
    
    const { data, error } = await supabase
      .from('transactions')
      .update(updateData as never) // Type assertion to bypass type checking
      .eq('id', transactionId)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('No data returned from transaction update');
    return data;
  },

  async deleteTransaction(transactionId: string): Promise<boolean> {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', transactionId);

    if (error) throw error;
    return true;
  },

  // Helper function to format transaction amount with currency
  formatTransactionAmount(transaction: { amount: number; type: TransactionType }, currency: string): string {
    const sign = transaction.type === 'expense' ? '-' : '';
    return `${sign}${currency}${Math.abs(transaction.amount).toFixed(2)}`;
  },
};
