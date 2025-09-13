import { supabase } from '@/infrastructure/supabase/client';

type Category = {
  name: string;
  icon: string | null;
};

type Account = {
  name: string;
  currency: string;
};

type TransactionWithRelations = {
  id: string;
  amount: number;
  description: string;
  type: 'income' | 'expense' | 'transfer';
  date: string;
  category_id: string | null;
  notes: string | null;
  is_recurring: boolean;
  account_id: string;
  created_at: string;
  updated_at: string;
  categories: Category | null;
  accounts: Account | null;
};

export type TransactionDetail = Omit<TransactionWithRelations, 'categories' | 'accounts'> & {
  category_name: string | null;
  category_icon: string | null;
  account_name: string;
  account_currency: string;
};

export const transactionDetailService = {
  async getTransactionById(transactionId: string): Promise<TransactionDetail | null> {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        categories:category_id (name, icon),
        accounts:account_id (name, currency)
      `)
      .eq('id', transactionId)
      .single<TransactionWithRelations>();

    if (error) {
      console.error('Error fetching transaction:', error);
      throw error;
    }

    if (!data) return null;

    return {
      id: data.id,
      amount: data.amount,
      description: data.description,
      type: data.type,
      date: data.date,
      category_id: data.category_id,
      notes: data.notes,
      is_recurring: data.is_recurring,
      account_id: data.account_id,
      created_at: data.created_at,
      updated_at: data.updated_at,
      category_name: data.categories?.name || null,
      category_icon: data.categories?.icon || null,
      account_name: data.accounts?.name || 'Sin cuenta',
      account_currency: data.accounts?.currency || 'USD',
    };
  },
};
