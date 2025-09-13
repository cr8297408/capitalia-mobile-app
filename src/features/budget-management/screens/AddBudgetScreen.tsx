import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, AlertCircle, Tag, Clock, ChevronDown } from 'lucide-react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import type { RootStackScreenProps } from '@/navigation/types';
import { useAddBudget, BudgetPeriod } from '../hooks/useAddBudget';
import { useCategories } from '../../transaction-tracking/hooks/useCategories';
import { useBudgetHeader } from '../hooks/useBudgetHeader';

type AddBudgetScreenProps = RootStackScreenProps<'AddBudget'>;

type BudgetFormData = {
  name: string;
  amount: string;
  categoryId: string;
  period: BudgetPeriod;
  startDate: Date;
  endDate: Date;
  alertThreshold: string; // Keep as string for form input
};

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
  const { handleSubmit, isLoading, error, isSubmitting } = useAddBudget();
  const { categories = [], loading: isLoadingCategories } = useCategories();

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
    }
  }, [error]);

  const handleSave = useCallback(async () => {
    if (!formData.name || !formData.amount) {
      Alert.alert('Error', 'Please fill in all required fields');
      return { success: false, error: 'Missing required fields' };
    }

    if (formData.startDate >= formData.endDate) {
      Alert.alert('Error', 'End date must be after start date');
      return { success: false, error: 'Invalid date range' };
    }

    const amountValue = parseFloat(formData.amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return { success: false, error: 'Invalid amount' };
    }

    try {
      const result = await handleSubmit({
        ...formData,
        // Ensure alertThreshold is passed as string
        alertThreshold: formData.alertThreshold.toString()
      });

      if (result.success) {
        navigation.goBack();
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save budget';
      console.error('Error saving budget:', errorMessage);
      return { success: false, error: errorMessage };
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
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Budget Name <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputWithIcon}>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={text => setFormData({ ...formData, name: text })}
                placeholder="e.g., Groceries, Entertainment"
                placeholderTextColor="#9CA3AF"
                editable={!isLoading}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Amount <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputWithIcon}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={[styles.input, { paddingLeft: 30 }]}
                value={formData.amount}
                onChangeText={text => setFormData({ ...formData, amount: text.replace(/[^0-9.]/g, '') })}
                placeholder="0.00"
                keyboardType="decimal-pad"
                placeholderTextColor="#9CA3AF"
                editable={!isLoading}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Start Date</Text>
            <TouchableOpacity 
              style={[styles.dateInput, isLoading && styles.disabledInput]} 
              onPress={() => !isLoading && setShowDatePicker('start')}
              disabled={isLoading}
            >
              <Calendar size={20} color="#6B7280" style={styles.icon} />
              <Text style={styles.dateText}>
                {formData.startDate.toLocaleDateString()}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>End Date</Text>
            <TouchableOpacity 
              style={[styles.dateInput, isLoading && styles.disabledInput]} 
              onPress={() => !isLoading && setShowDatePicker('end')}
              disabled={isLoading}
            >
              <Calendar size={20} color="#6B7280" style={styles.icon} />
              <Text style={styles.dateText}>
                {formData.endDate.toLocaleDateString()}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category (Optional)</Text>
            <View style={[styles.pickerContainer, isLoading && styles.disabledInput]}>
              <Tag size={20} color="#6B7280" style={styles.icon} />
              <ChevronDown size={20} color="#6B7280" style={styles.pickerIcon} />
              <Picker
                selectedValue={formData.categoryId}
                onValueChange={itemValue => setFormData(prev => ({ ...prev, categoryId: itemValue }))}
                style={styles.picker}
                enabled={!isLoading}
                dropdownIconColor="#6B7280"
              >
                <Picker.Item label="Select a category (optional)" value="" enabled={false} />
                {(categories || []).map((category: { id: string; name: string }) => (
                  <Picker.Item 
                    key={category.id}
                    label={category.name}
                    value={category.id}
                  />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Budget Period</Text>
            <View style={[styles.pickerContainer, isLoading && styles.disabledInput]}>
              <Clock size={20} color="#6B7280" style={styles.icon} />
              <ChevronDown size={20} color="#6B7280" style={styles.pickerIcon} />
              <Picker
                selectedValue={formData.period}
                onValueChange={itemValue => setFormData({ ...formData, period: itemValue as BudgetPeriod })}
                style={styles.picker}
                enabled={!isLoading}
                dropdownIconColor="#6B7280"
              >
                <Picker.Item label="Monthly" value="monthly" />
                <Picker.Item label="Weekly" value="weekly" />
                <Picker.Item label="Yearly" value="yearly" />
                <Picker.Item label="Custom" value="custom" />
              </Picker>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.alertThresholdHeader}>
              <AlertCircle size={20} color="#F59E0B" style={styles.alertIcon} />
              <Text style={styles.label}>Alert Threshold</Text>
            </View>
            <View style={styles.alertThresholdContainer}>
              <TextInput
                style={[styles.alertThresholdInput, isLoading && styles.disabledInput]}
                value={formData.alertThreshold}
                onChangeText={text => setFormData({ ...formData, alertThreshold: text.replace(/[^0-9]/g, '').slice(0, 3) })}
                keyboardType="numeric"
                maxLength={3}
                editable={!isLoading}
              />
              <Text style={styles.percentSymbol}>%</Text>
            </View>
            <Text style={styles.hintText}>
              You'll be notified when you've spent {formData.alertThreshold}% of your budget
            </Text>
          </View>
        </View>
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
  inputGroup: {
    marginBottom: 20,
    width: '100%',
    position: 'relative',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  required: {
    color: '#EF4444',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
    color: '#111827',
    width: '100%',
    height: 52,
    marginTop: 4,
  },
  inputWithIcon: {
    position: 'relative',
    width: '100%',
  },
  currencySymbol: {
    position: 'absolute',
    left: 16,
    top: '50%',
    marginTop: -8, // Half of the font size to center it perfectly
    fontSize: 16,
    color: '#6B7280',
    zIndex: 1,
  },
  pickerContainer: {
    position: 'relative',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 16,
    height: 200,
    justifyContent: 'center',
  },
  picker: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2, // Ensure it's above other elements
    elevation: 5, // For Android
  },
  icon: {
    position: 'absolute',
    left: 20,
    top: 22,
    zIndex: 1,
    width: 20,
    height: 20,
  },
  pickerIcon: {
    position: 'absolute',
    right: 20,
    top: 22,
    pointerEvents: 'none',
    zIndex: 0,
    width: 20,
    height: 20,
  },
  pickerText: {
    position: 'absolute',
    left: 52,
    right: 52,
    top: 0,
    bottom: 0,
    textAlignVertical: 'center',
    color: '#9CA3AF',
    fontSize: 18,
    pointerEvents: 'none',
    zIndex: 0,
  },
  placeholderText: {
    color: '#9CA3AF',
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 64,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    width: '100%',
    position: 'relative',
    marginTop: 4,
  },
  dateText: {
    marginLeft: 16,
    fontSize: 18,
    color: '#111827',
    flex: 1,
  },
  alertThresholdHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertIcon: {
    marginRight: 8,
  },
  alertThresholdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    overflow: 'hidden',
    height: 52,
    width: '100%',
    position: 'relative',
  },
  alertThresholdInput: {
    flex: 1,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#111827',
    height: '100%',
  },
  percentSymbol: {
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  hintText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    lineHeight: 20,
  },
  disabledInput: {
    opacity: 0.6,
  },
});