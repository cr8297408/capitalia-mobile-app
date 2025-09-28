import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Switch, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Save, Calendar, Tag, DollarSign, Hash, FileText, Repeat, ArrowRight, ChevronDown } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import type { RootStackScreenProps } from '@/navigation/types';

import { useTransactionForm } from '../hooks/useTransactionForm';
import { styles } from '../styles/addTransactionScreen.styles';

type Account = {
  id: string;
  name: string;
  balance: number;
  currency: string;
  account_type: 'checking' | 'savings' | 'credit_card' | 'cash' | 'investment' | 'loan';
  created_at: string;
};

const FREQUENCIES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

type AddTransactionScreenProps = RootStackScreenProps<'AddTransaction'>;

const TransactionTypeButton = ({ 
  type, 
  currentType, 
  onPress, 
  icon: Icon, 
  label 
}: { 
  type: 'expense' | 'income' | 'transfer', 
  currentType: string, 
  onPress: (type: 'expense' | 'income' | 'transfer') => void, 
  icon: React.ComponentType<{ color: string, size: number }>,
  label: string 
}) => (
  <TouchableOpacity
    style={[
      styles.typeButton,
      currentType === type && styles.typeButtonActive
    ]}
    onPress={() => onPress(type)}
  >
    <Icon 
      color={currentType === type ? '#FFFFFF' : '#6B7280'} 
      size={20} 
    />
    <Text style={[
      styles.typeButtonText,
      currentType === type && styles.typeButtonTextActive
    ]}>
      {label}
    </Text>
  </TouchableOpacity>
);

export const AddTransactionScreen: React.FC<AddTransactionScreenProps> = () => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showAccountPicker, setShowAccountPicker] = useState(false);
  const { accounts, isLoadingAccounts } = useTransactionForm();
  const [showTransferAccountPicker, setShowTransferAccountPicker] = useState(false);
  const [showFrequencyPicker, setShowFrequencyPicker] = useState(false);
  
  const {
    // Form fields
    description,
    amount,
    date,
    type,
    accountId,
    categoryId,
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
  } = useTransactionForm();

  const selectedAccount = accounts.find((a: Account) => a.id === accountId);
  const selectedCategory = CATEGORIES.find(c => c.id === categoryId);
  const selectedTransferAccount = accounts.find((a: Account) => a.id === transferToAccountId);
  const selectedFrequency = FREQUENCIES.find(f => f.value === recurringFrequency);

  const onChangeDate = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

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

      <ScrollView style={styles.scrollView}>
        <View style={styles.typeSelector}>
          <TransactionTypeButton
            type="expense"
            currentType={type}
            onPress={setType}
            icon={DollarSign}
            label="Expense"
          />
          <TransactionTypeButton
            type="income"
            currentType={type}
            onPress={setType}
            icon={ArrowRight}
            label="Income"
          />
          <TransactionTypeButton
            type="transfer"
            currentType={type}
            onPress={setType}
            icon={Repeat}
            label="Transfer"
          />
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Amount</Text>
            <View style={styles.amountInputContainer}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={[styles.input, styles.amountInput]}
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                keyboardType="numeric"
                returnKeyType="done"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={styles.input}
              value={description}
              onChangeText={setDescription}
              placeholder="Enter transaction description"
              returnKeyType="next"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date</Text>
            <TouchableOpacity 
              style={styles.dateInput}
              onPress={() => setShowDatePicker(true)}
            >
              <Calendar size={20} color="#6B7280" />
              <Text style={styles.dateText}>{formatDate(date)}</Text>
              <ChevronDown size={20} color="#6B7280" />
            </TouchableOpacity>
            
            {showDatePicker && (
              <DateTimePicker
                testID="dateTimePicker"
                value={date}
                mode="date"
                display="default"
                onChange={onChangeDate}
              />
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.pickerLabel}>Account</Text>
            {isLoadingAccounts ? (
              <View style={styles.pickerButton}>
                <Text style={styles.pickerButtonText}>Loading accounts...</Text>
              </View>
            ) : accounts.length > 0 ? (
              <TouchableOpacity 
                style={styles.pickerButton}
                onPress={() => setShowAccountPicker(true)}
              >
                <Text style={styles.pickerButtonText}>
                  {accountId 
                    ? accounts.find(a => a.id === accountId)?.name || 'Select Account'
                    : 'Select Account'}
                </Text>
                <ChevronDown size={20} color="#666" />
              </TouchableOpacity>
            ) : (
              <View style={styles.pickerButton}>
                <Text style={[styles.pickerButtonText, { color: '#ff4444' }]}>
                  No accounts found. Please create an account first.
                </Text>
              </View>
            )}
            
            {showAccountPicker && (
              <View style={styles.pickerContainer}>
                <ScrollView style={styles.pickerScrollView}>
                  {accounts.map((account: Account) => (
                    <TouchableOpacity
                      key={account.id}
                      style={styles.pickerItem}
                      onPress={() => {
                        setAccountId(account.id);
                        setShowAccountPicker(false);
                      }}
                    >
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
                        <Text style={styles.pickerItemText}>{account.name}</Text>
                        <Text style={[styles.pickerItemText, { color: '#666' }]}>
                          {new Intl.NumberFormat(undefined, {
                            style: 'currency',
                            currency: account.currency || 'USD',
                          }).format(account.balance)}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <TouchableOpacity 
                  style={styles.pickerCancelButton}
                  onPress={() => setShowAccountPicker(false)}
                >
                  <Text style={styles.pickerCancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {type !== 'transfer' && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Category</Text>
              <TouchableOpacity 
                style={styles.pickerInput}
                onPress={() => setShowCategoryPicker(true)}
              >
                <Text style={!categoryId ? styles.placeholderText : {}}>
                  {selectedCategory?.name || 'Select category'}
                </Text>
                <ChevronDown size={20} color="#6B7280" />
              </TouchableOpacity>
              
              {showCategoryPicker && (
                <View style={styles.pickerModal}>
                  <Text style={styles.pickerTitle}>Select Category</Text>
                  {CATEGORIES.map(category => (
                    <TouchableOpacity
                      key={category.id}
                      style={styles.pickerItem}
                      onPress={() => {
                        setCategoryId(category.id);
                        setShowCategoryPicker(false);
                      }}
                    >
                      <Text>{category.name}</Text>
                      {categoryId === category.id && (
                        <View style={styles.checkmark} />
                      )}
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity 
                    style={styles.pickerCancelButton}
                    onPress={() => setShowCategoryPicker(false)}
                  >
                    <Text style={styles.pickerCancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {type === 'transfer' && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>To Account</Text>
              <TouchableOpacity 
                style={styles.pickerInput}
                onPress={() => setShowTransferAccountPicker(true)}
              >
                <Text style={!transferToAccountId ? styles.placeholderText : {}}>
                  {selectedTransferAccount?.name || 'Select destination account'}
                </Text>
                <ChevronDown size={20} color="#6B7280" />
              </TouchableOpacity>
              
              {showTransferAccountPicker && (
                <View style={styles.pickerContainer}>
                  <Text style={styles.pickerTitle}>Select Destination Account</Text>
                  <ScrollView style={styles.pickerScrollView}>
                    {accounts.filter((acc: Account) => acc.id !== accountId).map((account: Account) => (
                      <TouchableOpacity
                        key={account.id}
                        style={styles.pickerItem}
                        onPress={() => {
                          setTransferToAccountId(account.id);
                          setShowTransferAccountPicker(false);
                        }}
                      >
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
                          <Text style={styles.pickerItemText}>{account.name}</Text>
                          <Text style={[styles.pickerItemText, { color: '#666' }]}>
                            {new Intl.NumberFormat(undefined, {
                              style: 'currency',
                              currency: account.currency || 'USD',
                            }).format(account.balance)}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                  <TouchableOpacity 
                    style={styles.pickerCancelButton}
                    onPress={() => setShowTransferAccountPicker(false)}
                  >
                    <Text style={styles.pickerCancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          <View style={[styles.inputGroup, styles.toggleGroup]}>
            <Text style={styles.label}>Recurring Transaction</Text>
            <Switch
              value={isRecurring}
              onValueChange={setIsRecurring}
              trackColor={{ false: '#E5E7EB', true: '#DBEAFE' }}
              thumbColor={isRecurring ? '#2563EB' : '#9CA3AF'}
            />
          </View>

          {isRecurring && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Frequency</Text>
              <TouchableOpacity 
                style={styles.pickerInput}
                onPress={() => setShowFrequencyPicker(true)}
              >
                <Text style={!recurringFrequency ? styles.placeholderText : {}}>
                  {selectedFrequency?.label || 'Select frequency'}
                </Text>
                <ChevronDown size={20} color="#6B7280" />
              </TouchableOpacity>
              
              {showFrequencyPicker && (
                <View style={styles.pickerModal}>
                  <Text style={styles.pickerTitle}>Select Frequency</Text>
                  {FREQUENCIES.map(frequency => (
                    <TouchableOpacity
                      key={frequency.value}
                      style={styles.pickerItem}
                      onPress={() => {
                        setRecurringFrequency(frequency.value as any);
                        setShowFrequencyPicker(false);
                      }}
                    >
                      <Text>{frequency.label}</Text>
                      {recurringFrequency === frequency.value && (
                        <View style={styles.checkmark} />
                      )}
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity 
                    style={styles.pickerCancelButton}
                    onPress={() => setShowFrequencyPicker(false)}
                  >
                    <Text style={styles.pickerCancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tags</Text>
            <View style={styles.tagsContainer}>
              {tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                  <TouchableOpacity onPress={() => handleRemoveTag(tag)}>
                    <X size={16} color="#6B7280" />
                  </TouchableOpacity>
                </View>
              ))}
              <View style={styles.tagInputContainer}>
                <Tag size={16} color="#6B7280" />
                <TextInput
                  style={styles.tagInput}
                  value={tagInput}
                  onChangeText={setTagInput}
                  placeholder="Add a tag"
                  returnKeyType="done"
                  onSubmitEditing={handleAddTag}
                />
              </View>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Notes</Text>
            <View style={styles.notesContainer}>
              <FileText size={20} color="#6B7280" style={styles.notesIcon} />
              <TextInput
                style={[styles.input, styles.notesInput]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Add any notes about this transaction"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};