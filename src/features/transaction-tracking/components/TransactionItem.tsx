import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Trash2, Pencil } from 'lucide-react-native';
import type { Transaction as BaseTransaction } from '../services/transactionService';

// Extend the base Transaction type to include category_name
interface Transaction extends BaseTransaction {
  category_name?: string;
}
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

type TransactionItemProps = {
  transaction: Transaction;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transactionId: string) => void;
};

export const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  onEdit,
  onDelete,
}) => {
  const isExpense = transaction.type === 'expense';
  const amountColor = isExpense ? '#EF4444' : '#10B981';
  const formattedDate = format(new Date(transaction.date), 'PPP', { locale: es });

  return (
    <View style={styles.container}>
      <View style={styles.leftContent}>
        <Text style={styles.category}>
          {transaction.category_name || 'Sin categoría'}
        </Text>
        <Text style={styles.description} numberOfLines={1}>
          {transaction.description}
        </Text>
        <Text style={styles.date}>{formattedDate}</Text>
      </View>
      
      <View style={styles.rightContent}>
        <Text style={[styles.amount, { color: amountColor }]}>
          {isExpense ? '-' : '+'} ${Math.abs(transaction.amount).toFixed(2)}
        </Text>
        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => onEdit(transaction)}
          >
            <Pencil size={16} color="#6B7280" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => onDelete(transaction.id)}
          >
            <Trash2 size={16} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  leftContent: {
    flex: 1,
    marginRight: 12,
  },
  rightContent: {
    alignItems: 'flex-end',
  },
  category: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 4,
    marginLeft: 8,
  },
});
