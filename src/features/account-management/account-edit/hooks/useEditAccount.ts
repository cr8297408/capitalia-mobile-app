import { useState, useCallback } from 'react';
import { useAuth } from '@/shared/hooks/useAuth';
import { accountService } from '@/features/account-management/services/accountService';
import { useTransactionService } from '@/features/transaction-tracking/hooks/useTransactionService';
import { categoryService } from '@/features/transaction-tracking/services/categoryService';
import { supabase } from '@/infrastructure/supabase/client';
import type { Database } from '@/types/supabase';
import type { EditAccountFormData, EditAccountResult, DeleteAccountResult, Account } from '../types/account.types';

export const useEditAccount = (accountId: string) => {
  const { user } = useAuth();
  const { createTransaction } = useTransactionService();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [originalBalance, setOriginalBalance] = useState(0);

  const fetchAccount = useCallback(async (): Promise<{ ok: boolean; account?: Account; code?: string; message?: string }> => {
    if (!accountId) return { ok: false, code: 'validation_error', message: 'Account ID is required' };
    
    try {
      const { data, error } = await accountService.getAccountById(accountId);
      
      if (error) throw error;
      if (!data) {
        return { 
          ok: false, 
          code: 'not_found', 
          message: 'Account not found' 
        };
      }
      
      const account = data as unknown as Account;
      setOriginalBalance(account.balance);
      return { 
        ok: true, 
        account
      };
    } catch (error) {
      console.error('Error fetching account:', error);
      return { 
        ok: false, 
        code: 'unknown_error', 
        message: 'Failed to load account details' 
      };
    } finally {
      setIsLoading(false);
    }
  }, [accountId]);

  const updateAccount = useCallback(async (data: EditAccountFormData): Promise<EditAccountResult> => {
    if (!user) {
      return { 
        ok: false, 
        code: 'not_authenticated', 
        message: 'Please sign in to update an account.' 
      };
    }

    const trimmedName = data.name.trim();
    if (!trimmedName) {
      return { 
        ok: false, 
        code: 'validation_error', 
        message: 'Please enter an account name.' 
      };
    }

    const newBalance = parseFloat(data.balance);
    if (isNaN(newBalance)) {
      return { 
        ok: false, 
        code: 'validation_error', 
        message: 'Please enter a valid balance.' 
      };
    }

    const balanceDifference = newBalance - originalBalance;
    const isBalanceChanged = Math.abs(balanceDifference) > 0.01;

    try {
      setIsSaving(true);
      
      // Update the account
      const { data: updatedAccount, error: updateError } = await accountService.updateAccount(accountId, {
        name: trimmedName,
        balance: newBalance,
        account_type: data.accountType,
        currency: data.currency,
      });

      if (updateError) {
        throw new Error('Failed to update account');
      }
      
      if (!updatedAccount) {
        throw new Error('No account data returned from update');
      }

      // Create a transaction for balance adjustment if needed
      if (isBalanceChanged) {
        const transactionType = balanceDifference > 0 ? 'income' : 'expense';
        const amount = Math.abs(balanceDifference);
        
        const adjustmentCategoryId = await categoryService.getAdjustmentCategory() || undefined;
        
        if (!user?.id) {
          throw new Error('User not authenticated');
        }

        const transactionAmount = transactionType === 'expense' ? -amount : amount;
        
        // Create a transaction for the balance adjustment
        // Get the adjustment category or find any available category
        let categoryId = adjustmentCategoryId;
        
        // If we don't have an adjustment category, try to get any available category
        if (!categoryId) {
          const firstCategory = await categoryService.getCategoryByName('');
          if (firstCategory) {
            categoryId = firstCategory.id;
          }
        }
        
        if (!categoryId) {
          throw new Error('Could not find a suitable category for balance adjustment');
        }
        
        const transactionData = {
          user_id: user.id,
          account_id: accountId,
          amount: transactionAmount,
          type: transactionType as 'income' | 'expense',
          description: 'Balance adjustment',
          date: new Date().toISOString(),
          category_id: categoryId,
          is_recurring: false, // Default to false for balance adjustments
          notes: 'Automatic balance adjustment',
        };

        await createTransaction(transactionData);
      }

      return { 
        ok: true, 
        account: updatedAccount as any 
      };
    } catch (error: any) {
      console.error('Error updating account:', error);
      return { 
        ok: false, 
        code: 'unknown_error', 
        message: error?.message || 'Failed to update account' 
      };
    } finally {
      setIsSaving(false);
    }
  }, [accountId, user, originalBalance, createTransaction]);

  const deleteAccount = useCallback(async (): Promise<DeleteAccountResult> => {
    if (!user) {
      return { 
        ok: false, 
        code: 'not_authenticated', 
        message: 'Please sign in to delete an account.' 
      };
    }

    try {
      setIsDeleting(true);
      
      // Check if account has transactions
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('id')
        .eq('account_id', accountId)
        .limit(1);

      if (error) throw error;
      
      if (transactions && transactions.length > 0) {
        return { 
          ok: false, 
          code: 'has_transactions', 
          message: 'Cannot delete account with existing transactions.' 
        };
      }

      // Delete the account
      await accountService.deleteAccount(accountId);
      
      return { ok: true };
    } catch (error: any) {
      console.error('Error deleting account:', error);
      return { 
        ok: false, 
        code: 'unknown_error', 
        message: error?.message || 'Failed to delete account' 
      };
    } finally {
      setIsDeleting(false);
    }
  }, [accountId, user]);

  return {
    isLoading,
    isSaving,
    isDeleting,
    fetchAccount,
    updateAccount,
    deleteAccount,
  };
};
