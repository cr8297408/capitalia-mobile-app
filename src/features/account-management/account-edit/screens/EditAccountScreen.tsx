import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import type { RootStackScreenProps } from '@/navigation/types';

import { AccountForm } from '../components/AccountForm';
import { useEditAccount } from '../hooks/useEditAccount';
import type { EditAccountFormData } from '../types/account.types';

type EditAccountScreenProps = RootStackScreenProps<'EditAccount'> & {
  route: {
    params: {
      accountId: string;
      initialData?: EditAccountFormData;
      onGoBack?: () => void;
    };
  };
};

export const EditAccountScreen: React.FC<EditAccountScreenProps> = ({ navigation, route }) => {
  const { accountId, initialData: initialDataFromParams } = route.params;
  const [initialData, setInitialData] = useState<EditAccountFormData | null>(
    initialDataFromParams || null
  );
  const [isLoadingInitialData, setIsLoadingInitialData] = useState(!initialDataFromParams);
  
  const {
    isLoading,
    isSaving,
    isDeleting,
    fetchAccount,
    updateAccount,
    deleteAccount,
  } = useEditAccount(accountId);

  // Fetch account data when component mounts if not provided via params
  useEffect(() => {
    if (!initialDataFromParams) {
      const loadAccount = async () => {
        const result = await fetchAccount();
        if (result.ok && result.account) {
          const { name, balance, account_type, currency } = result.account;
          setInitialData({
            name,
            balance: balance.toString(),
            accountType: account_type as any,
            currency: currency || 'USD',
          });
        }
        setIsLoadingInitialData(false);
      };

      loadAccount();
    }
  }, [fetchAccount, initialDataFromParams]);

  const saveAndGoBack = async (data: EditAccountFormData) => {
    const result = await updateAccount(data);
    if (result.ok) {
      // Call the onGoBack callback if provided
      if (route.params?.onGoBack) {
        route.params.onGoBack();
      }
      navigation.goBack();
    } else {
      // Show error message
      alert(result.message || 'Failed to update account');
    }
  };

  const handleDelete = async () => {
    const result = await deleteAccount();
    if (result.ok) {
      navigation.navigate('Main', { 
        screen: 'Accounts',
        params: { screen: 'AccountList' }
      });
    } else if (result.code === 'has_transactions') {
      // Show specific message for accounts with transactions
      alert('Cannot delete an account with existing transactions. Please delete or transfer the transactions first.');
    } else {
      alert(result.message || 'Failed to delete account');
    }
  };

  // Set up header
  useEffect(() => {
    navigation.setOptions({
      headerTitle: 'Edit Account',
      headerTitleAlign: 'left',
      headerLeft: () => (
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={{ padding: 8, marginLeft: 8 }}
          disabled={isSaving || isDeleting}
        >
          <ArrowLeft color="#111827" size={24} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, isSaving, isDeleting]);

  if (isLoadingInitialData || (isLoading && !initialData)) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Loading account details...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  if (!initialData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load account details.</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => {
              if (initialDataFromParams) {
                setInitialData(initialDataFromParams);
              } else {
                setIsLoadingInitialData(true);
                fetchAccount().then(() => setIsLoadingInitialData(false));
              }
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <AccountForm 
        initialData={initialData}
        onSubmit={saveAndGoBack}
        onCancel={navigation.goBack}
        isSubmitting={isSaving}
        isDeleting={isDeleting}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#6B7280',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
