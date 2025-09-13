import React, { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
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
import { formatISO } from 'date-fns';
import { Plus } from 'lucide-react-native';
import { useAuth } from '@/shared/hooks/useAuth';
import { UpgradePrompt } from '@/shared/components/ui/UpgradePrompt';
import { useTransactionList } from '@/shared/hooks/useTransactionList';
import { useAccountName } from '../../../../shared/hooks/useAccountName';
import { TransactionItem } from '@/features/transaction-tracking/transaction-list/components/TransactionItem';
import { TransactionFilters } from '@/features/transaction-tracking/transaction-list/components/TransactionFilters';
import type { RootStackScreenProps } from '@/navigation/types';
import type { Database } from '@/types/supabase';

type Transaction = Database['public']['Tables']['transactions']['Row'];

type TransactionListScreenProps = RootStackScreenProps<'TransactionList'>;

export const TransactionListScreen: React.FC<TransactionListScreenProps> = ({ navigation, route }) => {
  const { isPremium, limits } = useAuth();
  const [selectedAccountId, setSelectedAccountId] = useState<string | undefined>(route.params?.accountId);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>();
  const [selectedDateRange, setSelectedDateRange] = useState<{startDate?: Date; endDate?: Date}>({});
  const accountName = useAccountName(selectedAccountId);
  
  // Update the URL when the account filter changes
  useEffect(() => {
    navigation.setParams({ accountId: selectedAccountId });
  }, [selectedAccountId, navigation]);
  
  // Format date for API if needed
  const formatDateForApi = (date?: Date) => {
    return date ? formatISO(date, { representation: 'date' }) : undefined;
  };
  
  // Refresh data when screen comes into focus or accountId changes
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [selectedAccountId])
  );

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
    accountId: selectedAccountId,
    categoryId: selectedCategoryId,
    fromDate: formatDateForApi(selectedDateRange.startDate),
    toDate: formatDateForApi(selectedDateRange.endDate),
    limit: 20,
  });

  const handleAddTransaction = () => {
    navigation.navigate('AddTransaction', { accountId: selectedAccountId });
  };
  
  const handleClearFilters = () => {
    setSelectedAccountId(undefined);
    setSelectedCategoryId(undefined);
    setSelectedDateRange({});
  };

  // Set the title based on whether we're filtering by account
  const screenTitle = selectedAccountId ? 'Transacciones de la Cuenta' : 'Todas las Transacciones';
  
  // Check if any filters are active
  const hasActiveFilters = !!selectedAccountId || !!selectedCategoryId || selectedDateRange?.startDate || selectedDateRange?.endDate;

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

  // Type for the transaction item with additional UI properties
  type TransactionItemType = Transaction & {
    category_name?: string;
  };

  const renderItem = useCallback(({ item }: { item: TransactionItemType }) => (
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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <View style={styles.headerRow}>
            <Text style={styles.title}>{screenTitle}</Text>
            <TouchableOpacity 
              style={styles.addButton} 
              onPress={handleAddTransaction}
              disabled={!isPremium && transactions.length >= (limits?.maxTransactions || 0)}
            >
              <Plus color="#ffffff" size={20} />
            </TouchableOpacity>
          </View>
          <TransactionFilters
            selectedAccountId={selectedAccountId}
            selectedCategoryId={selectedCategoryId}
            selectedDateRange={selectedDateRange}
            onSelectAccount={setSelectedAccountId}
            onSelectCategory={setSelectedCategoryId}
            onSelectDateRange={setSelectedDateRange as any}
            onClearAll={handleClearFilters}
          />
        </View>
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error al cargar las transacciones</Text>
          <TouchableOpacity onPress={refresh} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : (
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
      )}

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
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  filterTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginRight: 8,
  },
  filterTagText: {
    fontSize: 12,
    color: '#4B5563',
    marginRight: 4,
  },
  clearButton: {
    padding: 2,
    borderRadius: 12,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});