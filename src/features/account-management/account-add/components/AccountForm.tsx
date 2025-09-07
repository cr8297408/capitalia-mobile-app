import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { Picker } from '@react-native-picker/picker';
import type { AddAccountFormData, AccountType } from '../types/account.types';

type AccountFormProps = {
  onSubmit: (data: AddAccountFormData) => Promise<void>;
  isSubmitting: boolean;
};

export const AccountForm: React.FC<AccountFormProps> = ({ onSubmit, isSubmitting }) => {
  const [formData, setFormData] = useState<AddAccountFormData>({
    name: '',
    balance: '',
    accountType: 'checking',
    currency: 'USD',
  });

  const handleChange = <K extends keyof AddAccountFormData>(
    field: K,
    value: AddAccountFormData[K]
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      await onSubmit(formData);
    } catch (error) {
      Alert.alert('Error', 'Failed to save account');
    }
  };

  return (
    <View style={styles.form}>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Account Name</Text>
        <TextInput
          style={styles.input}
          value={formData.name}
          onChangeText={(value) => handleChange('name', value)}
          placeholder="Enter account name"
          editable={!isSubmitting}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Initial Balance</Text>
        <TextInput
          style={styles.input}
          value={formData.balance}
          onChangeText={(value) => handleChange('balance', value)}
          placeholder="0.00"
          keyboardType="numeric"
          editable={!isSubmitting}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Account Type</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.accountType}
            onValueChange={(value: AccountType) => handleChange('accountType', value)}
            style={styles.picker}
            dropdownIconColor="#6B7280"
            enabled={!isSubmitting}
          >
            <Picker.Item label="Checking Account" value="checking" />
            <Picker.Item label="Savings Account" value="savings" />
            <Picker.Item label="Credit Card" value="credit_card" />
            <Picker.Item label="Cash" value="cash" />
            <Picker.Item label="Investment" value="investment" />
            <Picker.Item label="Loan" value="loan" />
          </Picker>
          <ChevronDown color="#6B7280" size={20} style={styles.pickerIcon} />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Currency</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.currency}
            onValueChange={(value) => handleChange('currency', value)}
            style={styles.picker}
            dropdownIconColor="#6B7280"
            enabled={!isSubmitting}
          >
            <Picker.Item label="🇺🇸 USD" value="USD" />
            <Picker.Item label="🇪🇺 EUR" value="EUR" />
            <Picker.Item label="🇬🇧 GBP" value="GBP" />
            <Picker.Item label="🇯🇵 JPY" value="JPY" />
            <Picker.Item label="🇨🇴 COP" value="COP" />
          </Picker>
          <ChevronDown color="#6B7280" size={20} style={styles.pickerIcon} />
        </View>
      </View>

      <TouchableOpacity
        style={[styles.saveButton, isSubmitting && styles.saveButtonDisabled]}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        <Text style={styles.saveButtonText}>
          {isSubmitting ? 'Saving...' : 'Save Account'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  form: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
  },
  pickerContainer: {
    position: 'relative',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    width: '100%',
    color: '#111827',
  },
  pickerIcon: {
    position: 'absolute',
    right: 12,
    top: 14,
  },
  saveButton: {
    backgroundColor: '#2563EB',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonDisabled: {
    backgroundColor: '#93C5FD',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
