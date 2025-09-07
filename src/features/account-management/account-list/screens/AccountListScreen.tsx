import React, { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  ListRenderItem,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';

import { UpgradePrompt } from '@/shared/components/ui/UpgradePrompt';
import { useAccountList } from '@/features/account-management/account-list/hooks/useAccountList';
import { styles } from '@/features/account-management/account-list/screens/AccountListScreen.styles';
import type { AccountItem } from '@/features/account-management/account-list/types/account.types';

export const AccountListScreen: React.FC = () => {
  const {
    accounts,
    isLoading,
    error,
    refresh,
    isPremium,
    limits,
    handleAddAccount,
    handleAccountPress,
  } = useAccountList();

  // Refresh when screen regains focus (e.g., after adding a new account)
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const renderAccountItem: ListRenderItem<AccountItem> = useCallback(({ item }) => (
    <TouchableOpacity 
      style={styles.accountItem}
      onPress={() => handleAccountPress(item.id)}
      activeOpacity={0.7}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.accountName}>{item.name}</Text>
        <Text style={styles.accountMeta}>
          {item.account_type.replace(/_/g, ' ')}
        </Text>
      </View>
      <Text style={styles.accountBalance}>
        {item.currency} {Number(item.balance).toFixed(2)}
      </Text>
    </TouchableOpacity>
  ), [handleAccountPress]);

  const renderSeparator = useCallback(() => (
    <View style={styles.separator} />
  ), []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Accounts</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddAccount}>
          <Plus color="#ffffff" size={20} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {isLoading && !accounts.length && (
          <ActivityIndicator size="small" color="#2563EB" style={{ marginTop: 24 }} />
        )}

        {!isLoading && error && (
          <Text style={styles.placeholder}>{error}</Text>
        )}

        {!isLoading && !error && accounts.length === 0 && (
          <Text style={styles.placeholder}>No accounts yet. Tap + to add your first account.</Text>
        )}

        {!isLoading && !error && accounts.length > 0 && (
          <FlatList
            data={accounts}
            keyExtractor={(item) => item.id}
            onRefresh={refresh}
            refreshing={isLoading}
            renderItem={renderAccountItem}
            ItemSeparatorComponent={renderSeparator}
            contentContainerStyle={{ paddingVertical: 12, paddingHorizontal: 24 }}
          />
        )}
      </View>

      {!isPremium && (
        <UpgradePrompt 
          feature="unlimited accounts"
          currentLimit={limits.maxAccounts || 'N/A'}
          description="Connect unlimited bank accounts and credit cards."
        />
      )}
    </SafeAreaView>
  );
};