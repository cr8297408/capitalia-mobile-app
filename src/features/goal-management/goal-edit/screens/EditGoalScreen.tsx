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
import { X, Save, Trash2 } from 'lucide-react-native';
import type { RootStackScreenProps } from '@/navigation/types';
import { formatCurrency, parseCurrencyToNumber } from '@/shared/utils/currencyFormatter';

type EditGoalScreenProps = RootStackScreenProps<'EditGoal'>;

export const EditGoalScreen: React.FC<EditGoalScreenProps> = ({ navigation, route }) => {
  const { goalId } = route.params;
  const [name, setName] = useState('Sample Goal');
  const [targetAmount, setTargetAmount] = useState('5000.00');

  const handleSave = () => {
    if (!name || !targetAmount) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    
    // TODO: Implement goal update logic
    Alert.alert('Success', `Goal ${goalId} will be updated when implemented`);
    navigation.goBack();
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Goal',
      'Are you sure you want to delete this goal?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            // TODO: Implement goal deletion logic
            Alert.alert('Success', 'Goal deleted');
            navigation.goBack();
          }
        },
      ]
    );
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
        <Text style={styles.title}>Edit Goal</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
            <Trash2 color="#EF4444" size={20} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSave}>
            <Save color="#2563EB" size={24} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Goal Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter goal name"
          />
        </View>

                <View style={styles.inputGroup}>
          <Text style={styles.label}>Target Amount</Text>
          <View style={styles.amountContainer}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={[styles.input, styles.amountInput]}
              value={formatCurrency(targetAmount)}
              onChangeText={(text) => {
                const parsedValue = parseCurrencyToNumber(text.replace(/[^0-9.,]/g, ''));
                setTargetAmount(parsedValue);
              }}
              placeholder="0.00"
              keyboardType="decimal-pad"
            />
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  deleteButton: {
    padding: 4,
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
  amountContainer: {
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
  amountInput: {
    paddingLeft: 30,
  },
});