import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus } from 'lucide-react-native';
import { useAuth } from '@/shared/hooks/useAuth';
import { UpgradePrompt } from '@/shared/components/ui/UpgradePrompt';
import type { TransactionStackScreenProps } from '@/navigation/types';

type TransactionListScreenProps = TransactionStackScreenProps<'TransactionList'>;

export const TransactionListScreen: React.FC<TransactionListScreenProps> = ({ navigation }) => {
  const { isPremium, limits } = useAuth();

  const handleAddTransaction = () => {
    navigation.navigate('AddTransaction');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Transactions</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddTransaction}>
          <Plus color="#ffffff" size={20} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.placeholder}>
          Transaction list coming soon
        </Text>
      </View>

      {!isPremium && (
        <UpgradePrompt 
          feature="unlimited transactions"
          currentLimit={limits.maxTransactions || 'N/A'}
          description="Track unlimited transactions and never miss a financial detail."
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  placeholder: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
});