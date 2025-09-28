import { Database } from "./supabase";
import { TransactionType } from "./transaction";

export type Transaction = Database['public']['Tables']['transactions']['Row'];
export type InsertTransaction = Database['public']['Tables']['transactions']['Insert'];
export type UpdateTransaction = Database['public']['Tables']['transactions']['Update'];

export type TransactionInsert = Omit<InsertTransaction, 'id' | 'created_at' | 'updated_at'> & {
  user_id: string;
  account_id: string;
  amount: number;
  type: TransactionType;
  description: string;
  category_id?: string | null; // ✅ Make optional for budget associations
  budget_id?: string | null; // ✅ Add budget association
  date: string;
  is_recurring: boolean;
};

export type TransactionWithCategory = Omit<Transaction, 'categories'> & {
  categories: { name: string } | null;
  category_name?: string | null;
  accounts?: {
    id: string;
    name: string;
    is_active: boolean;
  } | null;
};

export type GetTransactionsParams = {
  accountId?: string;
  categoryId?: string;
  limit?: number;
  offset?: number;
  fromDate?: string;
  toDate?: string;
  isActiveAccount?: boolean;
};

export type QueryParams = GetTransactionsParams & { 
  accountFilterIds: string[];
};
