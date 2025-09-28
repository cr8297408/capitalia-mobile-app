export interface Budget {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  spent_amount: number;
  category_id: string | null;
  period: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  start_date: string;
  end_date: string;
  alert_threshold: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type BudgetInsert = Omit<Budget, 'id' | 'spent_amount' | 'created_at' | 'updated_at'> & {
  id?: string;
  spent_amount?: number;
  created_at?: string;
  updated_at?: string;
};

export type BudgetUpdate = Partial<BudgetInsert>;

export interface BudgetWithCategory extends Budget {
  categories?: {
    id: string;
    name: string;
    icon?: string;
    color?: string;
  } | null;
}