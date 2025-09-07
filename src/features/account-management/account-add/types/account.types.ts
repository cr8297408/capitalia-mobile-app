export type AccountType = 'checking' | 'savings' | 'credit_card' | 'cash' | 'investment' | 'loan';

export interface AddAccountFormData {
  name: string;
  balance: string;
  accountType: AccountType;
  currency: string;
}

export interface AddAccountResult {
  ok: boolean;
  code?: 'not_authenticated' | 'validation_error' | 'limit_reached' | 'unknown_error';
  message?: string;
}
