import { useCallback, useEffect, useState } from 'react';
import { accountService } from '@/features/account-management/services/accountService';
import { useAuth } from '@/shared/hooks/useAuth';

export type Account = {
  id: string;
  name: string;
  balance: number;
  currency: string;
  account_type: 'checking' | 'savings' | 'credit_card' | 'cash' | 'investment' | 'loan';
  created_at: string;
};

export const useAccounts = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      setError(null);
      const data = await accountService.listAccounts(user.id);
      setAccounts(data as Account[]);
    } catch (err: any) {
      console.error('Load accounts error:', err);
      setError(err?.message || 'Failed to load accounts');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  return { accounts, isLoading, error, refresh: load };
};
