import { supabase } from '@/infrastructure/supabase/client';
import type { BudgetPeriod } from '../budget-add/hooks/useAddBudget';

export interface Budget {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  spent_amount: number;
  category_id: string | null;
  period: BudgetPeriod;
  start_date: string;
  end_date: string;
  alert_threshold: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category?: {
    id: string;
    name: string;
    color: string;
  };
}

export interface CreateBudgetData {
  name: string;
  amount: number;
  category_id?: string;
  user_id: string;
  period: BudgetPeriod;
  start_date: string;
  end_date: string;
  alert_threshold?: number;
}

export interface UpdateBudgetData extends Partial<CreateBudgetData> {
  is_active?: boolean;
}

export class BudgetService {
  static async getBudgets(): Promise<Budget[]> {
    const { data, error } = await supabase
      .from('budgets')
      .select(`
        *,
        category:categories(id, name, color)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching budgets:', error);
      throw new Error('Failed to fetch budgets');
    }

    return data || [];
  }

  static async getBudgetById(id: string): Promise<Budget | null> {
    const { data, error } = await supabase
      .from('budgets')
      .select(`
        *,
        category:categories(id, name, color)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Budget not found
      }
      console.error('Error fetching budget:', error);
      throw new Error('Failed to fetch budget');
    }

    return data;
  }

  static async createBudget(budgetData: CreateBudgetData): Promise<Budget> {
    const { data, error } = await supabase
      .from('budgets')
      .insert([budgetData])
      .select(`
        *,
        category:categories(id, name, color)
      `)
      .single();

    if (error) {
      console.error('Error creating budget:', error);
      throw new Error('Failed to create budget');
    }

    return data;
  }

  static async updateBudget(id: string, updates: UpdateBudgetData): Promise<Budget> {
    const { data, error } = await supabase
      .from('budgets')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        category:categories(id, name, color)
      `)
      .single();

    if (error) {
      console.error('Error updating budget:', error);
      throw new Error('Failed to update budget');
    }

    return data;
  }

  static async deleteBudget(id: string): Promise<void> {
    const { error } = await supabase
      .from('budgets')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      console.error('Error deleting budget:', error);
      throw new Error('Failed to delete budget');
    }
  }

  static async getBudgetProgress(id: string): Promise<{
    spent: number;
    remaining: number;
    percentage: number;
  }> {
    const budget = await this.getBudgetById(id);
    if (!budget) {
      throw new Error('Budget not found');
    }

    const spent = budget.spent_amount;
    const remaining = Math.max(0, budget.amount - spent);
    const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;

    return {
      spent,
      remaining,
      percentage: Math.min(100, percentage),
    };
  }

  static async updateSpentAmount(id: string, spentAmount: number): Promise<void> {
    const { error } = await supabase
      .from('budgets')
      .update({
        spent_amount: spentAmount,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating spent amount:', error);
      throw new Error('Failed to update spent amount');
    }
  }
}
