import React, { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus } from 'lucide-react-native';
import { useAuth } from '@/shared/hooks/useAuth';
import { UpgradePrompt } from '@/shared/components/ui/UpgradePrompt';
import type { StackScreenProps } from '@react-navigation/stack';
import type { RootStackParamList } from '@/navigation/types';
import { useTransactionList } from '../hooks/useTransactionList';
import { TransactionItem } from '../components/TransactionItem';

// Extend the TransactionStackParamList to include TransactionList with params
declare global {
  namespace ReactNavigation {
    interface TransactionListParamList {
      TransactionList: { accountId?: string };
    }
  }
}

type TransactionListScreenProps = StackScreenProps<RootStackParamList, 'TransactionList'>;

export const TransactionListScreen: React.FC<TransactionListScreenProps> = ({ navigation, route }) => {
  const { isPremium, limits } = useAuth();
  const accountId = route.params?.accountId;
  
  const {
    transactions,
    isLoading,
    isRefreshing,
    error,
    hasMore,
    refresh,
    loadMore,
    deleteTransaction,
  } = useTransactionList({
    accountId,
    limit: 20,
  });
    console.log("🚀 ~ transactions:", transactions)

  const handleAddTransaction = () => {
    navigation.navigate('AddTransaction', { accountId });
  };

  const handleEditTransaction = useCallback((transaction: { id: string }) => {
    navigation.navigate('EditTransaction', { transactionId: transaction.id });
  }, [navigation]);

  const handleTransactionPress = useCallback((transaction: { id: string }) => {
    navigation.navigate('TransactionDetail', { transactionId: transaction.id });
  }, [navigation]);

  const handleDelete = useCallback((transactionId: string) => {
    Alert.alert(
      'Eliminar transacción',
      '¿Estás seguro de que deseas eliminar esta transacción?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => deleteTransaction(transactionId),
        },
      ]
    );
  }, [deleteTransaction]);

  const renderItem = useCallback(({ item }: { item: any }) => (
    <TouchableOpacity 
      onPress={() => handleTransactionPress(item)}
      activeOpacity={0.7}
    >
      <TransactionItem
        key={item.id}
        transaction={item}
        onEdit={handleEditTransaction}
        onDelete={handleDelete}
      />
    </TouchableOpacity>
  ), [handleEditTransaction, handleDelete, handleTransactionPress]);

  const renderFooter = useCallback(() => {
    if (!isLoading || !transactions.length) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#2563EB" />
      </View>
    );
  }, [isLoading, transactions.length]);

  const renderEmpty = useCallback(() => {
    if (isLoading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No hay transacciones registradas</Text>
      </View>
    );
  }, [isLoading]);

  return (
    <SafeAreaView style={styles.container} edges={['right', 'left']}>
      <View style={styles.header}>
        <Text style={styles.title}>Transacciones</Text>
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={handleAddTransaction}
          disabled={!isPremium && transactions.length >= (limits?.maxTransactions || 0)}
        >
          <Plus color="#ffffff" size={20} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={refresh} />
        }
        onEndReached={hasMore ? loadMore : null}
        onEndReachedThreshold={0.2}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        removeClippedSubviews
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={11}
      />

      {!isPremium && (
        <UpgradePrompt 
          feature="transacciones ilimitadas"
          currentLimit={limits?.maxTransactions?.toString() || '0'}
          description="Registra transacciones ilimitadas y lleva un mejor control de tus finanzas."
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 20,
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
  listContent: {
    paddingBottom: 16,
  },
  footer: {
    padding: 16,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
});