import { supabase } from '@/infrastructure/supabase/client';
import type { Transaction as BaseTransaction } from './transactionService';

type TransactionWithCategory = BaseTransaction & {
  categories: { name: string } | null;
  category_name?: string | null;
};

type GetTransactionsParams = {
  accountId?: string;
  limit?: number;
  offset?: number;
  fromDate?: string;
  toDate?: string;
};

export const transactionListService = {
  async getTransactions({
    accountId,
    limit = 20,
    offset = 0,
    fromDate,
    toDate,
  }: GetTransactionsParams = {}): Promise<{ data: TransactionWithCategory[]; count: number }> {
    let query = supabase
      .from('transactions')
      .select(`
        *,
        categories:category_id (name)
      `, { count: 'exact' })
      .order('date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (accountId) {
      query = query.eq('account_id', accountId);
    }

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

    // Map the data to include category_name in a flat structure
    const transactionsWithCategory = (data || []).map((transaction: any) => ({
      ...transaction,
      category_name: transaction.categories?.name || null,
      categories: undefined // Remove the nested categories object
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
