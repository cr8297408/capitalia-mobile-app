import { useState, useEffect, useCallback } from 'react';
import { BudgetService, type Budget, type UpdateBudgetData } from '../services/budgetService';
import type { BudgetPeriod } from './useAddBudget';

export interface EditBudgetFormData {
  name: string;
  amount: string;
  category_id: string;
  period: BudgetPeriod;
  start_date: Date;
  end_date: Date;
  alert_threshold: string;
}

export interface UseEditBudgetReturn {
  formData: EditBudgetFormData;
  loading: boolean;
  saving: boolean;
  error: string | null;
  setFormData: (data: EditBudgetFormData) => void;
  updateField: <K extends keyof EditBudgetFormData>(field: K, value: EditBudgetFormData[K]) => void;
  saveBudget: () => Promise<{ success: boolean; error?: string }>;
  deleteBudget: () => Promise<{ success: boolean; error?: string }>;
  resetForm: () => void;
}

export const useEditBudget = (budgetId: string | undefined): UseEditBudgetReturn => {
  const [budget, setBudget] = useState<Budget | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<EditBudgetFormData>({
    name: '',
    amount: '',
    category_id: '',
    period: 'monthly',
    start_date: new Date(),
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    alert_threshold: '80',
  });

  const fetchBudget = useCallback(async () => {
    if (!budgetId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const budgetData = await BudgetService.getBudgetById(budgetId);

      if (!budgetData) {
        setError('Budget not found');
        return;
      }

      setBudget(budgetData);

      // Populate form data
      setFormData({
        name: budgetData.name,
        amount: budgetData.amount.toString(),
        category_id: budgetData.category_id || '',
        period: budgetData.period,
        start_date: new Date(budgetData.start_date),
        end_date: new Date(budgetData.end_date),
        alert_threshold: (budgetData.alert_threshold * 100).toString(),
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch budget';
      setError(errorMessage);
      console.error('Error fetching budget for editing:', err);
    } finally {
      setLoading(false);
    }
  }, [budgetId]);

  const updateField = useCallback(<K extends keyof EditBudgetFormData>(
    field: K,
    value: EditBudgetFormData[K]
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const validateForm = useCallback((): string | null => {
    if (!formData.name.trim()) {
      return 'Budget name is required';
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      return 'Please enter a valid amount';
    }

    if (formData.start_date >= formData.end_date) {
      return 'End date must be after start date';
    }

    const threshold = parseFloat(formData.alert_threshold);
    if (isNaN(threshold) || threshold < 0 || threshold > 100) {
      return 'Alert threshold must be between 0 and 100';
    }

    return null;
  }, [formData]);

  const saveBudget = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    if (!budgetId) {
      return { success: false, error: 'Budget ID is required' };
    }

    const validationError = validateForm();
    if (validationError) {
      return { success: false, error: validationError };
    }

    try {
      setSaving(true);
      setError(null);

      const updateData: UpdateBudgetData = {
        name: formData.name.trim(),
        amount: parseFloat(formData.amount),
        category_id: formData.category_id || undefined,
        period: formData.period,
        start_date: formData.start_date.toISOString().split('T')[0],
        end_date: formData.end_date.toISOString().split('T')[0],
        alert_threshold: parseFloat(formData.alert_threshold) / 100,
      };

      await BudgetService.updateBudget(budgetId, updateData);

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update budget';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setSaving(false);
    }
  }, [budgetId, formData, validateForm]);

  const deleteBudget = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    if (!budgetId) {
      return { success: false, error: 'Budget ID is required' };
    }

    try {
      setSaving(true);
      setError(null);

      await BudgetService.deleteBudget(budgetId);

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete budget';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setSaving(false);
    }
  }, [budgetId]);

  const resetForm = useCallback(() => {
    if (budget) {
      setFormData({
        name: budget.name,
        amount: budget.amount.toString(),
        category_id: budget.category_id || '',
        period: budget.period,
        start_date: new Date(budget.start_date),
        end_date: new Date(budget.end_date),
        alert_threshold: (budget.alert_threshold * 100).toString(),
      });
    }
  }, [budget]);

  useEffect(() => {
    fetchBudget();
  }, [fetchBudget]);

  return {
    formData,
    loading,
    saving,
    error,
    setFormData,
    updateField,
    saveBudget,
    deleteBudget,
    resetForm,
  };
};