export interface Category {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  parent_category_id?: string | null;
  transaction_type: 'income' | 'expense';
  is_system_default: boolean;
  user_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export type CategoryInsert = Omit<Category, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type CategoryUpdate = Partial<CategoryInsert>;