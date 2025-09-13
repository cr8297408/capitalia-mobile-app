import React, { useLayoutEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
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
import { TransactionType } from '../types/transaction.types';

// Local styles to avoid conflicts with imported styles
const localStyles = {
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  } as ViewStyle,
  content: {
    flexGrow: 1,
    padding: 16,
  } as ViewStyle,
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
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
  } as ViewStyle,
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  } as ViewStyle,
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
  } as TextStyle,
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
  } as ViewStyle,
  categoryIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  description: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'left',
    marginTop: 4,
  } as TextStyle,
};

// Define navigation types
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

const TransactionDetailScreen = () => {
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

  const getTransactionIcon = (type: TransactionType): IconComponentType => {
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
  const IconComponent = getTransactionIcon(transaction.type as TransactionType);

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
    if (transaction.category_id) {
      navigation.navigate('Categories');
    }
  };

  // Helper function to handle navigation to account
  const handleAccountPress = () => {
    if (transaction.account_id) {
      navigation.navigate('Accounts', { 
        screen: 'AccountDetail',
        params: { accountId: transaction.account_id },
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
  const IconComponent = getTransactionIcon(transaction.type as TransactionType);

  return (
    <SafeAreaView style={transactionDetailStyles.container}>
      <ScrollView 
        style={transactionDetailStyles.content as ViewStyle}
        contentContainerStyle={transactionDetailStyles.scrollContent as ViewStyle}
      >
        {/* Amount Section */}
        <View style={transactionDetailStyles.amountContainer as ViewStyle}>
          <View style={[transactionDetailStyles.categoryIcon as ViewStyle, { backgroundColor: `${amountColor}1A` }]}>
            <IconComponent size={24} color={amountColor} />
          </View>
          <View style={{ marginLeft: 16, flex: 1 }}>
            <Text style={[styles.amount, { color: amountColor }]}>
              {amountPrefix}${transaction.amount.toFixed(2)}
            </Text>
            <Text style={transactionDetailStyles.description}>
              {transaction.description || 'Sin descripción'}
            </Text>
          </View>
        </View>

        {/* Details Section */}
        <View style={transactionDetailStyles.section}>
          <Text style={transactionDetailStyles.sectionTitle}>Detalles</Text>

          {/* Category Row */}
          <TouchableOpacity 
            style={transactionDetailStyles.detailRow}
            onPress={handleCategoryPress}
            disabled={!transaction.category_id}
          >
            <View style={[transactionDetailStyles.detailLabel, { backgroundColor: '#F3F4F6', padding: 8, borderRadius: 8 }]}>
              {transaction.category_icon ? (
                <Text style={{ fontSize: 16 }}>{transaction.category_icon}</Text>
              ) : (
                <Tag color="#6B7280" size={20} />
              )}
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ fontSize: 14, color: '#6B7280' }}>Categoría</Text>
              <Text style={{ fontSize: 16, color: '#111827' }}>
                {transaction.category_name || 'Sin categoría'}
              </Text>
            </View>
            {transaction.category_id && <ArrowRight color="#9CA3AF" size={20} />}
          </TouchableOpacity>

          {/* Account Row */}
          <TouchableOpacity 
            style={transactionDetailStyles.detailRow}
            onPress={handleAccountPress}
            disabled={!transaction.account_id}
          >
            <View style={[transactionDetailStyles.detailLabel, { backgroundColor: '#EFF6FF', padding: 8, borderRadius: 8 }]}>
              <CreditCard color="#2563EB" size={20} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ fontSize: 14, color: '#6B7280' }}>Cuenta</Text>
              <Text style={{ fontSize: 16, color: '#111827' }}>
                {transaction.account_name || 'Sin cuenta'}
                {transaction.account_currency ? ` (${transaction.account_currency})` : ''}
              </Text>
            </View>
            {transaction.account_id && <ArrowRight color="#9CA3AF" size={20} />}
          </TouchableOpacity>

          {/* Date Row */}
          <View style={transactionDetailStyles.detailRow}>
            <View style={[transactionDetailStyles.detailLabel, { padding: 8, borderRadius: 8 }]}>
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
            <View style={transactionDetailStyles.detailRow}>
              <View style={[transactionDetailStyles.detailLabel, { padding: 8, borderRadius: 8 }]}>
                <FileText color="#6B7280" size={20} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ fontSize: 14, color: '#6B7280' }}>Notas</Text>
                <Text style={{ fontSize: 16, color: '#111827' }}>{transaction.notes}</Text>
              </View>
            </View>
          )}

          {/* Created At Row */}
          <View style={transactionDetailStyles.detailRow}>
            <View style={[transactionDetailStyles.detailLabel, { padding: 8, borderRadius: 8 }]}>
              <Clock color="#6B7280" size={20} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ fontSize: 14, color: '#6B7280' }}>Creada</Text>
              <Text style={{ fontSize: 16, color: '#111827' }}>
                {formatDate(transaction.created_at)} • {formatTime(transaction.created_at)}
              </Text>
            </View>
          </View>
        </View>

        {/* Upgrade Banner - Only show if not premium */}
        {!transaction.is_premium && (
          <View style={{
            backgroundColor: '#FEF3C7',
            borderRadius: 12,
            padding: 16,
            marginTop: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <Text style={{
              flex: 1,
              color: '#92400E',
              fontSize: 14,
              marginRight: 12
            }}>
              Actualiza a Premium para ver análisis detallados de tus transacciones.
            </Text>
            <TouchableOpacity 
              style={{
                backgroundColor: '#F59E0B',
                paddingVertical: 8,
                paddingHorizontal: 16,
                borderRadius: 8
              }}
              onPress={handleUpgradePress}
            >
              <Text style={{
                color: '#FFFFFF',
                fontWeight: '600',
                fontSize: 14
              }}>Actualizar</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default TransactionDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  categoryIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  amountTextContainer: {
    flex: 1,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 24,
    fontWeight: '700',
    flexShrink: 1,
    flexWrap: 'wrap',
    includeFontPadding: false,
    textAlignVertical: 'bottom',
  },
  amountSymbol: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
    marginRight: 4,
    includeFontPadding: false,
    textAlignVertical: 'bottom',
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'left',
    marginTop: 4,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Details section
  detailsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    margin: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  
  categoryIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  detailTextContainer: {
    flex: 1,
  },
  
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  
  detailValue: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  
  // Upgrade banner
  upgradeBanner: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    alignItems: 'center',
  },
  
  upgradeText: {
    fontSize: 14,
    color: '#1E40AF',
    textAlign: 'center',
    marginBottom: 12,
  },
  
  upgradeButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  
  upgradeButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
});