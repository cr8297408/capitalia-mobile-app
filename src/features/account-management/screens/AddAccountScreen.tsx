import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Save, ChevronDown } from 'lucide-react-native';
import { Picker } from '@react-native-picker/picker';
import type { RootStackScreenProps } from '@/navigation/types';
import { useAddAccount } from '@/features/account-management/hooks/useAddAccount';

type AddAccountScreenProps = RootStackScreenProps<'AddAccount'>;

export const AddAccountScreen: React.FC<AddAccountScreenProps> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const [accountType, setAccountType] = useState<'checking' | 'savings' | 'credit_card' | 'cash' | 'investment' | 'loan'>('checking');
  const { isSaving, saveAccount } = useAddAccount();

  const handleSave = async () => {
    const result = await saveAccount({ 
      name, 
      balance,
      accountType // Pass selected account type
    });
    if (result.ok) {
      Alert.alert('Success', 'Account created successfully');
      navigation.goBack();
      return;
    }

    // Map error codes to alerts
    switch (result.code) {
      case 'not_authenticated':
        Alert.alert('Not authenticated', result.message);
        break;
      case 'validation_error':
        Alert.alert('Validation error', result.message);
        break;
      case 'limit_reached':
        Alert.alert('Upgrade required', result.message);
        break;
      default:
        Alert.alert('Error', result.message);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel}>
          <X color="#6B7280" size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Add Account</Text>
        <TouchableOpacity onPress={handleSave} disabled={isSaving}>
          <Save color="#2563EB" size={24} />
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Account Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter account name"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Initial Balance</Text>
          <TextInput
            style={styles.input}
            value={balance}
            onChangeText={setBalance}
            placeholder="0.00"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Account Type</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={accountType}
              onValueChange={(itemValue) => setAccountType(itemValue)}
              style={styles.picker}
              dropdownIconColor="#6B7280"
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
      </View>
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
  form: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    position: 'relative',
  },
  picker: {
    color: '#111827',
    paddingVertical: 8,
    paddingRight: 32,
  },
  pickerIcon: {
    position: 'absolute',
    right: 12,
    pointerEvents: 'none',
  },
});