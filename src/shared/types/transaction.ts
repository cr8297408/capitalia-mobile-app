import type { Category } from './category';

export type TransactionType = 'income' | 'expense' | 'transfer';

export interface Transaction {
  id: string;
  user_id: string;
  account_id: string;
  category_id: string | null;
  budget_id?: string | null; // ✅ New optional budget association
  category?: Category;
  amount: number;
  description: string;
  date: string;
  type: TransactionType;
  is_recurring: boolean;
  created_at: string;
  updated_at: string;
}

export const TransactionType = {
  INCOME: 'income' as TransactionType,
  EXPENSE: 'expense' as TransactionType,
  TRANSFER: 'transfer' as TransactionType,
};
