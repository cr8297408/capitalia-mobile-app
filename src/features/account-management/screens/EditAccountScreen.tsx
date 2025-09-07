import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Save, Trash2 } from 'lucide-react-native';
import type { RootStackScreenProps } from '@/navigation/types';
import { accountService } from '../services/accountService';
import type { Database } from '@/types/supabase';
import { useTransactionService } from '@/features/transaction-tracking/hooks/useTransactionService';
import { categoryService } from '@/features/transaction-tracking/services/categoryService';
import { supabase } from '@/infrastructure/supabase/client';

type Account = Database['public']['Tables']['accounts']['Row'];

type EditAccountScreenProps = RootStackScreenProps<'EditAccount'>;

export const EditAccountScreen: React.FC<EditAccountScreenProps> = ({ navigation, route }) => {
  const { accountId } = route.params;
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const [originalBalance, setOriginalBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { createTransaction } = useTransactionService();

  // Fetch account details
  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const { data, error } = await accountService.getAccountById(accountId);
        
        if (error) throw error;
        if (data) {
          const account = data as unknown as Account;
          setName(account.name);
          setBalance(account.balance.toString());
          setOriginalBalance(account.balance);
        }
      } catch (error) {
        console.error('Error fetching account:', error);
        Alert.alert('Error', 'Failed to load account details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAccount();
  }, [accountId]);

  const handleSave = async () => {
    if (!name || !balance) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    const newBalance = parseFloat(balance);
    if (isNaN(newBalance)) {
      Alert.alert('Error', 'Por favor ingresa un saldo válido');
      return;
    }

    const balanceDifference = newBalance - originalBalance;
    const isBalanceChanged = Math.abs(balanceDifference) > 0.01; // Usando un pequeño épsilon para comparación de decimales

    try {
      setIsSaving(true);
      
      // Primero actualizamos la cuenta
      const updatedAccount = await accountService.updateAccount(accountId, {
        name,
      });

      if (!updatedAccount) {
        throw new Error('Error al actualizar la cuenta');
      }
      
      // Luego creamos la transacción de ajuste si hay cambio de saldo
      if (isBalanceChanged) {
        try {
          const transactionType: 'income' | 'expense' = balanceDifference > 0 ? 'income' : 'expense';
          const amount = Math.abs(balanceDifference);
          
          // Obtenemos el ID de la categoría de ajuste
          const adjustmentCategoryId = await categoryService.getAdjustmentCategory();
          
          if (!adjustmentCategoryId) {
            console.warn('No se encontró categoría de ajuste, usando categoría por defecto');
          }
          
          // Obtenemos el ID del usuario autenticado
          const { data: { user } } = await supabase.auth.getUser();
          
          if (!user) {
            throw new Error('Usuario no autenticado');
          }

          // Creamos la transacción
          // Si es un gasto, el monto debe ser negativo
          const transactionAmount = transactionType === 'expense' ? -amount : amount;
          
          await createTransaction({
            user_id: user.id,
            account_id: accountId,
            amount: transactionAmount,
            type: transactionType,
            description: 'Ajuste de saldo',
            category_id: adjustmentCategoryId || '',
            date: new Date().toISOString(),
            is_recurring: false,
            notes: `Ajuste de saldo de $${originalBalance.toFixed(2)} a $${newBalance.toFixed(2)}`,
          });
        } catch (txError) {
          console.error('Error creating adjustment transaction:', txError);
          // No hacemos throw aquí para no revertir la actualización del saldo
          // Solo mostramos una alerta al usuario
          Alert.alert(
            'Aviso', 
            'La cuenta se actualizó correctamente, pero hubo un error al crear la transacción de ajuste.'
          );
        }
      }
      
      Alert.alert('Éxito', 'La cuenta se ha actualizado correctamente');
      navigation.goBack();
    } catch (error) {
      console.error('Error updating account:', error);
      Alert.alert('Error', 'No se pudo actualizar la cuenta. Por favor, inténtalo de nuevo.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete this account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              setIsDeleting(true);
              await accountService.deleteAccount(accountId);
              Alert.alert('Success', 'Account deleted successfully');
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting account:', error);
              Alert.alert('Error', 'Failed to delete account');
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  const handleCancel = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      // Navigate to the main accounts screen
      navigation.navigate('Main', { 
        screen: 'Accounts',
        params: { screen: 'AccountList' }
      });
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#2563EB" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} disabled={isSaving || isDeleting}>
          <X color={isSaving || isDeleting ? '#9CA3AF' : '#6B7280'} size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Account</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            onPress={handleDelete} 
            style={styles.deleteButton}
            disabled={isSaving || isDeleting}
          >
            {isDeleting ? (
              <ActivityIndicator size="small" color="#EF4444" />
            ) : (
              <Trash2 color={isSaving ? '#9CA3AF' : '#EF4444'} size={20} />
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={handleSave} 
            disabled={isSaving || isDeleting}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#2563EB" />
            ) : (
              <Save color={isDeleting ? '#9CA3AF' : '#2563EB'} size={24} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Account Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter account name"
            editable={!isSaving && !isDeleting}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Current Balance</Text>
          <TextInput
            style={styles.input}
            value={balance}
            onChangeText={setBalance}
            placeholder="0.00"
            keyboardType="decimal-pad"
            editable={!isSaving && !isDeleting}
            placeholderTextColor="#9CA3AF"
          />
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
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
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
});