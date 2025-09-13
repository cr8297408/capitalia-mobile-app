import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useTransactionDetail } from '../hooks/useTransactionDetail';

type TransactionDetail = {
  id: string;
  type: 'expense' | 'income' | 'transfer';
  amount: number;
  description: string;
  date: string;
  account?: {
    id: string;
    name: string;
  };
  category?: {
    id: string;
    name: string;
  };
  paymentMethod?: string;
  notes?: string;
};

type TransactionDetailScreenRouteProp = {
  key: string;
  name: string;
  params: {
    transactionId: string;
  };
  path?: string;
};

export const useTransactionDetailScreen = (transactionId: string) => {
  const navigation = useNavigation<any>();
  const route = useRoute<TransactionDetailScreenRouteProp>();
  const { transaction, isLoading, deleteTransaction } = useTransactionDetail(transactionId);
  
  // Mock data - replace with actual data from your API
  const mockTransaction: TransactionDetail = {
    id: transactionId,
    type: 'expense',
    amount: 0,
    description: '',
    date: new Date().toISOString(),
  };

  const handleEdit = useCallback(() => {
    navigation.navigate('EditTransaction', { transactionId });
  }, [navigation, transactionId]);

  const handleDelete = useCallback(() => {
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
            const success = await deleteTransaction();
            if (success) {
              navigation.goBack();
            }
          },
        },
      ]
    );
  }, [deleteTransaction, navigation]);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "d 'de' MMMM 'de' yyyy", { locale: es });
  };

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'HH:mm', { locale: es });
  };

  const getTransactionIcon = (transaction?: TransactionDetail) => {
    if (!transaction) return 'dollar-sign';
    
    switch (transaction.type) {
      case 'income':
        return 'trending-up';
      case 'expense':
        return 'trending-down';
      case 'transfer':
        return 'refresh-cw';
      default:
        return 'dollar-sign';
    }
  };

  return {
    transaction: (transaction || mockTransaction )as TransactionDetail,
    isLoading,
    handleEdit,
    handleDelete,
    formatDate: (dateString: string) => {
      return format(new Date(dateString), "d 'de' MMMM 'de' yyyy", { locale: es });
    },
    formatTime: (dateString: string) => {
      return format(new Date(dateString), 'HH:mm', { locale: es });
    },
    getTransactionIcon,
  };
};
