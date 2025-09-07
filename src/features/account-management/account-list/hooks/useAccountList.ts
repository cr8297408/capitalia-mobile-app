import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '@/shared/hooks/useAuth';
import { useAccounts } from '@/features/account-management/hooks/useAccounts';
import type { AccountStackParamList, RootStackParamList } from '@/navigation/types';

// Extend the navigation prop type to include the navigate method with the correct params
type NavigationProp = NativeStackNavigationProp<AccountStackParamList, 'AccountList'> & {
  navigate: (screen: keyof RootStackParamList, params?: any) => void;
};

export const useAccountList = () => {
  const navigation = useNavigation<NavigationProp>();
  const { isPremium, limits } = useAuth();
  const { accounts, isLoading, error, refresh } = useAccounts();

  const handleAddAccount = useCallback(() => {
    // Use type assertion to handle the navigation to AddAccount
    (navigation as any).navigate('AddAccount');
  }, [navigation]);

  const handleAccountPress = useCallback((accountId: string) => {
    navigation.navigate('AccountDetail', { accountId });
  }, [navigation]);

  const handleEditAccount = useCallback((accountId: string) => {
    navigation.navigate('EditAccount', { accountId });
  }, [navigation]);

  return {
    accounts,
    isLoading,
    error,
    refresh,
    isPremium,
    limits,
    handleAddAccount,
    handleAccountPress,
    handleEditAccount,
  };
};
