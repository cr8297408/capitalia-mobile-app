/**
 * Goal Card Component - Individual goal card display
 * Following Scope Rule Pattern - Component specific to goal-list subdirectory
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from 'react-native';
import { 
  Edit3, 
  Trash2, 
  Play, 
  Pause, 
  CheckCircle2,
  Calendar,
  AlertTriangle,
  Target
} from 'lucide-react-native';
import { formatCurrencyDisplay } from '@/shared/utils/currencyFormatter';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { GoalWithProgress } from '../../types';
import { GOAL_CATEGORIES } from '../../types';

interface GoalCardProps {
  goal: GoalWithProgress;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
  onComplete: () => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  onPress,
  onEdit,
  onDelete,
  onToggleStatus,
  onComplete,
}) => {
  const getStatusColor = () => {
    if (goal.status === 'completed') return '#10B981';
    if (goal.status === 'paused') return '#6B7280';
    if (goal.is_overdue) return '#EF4444';
    if (goal.days_remaining !== undefined && goal.days_remaining <= 7) return '#F59E0B';
    return '#3B82F6';
  };

  const getStatusIcon = () => {
    const color = getStatusColor();
    const size = 16;
    
    if (goal.status === 'completed') return <CheckCircle2 size={size} color={color} />;
    if (goal.status === 'paused') return <Pause size={size} color={color} />;
    if (goal.is_overdue) return <AlertTriangle size={size} color={color} />;
    return <Target size={size} color={color} />;
  };

  const getStatusText = () => {
    if (goal.status === 'completed') return 'Completed';
    if (goal.status === 'paused') return 'Paused';
    if (goal.is_overdue) return 'Overdue';
    if (goal.days_remaining !== undefined && goal.days_remaining <= 7) {
      return `${goal.days_remaining} days left`;
    }
    return 'Active';
  };

  const getCategoryInfo = () => {
    const category = GOAL_CATEGORIES.find(cat => cat.id === goal.category);
    return category || { name: 'Other', icon: 'target', color: '#6B7280' };
  };

  const categoryInfo = getCategoryInfo();

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={[styles.categoryIcon, { backgroundColor: `${goal.color || categoryInfo.color}20` }]}>
            <Target size={20} color={goal.color || categoryInfo.color} />
          </View>
          <View style={styles.titleContent}>
            <Text style={styles.goalName} numberOfLines={1}>
              {goal.name}
            </Text>
            {goal.category && (
              <Text style={styles.categoryName} numberOfLines={1}>
                {categoryInfo.name}
              </Text>
            )}
          </View>
        </View>
        
        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={onEdit}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Edit3 size={16} color="#6B7280" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={onDelete}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Trash2 size={16} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.amountSection}>
        <View style={styles.amountRow}>
          <Text style={styles.currentAmount}>
            {formatCurrencyDisplay(goal.current_amount)}
          </Text>
          <Text style={styles.targetAmount}>
            of {formatCurrencyDisplay(goal.target_amount)}
          </Text>
        </View>
        <Text style={styles.remainingAmount}>
          {formatCurrencyDisplay(goal.remaining_amount)} remaining
        </Text>
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.min(goal.progress_percentage, 100)}%`,
                backgroundColor: getStatusColor(),
              },
            ]}
          />
        </View>
        <Text style={[styles.progressText, { color: getStatusColor() }]}>
          {goal.progress_percentage.toFixed(1)}%
        </Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.statusSection}>
          {getStatusIcon()}
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {getStatusText()}
          </Text>
        </View>

        <View style={styles.footerActions}>
          {goal.status === 'active' && goal.progress_percentage >= 100 && (
            <TouchableOpacity 
              style={[styles.footerButton, styles.completeButton]}
              onPress={onComplete}
            >
              <CheckCircle2 size={14} color="#FFFFFF" />
              <Text style={styles.completeButtonText}>Complete</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={[styles.footerButton, styles.toggleButton]}
            onPress={onToggleStatus}
          >
            {goal.status === 'paused' ? (
              <>
                <Play size={14} color="#3B82F6" />
                <Text style={styles.toggleButtonText}>Resume</Text>
              </>
            ) : (
              <>
                <Pause size={14} color="#6B7280" />
                <Text style={[styles.toggleButtonText, { color: '#6B7280' }]}>Pause</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {goal.target_date && (
        <View style={styles.dateSection}>
          <Calendar size={12} color="#6B7280" />
          <Text style={styles.dateText}>
            Target: {format(new Date(goal.target_date), 'MMM d, yyyy', { locale: es })}
          </Text>
        </View>
      )}

      {goal.description && (
        <Text style={styles.description} numberOfLines={2}>
          {goal.description}
        </Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  titleContent: {
    flex: 1,
  },
  goalName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  categoryName: {
    fontSize: 12,
    color: '#6B7280',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
  amountSection: {
    marginBottom: 12,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  currentAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginRight: 8,
  },
  targetAmount: {
    fontSize: 14,
    color: '#6B7280',
  },
  remainingAmount: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    minWidth: 40,
    textAlign: 'right',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 6,
  },
  footerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginLeft: 8,
  },
  completeButton: {
    backgroundColor: '#10B981',
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  toggleButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  toggleButtonText: {
    color: '#3B82F6',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  dateSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 11,
    color: '#6B7280',
    marginLeft: 4,
  },
  description: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
});