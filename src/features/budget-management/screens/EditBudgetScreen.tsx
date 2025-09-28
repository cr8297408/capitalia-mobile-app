import React from 'react';
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
import { X, Save, Trash2, Calendar, Tag, Clock, AlertTriangle } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useEditBudget } from '../hooks/useEditBudget';
import { useCategories } from '@/shared/hooks/useCategories';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { BudgetStackParamList } from '@/navigation/types';
import type { BudgetPeriod } from '../hooks/useAddBudget';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';

type EditBudgetScreenNavigationProp = StackNavigationProp<BudgetStackParamList, 'EditBudget'>;

export const EditBudgetScreen: React.FC = () => {
  const navigation = useNavigation<EditBudgetScreenNavigationProp>();
  const route = useRoute();
  const { budgetId } = route.params as { budgetId: string };

  const { formData, loading, saving, error, updateField, saveBudget, deleteBudget, resetForm } = useEditBudget(budgetId);
  const { categories = [] } = useCategories();

  const [showDatePicker, setShowDatePicker] = React.useState<'start' | 'end' | null>(null);

  const handleSave = async () => {
    const result = await saveBudget();
    if (result.success) {
      Alert.alert('Success', 'Budget updated successfully');
      navigation.goBack();
    } else {
      Alert.alert('Error', result.error || 'Failed to update budget');
    }
  };

  const handleDelete = async () => {
    const result = await deleteBudget();
    if (result.success) {
      Alert.alert('Success', 'Budget deleted successfully');
      navigation.goBack();
    } else {
      Alert.alert('Error', result.error || 'Failed to delete budget');
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(null);
    if (selectedDate) {
      updateField(showDatePicker === 'start' ? 'start_date' : 'end_date', selectedDate);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel}>
            <X color="#6B7280" size={24} />
          </TouchableOpacity>
          <Text style={styles.title}>Edit Budget</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Loading budget...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel}>
            <X color="#6B7280" size={24} />
          </TouchableOpacity>
          <Text style={styles.title}>Edit Budget</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load budget</Text>
          <Text style={styles.errorSubtitle}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel}>
          <X color="#6B7280" size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Budget</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
            <Trash2 color="#EF4444" size={20} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSave} disabled={saving}>
            <Save color={saving ? "#9CA3AF" : "#2563EB"} size={24} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Budget Name <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputWithIcon}>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(value) => updateField('name', value)}
                placeholder="e.g., Groceries, Entertainment"
                placeholderTextColor="#9CA3AF"
                editable={!saving}
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
                onChangeText={(value) => updateField('amount', value.replace(/[^0-9.]/g, ''))}
                placeholder="0.00"
                keyboardType="decimal-pad"
                placeholderTextColor="#9CA3AF"
                editable={!saving}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category (Optional)</Text>
            <View style={[styles.pickerContainer, saving && styles.disabledInput]}>
              <Picker
                selectedValue={formData.category_id}
                onValueChange={(value) => updateField('category_id', value)}
                style={styles.picker}
                enabled={!saving}
                dropdownIconColor="#6B7280"
              >
                <Picker.Item label="Select a category (optional)" value="" />
                {categories.map((category) => (
                  <Picker.Item
                    key={category.id}
                    label={category.name}
                    value={category.id}
                  />
                ))}
              </Picker>
              <Tag size={20} color="#6B7280" style={styles.pickerIcon} />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Budget Period</Text>
            <View style={[styles.pickerContainer, saving && styles.disabledInput]}>
              <Picker
                selectedValue={formData.period}
                onValueChange={(value: BudgetPeriod) => updateField('period', value)}
                style={styles.picker}
                enabled={!saving}
              >
                <Picker.Item label="Monthly" value="monthly" />
                <Picker.Item label="Weekly" value="weekly" />
                <Picker.Item label="Yearly" value="yearly" />
                <Picker.Item label="Custom" value="custom" />
              </Picker>
              <Clock size={20} color="#6B7280" style={styles.pickerIcon} />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Start Date</Text>
            <TouchableOpacity
              style={[styles.dateInput, saving && styles.disabledInput]}
              onPress={() => !saving && setShowDatePicker('start')}
              disabled={saving}
            >
              <Calendar size={20} color="#6B7280" style={styles.icon} />
              <Text style={styles.dateText}>
                {formData.start_date.toLocaleDateString()}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>End Date</Text>
            <TouchableOpacity
              style={[styles.dateInput, saving && styles.disabledInput]}
              onPress={() => !saving && setShowDatePicker('end')}
              disabled={saving}
            >
              <Calendar size={20} color="#6B7280" style={styles.icon} />
              <Text style={styles.dateText}>
                {formData.end_date.toLocaleDateString()}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.alertThresholdHeader}>
              <AlertTriangle size={20} color="#F59E0B" style={styles.alertIcon} />
              <Text style={styles.label}>Alert Threshold</Text>
            </View>
            <View style={styles.alertThresholdContainer}>
              <TextInput
                style={[styles.alertThresholdInput, saving && styles.disabledInput]}
                value={formData.alert_threshold}
                onChangeText={(value) => updateField('alert_threshold', value.replace(/[^0-9]/g, '').slice(0, 3))}
                keyboardType="numeric"
                maxLength={3}
                editable={!saving}
              />
              <Text style={styles.percentSymbol}>%</Text>
            </View>
            <Text style={styles.hintText}>
              You'll be notified when you've spent {formData.alert_threshold}% of your budget
            </Text>
          </View>
        </View>
      </ScrollView>

      {showDatePicker && (
        <DateTimePicker
          value={showDatePicker === 'start' ? formData.start_date : formData.end_date}
          mode="date"
          display="default"
          onChange={handleDateChange}
          minimumDate={showDatePicker === 'end' ? formData.start_date : undefined}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  deleteButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  form: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 24,
    width: '100%',
    position: 'relative',
    minHeight: 84,
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
    marginTop: -8,
    fontSize: 16,
    color: '#6B7280',
    zIndex: 1,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    paddingLeft: 40,
    paddingRight: 12,
    height: 52,
    width: '100%',
    position: 'relative',
    marginTop: 6,
    marginBottom: 6,
  },
  picker: {
    width: '100%',
    height: 50,
    color: '#111827',
    position: 'relative',
  },
  pickerIcon: {
    position: 'absolute',
    left: 12,
    top: 16,
  },
  icon: {
    marginRight: 12,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
    backgroundColor: '#F9FAFB',
    height: 52,
    width: '100%',
    position: 'relative',
    marginTop: 4,
  },
  dateText: {
    fontSize: 16,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#EF4444',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});