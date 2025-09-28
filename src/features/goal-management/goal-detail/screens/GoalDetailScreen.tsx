/**
 * Goal Detail Screen - Display individual goal with contribution management
 * Following Scope Rule Pattern - Screen specific to goal-detail subdirectory
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Target, Plus } from 'lucide-react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { useGoalDetail } from '../../hooks/useGoalDetail';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '@/navigation/types';
import { useCallback } from 'react';

type GoalDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'GoalDetail'>;
type GoalDetailScreenRouteProp = RouteProp<RootStackParamList, 'GoalDetail'>;

export const GoalDetailScreen: React.FC = () => {
  const navigation = useNavigation<GoalDetailScreenNavigationProp>();
  const route = useRoute<GoalDetailScreenRouteProp>();
  const { goalId } = route.params;
  
  const { goal, contributions, loading, loadGoalDetail } = useGoalDetail(goalId);
  const [refreshing, setRefreshing] = useState(false);

  // Refresh data when screen comes into focus (e.g., returning from add contribution)
  useFocusEffect(
    useCallback(() => {
      if (goalId) {
        loadGoalDetail(goalId);
      }
    }, [goalId, loadGoalDetail])
  );

  // Handle pull-to-refresh
  const onRefresh = useCallback(async () => {
    if (goalId) {
      setRefreshing(true);
      try {
        await loadGoalDetail(goalId);
      } finally {
        setRefreshing(false);
      }
    }
  }, [goalId, loadGoalDetail]);

  if (loading || !goal) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading goal...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const progressPercentage = goal.target_amount > 0 
    ? Math.min((goal.current_amount / goal.target_amount) * 100, 100)
    : 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerButton} 
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Goal Details</Text>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => navigation.navigate('AddGoalContribution', { goalId })}
        >
          <Plus size={24} color="#374151" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor="#3B82F6"
            title="Updating goal..."
          />
        }
      >
        {/* Goal Header */}
        <View style={[styles.goalCard, { backgroundColor: goal.color ? `${goal.color}10` : '#F9FAFB' }]}>
          <View style={styles.goalHeader}>
            <View style={styles.goalIcon}>
              <Target size={24} color={goal.color || '#3B82F6'} />
            </View>
            <View style={styles.goalInfo}>
              <Text style={styles.goalName}>{goal.name}</Text>
              {goal.description && (
                <Text style={styles.goalDescription}>{goal.description}</Text>
              )}
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${progressPercentage}%`,
                    backgroundColor: goal.color || '#3B82F6'
                  }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {progressPercentage.toFixed(1)}% Complete
            </Text>
          </View>

          {/* Amounts */}
          <View style={styles.amountContainer}>
            <View style={styles.amountItem}>
              <Text style={styles.amountLabel}>Current</Text>
              <Text style={styles.amountValue}>
                ${goal.current_amount.toLocaleString()}
              </Text>
            </View>
            <View style={styles.amountItem}>
              <Text style={styles.amountLabel}>Target</Text>
              <Text style={styles.amountValue}>
                ${goal.target_amount.toLocaleString()}
              </Text>
            </View>
            <View style={styles.amountItem}>
              <Text style={styles.amountLabel}>Remaining</Text>
              <Text style={[styles.amountValue, styles.remainingAmount]}>
                ${(goal.target_amount - goal.current_amount).toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Recent Contributions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Contributions</Text>
          {contributions.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No contributions yet</Text>
              <Text style={styles.emptySubtext}>
                Start contributing to reach your goal!
              </Text>
            </View>
          ) : (
            <View style={styles.contributionsList}>
              {contributions.slice(0, 5).map((contribution) => (
                <View key={contribution.id} style={styles.contributionItem}>
                  <View style={styles.contributionInfo}>
                    <Text style={styles.contributionAmount}>
                      +${contribution.amount.toLocaleString()}
                    </Text>
                    <Text style={styles.contributionDate}>
                      {new Date(contribution.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                  {contribution.notes && (
                    <Text style={styles.contributionNotes}>
                      {contribution.notes}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerButton: {
    padding: 8,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  content: {
    flex: 1,
    padding: 16,
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
  goalCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  goalIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  goalInfo: {
    flex: 1,
  },
  goalName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  goalDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
  },
  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  amountItem: {
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  remainingAmount: {
    color: '#F59E0B',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  contributionsList: {
    gap: 12,
  },
  contributionItem: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
  },
  contributionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  contributionAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#059669',
  },
  contributionDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  contributionNotes: {
    fontSize: 14,
    color: '#374151',
  },
});