import React, { useState, useEffect, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AlertCircle } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import type { RootStackScreenProps } from '@/navigation/types';
import { useAddBudget } from '../hooks/useAddBudget';
import type { BudgetFormData } from '../components';
import { useCategories } from '@/shared/hooks/useCategories';
import { useBudgetHeader } from '../../hooks/useBudgetHeader';
import { BudgetForm } from '../components';

type AddBudgetScreenProps = RootStackScreenProps<'AddBudget'>;

type AddBudgetFormData = BudgetFormData;

export const AddBudgetScreen: React.FC<AddBudgetScreenProps> = ({ navigation }) => {
  const [formData, setFormData] = useState<BudgetFormData>({
    name: '',
    amount: '',
    categoryId: '',
    period: 'monthly',
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    alertThreshold: '80', // 80% as string
  });
  
  const [showDatePicker, setShowDatePicker] = useState<'start' | 'end' | null>(null);
  const { handleSubmit, isLoading: isSubmitting, error } = useAddBudget();
  const { categories = [], loading: isLoadingCategories } = useCategories();

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
    }
  }, [error]);

  const handleSave = useCallback(async () => {
    if (formData.startDate >= formData.endDate) {
      Alert.alert('Error', 'End date must be after start date');
      return { success: false, error: 'Invalid date range' };
    }

    if (!formData.name || !formData.amount || !formData.categoryId) {
      Alert.alert('Error', 'Please fill in all required fields');
      return { success: false, error: 'Missing required fields' };
    }

    try {
      const result = await handleSubmit({
        name: formData.name,
        amount: formData.amount, // Keep as string, let the hook handle parsing
        categoryId: formData.categoryId,
        period: formData.period,
        startDate: formData.startDate,
        endDate: formData.endDate,
        alertThreshold: formData.alertThreshold // Keep as string, let the hook handle parsing
      });

      if (result?.success) {
        Alert.alert('Success', 'Budget created successfully');
        navigation.goBack();
      } else {
        Alert.alert('Error', result?.error || 'Failed to create budget');
      }

      return result;
    } catch (err) {
      console.error('Error creating budget:', err);
      Alert.alert('Error', 'Failed to create budget');
      return { success: false, error: 'Failed to create budget' };
    }
  }, [formData, handleSubmit, navigation]);

  // Set up header with save button
  useBudgetHeader({
    onSave: handleSave,
    isLoading: isSubmitting,
  });

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(null);
    if (selectedDate) {
      setFormData(prev => ({
        ...prev,
        [showDatePicker === 'start' ? 'startDate' : 'endDate']: selectedDate,
      }));
    }
  };

  if (isLoadingCategories) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <BudgetForm
          formData={formData}
          setFormData={setFormData}
          categories={categories}
          isLoading={isSubmitting || isLoadingCategories}
          showDatePicker={showDatePicker}
          setShowDatePicker={setShowDatePicker}
          handleDateChange={handleDateChange}
        />
      </ScrollView>

      {showDatePicker && (
        <DateTimePicker
          value={showDatePicker === 'start' ? formData.startDate : formData.endDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
          minimumDate={showDatePicker === 'end' ? formData.startDate : undefined}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100, // Extra space at the bottom
  },
  form: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    padding: 16,
  },
  disabledInput: {
    opacity: 0.6,
  },
});