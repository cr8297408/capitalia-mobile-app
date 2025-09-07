import { supabase } from '@/infrastructure/supabase/client';
import type { Database } from '@/types/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';

export type CreateAccountInput = {
  userId: string;
  name: string;
  balance: number; // decimal with 2 precision expected
  accountType?: 'checking' | 'savings' | 'credit_card' | 'cash' | 'investment' | 'loan';
  currency?: string;
  institutionName?: string;
  accountNumberLastFour?: string;
};

export const accountService = {
  async getAccountsCount(userId: string) {
    const db = supabase as SupabaseClient<Database>;
    const table = 'accounts' as const;
    const { count, error } = await db
      .from(table)
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) throw error;
    return count ?? 0;
  },

  async createAccount(input: CreateAccountInput) {
    const {
      userId,
      name,
      balance,
      accountType = 'checking',
      currency = 'USD',
      institutionName,
      accountNumberLastFour,
    } = input;

    const payload: any = {
      user_id: userId,
      name,
      account_type: accountType,
      balance,
      currency,
      institution_name: institutionName ?? null,
      account_number_last_four: accountNumberLastFour ?? null,
    };

    const db = supabase as SupabaseClient<Database>;
    const { data, error } = await db
      .from('accounts')
      .insert(payload)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  },

  async listAccounts(userId: string) {
    const db = supabase as SupabaseClient<Database>;
    const { data, error } = await db
      .from('accounts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getAccountById(accountId: string) {
    const db = supabase as SupabaseClient<Database>;
    return db
      .from('accounts')
      .select('*')
      .eq('id', accountId)
      .single();
  },

  async updateAccount(
    accountId: string,
    updates: {
      name?: string;
      balance?: number;
      account_type?: 'checking' | 'savings' | 'credit_card' | 'cash' | 'investment' | 'loan';
      currency?: string;
      institution_name?: string | null;
      account_number_last_four?: string | null;
    }
  ) {
    const db = supabase as SupabaseClient<Database>;
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString(),
    };
    
    const { data, error } = await db
      .from('accounts')
      .update(updateData as never) // Type assertion needed due to TypeScript limitations
      .eq('id', accountId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteAccount(accountId: string) {
    const db = supabase as SupabaseClient<Database>;
    const { error } = await db
      .from('accounts')
      .delete()
      .eq('id', accountId);

    if (error) throw error;
    return true;
  },
};
