import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus } from 'lucide-react-native';
import { useAuth } from '@/shared/hooks/useAuth';
import { UpgradePrompt } from '@/shared/components/ui/UpgradePrompt';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { RootStackNavigationProp } from '@/navigation/types';
import { useAccounts } from '@/features/account-management/hooks/useAccounts';

export const AccountListScreen: React.FC = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const { isPremium, limits } = useAuth();
  const { accounts, isLoading, error, refresh } = useAccounts();

  const handleAddAccount = () => {
    navigation.navigate('AddAccount');
  };

  // Refresh when screen regains focus (e.g., after adding a new account)
  useFocusEffect(
    React.useCallback(() => {
      refresh();
    }, [refresh])
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Accounts</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddAccount}>
          <Plus color="#ffffff" size={20} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {isLoading && (
          <ActivityIndicator size="small" color="#2563EB" />
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
            renderItem={({ item }) => (
              <View style={styles.accountItem}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.accountName}>{item.name}</Text>
                  <Text style={styles.accountMeta}>{item.account_type}</Text>
                </View>
                <Text style={styles.accountBalance}>
                  {item.currency} {Number(item.balance).toFixed(2)}
                </Text>
              </View>
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  addButton: {
    backgroundColor: '#2563EB',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingTop: 8,
  },
  placeholder: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 24,
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  accountMeta: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  accountBalance: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
});