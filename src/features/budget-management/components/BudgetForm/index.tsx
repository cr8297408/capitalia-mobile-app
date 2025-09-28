import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Calendar, Tag, ChevronDown, Clock, AlertTriangle } from 'lucide-react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';

import { BudgetFormData as SharedBudgetFormData, BudgetPeriod } from '../../hooks/useAddBudget';

export type { BudgetPeriod };

export interface BudgetFormData extends Omit<SharedBudgetFormData, 'alertThreshold'> {
  alertThreshold: string; // Keep as string for form input, will be converted to number on submit
}

interface BudgetFormProps {
  formData: BudgetFormData;
  setFormData: React.Dispatch<React.SetStateAction<BudgetFormData>>;
  categories: Array<{ id: string; name: string }>;
  isLoading: boolean;
  showDatePicker: 'start' | 'end' | null;
  setShowDatePicker: (value: 'start' | 'end' | null) => void;
  handleDateChange: (event: any, selectedDate?: Date) => void;
}

export const BudgetForm: React.FC<BudgetFormProps> = ({
  formData,
  setFormData,
  categories,
  isLoading,
  showDatePicker,
  setShowDatePicker,
  handleDateChange,
}) => {
  return (
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
            onValueChange={(itemValue: string) => setFormData({ ...formData, categoryId: itemValue })}
            style={styles.picker}
            enabled={!isLoading}
            dropdownIconColor="#6B7280"
          >
            <Picker.Item label="Select a category (optional)" value="" enabled={false} />
            {categories.map((category: { id: string; name: string }) => (
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
            onValueChange={(itemValue: BudgetPeriod) => setFormData({ ...formData, period: itemValue })}
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
          <Text style={styles.label}>Alert Threshold</Text>
        </View>
        <View style={styles.alertThresholdContainer}>
          <TextInput
            style={[styles.alertThresholdInput, isLoading && styles.disabledInput]}
            value={formData.alertThreshold}
            onChangeText={text => setFormData({ ...formData, alertThreshold: text.replace(/[^0-9]/g, '').slice(0, 3) })}
            keyboardType="numeric"
            placeholder="80"
            placeholderTextColor="#9CA3AF"
            editable={!isLoading}
          />
          <Text style={styles.percentSymbol}>%</Text>
        </View>
        <Text style={styles.hintText}>
          Receive a notification when you've spent this percentage of your budget
        </Text>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={showDatePicker === 'start' ? formData.startDate : formData.endDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
          minimumDate={showDatePicker === 'end' ? formData.startDate : undefined}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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
    position: 'absolute',
    left: 12,
    top: 16,
    zIndex: 1,
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
    marginLeft: 12,
  },
  alertThresholdHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
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
