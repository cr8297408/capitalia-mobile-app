/**
 * Add Goal Contribution Screen - Create new contribution for a specific goal
 * Following Scope Rule Pattern - Screen specific to goal-contribution-add subdirectory
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Save, DollarSign, FileText, Target, ChevronDown, Calendar } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { formatCurrency, parseCurrencyToFloat } from '@/shared/utils/currencyFormatter';
import { GoalContributionService } from '../../services/goalContributionService';
import { GoalService } from '../../services/goalService';
import { useUserTransactions } from '../hooks/useUserTransactions';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '@/navigation/types';
import type { Goal, ContributionType } from '../../types';
import type { TransactionWithCategory } from '@/shared/types/transaction.d';

type AddGoalContributionScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AddGoalContribution'>;
type AddGoalContributionScreenRouteProp = RouteProp<RootStackParamList, 'AddGoalContribution'>;

export const AddGoalContributionScreen: React.FC = () => {
  const navigation = useNavigation<AddGoalContributionScreenNavigationProp>();
  const route = useRoute<AddGoalContributionScreenRouteProp>();
  const { goalId } = route.params;
  
  const [goal, setGoal] = useState<Goal | null>(null);
  const [amountInput, setAmountInput] = useState('');
  const [notes, setNotes] = useState('');
  const [contributionType, setContributionType] = useState<ContributionType>('manual');
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionWithCategory | null>(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load user transactions when transaction_linked is selected
  const { 
    transactions, 
    loading: transactionsLoading 
  } = useUserTransactions({
    enabled: contributionType === 'transaction_linked',
    excludeLinkedTransactions: true,
  });

  useEffect(() => {
    loadGoal();
  }, [goalId]);

  const loadGoal = async () => {
    try {
      setLoading(true);
      const goalData = await GoalService.getGoalById(goalId);
      setGoal(goalData);
    } catch (error) {
      console.error('Error loading goal:', error);
      Alert.alert('Error', 'Failed to load goal details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleAmountChange = (text: string) => {
    const formatted = formatCurrency(text);
    setAmountInput(formatted);
  };

  const handleContributionTypeChange = (newType: ContributionType) => {
    setContributionType(newType);
    
    // Reset transaction-related state when changing types
    if (newType !== 'transaction_linked') {
      setSelectedTransaction(null);
      setShowTransactionModal(false);
    }
    
    // Auto-fill amount from selected transaction if switching to transaction_linked
    if (newType === 'transaction_linked' && selectedTransaction) {
      setAmountInput(formatCurrency(Math.abs(selectedTransaction.amount).toString()));
    }
  };

  const handleTransactionSelect = (transaction: TransactionWithCategory) => {
    setSelectedTransaction(transaction);
    // Auto-fill amount with transaction amount (use absolute value)
    setAmountInput(formatCurrency(Math.abs(transaction.amount).toString()));
    setShowTransactionModal(false);
  };

  const validateForm = (): boolean => {
    if (!amountInput.trim()) {
      Alert.alert('Validation Error', 'Contribution amount is required');
      return false;
    }

    const amount = parseCurrencyToFloat(amountInput);
    if (amount <= 0) {
      Alert.alert('Validation Error', 'Amount must be greater than 0');
      return false;
    }

    if (contributionType === 'transaction_linked' && !selectedTransaction) {
      Alert.alert('Validation Error', 'Please select a transaction');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !goal) return;

    try {
      setIsSubmitting(true);
      const amount = parseCurrencyToFloat(amountInput);

      await GoalContributionService.createContribution({
        goal_id: goalId,
        amount,
        contribution_type: contributionType,
        notes: notes.trim() || undefined,
        transaction_id: selectedTransaction?.id || undefined,
      });

      const successMessage = contributionType === 'transaction_linked' && selectedTransaction
        ? `Contribution of $${amount.toLocaleString()} linked to transaction "${selectedTransaction.description}" for ${goal.name}`
        : `Contribution of $${amount.toLocaleString()} added to ${goal.name}`;

      Alert.alert('Success!', successMessage, [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error('Error creating contribution:', error);
      Alert.alert('Error', 'Failed to add contribution. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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

  const remainingAmount = goal.target_amount - goal.current_amount;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerButton} 
          onPress={() => navigation.goBack()}
        >
          <X size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Contribution</Text>
        <TouchableOpacity 
          style={[
            styles.headerButton, 
            { opacity: isSubmitting ? 0.5 : 1 }
          ]} 
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Save size={24} color={isSubmitting ? "#9CA3AF" : "#3B82F6"} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Goal Summary */}
        <View style={[styles.goalSummary, { backgroundColor: goal.color ? `${goal.color}10` : '#F9FAFB' }]}>
          <View style={styles.goalHeader}>
            <View style={styles.goalIcon}>
              <Target size={24} color={goal.color || '#3B82F6'} />
            </View>
            <View style={styles.goalInfo}>
              <Text style={styles.goalName}>{goal.name}</Text>
              <Text style={styles.goalProgress}>
                ${goal.current_amount.toLocaleString()} / ${goal.target_amount.toLocaleString()} 
                ({progressPercentage.toFixed(1)}%)
              </Text>
            </View>
          </View>
          
          {remainingAmount > 0 && (
            <Text style={styles.remainingText}>
              ${remainingAmount.toLocaleString()} remaining to reach goal
            </Text>
          )}
        </View>

        {/* Form */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Contribution Details</Text>
          
          {/* Amount Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Amount *</Text>
            <View style={styles.amountInputContainer}>
              <DollarSign size={20} color="#6B7280" style={styles.currencyIcon} />
              <TextInput
                style={styles.amountInput}
                value={amountInput}
                onChangeText={handleAmountChange}
                placeholder="0.00"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                returnKeyType="next"
              />
            </View>
          </View>

          {/* Contribution Type */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contribution Type</Text>
            <View style={styles.typeButtons}>
              {[
                { value: 'manual', label: 'Manual' },
                { value: 'automatic', label: 'Automatic' },
                { value: 'transaction_linked', label: 'Transaction Linked' },
              ].map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.typeButton,
                    contributionType === type.value && styles.typeButtonActive,
                  ]}
                  onPress={() => handleContributionTypeChange(type.value as ContributionType)}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      contributionType === type.value && styles.typeButtonTextActive,
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Transaction Selector - Only show when transaction_linked is selected */}
          {contributionType === 'transaction_linked' && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Select Transaction *</Text>
              <TouchableOpacity
                style={styles.transactionSelector}
                onPress={() => setShowTransactionModal(true)}
                disabled={transactionsLoading}
              >
                <View style={styles.transactionSelectorContent}>
                  {selectedTransaction ? (
                    <View style={styles.selectedTransactionInfo}>
                      <Text style={styles.selectedTransactionDescription}>
                        {selectedTransaction.description}
                      </Text>
                      <Text style={styles.selectedTransactionAmount}>
                        ${Math.abs(selectedTransaction.amount).toLocaleString()}
                      </Text>
                      <Text style={styles.selectedTransactionDate}>
                        {new Date(selectedTransaction.date).toLocaleDateString()}
                      </Text>
                    </View>
                  ) : (
                    <Text style={styles.transactionSelectorPlaceholder}>
                      {transactionsLoading ? 'Loading transactions...' : 'Tap to select a transaction'}
                    </Text>
                  )}
                  <ChevronDown size={20} color="#6B7280" />
                </View>
              </TouchableOpacity>
            </View>
          )}

          {/* Notes */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Notes (Optional)</Text>
            <View style={styles.notesInputContainer}>
              <FileText size={20} color="#6B7280" style={styles.notesIcon} />
              <TextInput
                style={styles.notesInput}
                value={notes}
                onChangeText={setNotes}
                placeholder="Add a note about this contribution..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Transaction Selection Modal */}
      <Modal
        visible={showTransactionModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTransactionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Transaction</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowTransactionModal(false)}
              >
                <X size={24} color="#374151" />
              </TouchableOpacity>
            </View>
            
            {transactionsLoading ? (
              <View style={styles.modalLoading}>
                <Text style={styles.modalLoadingText}>Loading transactions...</Text>
              </View>
            ) : transactions.length === 0 ? (
              <View style={styles.modalEmpty}>
                <Text style={styles.modalEmptyText}>No transactions available</Text>
              </View>
            ) : (
              <FlatList
                data={transactions}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.transactionItem}
                    onPress={() => handleTransactionSelect(item)}
                  >
                    <View style={styles.transactionItemContent}>
                      <View style={styles.transactionItemInfo}>
                        <Text style={styles.transactionItemDescription}>
                          {item.description}
                        </Text>
                        <Text style={styles.transactionItemCategory}>
                          {item.categories?.name || 'No category'} • {item.accounts?.name || 'Unknown account'}
                        </Text>
                        <Text style={styles.transactionItemDate}>
                          {new Date(item.date).toLocaleDateString()}
                        </Text>
                      </View>
                      <Text style={[
                        styles.transactionItemAmount,
                        { color: item.amount >= 0 ? '#059669' : '#DC2626' }
                      ]}>
                        ${Math.abs(item.amount).toLocaleString()}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
                style={styles.transactionsList}
                showsVerticalScrollIndicator
              />
            )}
          </View>
        </View>
      </Modal>
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
  goalSummary: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
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
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  goalProgress: {
    fontSize: 14,
    color: '#6B7280',
  },
  remainingText: {
    fontSize: 14,
    color: '#F59E0B',
    fontWeight: '500',
    textAlign: 'center',
  },
  formSection: {
    gap: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  currencyIcon: {
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    fontWeight: '600',
  },
  typeButtons: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  typeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  typeButtonActive: {
    borderColor: '#3B82F6',
    backgroundColor: '#EBF4FF',
  },
  typeButtonText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  typeButtonTextActive: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  notesInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  notesIcon: {
    marginTop: 2,
    marginRight: 8,
  },
  notesInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    minHeight: 60,
  },
  // Transaction Selector Styles
  transactionSelector: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  transactionSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedTransactionInfo: {
    flex: 1,
  },
  selectedTransactionDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  selectedTransactionAmount: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '500',
    marginBottom: 2,
  },
  selectedTransactionDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  transactionSelectorPlaceholder: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  modalCloseButton: {
    padding: 8,
    borderRadius: 8,
  },
  modalLoading: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  modalLoadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  modalEmpty: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  modalEmptyText: {
    fontSize: 16,
    color: '#6B7280',
  },
  transactionsList: {
    maxHeight: 400,
  },
  transactionItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  transactionItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  transactionItemInfo: {
    flex: 1,
    marginRight: 12,
  },
  transactionItemDescription: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  transactionItemCategory: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  transactionItemDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  transactionItemAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
});