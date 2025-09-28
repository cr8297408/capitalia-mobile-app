import { supabase } from '@/infrastructure/supabase/client';
import type { Budget, BudgetInsert, BudgetUpdate, BudgetWithCategory } from '@/shared/types/budget';

export const budgetService = {
  async getBudgets(): Promise<BudgetWithCategory[]> {
    const { data, error } = await supabase
      .from('budgets')
      .select(`
        *,
        categories:category_id (
          id,
          name,
          icon,
          color
        )
      `)
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) {
      throw error;
    }

    return data || [];
  },

  async getActiveBudgets(): Promise<BudgetWithCategory[]> {
    const { data, error } = await supabase
      .from('budgets')
      .select(`
        *,
        categories:category_id (
          id,
          name,
          icon,
          color
        )
      `)
      .eq('is_active', true)
      .gte('end_date', new Date().toISOString().split('T')[0])
      .order('name', { ascending: true });

    if (error) {
      throw error;
    }

    return data || [];
  },

  async getBudgetById(id: string): Promise<BudgetWithCategory | null> {
    const { data, error } = await supabase
      .from('budgets')
      .select(`
        *,
        categories:category_id (
          id,
          name,
          icon,
          color
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching budget:', error);
      return null;
    }

    return data;
  },

  async createBudget(budget: BudgetInsert): Promise<Budget> {
    const { data, error } = await supabase
      .from('budgets')
      .insert(budget)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  },

  async updateBudget(id: string, updates: BudgetUpdate): Promise<Budget> {
    const { data, error } = await supabase
      .from('budgets')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  },

  async deleteBudget(id: string): Promise<void> {
    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }
  },

  async getBudgetsCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('budgets')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) {
      console.error('Error getting budgets count:', error);
      throw error;
    }

    return count || 0;
  },
};