import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react-native';
import { useAuth } from '@/shared/hooks/useAuth';
import { UpgradePrompt } from '@/shared/components/ui/UpgradePrompt';
import { useNavigation } from '@react-navigation/native';
import { useBudgets } from '../hooks/useBudgets';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { BudgetStackParamList } from '@/navigation/types';
import type { Budget } from '../services/budgetService';

interface BudgetCardProps {
  budget: Budget;
  onPress: () => void;
}

const BudgetCard: React.FC<BudgetCardProps> = ({ budget, onPress }) => {
  const spentPercentage = budget.amount > 0 ? (budget.spent_amount / budget.amount) * 100 : 0;
  const remaining = budget.amount - budget.spent_amount;
  const isOverBudget = spentPercentage > 100;
  const isNearLimit = spentPercentage >= budget.alert_threshold * 100;

  const getStatusColor = () => {
    if (isOverBudget) return '#EF4444'; // Red
    if (isNearLimit) return '#F59E0B'; // Yellow
    return '#10B981'; // Green
  };

  const getStatusIcon = () => {
    if (isOverBudget) return <TrendingDown size={16} color="#EF4444" />;
    if (isNearLimit) return <AlertTriangle size={16} color="#F59E0B" />;
    return <TrendingUp size={16} color="#10B981" />;
  };

  return (
    <TouchableOpacity style={styles.budgetCard} onPress={onPress}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleRow}>
          <Text style={styles.budgetName} numberOfLines={1}>
            {budget.name}
          </Text>
          {getStatusIcon()}
        </View>
        {budget.category && (
          <View style={[styles.categoryBadge, { backgroundColor: budget.category.color + '20' }]}>
            <Text style={[styles.categoryText, { color: budget.category.color }]}>
              {budget.category.name}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.cardContent}>
        <View style={styles.amountRow}>
          <Text style={styles.spentAmount}>
            ${budget.spent_amount.toFixed(2)}
          </Text>
          <Text style={styles.totalAmount}>
            of ${budget.amount.toFixed(2)}
          </Text>
        </View>

        <View style={styles.progressContainer}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${Math.min(spentPercentage, 100)}%`,
                backgroundColor: getStatusColor(),
              },
            ]}
          />
        </View>

        <View style={styles.footerRow}>
          <Text style={styles.remainingText}>
            {remaining >= 0 ? `$${remaining.toFixed(2)} left` : `$${Math.abs(remaining).toFixed(2)} over`}
          </Text>
          <Text style={styles.periodText}>
            {budget.period}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export const BudgetListScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<BudgetStackParamList>>();
  const { isPremium, limits } = useAuth();
  const { budgets, loading, error, deleteBudget } = useBudgets();

  const handleAddBudget = () => {
    navigation.navigate('AddBudget');
  };

  const handleBudgetPress = (budget: Budget) => {
    navigation.navigate('BudgetDetail', { budgetId: budget.id });
  };

  const handleDeleteBudget = (budget: Budget) => {
    Alert.alert(
      'Delete Budget',
      `Are you sure you want to delete "${budget.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteBudget(budget.id);
            } catch (err) {
              Alert.alert('Error', 'Failed to delete budget');
            }
          },
        },
      ]
    );
  };

  const renderBudget = ({ item }: { item: Budget }) => (
    <BudgetCard
      budget={item}
      onPress={() => handleBudgetPress(item)}
    />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No budgets yet</Text>
      <Text style={styles.emptySubtitle}>
        Create your first budget to start tracking your spending
      </Text>
      <TouchableOpacity style={styles.createButton} onPress={handleAddBudget}>
        <Plus color="#ffffff" size={20} />
        <Text style={styles.createButtonText}>Create Budget</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Budgets</Text>
          <TouchableOpacity style={styles.addButton} onPress={handleAddBudget}>
            <Plus color="#ffffff" size={20} />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading budgets...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Budgets</Text>
          <TouchableOpacity style={styles.addButton} onPress={handleAddBudget}>
            <Plus color="#ffffff" size={20} />
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load budgets</Text>
          <Text style={styles.errorSubtitle}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Budgets</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddBudget}>
          <Plus color="#ffffff" size={20} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={budgets}
        renderItem={renderBudget}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmpty}
      />

      {!isPremium && budgets.length >= (limits.maxBudgets || 5) && (
        <UpgradePrompt
          feature="unlimited budgets"
          currentLimit={limits.maxBudgets || 'N/A'}
          description="Create unlimited budgets and stay on top of your spending."
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
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  budgetCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardHeader: {
    marginBottom: 12,
  },
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  budgetName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  cardContent: {
    gap: 8,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  spentAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  totalAmount: {
    fontSize: 14,
    color: '#6B7280',
  },
  progressContainer: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  remainingText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  periodText: {
    fontSize: 12,
    color: '#9CA3AF',
    textTransform: 'capitalize',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#EF4444',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});