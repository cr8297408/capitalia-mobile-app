import React, { useLayoutEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  StyleSheet,
  ViewStyle,
  TextStyle
} from 'react-native';
import { 
  useNavigation, 
  useRoute, 
  RouteProp,
  NavigationProp
} from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  ArrowLeft, 
  Edit3, 
  Trash2, 
  Clock, 
  Calendar, 
  Tag, 
  CreditCard,
  FileText,
  ArrowRight,
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  DollarSign 
} from 'lucide-react-native';

import { useTransactionDetailScreen } from '../hooks/useTransactionDetailScreen';

type RootStackParamList = {
  TransactionDetail: { transactionId: string };
  Main: {
    screen?: string;
    params?: {
      screen?: string;
      params?: {
        accountId?: string;
      };
    };
  };
  Premium: undefined;
  Categories: undefined;
  Accounts: {
    screen?: string;
    params?: {
      accountId?: string;
    };
  };
};

type TransactionDetailScreenRouteProp = RouteProp<RootStackParamList, 'TransactionDetail'>;
type NavigationProps = NavigationProp<RootStackParamList>;

type IconComponentType = React.ComponentType<{ size: number; color: string }>;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flexGrow: 1,
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  detailLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  } as TextStyle,
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  categoryIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'left',
    marginTop: 4,
  },
  amount: {
    fontSize: 24,
    fontWeight: '700',
  } as TextStyle,
});

export const TransactionDetailScreen = () => {
  const navigation = useNavigation<NavigationProps>();
  const route = useRoute<TransactionDetailScreenRouteProp>();
  const { transactionId } = route.params;

  const {
    transaction,
    isLoading,
    handleEdit,
    handleDelete,
    formatDate,
    formatTime,
  } = useTransactionDetailScreen(transactionId);

  const getTransactionIcon = (type: string): IconComponentType => {
    switch (type) {
      case 'income':
        return TrendingUp;
      case 'expense':
        return TrendingDown;
      case 'transfer':
        return RefreshCw;
      default:
        return DollarSign;
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 8 }}>
          <ArrowLeft color="#2563EB" size={24} />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <View style={{ flexDirection: 'row', marginRight: 8 }}>
          <TouchableOpacity onPress={handleEdit} style={{ padding: 8 }}>
            <Edit3 color="#2563EB" size={24} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={{ padding: 8, marginLeft: 8 }}>
            <Trash2 color="#EF4444" size={24} />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, handleEdit, handleDelete]);

  // Helper function to handle navigation to category
  const handleCategoryPress = () => {
    if (transaction.category?.id) {
      navigation.navigate('Categories');
    }
  };

  // Helper function to handle navigation to account
  const handleAccountPress = () => {
    if (transaction.account?.id) {
      navigation.navigate('Accounts', { 
        screen: 'AccountDetail',
        params: { accountId: transaction.account.id },
      });
    }
  };

  // Helper function to handle upgrade to premium
  const handleUpgradePress = () => {
    navigation.navigate('Premium');
  };

  if (isLoading || !transaction) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  const isExpense = transaction.type === 'expense';
  const isTransfer = transaction.type === 'transfer';
  const amountColor = isExpense ? '#EF4444' : isTransfer ? '#6366F1' : '#10B981';
  const amountPrefix = isExpense ? '-' : isTransfer ? '→ ' : '+';
  const IconComponent = getTransactionIcon(transaction.type);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.content}
      >
        {/* Amount Section */}
        <View style={styles.amountContainer}>
          <View style={[styles.categoryIcon, { backgroundColor: `${amountColor}1A` }]}>
            <IconComponent size={24} color={amountColor} />
          </View>
          <View style={{ marginLeft: 16, flex: 1 }}>
            <Text style={[styles.amount, { color: amountColor }]}>
              {amountPrefix}${transaction.amount.toFixed(2)}
            </Text>
            <Text style={styles.description}>
              {transaction.description || 'Sin descripción'}
            </Text>
          </View>
        </View>

        {/* Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detalles</Text>

          {/* Category Row */}
          <TouchableOpacity 
            style={styles.detailRow}
            onPress={handleCategoryPress}
            disabled={!transaction.category?.id}
          >
            <View style={[styles.detailLabel, { backgroundColor: '#F3F4F6', padding: 8, borderRadius: 8 }]}>
              {transaction.category?.id ? (
                <Tag color="#6B7280" size={20} />
              ) : (
                <Tag color="#6B7280" size={20} />
              )}
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ fontSize: 14, color: '#6B7280' }}>Categoría</Text>
              <Text style={{ fontSize: 16, color: '#111827' }}>
                {transaction.category?.name || 'Sin categoría'}
              </Text>
            </View>
            {transaction.category?.id && <ArrowRight color="#9CA3AF" size={20} />}
          </TouchableOpacity>

          {/* Account Row */}
          <TouchableOpacity 
            style={styles.detailRow}
            onPress={handleAccountPress}
            disabled={!transaction.account?.id}
          >
            <View style={[styles.detailLabel, { backgroundColor: '#EFF6FF', padding: 8, borderRadius: 8 }]}>
              <CreditCard color="#2563EB" size={20} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ fontSize: 14, color: '#6B7280' }}>Cuenta</Text>
              <Text style={{ fontSize: 16, color: '#111827' }}>
                {transaction.account?.name || 'Sin cuenta'}
              </Text>
            </View>
            {transaction.account?.id && <ArrowRight color="#9CA3AF" size={20} />}
          </TouchableOpacity>

          {/* Date Row */}
          <View style={styles.detailRow}>
            <View style={[styles.detailLabel, { padding: 8, borderRadius: 8 }]}>
              <Calendar color="#6B7280" size={20} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ fontSize: 14, color: '#6B7280' }}>Fecha</Text>
              <Text style={{ fontSize: 16, color: '#111827' }}>
                {formatDate(transaction.date)} • {formatTime(transaction.date)}
              </Text>
            </View>
          </View>

          {/* Notes Row */}
          {transaction.notes && (
            <View style={styles.detailRow}>
              <View style={[styles.detailLabel, { padding: 8, borderRadius: 8 }]}>
                <FileText color="#6B7280" size={20} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ fontSize: 14, color: '#6B7280' }}>Notas</Text>
                <Text style={{ fontSize: 16, color: '#111827' }}>{transaction.notes}</Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
