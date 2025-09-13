export type TransactionType = 'income' | 'expense' | 'transfer';

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface Account {
  id: string;
  name: string;
  currency: string;
}

export interface TransactionDetail {
  id: string;
  amount: number;
  type: TransactionType;
  description?: string;
  notes?: string;
  date: string;
  created_at: string;
  updated_at: string;
  category_id?: string;
  category_name?: string;
  category_icon?: string;
  category?: Category;
  account_id: string;
  account_name: string;
  account_currency: string;
  account?: Account;
  is_premium?: boolean;
}
