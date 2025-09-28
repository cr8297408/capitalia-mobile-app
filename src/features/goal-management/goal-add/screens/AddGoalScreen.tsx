/**
 * Add Goal Screen - Create new financial goal
 * Following Scope Rule Pattern - Screen specific to goal-add subdirectory
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Save, Target, DollarSign, FileText } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useGoals } from '../../hooks/useGoals';
import { useGoalCategories } from '../../hooks/useGoalCategories';
import { formatCurrency, parseCurrencyToFloat, formatCurrencyDisplay } from '@/shared/utils/currencyFormatter';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '@/navigation/types';
import type { GoalPriority } from '../../types';

type AddGoalScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AddGoal'>;

export const AddGoalScreen: React.FC = () => {
  const navigation = useNavigation<AddGoalScreenNavigationProp>();
  const { createGoal } = useGoals();
  const { categories, loading: categoriesLoading } = useGoalCategories();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [targetAmountInput, setTargetAmountInput] = useState('');
  const [priority, setPriority] = useState<GoalPriority>('medium');
  const [category, setCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTargetAmountChange = (text: string) => {
    const formatted = formatCurrency(text);
    setTargetAmountInput(formatted);
  };

  const validateForm = (): boolean => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Goal name is required');
      return false;
    }

    const amount = parseCurrencyToFloat(targetAmountInput);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Validation Error', 'Target amount must be greater than 0');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      const amount = parseCurrencyToFloat(targetAmountInput);
      const selectedCategory = categories.find(cat => cat.id === category);
      
      await createGoal({
        name,
        description: description || undefined,
        target_amount: amount,
        priority,
        category: category || undefined,
        icon: selectedCategory?.icon || undefined,
        color: selectedCategory?.color,
        notification_milestones: [25, 50, 75, 100],
        auto_contribution_enabled: false,
      });
      
      Alert.alert('Success', 'Goal created successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to create goal. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
          <X size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Goal</Text>
        <TouchableOpacity 
          style={[styles.headerButton, styles.saveButton]} 
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Save size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Goal Name</Text>
            <View style={styles.inputContainer}>
              <Target size={20} color="#6B7280" />
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="e.g., Emergency Fund, Vacation"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description (Optional)</Text>
            <View style={styles.inputContainer}>
              <FileText size={20} color="#6B7280" />
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Describe your goal..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
              />
            </View>
          </View>
        </View>

        {/* Target Amount */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Target Amount</Text>
          <View style={styles.inputGroup}>
            <View style={styles.inputContainer}>
              <DollarSign size={20} color="#6B7280" />
              <TextInput
                style={[styles.input, styles.amountInput]}
                value={targetAmountInput}
                onChangeText={handleTargetAmountChange}
                placeholder="0.00"
                keyboardType="numeric"
                placeholderTextColor="#9CA3AF"
              />
            </View>
            {targetAmountInput && (
              <Text style={styles.formattedAmount}>
                Target: {formatCurrencyDisplay(parseCurrencyToFloat(targetAmountInput))}
              </Text>
            )}
          </View>
        </View>

        {/* Category */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Category (Optional)</Text>
          {categoriesLoading ? (
            <Text style={styles.loadingText}>Loading categories...</Text>
          ) : (
            <View style={styles.categorySection}>
              {/* Selected Category Display */}
              {category && (
                <View style={styles.selectedCategoryContainer}>
                  {(() => {
                    const selectedCat = categories.find(cat => cat.id === category);
                    return selectedCat ? (
                      <View style={[
                        styles.selectedCategory,
                        { backgroundColor: `${selectedCat.color}20`, borderColor: selectedCat.color }
                      ]}>
                        <Target size={16} color={selectedCat.color} />
                        <Text style={[styles.selectedCategoryText, { color: selectedCat.color }]}>
                          {selectedCat.name}
                        </Text>
                        <TouchableOpacity
                          onPress={() => setCategory('')}
                          style={styles.clearCategoryButton}
                        >
                          <X size={14} color={selectedCat.color} />
                        </TouchableOpacity>
                      </View>
                    ) : null;
                  })()}
                </View>
              )}

              {/* Category Grid */}
              <View style={styles.categoryGrid}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryItem,
                      category === cat.id && styles.categoryItemActive,
                      { backgroundColor: category === cat.id ? `${cat.color}15` : '#F9FAFB' }
                    ]}
                    onPress={() => setCategory(cat.id)}
                  >
                    <Target size={18} color={cat.color} />
                    <Text
                      style={[
                        styles.categoryItemText,
                        category === cat.id && { color: cat.color, fontWeight: '600' }
                      ]}
                      numberOfLines={2}
                    >
                      {cat.name}
                    </Text>
                    {cat.is_system_default && (
                      <View style={styles.systemBadge}>
                        <Text style={styles.systemBadgeText}>SYS</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              {/* Category Stats */}
              <Text style={styles.categoryStats}>
                {categories.filter(c => c.is_system_default).length} system categories, {' '}
                {categories.filter(c => !c.is_system_default).length} personal categories
              </Text>
            </View>
          )}
        </View>

        {/* Priority */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Priority</Text>
          <View style={styles.priorityContainer}>
            {[
              { value: 'low' as GoalPriority, label: 'Low', color: '#6B7280' },
              { value: 'medium' as GoalPriority, label: 'Medium', color: '#3B82F6' },
              { value: 'high' as GoalPriority, label: 'High', color: '#F59E0B' },
              { value: 'critical' as GoalPriority, label: 'Critical', color: '#EF4444' },
            ].map((p) => (
              <TouchableOpacity
                key={p.value}
                style={[
                  styles.priorityButton,
                  priority === p.value && [
                    styles.priorityButtonActive,
                    { backgroundColor: `${p.color}20`, borderColor: p.color }
                  ]
                ]}
                onPress={() => setPriority(p.value)}
              >
                <Text
                  style={[
                    styles.priorityText,
                    priority === p.value && { color: p.color, fontWeight: '600' }
                  ]}
                >
                  {p.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
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
  saveButton: {
    backgroundColor: '#3B82F6',
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    marginLeft: 12,
  },
  textArea: {
    textAlignVertical: 'top',
    minHeight: 80,
  },
  amountInput: {
    fontSize: 18,
    fontWeight: '600',
  },
  categoryContainer: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  categoryButton: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginRight: 12,
    minWidth: 80,
  },
  categoryButtonActive: {
    borderWidth: 2,
  },
  categoryText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  priorityContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  priorityButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    marginRight: 8,
    marginBottom: 8,
  },
  priorityButtonActive: {
    borderWidth: 2,
  },
  priorityText: {
    fontSize: 14,
    color: '#6B7280',
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingVertical: 20,
  },
  formattedAmount: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'right',
  },
  categorySection: {
    gap: 16,
  },
  selectedCategoryContainer: {
    marginBottom: 8,
  },
  selectedCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignSelf: 'flex-start',
    gap: 8,
  },
  selectedCategoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  clearCategoryButton: {
    padding: 2,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryItem: {
    minWidth: '45%',
    maxWidth: '48%',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 6,
    position: 'relative',
  },
  categoryItemActive: {
    borderWidth: 2,
  },
  categoryItemText: {
    fontSize: 12,
    color: '#374151',
    textAlign: 'center',
    lineHeight: 16,
  },
  systemBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#6B7280',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  systemBadgeText: {
    fontSize: 8,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  categoryStats: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
  },
});