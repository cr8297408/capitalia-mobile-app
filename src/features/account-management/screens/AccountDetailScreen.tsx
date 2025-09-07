import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Edit, DollarSign, CreditCard, Wallet, TrendingUp, AlertCircle, Trash2 } from 'lucide-react-native';
import type { AccountStackScreenProps, RootStackParamList } from '@/navigation/types';
import { useAccountDetail } from '@/features/account-management/hooks/useAccountDetail';
import { useTransactions } from '@/features/transaction-tracking/hooks/useTransactions';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react-native';

type AccountDetailScreenProps = AccountStackScreenProps<'AccountDetail'> & {
  navigation: AccountStackScreenProps<'AccountDetail'>['navigation'] & {
    navigate: (screen: keyof RootStackParamList, params?: any) => void;
  };
};

export const AccountDetailScreen: React.FC<AccountDetailScreenProps> = ({ route, navigation }) => {
  const { accountId } = route.params;
  const { account, isLoading: isAccountLoading, error: accountError, refresh: refreshAccount } = useAccountDetail(accountId);
  console.log("🚀 ~ account:", account)

  const { transactions, isLoading: isTransactionsLoading, error: transactionsError, refresh: refreshTransactions } = useTransactions(accountId);

  const refreshAll = () => {
    refreshAccount();
    refreshTransactions();
  };

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'checking':
        return <DollarSign size={24} color="#2563EB" />;
      case 'savings':
        return <Wallet size={24} color="#10B981" />;
      case 'credit_card':
        return <CreditCard size={24} color="#8B5CF6" />;
      case 'investment':
        return <TrendingUp size={24} color="#F59E0B" />;
      default:
        return <DollarSign size={24} color="#6B7280" />;
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy', { locale: enUS });
  };

  const handleEdit = () => {
    if (!account) return;
    navigation.navigate('EditAccount', { accountId: account.id });
  };

  const handleDelete = () => {
    if (!account) return;
    // TODO: Implement delete account functionality
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete this account?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => {
          // Handle delete account
          console.log('Delete account', account.id);
        }},
      ]
    );
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Account Details',
      headerTitleAlign: 'left',
      headerLeft: () => (
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={{ padding: 8, marginLeft: 8 }}
        >
          <ArrowLeft color="#111827" size={24} />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <View style={{ flexDirection: 'row', marginRight: 8 }}>
          <TouchableOpacity 
            onPress={handleEdit} 
            style={{ padding: 8 }}
          >
            <Edit color="#2563EB" size={24} />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={handleDelete} 
            style={{ padding: 8, marginLeft: 8 }}
          >
            <Trash2 color="#EF4444" size={24} />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, account]);

  if (isAccountLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      </SafeAreaView>
    );
  }

  if (accountError || !account) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <AlertCircle size={48} color="#EF4444" style={styles.errorIcon} />
          <Text style={styles.errorText}>{accountError || 'Account not found'}</Text>
          <Text style={styles.retryText} onPress={refreshAll}>
            Tap to retry
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isAccountLoading || isTransactionsLoading}
            onRefresh={refreshAll}
            colors={['#2563EB']}
          />
        }>
        <View style={styles.accountCard}>
          <View style={styles.accountHeader}>
            <View style={[styles.iconContainer, { backgroundColor: '#EFF6FF' }]}>
              {getAccountIcon(account.account_type)}
            </View>
            <View style={styles.accountInfo}>
              <Text style={styles.accountName}>{account.name}</Text>
              <Text style={styles.accountType}>
                {account.account_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Text>
            </View>
            <Text style={styles.balance}>
              {account.currency} {Number(account.balance).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
          </View>

          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Account Number</Text>
              <Text style={styles.detailValue}>{account.id.substring(0, 8).toUpperCase()}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Currency</Text>
              <Text style={styles.detailValue}>{account.currency}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Created</Text>
              <Text style={styles.detailValue}>{formatDate(account.created_at)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Last Updated</Text>
              <Text style={styles.detailValue}>{formatDate(account.updated_at)}</Text>
            </View>
          </View>
        </View>

        {/* Transactions List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity 
              onPress={() => navigation.navigate('TransactionDetail', { transactionId: 'temp-id' })} // TODO: Update with correct navigation once TransactionList is implemented
              style={styles.viewAllButton}
            >
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {isTransactionsLoading && !transactions.length ? (
            <View style={styles.placeholderContainer}>
              <ActivityIndicator size="small" color="#2563EB" />
              <Text style={styles.placeholderText}>Loading transactions...</Text>
            </View>
          ) : transactionsError ? (
            <View style={styles.placeholderContainer}>
              <AlertCircle size={24} color="#EF4444" style={styles.errorIcon} />
              <Text style={[styles.placeholderText, { color: '#EF4444' }]}>
                {transactionsError}
              </Text>
              <TouchableOpacity onPress={refreshTransactions} style={styles.retryButton}>
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : transactions.length === 0 ? (
            <View style={styles.placeholderContainer}>
              <Clock size={24} color="#9CA3AF" style={styles.placeholderIcon} />
              <Text style={styles.placeholderText}>No recent transactions</Text>
            </View>
          ) : (
            <View style={styles.transactionsList}>
              {transactions.map((transaction) => (
                <TouchableOpacity 
                  key={transaction.id}
                  style={styles.transactionItem}
                  onPress={() => navigation.navigate('TransactionDetail', { transactionId: transaction.id })}
                >
                  <View style={styles.transactionIcon}>
                    {transaction.type === 'income' ? (
                      <ArrowDownRight size={20} color="#10B981" />
                    ) : (
                      <ArrowUpRight size={20} color="#EF4444" />
                    )}
                  </View>
                  <View style={styles.transactionInfo}>
                    <Text style={styles.transactionDescription} numberOfLines={1}>
                      {transaction.description || 'No description'}
                    </Text>
                    <Text style={styles.transactionCategory}>
                      {transaction.category_id || 'Uncategorized'}
                    </Text>
                    <Text style={styles.transactionDate}>
                      {format(new Date(transaction.date), 'MMM d, yyyy', { locale: enUS })}
                    </Text>
                  </View>
                  <Text 
                    style={[
                      styles.transactionAmount,
                      { color: transaction.type === 'income' ? '#10B981' : '#111827' }
                    ]}
                  >
                    {transaction.type === 'expense' ? '-' : ''}{account?.currency} 
                    {Math.abs(transaction.amount).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorIcon: {
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  retryText: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  viewAllButton: {
    padding: 4,
  },
  viewAllText: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '500',
  },
  retryButton: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    alignSelf: 'center',
  },
  retryButtonText: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '500',
  },
  placeholderIcon: {
    marginBottom: 8,
  },
  transactionsList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  section: {
    marginTop: 16,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
    marginRight: 12,
  },
  transactionDescription: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
    marginBottom: 2,
  },
  transactionCategory: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  accountCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    margin: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  accountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  accountType: {
    fontSize: 14,
    color: '#6B7280',
  },
  balance: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  detailsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  placeholderContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: '#6B7280',
    fontSize: 14,
    textAlign: 'center',
  },
});