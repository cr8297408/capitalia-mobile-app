import { useState, useCallback } from 'react';
import { useAuth } from '@/shared/hooks/useAuth';
import { accountService } from '@/shared/services/accountService';
import { useTransactionService } from '@/features/transaction-tracking/hooks/useTransactionService';
import { categoryService } from '@/shared/services/categoryService';
import { supabase } from '@/infrastructure/supabase/client';
import type { Database } from '@/shared/types/supabase';
import type { EditAccountFormData, EditAccountResult, DeleteAccountResult, Account } from '../types/account.types';

export const useEditAccount = (accountId: string) => {
  const { user } = useAuth();
  const { createTransaction } = useTransactionService();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
      return { 
        ok: true, 
        account
      };
    } catch (error: any) {
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
    const { ok, account } = await fetchAccount();
    const trimmedName = data.name.trim();
    if (!trimmedName || !data.balance) {
      return { 
        ok: false, 
        code: 'validation_error', 
        message: 'Por favor completa todos los campos' 
      };
    }

    const newBalance = parseFloat(data.balance);
    if (isNaN(newBalance)) {
      return { 
        ok: false, 
        code: 'validation_error', 
        message: 'Por favor ingresa un saldo válido' 
      };
    }

    const balanceDifference = newBalance - (account?.balance ?? 0);
    console.log(`💰 [Account Update] Balance change: ${account?.balance} → ${newBalance} (Δ: ${balanceDifference.toFixed(2)})`);
    const isBalanceChanged = Math.abs(balanceDifference) > 0.01;
    
    console.log(`📊 [Account Update] Balance changed: ${isBalanceChanged ? 'Yes' : 'No'}`);

    try {
      setIsSaving(true);
      
      const updateData = {
        name: trimmedName,
        account_type: data.accountType,
        currency: data.currency,
      };
      
      console.log('📤 [Account Update] Updating account with data:', JSON.stringify(updateData, null, 2));
      
      // Update the account
      const { data: updatedAccount, error: updateError } = await accountService.updateAccount(accountId, updateData);

      let finalAccount = updatedAccount;
      
      if (updateError || !updatedAccount) {
        console.warn('⚠️ [Account Update] Update did not return account data, attempting to refetch...');
        
        // If update didn't return the account, try to fetch it again
        const { data: refetchedAccount, error: refetchError } = await accountService.getAccountById(accountId);
        
        if (refetchError || !refetchedAccount) {
          console.error('❌ [Account Update] Failed to refetch account after update:', refetchError || 'No data returned');
          const errorMessage = (updateError as { message?: string })?.message || 'Error al actualizar la cuenta y no se pudo recuperar la información actualizada';
          throw new Error(errorMessage);
        }
        
        finalAccount = refetchedAccount;
        console.log('✅ [Account Update] Successfully refetched account after update');
      }
      
      console.log('✅ [Account Update] Account updated successfully:', finalAccount);
      
      // Create a transaction for balance adjustment if needed
      if (isBalanceChanged) {
        console.log('🔄 [Transaction] Starting balance adjustment transaction...');
        console.log(`💱 [Transaction] Type: ${balanceDifference > 0 ? 'income' : 'expense'}, Amount: ${Math.abs(balanceDifference).toFixed(2)}`);
        
        try {
          // Determine if this is an income or expense based on balance change
          const isIncome = balanceDifference > 0;
          const transactionType: 'income' | 'expense' = isIncome ? 'income' : 'expense';
          // Use the balance difference as the amount (positive or negative)
          const amount = balanceDifference;
          
          console.log(`💰 [Transaction] Amount after adjustment: ${amount} (${transactionType})`);
          
          console.log('🔍 [Transaction] Looking for adjustment category...');
          // Get adjustment category or any available category as fallback
          let categoryId = await categoryService.getAdjustmentCategory();
          
          if (!categoryId) {
            console.warn('⚠️ [Transaction] No se encontró categoría de ajuste, usando categoría por defecto');
            const firstCategory = await categoryService.getCategoryByName('');
            if (firstCategory) {
              categoryId = firstCategory.id;
              console.log(`✅ [Transaction] Using default category: ${firstCategory.name} (${firstCategory.id})`);
            }
          } else {
            console.log(`✅ [Transaction] Using adjustment category: ${categoryId}`);
          }
          
          if (!categoryId) {
            const errorMsg = 'No se pudo encontrar una categoría adecuada para el ajuste';
            console.error(`❌ [Transaction] ${errorMsg}`);
            return { 
              ok: true, 
              account: updatedAccount as any,
              message: 'La cuenta se actualizó correctamente, pero no se pudo crear la transacción de ajuste (categoría no encontrada)'
            };
          }
          
          if (!user?.id) {
            const errorMsg = 'Usuario no autenticado al crear transacción';
            console.error(`❌ [Transaction] ${errorMsg}`);
            throw new Error(errorMsg);
          }

          // For expenses, amount is already negative; for income, it's positive
          const transactionData = {
            user_id: user.id,
            account_id: accountId,
            amount: amount, // amount is already negative for expenses
            type: transactionType,
            description: 'Ajuste de saldo',
            category_id: categoryId,
            date: new Date().toISOString(),
            is_recurring: false,
            notes: `Ajuste de saldo de $${account?.balance.toFixed(2)} a $${newBalance.toFixed(2)}`,
          };
          
          console.log('📝 [Transaction] Creating transaction with data:', JSON.stringify({
            ...transactionData,
            amount: `${amount} (${transactionType}, ${amount < 0 ? 'negative' : 'positive'})`,
            category_id: categoryId
          }, null, 2));
          
          const result = await createTransaction(transactionData);
          console.log('✅ [Transaction] Transaction created successfully:', result);
        } catch (txError) {
          const errorMsg = txError instanceof Error ? txError.message : 'Error desconocido';
          console.error('❌ [Transaction] Error creando transacción de ajuste:', errorMsg);
          console.error('Transaction error details:', txError);
          return { 
            ok: true, 
            account: updatedAccount as any,
            message: 'La cuenta se actualizó correctamente, pero hubo un error al crear la transacción de ajuste.'
          };
        }
      }

      return { 
        ok: true, 
        account: updatedAccount as any,
        message: 'La cuenta se ha actualizado correctamente'
      };
    } catch (error: any) {
      console.error('Error actualizando cuenta:', error);
      return { 
        ok: false, 
        code: 'unknown_error', 
        message: error?.message || 'No se pudo actualizar la cuenta. Por favor, inténtalo de nuevo.' 
      };
    } finally {
      setIsSaving(false);
    }
  }, [accountId, user, createTransaction]);

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
