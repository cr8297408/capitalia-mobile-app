import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TrendingUp, TrendingDown, AlertTriangle, Calendar, Tag } from 'lucide-react-native';
import { ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useBudgetDetail } from '../hooks/useBudgetDetail';
import { useBudgets } from '../../budget-list/hooks/useBudgets';
import { useHeaderBudgetDetail } from '../../hooks/useHeaderBudgetDetail';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { BudgetStackParamList } from '@/navigation/types';

type BudgetDetailScreenNavigationProp = StackNavigationProp<BudgetStackParamList, 'BudgetDetail'>;

export const BudgetDetailScreen: React.FC = () => {
  const navigation = useNavigation<BudgetDetailScreenNavigationProp>();
  const route = useRoute();
  const { budgetId } = route.params as { budgetId: string };

  const { budget, progress, loading, error } = useBudgetDetail(budgetId);
  const { deleteBudget } = useBudgets();

  const handleEdit = () => {
    navigation.navigate('EditBudget', { budgetId });
  };

  const handleDelete = () => {
    if (!budget) return;

    Alert.alert(
      'Delete Budget',
      `Are you sure you want to delete "${budget.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteBudget(budgetId);
              navigation.goBack();
            } catch (err) {
              Alert.alert('Error', 'Failed to delete budget');
            }
          },
        },
      ]
    );
  };

  useHeaderBudgetDetail({
    navigation,
    onEdit: handleEdit,
    onDelete: handleDelete,
    budgetName: budget?.name,
  });

  const getStatusColor = () => {
    if (!progress) return '#10B981';
    if (progress.percentage > 100) return '#EF4444';
    if (progress.percentage >= (budget?.alert_threshold || 0) * 100) return '#F59E0B';
    return '#10B981';
  };

  const getStatusIcon = () => {
    if (!progress) return <TrendingUp size={24} color="#10B981" />;
    if (progress.percentage > 100) return <TrendingDown size={24} color="#EF4444" />;
    if (progress.percentage >= (budget?.alert_threshold || 0) * 100) return <AlertTriangle size={24} color="#F59E0B" />;
    return <TrendingUp size={24} color="#10B981" />;
  };

  const getStatusText = () => {
    if (!progress) return 'On Track';
    if (progress.percentage > 100) return 'Over Budget';
    if (progress.percentage >= (budget?.alert_threshold || 0) * 100) return 'Near Limit';
    return 'On Track';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Loading budget details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !budget) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load budget</Text>
          <Text style={styles.errorSubtitle}>{error || 'Budget not found'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Budget Name Header */}
        <View style={styles.budgetNameContainer}>
          <Text style={styles.budgetName} numberOfLines={2}>
            {budget.name}
          </Text>
          <Text style={styles.budgetPeriod}>
            {budget.period.charAt(0).toUpperCase() + budget.period.slice(1)} Budget
          </Text>
        </View>

        {/* Status Card */}
        <View style={[styles.statusCard, { borderLeftColor: getStatusColor() }]}>
          <View style={styles.statusHeader}>
            {getStatusIcon()}
            <Text style={[styles.statusText, { color: getStatusColor() }]}>
              {getStatusText()}
            </Text>
          </View>
          <Text style={styles.statusDescription}>
            {progress && progress.percentage > 100
              ? `You've exceeded your budget by $${(progress.spent - budget.amount).toFixed(2)}`
              : progress && progress.percentage >= (budget.alert_threshold * 100)
              ? `You're approaching your ${budget.alert_threshold * 100}% alert threshold`
              : 'Your spending is within budget limits'
            }
          </Text>
        </View>

        {/* Budget Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Budget Overview</Text>

          <View style={styles.overviewGrid}>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>Total Budget</Text>
              <Text style={styles.overviewValue}>${budget.amount.toFixed(2)}</Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>Spent</Text>
              <Text style={styles.overviewValue}>${budget.spent_amount.toFixed(2)}</Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>Remaining</Text>
              <Text style={[styles.overviewValue, {
                color: progress && progress.remaining < 0 ? '#EF4444' : '#10B981'
              }]}>
                ${progress?.remaining.toFixed(2) || '0.00'}
              </Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>Progress</Text>
              <Text style={styles.overviewValue}>
                {progress?.percentage.toFixed(1) || '0.0'}%
              </Text>
            </View>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Progress</Text>
          <View style={styles.progressContainer}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${Math.min(progress?.percentage || 0, 100)}%`,
                  backgroundColor: getStatusColor(),
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {progress?.percentage.toFixed(1) || '0.0'}% of budget used
          </Text>
        </View>

        {/* Budget Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>

          <View style={styles.detailGrid}>
            <View style={styles.detailItem}>
              <Calendar size={20} color="#6B7280" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Period</Text>
                <Text style={styles.detailValue} numberOfLines={1}>
                  {budget.period.charAt(0).toUpperCase() + budget.period.slice(1)}
                </Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <Calendar size={20} color="#6B7280" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Start Date</Text>
                <Text style={styles.detailValue}>
                  {new Date(budget.start_date).toLocaleDateString()}
                </Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <Calendar size={20} color="#6B7280" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>End Date</Text>
                <Text style={styles.detailValue}>
                  {new Date(budget.end_date).toLocaleDateString()}
                </Text>
              </View>
            </View>

            {budget.category && (
              <View style={styles.detailItem}>
                <Tag size={20} color="#6B7280" />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Category</Text>
                  <View style={[styles.categoryBadge, { backgroundColor: budget.category.color + '20' }]}>
                    <Text style={[styles.categoryText, { color: budget.category.color }]}>
                      {budget.category.name}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            <View style={styles.detailItem}>
              <AlertTriangle size={20} color="#6B7280" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Alert Threshold</Text>
                <Text style={styles.detailValue}>
                  {budget.alert_threshold * 100}%
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  budgetNameContainer: {
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  budgetName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 4,
  },
  budgetPeriod: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  statusCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
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
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  overviewItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  overviewLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    textAlign: 'center',
  },
  overviewValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
  },
  progressContainer: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  detailGrid: {
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
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