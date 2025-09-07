import { useState, useEffect } from 'react';
import { accountService } from '@/features/account-management/services/accountService';

type Account = {
  id: string;
  name: string;
  balance: number;
  currency: string;
  account_type: string;
  created_at: string;
  updated_at: string;
  // Add other account fields as needed
};

export const useAccountDetail = (accountId: string) => {
  const [account, setAccount] = useState<Account | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAccount = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await accountService.getAccountById(accountId);
      setAccount(data);
    } catch (err) {
      console.error('Error fetching account:', err);
      setError('Failed to load account details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (accountId) {
      fetchAccount();
    }
  }, [accountId]);

  const refresh = () => {
    fetchAccount();
  };

  return {
    account,
    isLoading,
    error,
    refresh,
  };
};
