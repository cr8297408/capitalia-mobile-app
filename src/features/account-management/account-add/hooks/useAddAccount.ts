import { useState, useCallback } from 'react';
import { useAuth } from '@/shared/hooks/useAuth';
import { TransactionService } from '@/shared/services/transactionService';
import { categoryService } from '@/shared/services/categoryService';
import type { Database } from '@/shared/types/supabase';
import { accountService } from '@/shared/services/accountService';

type Account = Database['public']['Tables']['accounts']['Row'];
const transactionService = TransactionService.getInstance();

export type SaveAccountResult =
  | { ok: false; code: 'not_authenticated' | 'validation_error' | 'limit_reached' | 'error'; message: string }
  | { ok: true; code: 'success'; message: string };

export const useAddAccount = () => {
  const { user, limits, isPremium } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  const saveAccount = useCallback(
    async ({ name, balance, accountType, currency }: { 
      name: string; 
      balance: string; 
      accountType: 'checking' | 'savings' | 'credit_card' | 'cash' | 'investment' | 'loan';
      currency: string;
    }): Promise<SaveAccountResult> => {
      try {
        if (isSaving) return { ok: false, code: 'error', message: 'Already saving' };

        if (!user) {
          return { ok: false, code: 'not_authenticated', message: 'Please sign in to add an account.' };
        }

        const trimmedName = name.trim();
        if (!trimmedName) {
          return { ok: false, code: 'validation_error', message: 'Please enter an account name.' };
        }

        const normalized = balance.replace(/,/g, '');
        if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
          return { ok: false, code: 'validation_error', message: 'Balance must be a valid number (up to 2 decimals).' };
        }
        const balanceValue = parseFloat(normalized);
        if (Number.isNaN(balanceValue)) {
          return { ok: false, code: 'validation_error', message: 'Balance is not a valid number.' };
        }

        if (!isPremium && limits?.maxAccounts != null) {
          const currentCount = await accountService.getAccountsCount(user.id);
          if (currentCount >= limits.maxAccounts) {
            return {
              ok: false,
              code: 'limit_reached',
              message: `You have reached the free tier limit of ${limits.maxAccounts} accounts. Upgrade to add more.`,
            };
          }
        }

        setIsSaving(true);

        // Create the account first
        const account = await accountService.createAccount({
          userId: user.id,
          name: trimmedName,
          balance: 0,
          accountType,
          currency,
        });

        // Create an initial transaction for the account balance
        if (balanceValue !== 0) {
          // Get the 'Other Income' category
          let categoryId = (await categoryService.getCategoryByName('Other Income'))?.id;
          
          if (!categoryId) {
            console.warn("'Other Income' category not found, trying adjustment category");
            categoryId = (await categoryService.getAdjustmentCategory()) || undefined;
          }

          await transactionService.createTransaction({
            user_id: user.id,
            account_id: (account as Account).id,
            amount: Number(balanceValue.toFixed(2)),
            description: 'Initial balance',
            date: new Date().toISOString(),
            type: balanceValue >= 0 ? 'income' : 'expense',
            category_id: categoryId as string,
            is_recurring: false,
          });
        }

        return { ok: true, code: 'success', message: 'Account created successfully' };
      } catch (err: any) {
        console.error('Create account error:', err);
        return { ok: false, code: 'error', message: err?.message || 'Failed to create account' };
      } finally {
        setIsSaving(false);
      }
    },
    [isSaving, user, limits, isPremium]
  );

  return { isSaving, saveAccount };
};
