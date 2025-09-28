import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/infrastructure/supabase/client';
import type { SubscriptionLimits } from '@/infrastructure/stripe/stripe-client';

interface PremiumState {
  subscription: any;
  isPremium: boolean;
  limits: SubscriptionLimits;
  isLoading: boolean;
}

const DEFAULT_LIMITS: SubscriptionLimits = {
  maxTransactions: 10000000,  // Reasonable limit for free tier
  maxAccounts: 3,
  maxBudgets: 5,
  maxGoals: 3,
  canExportData: false,
  canUseAdvancedAnalytics: false,
  canUseRecurringTransactions: false,
  canAttachReceipts: false,
  canSetCustomCategories: false,
};

export const usePremiumFeatures = () => {
  const [premiumState, setPremiumState] = useState<PremiumState>({
    subscription: null,
    isPremium: false,
    limits: DEFAULT_LIMITS,
    isLoading: true,
  });

  const fetchSubscriptionStatus = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setPremiumState({
          subscription: null,
          isPremium: false,
          limits: DEFAULT_LIMITS,
          isLoading: false,
        });
        return;
      }

      // Call edge function to get subscription status
      const { data, error } = await supabase.functions.invoke('get-subscription-status', {
        body: { userId: user.id }
      });
      console.log("🚀 ~ usePremiumFeatures ~ data:", data)
      console.log("🚀 ~ usePremiumFeatures ~ error:", error)
      
      if (error) {
        console.error('Error fetching subscription status:', error);
        setPremiumState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      setPremiumState({
        subscription: data.subscription,
        isPremium: data.isPremium,
        limits: data.limits,
        isLoading: false,
      });

    } catch (error: any) {
      console.error('Error in fetchSubscriptionStatus:', error);
      setPremiumState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  useEffect(() => {
    fetchSubscriptionStatus();

    // Listen for subscription changes via realtime
    const subscription = supabase
      .channel('subscription_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'subscriptions',
      }, () => {
        fetchSubscriptionStatus();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchSubscriptionStatus]);

  // Helper functions for checking limits
  const canCreateTransaction = useCallback(async (currentCount: number) => {
    if (premiumState.limits.maxTransactions === null) return true;
    return currentCount < premiumState.limits.maxTransactions;
  }, [premiumState.limits.maxTransactions]);

  const canCreateAccount = useCallback(async (currentCount: number) => {
    if (premiumState.limits.maxAccounts === null) return true;
    return currentCount < premiumState.limits.maxAccounts;
  }, [premiumState.limits.maxAccounts]);

  const canCreateBudget = useCallback(async (currentCount: number) => {
    if (premiumState.limits.maxBudgets === null) return true;
    return currentCount < premiumState.limits.maxBudgets;
  }, [premiumState.limits.maxBudgets]);

  const checkFeatureAccess = useCallback((feature: keyof SubscriptionLimits) => {
    return premiumState.limits[feature] === true;
  }, [premiumState.limits]);

  return {
    ...premiumState,
    refreshSubscription: fetchSubscriptionStatus,
    canCreateTransaction,
    canCreateAccount,
    canCreateBudget,
    checkFeatureAccess,
  };
};