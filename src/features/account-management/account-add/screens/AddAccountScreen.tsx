import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import type { RootStackScreenProps } from '@/navigation/types';
import type { AddAccountFormData } from '../types/account.types';

import { AccountForm } from '../components/AccountForm';
import { useAddAccount } from '../hooks/useAddAccount';

type AddAccountScreenProps = RootStackScreenProps<'AddAccount'>;

export const AddAccountScreen: React.FC<AddAccountScreenProps> = ({ navigation }) => {
  const { isSaving, saveAccount } = useAddAccount();

  const handleCancel = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleSubmit = useCallback(async (data: AddAccountFormData) => {
    const result = await saveAccount(data);
    if (result.ok) {
      navigation.goBack();
    }
  }, [saveAccount, navigation]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel} disabled={isSaving}>
            <X color="#6B7280" size={24} />
          </TouchableOpacity>
          <Text style={styles.title}>Add Account</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <AccountForm 
              onSubmit={handleSubmit}
              isSubmitting={isSaving}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
});
