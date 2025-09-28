/**
 * Dashboard Insights Component - AI insights and goal progress cards
 * Following Scope Rule Pattern - Component local to dashboard feature
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ArrowRight, Target, Brain } from 'lucide-react-native';

interface AIInsight {
  id: string;
  type: 'savings' | 'spending' | 'goal' | 'budget';
  title: string;
  message: string;
  actionText?: string;
  onPress?: () => void;
}

interface GoalProgress {
  id: string;
  name: string;
  currentAmount: number;
  targetAmount: number;
  progress: number; // 0-1
}

interface DashboardInsightsProps {
  aiInsights?: AIInsight[];
  goalProgress?: GoalProgress[];
  onViewAllGoals?: () => void;
  onViewInsight?: (insight: AIInsight) => void;
}

export const DashboardInsights: React.FC<DashboardInsightsProps> = ({
  aiInsights = [],
  goalProgress = [],
  onViewAllGoals,
  onViewInsight,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getInsightIcon = (type: AIInsight['type']) => {
    switch (type) {
      case 'savings':
        return '💰';
      case 'spending':
        return '💸';
      case 'goal':
        return '🎯';
      case 'budget':
        return '📊';
      default:
        return '🤖';
    }
  };

  const getInsightColor = (type: AIInsight['type']) => {
    switch (type) {
      case 'savings':
        return '#10B981';
      case 'spending':
        return '#EF4444';
      case 'goal':
        return '#3B82F6';
      case 'budget':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };

  return (
    <View style={styles.container}>
      {/* AI Insights Section */}
      {aiInsights.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Brain size={20} color="#8B5CF6" />
            <Text style={styles.sectionTitle}>Insights de IA</Text>
          </View>
          
          {aiInsights.slice(0, 2).map((insight, index) => (
            <TouchableOpacity
              key={insight.id}
              style={[
                styles.insightCard,
                { borderLeftColor: getInsightColor(insight.type) }
              ]}
              onPress={() => onViewInsight?.(insight)}
              activeOpacity={0.7}
            >
              <View style={styles.insightContent}>
                <View style={styles.insightHeader}>
                  <Text style={styles.insightIcon}>
                    {getInsightIcon(insight.type)}
                  </Text>
                  <Text style={styles.insightTitle}>{insight.title}</Text>
                </View>
                <Text style={styles.insightMessage}>{insight.message}</Text>
              </View>
              <ArrowRight size={20} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Goal Progress Section */}
      {goalProgress.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Target size={20} color="#3B82F6" />
            <Text style={styles.sectionTitle}>Progreso de Metas</Text>
            {onViewAllGoals && (
              <TouchableOpacity onPress={onViewAllGoals}>
                <Text style={styles.viewAllText}>Ver todas</Text>
              </TouchableOpacity>
            )}
          </View>

          {goalProgress.slice(0, 2).map((goal, index) => (
            <View key={goal.id} style={styles.goalCard}>
              <View style={styles.goalHeader}>
                <Text style={styles.goalName}>{goal.name}</Text>
                <Text style={styles.goalAmount}>
                  {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                </Text>
              </View>
              
              <View style={styles.progressContainer}>
                <View style={styles.progressTrack}>
                  <View 
                    style={[
                      styles.progressFill,
                      { width: `${Math.min(goal.progress * 100, 100)}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>
                  {Math.round(goal.progress * 100)}%
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Empty State */}
      {aiInsights.length === 0 && goalProgress.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📊</Text>
          <Text style={styles.emptyTitle}>No hay insights disponibles</Text>
          <Text style={styles.emptyMessage}>
            Agrega transacciones y metas para obtener insights personalizados
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 8,
    flex: 1,
  },
  viewAllText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  insightContent: {
    flex: 1,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  insightIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  insightMessage: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  goalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  goalAmount: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressTrack: {
    flex: 1,
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
    minWidth: 35,
    textAlign: 'right',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 0,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
});