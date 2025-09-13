import type { Database } from '@/shared/types/supabase';

export type AccountType = 'checking' | 'savings' | 'credit_card' | 'cash' | 'investment' | 'loan';

export type Account = Database['public']['Tables']['accounts']['Row'];

export interface EditAccountFormData {
  name: string;
  balance: string;
  accountType: AccountType;
  currency: string;
}

export interface EditAccountResult {
  ok: boolean;
  code?: 'not_authenticated' | 'validation_error' | 'not_found' | 'unknown_error';
  message?: string;
  account?: Account;
}

export interface DeleteAccountResult {
  ok: boolean;
  code?: 'not_authenticated' | 'not_found' | 'unknown_error' | 'has_transactions';
  message?: string;
}
