import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Edit3, 
  Trash2, 
  ArrowLeft, 
  ArrowRight, 
  Calendar, 
  Wallet, 
  FileText, 
  Clock,
  Tag,
  CreditCard,
  DollarSign,
  TrendingUp,
  TrendingDown,
  RefreshCw
} from 'lucide-react-native';
import type { RootStackScreenProps } from '@/navigation/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '@/shared/hooks/useAuth';
import { useTransactionDetail } from '../hooks/useTransactionDetail';

type TransactionDetailScreenProps = RootStackScreenProps<'TransactionDetail'>;

export const TransactionDetailScreen: React.FC<TransactionDetailScreenProps> = ({ navigation, route }) => {
  const { transactionId } = route.params;
  const { isPremium } = useAuth();
  const { 
    transaction, 
    isLoading, 
    deleteTransaction: deleteTransactionHook 
  } = useTransactionDetail(transactionId);

  const handleEdit = () => {
    navigation.navigate('EditTransaction', { transactionId });
  };

  const handleDelete = () => {
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
          onPress: async () => {
            const success = await deleteTransactionHook();
            if (success) {
              navigation.goBack();
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "d 'de' MMMM 'de' yyyy", { locale: es });
  };

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'HH:mm', { locale: es });
  };

  const getTransactionIcon = () => {
    if (!transaction) return null;
    
    const iconProps = { size: 24, color: '#6B7280' };
    
    switch (transaction.type) {
      case 'income':
        return <TrendingUp {...iconProps} />;
      case 'expense':
        return <TrendingDown {...iconProps} />;
      case 'transfer':
        return <RefreshCw {...iconProps} />;
      default:
        return <DollarSign {...iconProps} />;
    }
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Detalle de transacción',
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
            <Edit3 color="#2563EB" size={24} />
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
  }, [navigation, handleEdit, handleDelete]);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (!transaction) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text>No se encontró la transacción</Text>
      </View>
    );
  }

  const isExpense = transaction.type === 'expense';
  const isTransfer = transaction.type === 'transfer';
  const amountColor = isExpense ? '#EF4444' : isTransfer ? '#6366F1' : '#10B981';
  const amountPrefix = isExpense ? '- ' : isTransfer ? '→ ' : '+ ';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={[styles.content]}
      >
        <View style={styles.amountContainer}>
          <View style={[styles.amountIcon, { backgroundColor: `${amountColor}1A` }]}>
            {getTransactionIcon()}
          </View>
          <View style={styles.amountTextContainer}>
            <View style={styles.amountRow}>
              <Text style={[styles.amount, { color: amountColor }]}>
                <Text style={styles.amountSymbol}>
                  {amountPrefix}{transaction.account_currency || '$'}
                </Text>
                <Text>{Math.abs(transaction.amount).toFixed(2)}</Text>
              </Text>
            </View>
            <Text style={styles.description} numberOfLines={2} ellipsizeMode="tail">
              {transaction.description}
            </Text>
          </View>
        </View>

        <View style={styles.detailsContainer}>
          <TouchableOpacity 
            style={styles.detailRow}
            onPress={() => {
              if (transaction.category_id) {
                // Navigate to category edit if needed
              }
            }}
          >
            <View style={[styles.detailIcon, { backgroundColor: '#F3F4F6' }]}>
              {transaction.category_icon ? (
                <Text style={styles.categoryIcon}>{transaction.category_icon}</Text>
              ) : (
                <Tag color="#6B7280" size={20} />
              )}
            </View>
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Categoría</Text>
              <Text style={styles.detailValue}>
                {transaction.category_name || 'Sin categoría'}
              </Text>
            </View>
            <ArrowRight color="#9CA3AF" size={20} />
          </TouchableOpacity>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Calendar color="#6B7280" size={20} />
            </View>
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Fecha</Text>
              <Text style={styles.detailValue}>
                {formatDate(transaction.date)} • {formatTime(transaction.date)}
              </Text>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.detailRow}
            onPress={() => {
              // Navigate to account details if needed
            }}
          >
            <View style={[styles.detailIcon, { backgroundColor: '#EFF6FF' }]}>
              <CreditCard color="#2563EB" size={20} />
            </View>
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Cuenta</Text>
              <Text style={styles.detailValue}>
                {transaction.account_name || 'Sin cuenta'}
                {transaction.account_currency && ` (${transaction.account_currency})`}
              </Text>
            </View>
            <ArrowRight color="#9CA3AF" size={20} />
          </TouchableOpacity>

          {transaction.notes && (
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <FileText color="#6B7280" size={20} />
              </View>
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailLabel}>Notas</Text>
                <Text style={styles.detailValue}>{transaction.notes}</Text>
              </View>
            </View>
          )}

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Clock color="#6B7280" size={20} />
            </View>
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Creada</Text>
              <Text style={styles.detailValue}>
                {formatDate(transaction.created_at)} • {formatTime(transaction.created_at)}
              </Text>
            </View>
          </View>
        </View>

        {!isPremium && (
          <View style={styles.upgradeBanner}>
            <Text style={styles.upgradeText}>
              Actualiza a Premium para ver análisis detallados de tus transacciones.
            </Text>
            <TouchableOpacity style={styles.upgradeButton}>
              <Text style={styles.upgradeButtonText}>Actualizar</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // Layout
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  content: {
    flex: 1,
    padding: 2,
  },
  
  // Amount section
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  
  amountIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  
  amountTextContainer: {
    flex: 1,
  },
  
  amountRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  
  amount: {
    fontSize: 28,
    fontWeight: '700',
    flexShrink: 1,
    flexWrap: 'wrap',
    includeFontPadding: false,
    textAlignVertical: 'bottom',
  },
  
  amountSymbol: {
    fontSize: 28,
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