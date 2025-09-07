import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Pencil } from 'lucide-react-native';
import type { AccountItem as AccountItemType } from '../types/account.types';

type AccountItemProps = {
  account: AccountItemType;
  onPress: (accountId: string) => void;
  onEdit?: (accountId: string) => void;
};

export const AccountItem: React.FC<AccountItemProps> = ({ 
  account, 
  onPress, 
  onEdit 
}) => {
  const handlePress = useCallback(() => {
    onPress(account.id);
  }, [account.id, onPress]);

  const handleEditPress = useCallback((e: any) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(account.id);
    }
  }, [account.id, onEdit]);

  return (
    <View style={styles.accountItem}>
      <TouchableOpacity 
        style={styles.accountInfo}
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
      {onEdit && (
        <TouchableOpacity 
          style={styles.editButton}
          onPress={handleEditPress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Pencil size={16} color="#6B7280" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  accountInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    padding: 8,
    marginLeft: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    width: 36,
    height: 36,
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
