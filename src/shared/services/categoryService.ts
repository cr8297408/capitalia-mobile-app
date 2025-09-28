import { supabase } from '@/infrastructure/supabase/client';
import type { Category } from '@/shared/types/category';

export const categoryService = {
  async getCategoryByName(name: string): Promise<Category | null> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .ilike('name', `%${name}%`)
      .limit(1)
      .single();

    if (error) {
      console.error('Error fetching category:', error);
      return null;
    }
    return data as Category;
  },

  async getAdjustmentCategory(): Promise<string | null> {
    try {
      // First try to find 'Ajuste' category
      const ajusteCategory = await this.getCategoryByName('Ajuste');
      if (ajusteCategory) return ajusteCategory.id;

      // If not found, try 'Ajuste de Saldo' or similar
      const balanceAdjustment = await this.getCategoryByName('Ajuste de Saldo');
      if (balanceAdjustment) return balanceAdjustment.id;

      // If still not found, try to find any system default category that might be used for adjustments
      const { data, error } = await supabase
        .from('categories')
        .select('id')
        .eq('is_system_default', true)
        .or('name.ilike.%ajuste%,name.ilike.%balance%')
        .limit(1)
        .single();

      if (error || !data) {
        console.warn('No adjustment category found, using first available category');
        // As a fallback, get the first available category
        const { data: firstCategory } = await supabase
          .from('categories')
          .select('id')
          .limit(1)
          .single();
        
        return firstCategory?.id || null;
      }

      return data.id;
    } catch (error: any) {
      console.error('Error getting adjustment category:', error);
      return null;
    }
  },

  async getGoalCategories(): Promise<Category[]> {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .or(`is_system_default.eq.true,user_id.eq.${user?.id}`)
        .order('name');

      if (error) {
        throw new Error(`Failed to fetch goal categories: ${error.message}`);
      }

      return (data || []) as Category[];
    } catch (error) {
      console.error('Error fetching goal categories:', error);
      throw error;
    }
  },
};
