import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
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

export const useAccountDetail = (accountId: string, navigation: any) => {
  const [account, setAccount] = useState<Account | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAccount = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await accountService.getAccountById(accountId);
      setAccount(data?.data);
    } catch (err) {
      console.error('Error fetching account:', err);
      setError('Failed to load account details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [accountId]);

  useEffect(() => {
    if (accountId) {
      fetchAccount();
    }
  }, [accountId, fetchAccount]);

  const refresh = useCallback(() => {
    fetchAccount();
  }, [fetchAccount]);

  const getAccountIcon = useCallback((type: string) => {
    switch (type) {
      case 'checking':
        return { icon: 'DollarSign', color: '#2563EB' };
      case 'savings':
        return { icon: 'Wallet', color: '#10B981' };
      case 'credit_card':
        return { icon: 'CreditCard', color: '#8B5CF6' };
      case 'investment':
        return { icon: 'TrendingUp', color: '#F59E0B' };
      default:
        return { icon: 'DollarSign', color: '#6B7280' };
    }
  }, []);

  const formatDate = useCallback((dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy', { locale: enUS });
  }, []);

  const handleEdit = useCallback(() => {
    // Navigate to edit screen with the account ID
    if (account) {
      (navigation as any).navigate('EditAccount', { 
        accountId: account.id,
        // Pass any additional data needed for the edit form
        initialData: {
          name: account.name,
          balance: account.balance.toString(),
          accountType: account.account_type as any,
          currency: account.currency || 'USD',
        },
      });
    }
  }, [navigation, account]);

  const handleDelete = useCallback(async () => {
    if (!account) return;
    
    Alert.alert(
      'Eliminar cuenta',
      '¿Estás seguro de que deseas eliminar esta cuenta? Esta acción no se puede deshacer.',
      [
        { 
          text: 'Cancelar', 
          style: 'cancel' 
        },
        { 
          text: 'Eliminar', 
          style: 'destructive', 
          async onPress() {
            try {
              await accountService.deleteAccount(account.id);
              Alert.alert(
                'Cuenta eliminada',
                'La cuenta se ha eliminado correctamente.',
                [
                  { 
                    text: 'Aceptar',
                    onPress: () => {
                      navigation.goBack();
                    }
                  }
                ]
              );
            } catch (error) {
              console.error('Error deleting account:', error);
              Alert.alert(
                'Error',
                'No se pudo eliminar la cuenta. Por favor, inténtalo de nuevo.'
              );
            }
          }
        },
      ]
    );
  }, [account, navigation]);

  return {
    account,
    isLoading,
    error,
    refresh,
    getAccountIcon,
    formatDate,
    handleEdit,
    handleDelete,
  };
};
