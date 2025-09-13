import { supabase } from '@/shared/lib/supabase';

type Account = {
  id: string;
  name: string;
  balance: number;
  currency: string;
  is_active: boolean;
};

export class AccountService {
  private static instance: AccountService;

  public static getInstance(): AccountService {
    if (!AccountService.instance) {
      AccountService.instance = new AccountService();
    }
    return AccountService.instance;
  }

  async getActiveAccounts(userId: string): Promise<Account[]> {
    const { data, error } = await supabase
      .from('accounts')
      .select('id, name, balance, currency, is_active')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching accounts:', error);
      throw error;
    }

    return data || [];
  }

  async getTotalBalance(userId: string): Promise<number> {
    const accounts = await this.getActiveAccounts(userId);
    return accounts.reduce((sum, account) => sum + (account.balance || 0), 0);
  }
}

export const accountService = AccountService.getInstance();
