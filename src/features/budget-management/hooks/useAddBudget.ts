import { useState } from 'react';
import { useAuth } from '@/shared/hooks/useAuth';
import { BudgetService, CreateBudgetData } from '../services/budgetService';
import { budgetService } from '@/shared/services/budgetService';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { RootStackNavigationProp } from '@/navigation/types';

export type BudgetPeriod = 'monthly' | 'weekly' | 'yearly' | 'custom';

export interface BudgetFormData {
  name: string;
  amount: string;
  categoryId: string;
  period: BudgetPeriod;
  startDate: Date;
  endDate: Date;
  alertThreshold: number;
}

export const useAddBudget = () => {
  const { user, isPremium, limits } = useAuth();
  const navigation = useNavigation<RootStackNavigationProp>();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: Omit<BudgetFormData, 'alertThreshold'> & { alertThreshold: string | number }) => {
    if (!user) {
      setError('User not authenticated');
      return { success: false, error: 'User not authenticated' } as const;
    }

    setIsLoading(true);
    setIsSubmitting(true);
    setError(null);

    try {
      const amount = parseFloat(formData.amount);
      const alertThreshold = typeof formData.alertThreshold === 'string' 
        ? parseFloat(formData.alertThreshold) 
        : formData.alertThreshold;
      
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Please enter a valid amount');
      }

      if (isNaN(alertThreshold) || alertThreshold <= 0) {
        throw new Error('Please enter a valid alert threshold');
      }

      // ✅ Check budget limits for non-premium users
      if (!isPremium && limits?.maxBudgets != null) {
        try {
          const budgetsCount = await budgetService.getBudgetsCount(user.id);
          if (budgetsCount >= limits.maxBudgets) {
            const message = `You have reached the free tier limit of ${limits.maxBudgets} budgets. Upgrade to add more.`;
            setError(message);
            Alert.alert(
              'Limit Reached',
              message,
              [
                { text: 'Cancel', style: 'cancel' },
                { 
                  text: 'Upgrade', 
                  onPress: () => {
                    navigation.navigate('SubscriptionPlans');
                  }
                }
              ]
            );
            return { success: false, error: message } as const;
          }
        } catch (limitError) {
          console.error('Error checking budget limits:', limitError);
          // Continue with budget creation if we can't check limits
        }
      }

      // Convert to database format
      const budgetData: CreateBudgetData = {
        name: formData.name,
        amount: amount,
        category_id: formData.categoryId,
        period: formData.period,
        start_date: formData.startDate.toISOString(),
        end_date: formData.endDate.toISOString(),
        user_id: user.id || '', // Ensure user_id is provided
        alert_threshold: alertThreshold / 100, // Convert percentage to decimal
      };

      const result = await BudgetService.createBudget(budgetData);
      return { success: true, data: result };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create budget';
      setError(errorMessage);
      return { success: false, error: errorMessage } as const;
    } finally {
      setIsLoading(false);
      setIsSubmitting(false);
    }
  };

  return { handleSubmit, isLoading, isSubmitting, error };
};
