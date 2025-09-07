import React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock, 
  AlertCircle, 
  DollarSign, 
  Wallet, 
  CreditCard, 
  TrendingUp 
} from 'lucide-react-native';
import type { AccountStackScreenProps, RootStackParamList } from '@/navigation/types';
import { useAccountDetail } from '../hooks/useAccountDetail';
import { useHeaderAccountDetail } from '../hooks/useHeaderAccountDetail';
import { useTransactionList } from '@/shared/hooks/useTransactionList';
import screenStyles from './AccountDetailScreen.styles';

type AccountDetailScreenProps = AccountStackScreenProps<'AccountDetail'> & {
  navigation: AccountStackScreenProps<'AccountDetail'>['navigation'] & {
    navigate: (screen: keyof RootStackParamList, params?: any) => void;
  };
};

export const AccountDetailScreen: React.FC<AccountDetailScreenProps> = ({ route, navigation }) => {
  const { accountId } = route.params;
  
  const { 
    transactions, 
    isLoading: isTransactionsLoading, 
    error: transactionsError, 
    refresh: refreshTransactions 
  } = useTransactionList({ accountId });

  const { 
    account, 
    isLoading: isAccountLoading, 
    error: accountError, 
    refresh: refreshAccount,
    getAccountIcon: getAccountIconInfo,
    formatDate,
    handleEdit,
    handleDelete,
  } = useAccountDetail({ 
    accountId, 
    navigation, 
    refreshTransactions 
  });

  const refreshAll = () => {
    refreshAccount();
    refreshTransactions();
  };
  
  const getAccountIcon = (type: string) => {
    const { icon, color } = getAccountIconInfo(type);
    switch (icon) {
      case 'DollarSign':
        return <DollarSign size={24} color={color} />;
      case 'Wallet':
        return <Wallet size={24} color={color} />;
      case 'CreditCard':
        return <CreditCard size={24} color={color} />;
      case 'TrendingUp':
        return <TrendingUp size={24} color={color} />;
      default:
        return <DollarSign size={24} color={color} />;
    }
  };

  useHeaderAccountDetail({
    navigation,
    onEdit: handleEdit,
    onDelete: handleDelete,
  });

  if (isAccountLoading) {
    return (
      <SafeAreaView style={screenStyles.container}>
        <View style={screenStyles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      </SafeAreaView>
    );
  }

  if (accountError || !account) {
    return (
      <SafeAreaView style={screenStyles.container}>
        <View style={screenStyles.errorContainer}>
          <AlertCircle size={48} color="#EF4444" style={screenStyles.errorIcon} />
          <Text style={screenStyles.errorText}>{accountError || 'Account not found'}</Text>
          <Text style={screenStyles.retryText} onPress={refreshAll}>
            Tap to retry
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={screenStyles.container}>

      <ScrollView 
        style={screenStyles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={isAccountLoading || isTransactionsLoading}
            onRefresh={refreshAll}
            colors={['#2563EB']}
          />
        }>
        <View style={screenStyles.accountCard}>
          <View style={screenStyles.accountHeader}>
            <View style={[screenStyles.iconContainer, { backgroundColor: '#EFF6FF' }]}>
              {getAccountIcon(account.account_type)}
            </View>
            <View>
            <View style={screenStyles.accountInfo}>
              <Text style={screenStyles.accountName}>{account.name}</Text>
              <Text style={screenStyles.accountType}>
                {account.account_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Text>
            </View>
            <Text style={screenStyles.balance}>
              {account.currency} {Number(account.balance).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
            </View>
          </View>

          <View style={screenStyles.detailsContainer}>
            <View style={screenStyles.detailRow}>
              <Text style={screenStyles.detailLabel}>Account Number</Text>
              <Text style={screenStyles.detailValue}>{account.id.substring(0, 8).toUpperCase()}</Text>
            </View>
            <View style={screenStyles.detailRow}>
              <Text style={screenStyles.detailLabel}>Currency</Text>
              <Text style={screenStyles.detailValue}>{account.currency}</Text>
            </View>
            {account.created_at && (
              <View style={screenStyles.detailRow}>
                <Text style={screenStyles.detailLabel}>Created</Text>
                <Text style={screenStyles.detailValue}>{formatDate(account.created_at)}</Text>
              </View>
            )}
            {account.updated_at && (
              <View style={screenStyles.detailRow}>
                <Text style={screenStyles.detailLabel}>Last Updated</Text>
                <Text style={screenStyles.detailValue}>{formatDate(account.updated_at)}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Transactions List */}
        <View style={screenStyles.section}>
          <View style={screenStyles.sectionHeader}>
            <Text style={screenStyles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity 
              style={screenStyles.viewAllButton}
              onPress={() => navigation.navigate('TransactionList', { accountId })}
            >
              <Text style={screenStyles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {isTransactionsLoading && !transactions.length ? (
            <View style={screenStyles.placeholderContainer}>
              <ActivityIndicator size="small" color="#2563EB" />
              <Text style={screenStyles.placeholderText}>Loading transactions...</Text>
            </View>
          ) : transactionsError ? (
            <View style={screenStyles.placeholderContainer}>
              <AlertCircle size={24} color="#EF4444" style={screenStyles.placeholderIcon} />
              <Text style={screenStyles.placeholderText}>Failed to load transactions</Text>
              <TouchableOpacity style={screenStyles.retryButton} onPress={refreshTransactions}>
                <Text style={screenStyles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : transactions.length === 0 ? (
            <View style={screenStyles.placeholderContainer}>
              <Clock size={24} color="#9CA3AF" style={screenStyles.placeholderIcon} />
              <Text style={screenStyles.placeholderText}>No transactions yet</Text>
            </View>
          ) : (
            <View style={screenStyles.transactionsList}>
              {transactions.map((transaction) => (
                <TouchableOpacity 
                  key={transaction.id}
                  style={screenStyles.transactionItem}
                  onPress={() => navigation.navigate('TransactionDetail', { transactionId: transaction.id })}
                >
                  <View style={screenStyles.transactionIcon}>
                    {transaction.type === 'income' ? (
                      <ArrowDownRight size={20} color="#10B981" />
                    ) : (
                      <ArrowUpRight size={20} color="#EF4444" />
                    )}
                  </View>
                  <View style={screenStyles.transactionInfo}>
                    <Text style={screenStyles.transactionDescription} numberOfLines={1}>
                      {transaction.description || 'No description'}
                    </Text>
                    <Text style={screenStyles.transactionDate}>
                      {formatDate(transaction.date)}
                    </Text>
                  </View>
                  <Text 
                    style={[
                      screenStyles.transactionAmount,
                      transaction.type === 'income' ? screenStyles.incomeAmount : screenStyles.expenseAmount
                    ]}
                  >
                    {transaction.type === 'income' ? '+' : '-'} {account?.currency || '$'} {Math.abs(Number(transaction.amount)).toFixed(2)}
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

export default AccountDetailScreen;