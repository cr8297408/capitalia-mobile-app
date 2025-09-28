/**
 * Goal List Screen - Display all user goals with progress
 * Following Scope Rule Pattern - Screen specific to goal-list subdirectory
 */

import React, { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Target, TrendingUp, Calendar, AlertTriangle } from 'lucide-react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '@/shared/hooks/useAuth';
import { UpgradePrompt } from '@/shared/components/ui/UpgradePrompt';
import { formatCurrencyDisplay } from '@/shared/utils/currencyFormatter';
import { useGoals } from '../../hooks/useGoals';
import { GoalCard } from '../components/GoalCard';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { GoalStackParamList } from '@/navigation/types';
import type { GoalWithProgress } from '../../types';

type GoalListScreenNavigationProp = StackNavigationProp<GoalStackParamList, 'GoalList'>;

export const GoalListScreen: React.FC = () => {
  const navigation = useNavigation<GoalListScreenNavigationProp>();
  const { limits } = useAuth();
  
  const {
    goals,
    activeGoals,
    completedGoals,
    urgentGoals,
    overdueGoals,
    totalGoals,
    totalTargetAmount,
    totalCurrentAmount,
    overallProgress,
    loading,
    error,
    loadGoals,
    deleteGoal,
    toggleGoalStatus,
    completeGoal,
  } = useGoals();

  // Refresh goals when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadGoals();
    }, [loadGoals])
  );

  const handleAddGoal = useCallback(() => {
    // Check premium limits
    if (limits.maxGoals && totalGoals >= limits.maxGoals) {
      Alert.alert(
        'Upgrade Required',
        `You've reached the limit of ${limits.maxGoals} goals. Upgrade to Premium for unlimited goals.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Upgrade', 
            onPress: () => navigation.navigate('SubscriptionPlans' as any) 
          }
        ]
      );
      return;
    }
    
    navigation.navigate('AddGoal');
  }, [navigation, limits.maxGoals, totalGoals]);

  const handleGoalPress = useCallback((goalId: string) => {
    navigation.navigate('GoalDetail', { goalId });
  }, [navigation]);

  const handleGoalEdit = useCallback((goalId: string) => {
    navigation.navigate('EditGoal', { goalId });
  }, [navigation]);

  const handleGoalDelete = useCallback((goal: GoalWithProgress) => {
    Alert.alert(
      'Delete Goal',
      `Are you sure you want to delete "${goal.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteGoal(goal.id);
            } catch (error: any) {
              Alert.alert('Error', 'Failed to delete goal. Please try again.');
            }
          },
        },
      ]
    );
  }, [deleteGoal]);

  const handleGoalToggleStatus = useCallback(async (goalId: string) => {
    try {
      await toggleGoalStatus(goalId);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to update goal status. Please try again.');
    }
  }, [toggleGoalStatus]);

  const handleGoalComplete = useCallback(async (goalId: string) => {
    try {
      await completeGoal(goalId);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to complete goal. Please try again.');
    }
  }, [completeGoal]);

  const renderGoalCard = useCallback(({ item }: { item: GoalWithProgress }) => (
    <GoalCard
      goal={item}
      onPress={() => handleGoalPress(item.id)}
      onEdit={() => handleGoalEdit(item.id)}
      onDelete={() => handleGoalDelete(item)}
      onToggleStatus={() => handleGoalToggleStatus(item.id)}
      onComplete={() => handleGoalComplete(item.id)}
    />
  ), [handleGoalPress, handleGoalEdit, handleGoalDelete, handleGoalToggleStatus, handleGoalComplete]);

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Target size={20} color="#3B82F6" />
          <Text style={styles.summaryValue}>{totalGoals}</Text>
          <Text style={styles.summaryLabel}>Total Goals</Text>
        </View>
        
        <View style={styles.summaryCard}>
          <TrendingUp size={20} color="#10B981" />
          <Text style={styles.summaryValue}>{overallProgress.toFixed(1)}%</Text>
          <Text style={styles.summaryLabel}>Progress</Text>
        </View>
        
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{formatCurrencyDisplay(totalCurrentAmount)}</Text>
          <Text style={styles.summaryLabel}>Saved</Text>
        </View>
      </View>

      {/* Alerts */}
      {urgentGoals.length > 0 && (
        <View style={styles.alertCard}>
          <View style={styles.alertIcon}>
            <Calendar size={16} color="#F59E0B" />
          </View>
          <Text style={styles.alertText}>
            {urgentGoals.length} goal{urgentGoals.length > 1 ? 's' : ''} approaching deadline
          </Text>
        </View>
      )}

      {overdueGoals.length > 0 && (
        <View style={[styles.alertCard, styles.overdueAlert]}>
          <View style={styles.alertIcon}>
            <AlertTriangle size={16} color="#EF4444" />
          </View>
          <Text style={[styles.alertText, styles.overdueText]}>
            {overdueGoals.length} goal{overdueGoals.length > 1 ? 's' : ''} overdue
          </Text>
        </View>
      )}
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Target size={64} color="#9CA3AF" />
      <Text style={styles.emptyTitle}>No Goals Yet</Text>
      <Text style={styles.emptyDescription}>
        Start by creating your first financial goal. Whether it's an emergency fund, vacation, or major purchase.
      </Text>
      <TouchableOpacity style={styles.emptyButton} onPress={handleAddGoal}>
        <Plus size={20} color="#FFFFFF" />
        <Text style={styles.emptyButtonText}>Create Your First Goal</Text>
      </TouchableOpacity>
    </View>
  );

  // Check premium limits for display
  if (limits.maxGoals && totalGoals >= limits.maxGoals) {
    return (
      <SafeAreaView style={styles.container}>
        <UpgradePrompt 
          feature="unlimited goals"
          currentLimit={`${totalGoals}/${limits.maxGoals} goals used`}
        />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <AlertTriangle size={48} color="#EF4444" />
          <Text style={styles.errorText}>Failed to load goals</Text>
          <Text style={styles.errorSubtext}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadGoals}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={goals}
        renderItem={renderGoalCard}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={goals.length > 0 ? renderHeader : undefined}
        ListEmptyComponent={!loading ? renderEmptyState : undefined}
        contentContainerStyle={goals.length === 0 ? styles.emptyContainer : styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadGoals} />
        }
        showsVerticalScrollIndicator={false}
      />
      
      {goals.length > 0 && (
        <TouchableOpacity style={styles.fab} onPress={handleAddGoal}>
          <Plus size={24} color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginTop: 8,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  overdueAlert: {
    backgroundColor: '#FEE2E2',
    borderLeftColor: '#EF4444',
  },
  alertIcon: {
    marginRight: 8,
  },
  alertText: {
    flex: 1,
    fontSize: 14,
    color: '#92400E',
    fontWeight: '500',
  },
  overdueText: {
    color: '#991B1B',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#EF4444',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});