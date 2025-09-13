import { useState } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';

type AddTransactionScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'AddTransaction'
>;

export const useTransactionForm = () => {
  const navigation = useNavigation<AddTransactionScreenNavigationProp>();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');

  const handleSave = () => {
    if (!description || !amount) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    
    // TODO: Implement transaction saving logic
    Alert.alert('Success', 'Transaction will be saved when implemented');
    navigation.goBack();
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return {
    description,
    amount,
    setDescription,
    setAmount,
    handleSave,
    handleCancel,
  };
};
