import { useState } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';
import { transactionService, TransactionType, RecurringFrequency } from '../../services/transactionService';
import { TransactionService } from '@/shared/services/transactionService';
import { accountService } from '@/shared/services/accountService';
import { useAuth } from '@/shared/hooks/useAuth';
import { useEffect } from 'react';

const sharedTransactionService = TransactionService.getInstance();

type Account = {
  id: string;
  name: string;
  balance: number;
  currency: string;
  account_type: 'checking' | 'savings' | 'credit_card' | 'cash' | 'investment' | 'loan';
  created_at: string;
};

type AddTransactionScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'AddTransaction'
>;

export const useTransactionForm = () => {
  const { user, isPremium, limits } = useAuth();
  const navigation = useNavigation<AddTransactionScreenNavigationProp>();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date());
  const [type, setType] = useState<TransactionType>('expense');
  const [accountId, setAccountId] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [budgetId, setBudgetId] = useState<string>(''); // ✅ New budget association
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState<RecurringFrequency | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [transferToAccountId, setTransferToAccountId] = useState<string>('');
  const [tagInput, setTagInput] = useState('');

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSave = async () => {
    // Check basic required fields
    if (!description || !amount || !accountId) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    // For non-transfer transactions, require either category or budget
    if (type !== 'transfer' && !categoryId && !budgetId) {
      Alert.alert('Error', 'Please select a category or associate with a budget');
      return;
    }
    
    // If budget is selected, ensure category is also present (should be auto-assigned)
    if (budgetId && !categoryId) {
      Alert.alert('Error', 'Budget selection requires a category. Please try selecting the budget again.');
      return;
    }
    
    if (type === 'transfer' && !transferToAccountId) {
      Alert.alert('Error', 'Please select destination account for transfer');
      return;
    }
    
    if (isRecurring && !recurringFrequency) {
      Alert.alert('Error', 'Please select a recurring frequency');
      return;
    }

    // ✅ Check transaction limits for non-premium users
    if (!isPremium && limits?.maxTransactions != null) {
      try {
        const transactionsCount = await sharedTransactionService.getTransactionsCount(user?.id || '');
        if (transactionsCount >= limits.maxTransactions) {
          Alert.alert(
            'Limit Reached',
            `You have reached the free tier limit of ${limits.maxTransactions} transactions. Upgrade to add more.`,
            [
              { text: 'Cancel', style: 'cancel' },
              { 
                text: 'Upgrade', 
                onPress: () => {
                  navigation.navigate('SubscriptionPlans');
                }
              }
            ]
          );
          return;
        }
      } catch (error) {
        console.error('Error checking transaction limits:', error);
        // Continue with transaction creation if we can't check limits
      }
    }
    
    try {
      setIsLoading(true);
      
      const amountValue = parseFloat(amount);
      if (isNaN(amountValue)) {
        throw new Error('Invalid amount');
      }
      
      // Format date to ISO string for the API
      const formattedDate = date.toISOString();
      
      // Create the transaction data object
      const transactionData = {
        description: description.trim(),
        amount: amountValue,
        date: formattedDate,
        type,
        account_id: accountId,
        category_id: type !== 'transfer' ? categoryId : null,
        budget_id: budgetId || null, // ✅ Include budget association
        is_recurring: isRecurring,
        recurring_frequency: isRecurring ? recurringFrequency : null,
        tags: tags.map(tag => tag.trim()).filter(tag => tag.length > 0),
        notes: notes.trim() || null,
        transfer_to_account_id: type === 'transfer' ? transferToAccountId : null,
        user_id: user?.id || '',
      };
      console.log("🚀 ~ handleSave ~ transactionData:", transactionData);
      
      // Additional validation log for budget association
      if (budgetId && categoryId) {
        console.log("✅ Budget association active: budget_id =", budgetId, "| category_id =", categoryId);
      }
      
      // Call the transaction service to save the transaction
      await transactionService.createTransaction(transactionData);
      
      // Show success message and navigate back
      Alert.alert('Success', 'Transaction saved successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error saving transaction:', error);
      Alert.alert('Error', 'Failed to save transaction. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Load accounts when component mounts
  useEffect(() => {
    const loadAccounts = async () => {
      if (!user?.id) return;
      
      try {
        setIsLoadingAccounts(true);
        const userAccounts: Account[] = await accountService.listAccounts(user.id);
        setAccounts(userAccounts);
      } catch (error) {
        console.error('Error loading accounts:', error);
        Alert.alert('Error', 'Failed to load accounts');
      } finally {
        setIsLoadingAccounts(false);
      }
    };

    loadAccounts();
  }, [user?.id]);

  const handleCancel = () => {
    navigation.goBack();
  };

  return {
    // Data
    accounts,
    isLoadingAccounts,
    // Form state
    isLoading,
    // Form fields
    description,
    amount,
    date,
    type,
    accountId,
    categoryId,
    budgetId, // ✅ New budget field
    isRecurring,
    recurringFrequency,
    tags,
    notes,
    transferToAccountId,
    tagInput,
    
    // Setters
    setDescription,
    setAmount,
    setDate,
    setType,
    setAccountId,
    setCategoryId,
    setBudgetId, // ✅ New budget setter
    setIsRecurring,
    setRecurringFrequency,
    setTags,
    setNotes,
    setTransferToAccountId,
    setTagInput,
    
    // Handlers
    handleSave,
    handleCancel,
    handleAddTag,
    handleRemoveTag,
  };
};
