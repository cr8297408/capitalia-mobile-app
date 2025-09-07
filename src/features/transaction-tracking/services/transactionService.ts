import { supabase } from '@/infrastructure/supabase/client';
import type { Database, TransactionType } from '@/types/supabase';

type Transaction = Database['public']['Tables']['transactions']['Row'];
type InsertTransaction = Database['public']['Tables']['transactions']['Insert'];
type UpdateTransaction = Database['public']['Tables']['transactions']['Update'];

export type { Transaction, TransactionType };

// This is a workaround for TypeScript to properly type the Supabase client
const transactionsTable = () => supabase.from('transactions');

export const transactionService = {
  async getRecentTransactionsByAccount(accountId: string, limit = 5): Promise<Transaction[]> {
    const { data, error } = await transactionsTable()
      .select('*')
      .eq('account_id', accountId)
      .order('date', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  async getTransactionById(transactionId: string): Promise<Transaction | null> {
    const { data, error } = await transactionsTable()
      .select('*')
      .eq('id', transactionId)
      .single();

    if (error) return null;
    return data;
  },

  async createTransaction(transaction: Omit<InsertTransaction, 'id' | 'created_at' | 'updated_at'>): Promise<Transaction> {
    const { data, error } = await (transactionsTable() as any)
      .insert(transaction)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('No data returned from transaction creation');
    return data;
  },

  async updateTransaction(
    transactionId: string,
    updates: Omit<UpdateTransaction, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Transaction> {
    const updateData: UpdateTransaction = {
      ...updates,
      updated_at: new Date().toISOString(),
    };
    
    const { data, error } = await (transactionsTable() as any)
      .update(updateData)
      .eq('id', transactionId)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('No data returned from transaction update');
    return data;
  },

  async deleteTransaction(transactionId: string): Promise<boolean> {
    const { error } = await transactionsTable()
      .delete()
      .eq('id', transactionId);

    if (error) throw error;
    return true;
  },

  // Helper function to format transaction amount with currency
  formatTransactionAmount(transaction: { amount: number; type: TransactionType }, currency: string): string {
    const sign = transaction.type === 'expense' ? '-' : '';
    return `${sign}${currency} ${Math.abs(transaction.amount).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  },
};
