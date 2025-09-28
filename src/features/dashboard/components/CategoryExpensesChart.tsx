/**
 * Category Expenses Chart Component - Visual chart showing expenses by category
 * Following Scope Rule Pattern - Component local to dashboard feature
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList } from 'react-native';
import { ChevronDown, X } from 'lucide-react-native';

interface CategoryExpense {
  category: string;
  categoryId: string;
  amount: number;
  percentage: number;
  color: string;
  icon: string;
  type?: 'expense' | 'budget';  // Para diferenciar gastos reales de presupuestos
  budgetAmount?: number;  // Monto total del presupuesto (solo para type: 'budget')
}

export type PeriodType = 'this_month' | 'last_month' | 'last_3_months' | 'last_6_months' | 'this_year';

interface CategoryExpensesChartProps {
  data: CategoryExpense[];
  title?: string;
  selectedPeriod?: PeriodType;
  onPeriodChange?: (period: PeriodType) => void;
}

const PERIOD_OPTIONS = [
  { value: 'this_month', label: 'Este mes' },
  { value: 'last_month', label: 'Mes anterior' },
  { value: 'last_3_months', label: 'Últimos 3 meses' },
  { value: 'last_6_months', label: 'Últimos 6 meses' },
  { value: 'this_year', label: 'Este año' },
] as const;

export const CategoryExpensesChart: React.FC<CategoryExpensesChartProps> = ({
  data,
  title = 'Gastos y Presupuestos',
  selectedPeriod = 'this_month',
  onPeriodChange,
}) => {
  const [showPeriodModal, setShowPeriodModal] = useState(false);
  
  const getCurrentPeriodLabel = () => {
    return PERIOD_OPTIONS.find(option => option.value === selectedPeriod)?.label || 'Este mes';
  };

  const handlePeriodSelect = (period: PeriodType) => {
    onPeriodChange?.(period);
    setShowPeriodModal(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Function to get icon based on icon name from database
  const getIconEmoji = (iconName: string): string => {
    const iconMap: Record<string, string> = {
      'utensils': '🍔',
      'car': '🚗',
      'shopping-bag': '🛍️',
      'gamepad-2': '🎬',
      'zap': '💡',
      'heart-pulse': '⚕️',
      'home': '🏠',
      'plane': '✈️',
      'graduation-cap': '🎓',
      'user': '👤',
      'briefcase': '💼',
      'laptop': '💻',
      'trending-up': '📈',
      'building': '🏢',
      'plus-circle': '➕',
      'tag': '🏷️',
    };

    return iconMap[iconName] || '📦';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <TouchableOpacity 
          style={styles.periodSelector}
          onPress={() => setShowPeriodModal(true)}
        >
          <Text style={styles.periodText}>{getCurrentPeriodLabel()}</Text>
          <ChevronDown size={16} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <View style={styles.chartContainer}>
        {data.map((item, index) => (
          <View key={item.categoryId || index} style={styles.barContainer}>
            <View style={styles.barInfo}>
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryIcon}>
                  {item.type === 'budget' ? '📊' : getIconEmoji(item.icon)}
                </Text>
                <View style={styles.categoryDetails}>
                  <Text style={styles.categoryName}>{item.category}</Text>
                  {item.type === 'budget' && item.budgetAmount && (
                    <Text style={styles.budgetSubtext}>
                      {formatCurrency(item.amount)} de {formatCurrency(item.budgetAmount)}
                    </Text>
                  )}
                </View>
              </View>
              <Text style={styles.categoryAmount}>
                {item.type === 'budget' ? `${item.percentage}%` : formatCurrency(item.amount)}
              </Text>
            </View>
            
            <View style={styles.barTrack}>
              <View 
                style={[
                  styles.barFill, 
                  { 
                    width: `${item.percentage}%`,
                    backgroundColor: item.type === 'budget' 
                      ? (item.percentage > 80 ? '#EF4444' : item.percentage > 60 ? '#F59E0B' : '#10B981')
                      : item.color
                  }
                ]} 
              />
            </View>
            
            <Text style={styles.percentageText}>
              {item.percentage}%
            </Text>
          </View>
        ))}
      </View>

      {data.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>💸</Text>
          <Text style={styles.emptyText}>No hay gastos para mostrar</Text>
          <Text style={styles.emptySubtext}>
            Agrega algunas transacciones para ver el análisis por categorías en este período
          </Text>
        </View>
      )}

      {/* Period Selection Modal */}
      <Modal
        visible={showPeriodModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPeriodModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar Período</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowPeriodModal(false)}
              >
                <X size={24} color="#374151" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={PERIOD_OPTIONS}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.periodOption,
                    selectedPeriod === item.value && styles.periodOptionSelected
                  ]}
                  onPress={() => handlePeriodSelect(item.value)}
                >
                  <Text style={[
                    styles.periodOptionText,
                    selectedPeriod === item.value && styles.periodOptionTextSelected
                  ]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  periodSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  periodText: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 4,
  },
  chartContainer: {
    gap: 16,
  },
  barContainer: {
    gap: 8,
  },
  barInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  categoryDetails: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    flex: 1,
  },
  budgetSubtext: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  categoryAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  barTrack: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  percentageText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'right',
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '50%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  modalCloseButton: {
    padding: 4,
  },
  periodOption: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  periodOptionSelected: {
    backgroundColor: '#F0F9FF',
  },
  periodOptionText: {
    fontSize: 16,
    color: '#374151',
  },
  periodOptionTextSelected: {
    color: '#3B82F6',
    fontWeight: '600',
  },
});