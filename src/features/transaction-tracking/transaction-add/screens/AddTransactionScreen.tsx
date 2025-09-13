import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Save } from 'lucide-react-native';
import type { RootStackScreenProps } from '@/navigation/types';

import { useTransactionForm } from '../hooks/useTransactionForm';
import { styles } from '../styles/addTransactionScreen.styles';

type AddTransactionScreenProps = RootStackScreenProps<'AddTransaction'>;

export const AddTransactionScreen: React.FC<AddTransactionScreenProps> = () => {
  const {
    description,
    amount,
    setDescription,
    setAmount,
    handleSave,
    handleCancel,
  } = useTransactionForm();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel}>
          <X color="#6B7280" size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Add Transaction</Text>
        <TouchableOpacity onPress={handleSave}>
          <Save color="#2563EB" size={24} />
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={styles.input}
            value={description}
            onChangeText={setDescription}
            placeholder="Enter transaction description"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Amount</Text>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            keyboardType="numeric"
          />
        </View>
      </View>
    </SafeAreaView>
  );
};