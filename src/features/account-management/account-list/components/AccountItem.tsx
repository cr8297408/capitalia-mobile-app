import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { AccountItem as AccountItemType } from '../types/account.types';

type AccountItemProps = {
  account: AccountItemType;
  onPress: (accountId: string) => void;
};

export const AccountItem: React.FC<AccountItemProps> = ({ account, onPress }) => {
  const handlePress = useCallback(() => {
    onPress(account.id);
  }, [account.id, onPress]);

  return (
    <TouchableOpacity 
      style={styles.accountItem}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.accountName}>{account.name}</Text>
        <Text style={styles.accountMeta}>
          {account.account_type.replace(/_/g, ' ')}
        </Text>
      </View>
      <Text style={styles.accountBalance}>
        {account.currency} {Number(account.balance).toFixed(2)}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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
});
