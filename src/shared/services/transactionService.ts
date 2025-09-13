import { supabase } from '@/infrastructure/supabase/client';
import type { GetTransactionsParams, QueryParams, Transaction, TransactionInsert, TransactionWithCategory, UpdateTransaction } from '@/shared/types/transaction';

export class TransactionService {
  private static instance: TransactionService;

  private constructor() {}

  public static getInstance(): TransactionService {
    if (!TransactionService.instance) {
      TransactionService.instance = new TransactionService();
    }
    return TransactionService.instance;
  }

  public async getTransactions(
    params: GetTransactionsParams = {}
  ): Promise<{ data: TransactionWithCategory[]; count: number }> {
    const { 
      accountId, 
      categoryId, 
      limit = 20, 
      offset = 0, 
      fromDate, 
      toDate, 
      isActiveAccount = true 
    } = params;
    
    const accountFilterIds = await this.getActiveAccountIds(accountId, isActiveAccount);
    const query = this.buildTransactionsQuery({
      accountId,
      categoryId,
      limit,
      offset,
      fromDate,
      toDate,
      isActiveAccount,
      accountFilterIds,
    });

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }

    return {
      data: this.formatTransactionsWithCategory(data || []),
      count: count || 0,
    };
  }

  public async getRecentTransactionsByAccount(accountId: string, limit = 5): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('account_id', accountId)
      .order('date', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  public async getTransactionById(transactionId: string): Promise<Transaction | null> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transactionId)
      .single();

    if (error) return null;
    return data;
  }

  public async createTransaction(transaction: TransactionInsert): Promise<Transaction> {
    const { data, error } = await supabase
      .from('transactions')
      .insert(transaction as never)
      .select()
      .single();

    if (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }

    return data as Transaction;
  }

  public async updateTransaction(
    transactionId: string, 
    updates: Partial<Omit<UpdateTransaction, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<Transaction> {
    const { data, error } = await supabase
      .from('transactions')
      .update(updates as never)
      .eq('id', transactionId)
      .select()
      .single();

    if (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }

    return data as Transaction;
  }

  public async deleteTransaction(transactionId: string): Promise<boolean> {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', transactionId);

    if (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }

    return true;
  }

  private async getActiveAccountIds(
    accountId: string | undefined, 
    isActiveAccount: boolean
  ): Promise<string[]> {
    if (accountId || !isActiveAccount) return [];

    const { data: activeAccounts, error } = await supabase
      .from('accounts')
      .select('id')
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching active accounts:', error);
      throw error;
    }

    return activeAccounts?.map((acc: Transaction) => acc.id) || [];
  }

  private buildTransactionsQuery(params: QueryParams) {
    const { 
      accountId, 
      categoryId, 
      limit = 20, 
      offset = 0, 
      fromDate, 
      toDate, 
      accountFilterIds 
    } = params;

    let query = supabase
      .from('transactions')
      .select(
        `
          *,
          categories:category_id (name),
          accounts:account_id (id, name, is_active)
        `, 
        { count: 'exact' }
      )
      .order('date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (accountId) {
      query = query.eq('account_id', accountId);
    } else if (accountFilterIds.length > 0) {
      query = query.in('account_id', accountFilterIds);
    }

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    if (fromDate) {
      query = query.gte('date', fromDate);
    }
    
    if (toDate) {
      query = query.lte('date', toDate);
    }

    return query;
  }

  private formatTransactionsWithCategory(transactions: any[]): TransactionWithCategory[] {
    return transactions.map(transaction => ({
      ...transaction,
      category_name: transaction.categories?.name || null,
      categories: undefined,
    })) as unknown as TransactionWithCategory[];
  }
}
