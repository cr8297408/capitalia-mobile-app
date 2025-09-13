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

type TransactionWithCategory = Transaction & {
  categories: { name: string } | null;
  category_name?: string | null;
};

type GetTransactionsParams = {
  accountId?: string;
  categoryId?: string;
  limit?: number;
  offset?: number;
  fromDate?: string;
  toDate?: string;
  isActiveAccount?: boolean;
};


export const transactionService = {
  async getTransactions({
    accountId,
    categoryId,
    limit = 20,
    offset = 0,
    fromDate,
    toDate,
    isActiveAccount = true,
  }: GetTransactionsParams = {}): Promise<{ data: TransactionWithCategory[]; count: number }> {
    let accountFilterIds: string[] = [];

    // Si el usuario pide cuentas activas, primero traemos sus IDs
    if (!accountId && isActiveAccount) {
      const { data: activeAccounts, error: accountsError } = await supabase
        .from('accounts')
        .select('id')
        .eq('is_active', true);

      if (accountsError) {
        console.error('Error fetching active accounts:', accountsError);
        throw accountsError;
      }

      accountFilterIds = (activeAccounts || []).map((acc: any) => acc.id);
    }

    // Construimos la query principal
    let query = supabase
      .from('transactions')
      .select(`
          *,
          categories:category_id (name),
          accounts:account_id (id, name, is_active)
        `, { count: 'exact' })
      .order('date', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filtro por cuenta específica
    if (accountId) {
      query = query.eq('account_id', accountId);
    } else if (isActiveAccount) {
      query = query.in('account_id', accountFilterIds);
    }

    // Filtro por categoría
    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    // Rango de fechas
    if (fromDate) {
      query = query.gte('date', fromDate);
    }
    if (toDate) {
      query = query.lte('date', toDate);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }

    // Aplanamos la categoría
    const transactionsWithCategory = (data || []).map((transaction: any) => ({
      ...transaction,
      category_name: transaction.categories?.name || null,
      categories: undefined, // quitamos el objeto nested
    })) as unknown as TransactionWithCategory[];

    return {
      data: transactionsWithCategory,
      count: count || 0,
    };
  },

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
