import { useState } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '@/shared/hooks/useAuth';
import { budgetService } from '../services/budgetService';
import { router } from 'expo-router';

export type BudgetPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';

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
  const { user } = useAuth();
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

      // Convert to database format
      const budgetData = {
        name: formData.name,
        amount: amount,
        category_id: formData.categoryId || null,
        period: formData.period,
        start_date: formData.startDate.toISOString(),
        end_date: formData.endDate.toISOString(),
        alert_threshold: alertThreshold / 100, // Convert percentage to decimal
      };

      const result = await budgetService.createBudget(budgetData, user.id);
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
