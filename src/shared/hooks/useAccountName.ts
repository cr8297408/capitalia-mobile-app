import { useState, useEffect } from 'react';
import { supabase } from '@/infrastructure/supabase/client';

type AccountData = {
  name: string;
};

export const useAccountName = (accountId?: string) => {
  const [accountName, setAccountName] = useState<string>('');

  useEffect(() => {
    const fetchAccountName = async () => {
      if (!accountId) {
        setAccountName('');
        return;
      }

      try {
        const { data, error } = await supabase
          .from('accounts')
          .select('name')
          .eq('id', accountId)
          .single();

        if (error) {
          console.error('Error fetching account name:', error);
          return;
        }

        if (data) {
          setAccountName(data.name);
        }
      } catch (error: any) {
        console.error('Error in useAccountName:', error);
      }
    };
    
    fetchAccountName();
  }, [accountId]);

  return accountName;
};
