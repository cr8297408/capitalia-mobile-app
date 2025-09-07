import { useState, useCallback } from 'react';
import { accountService } from '@/features/account-management/services/accountService';
import { useAuth } from '@/shared/hooks/useAuth';

export type SaveAccountResult =
  | { ok: true }
  | { ok: false; code: 'not_authenticated' | 'validation_error' | 'limit_reached' | 'error'; message: string };

export const useAddAccount = () => {
  const { user, limits, isPremium } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  const saveAccount = useCallback(
    async ({ name, balance }: { name: string; balance: string }): Promise<SaveAccountResult> => {
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

        await accountService.createAccount({
          userId: user.id,
          name: trimmedName,
          balance: Number(balanceValue.toFixed(2)),
          accountType: 'checking',
          currency: 'USD',
        });

        return { ok: true };
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
