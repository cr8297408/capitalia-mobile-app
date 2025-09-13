import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { formatCurrency } from '@/shared/utils/formatters';
import { format } from 'date-fns';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Transactions: undefined;
  TransactionDetail: { transactionId: string };
  // Add other screen params as needed
};
import { ArrowRight } from 'lucide-react-native';

type Transaction = {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  date: string;
  category?: {
    name: string;
    icon?: string;
  };
};

type RecentTransactionsProps = {
  transactions: Transaction[];
  isLoading: boolean;
  maxItems?: number;
};

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({
  transactions,
  isLoading,
  maxItems = 5,
}) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const displayedTransactions = transactions.slice(0, maxItems);

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'income':
        return '#10B981'; // Green
      case 'expense':
        return '#EF4444'; // Red
      case 'transfer':
        return '#6366F1'; // Indigo
      default:
        return '#6B7280'; // Gray
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Recent Transactions</Text>
          <View style={styles.placeholderLine} />
        </View>
        {[1, 2, 3].map((i) => (
          <View key={i} style={styles.transactionItemPlaceholder}>
            <View style={styles.placeholderIcon} />
            <View style={styles.placeholderTextContainer}>
              <View style={styles.placeholderLine} />
              <View style={[styles.placeholderLine, { width: '60%' }]} />
            </View>
            <View style={styles.placeholderAmount} />
          </View>
        ))}
      </View>
    );
  }

  if (transactions.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Recent Transactions</Text>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No transactions yet</Text>
          <Text style={styles.emptySubtext}>Add your first transaction to get started</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recent Transactions</Text>
        {transactions.length > 0 && (
          <TouchableOpacity 
            style={styles.seeAllButton}
            onPress={() => navigation.navigate('Transactions')}
          >
            <Text style={styles.seeAllText}>See All</Text>
            <ArrowRight size={16} color="#3B82F6" />
          </TouchableOpacity>
        )}
      </View>

      {displayedTransactions.map((transaction) => (
        <TouchableOpacity 
          key={transaction.id} 
          style={styles.transactionItem}
          onPress={() => navigation.navigate('TransactionDetail', { transactionId: transaction.id })}
        >
          <View style={[styles.iconContainer, { backgroundColor: `${getTransactionColor(transaction.type)}1A` }]}>
            <Text style={[styles.iconText, { color: getTransactionColor(transaction.type) }]}>
              {transaction.category?.icon || '💰'}
            </Text>
          </View>
          
          <View style={styles.transactionDetails}>
            <Text style={styles.transactionTitle} numberOfLines={1}>
              {transaction.description || 'No description'}
            </Text>
            <Text style={styles.transactionCategory}>
              {transaction.category?.name || 'Uncategorized'}
            </Text>
          </View>
          
          <View style={styles.amountContainer}>
            <Text 
              style={[
                styles.amount,
                { color: getTransactionColor(transaction.type) }
              ]}
            >
              {transaction.type === 'expense' ? '-' : transaction.type === 'income' ? '+' : ''}
              {formatCurrency(transaction.amount)}
            </Text>
            <Text style={styles.transactionDate}>
              {format(new Date(transaction.date), 'MMM d')}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    color: '#3B82F6',
    marginRight: 4,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 18,
  },
  transactionDetails: {
    flex: 1,
    marginRight: 8,
  },
  transactionTitle: {
    fontSize: 15,
    color: '#111827',
    marginBottom: 2,
    fontFamily: 'Inter-Medium',
  },
  transactionCategory: {
    fontSize: 13,
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
    fontFamily: 'Inter-SemiBold',
  },
  transactionDate: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
  },
  emptyState: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 4,
    fontFamily: 'Inter-Medium',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
  },
  transactionItemPlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  placeholderIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 12,
  },
  placeholderTextContainer: {
    flex: 1,
    marginRight: 8,
  },
  placeholderLine: {
    height: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    marginBottom: 6,
    width: '80%',
  },
  placeholderAmount: {
    width: 60,
    height: 20,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
  },
});
