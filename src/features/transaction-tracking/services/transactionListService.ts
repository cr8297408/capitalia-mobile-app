import { supabase } from '@/infrastructure/supabase/client';
import type { Transaction as BaseTransaction } from './transactionService';

type TransactionWithCategory = BaseTransaction & {
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

export const transactionListService = {
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

  async deleteTransaction(transactionId: string): Promise<void> {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', transactionId);

    if (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  },
};

