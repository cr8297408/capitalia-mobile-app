import { supabase } from "@/infrastructure/supabase/client";
import { Database } from "@/shared/types/supabase";


type Budget = Database['public']['Tables']['budgets']['Row'];
type InsertBudget = Database['public']['Tables']['budgets']['Insert'];

export const budgetService = {
  async createBudget(budgetData: Omit<InsertBudget, 'user_id' | 'id' | 'created_at' | 'updated_at' | 'spent_amount' | 'is_active'>, userId: string) {
    const { data, error } = await supabase
      .from('budgets')
      .insert([
        {
          ...budgetData,
          user_id: userId,
          spent_amount: 0,
          is_active: true,
        },
      ])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async updateBudget(id: string, updates: Partial<Budget>, userId: string) {
    const { data, error } = await supabase
      .from('budgets')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async deleteBudget(id: string, userId: string) {
    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      throw new Error(error.message);
    }
  },

  async getBudgets(userId: string) {
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async getBudgetById(id: string, userId: string) {
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },
};
