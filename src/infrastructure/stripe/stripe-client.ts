import { StripeProvider } from '@stripe/stripe-react-native';

const stripePublishableKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!;

if (!stripePublishableKey) {
  throw new Error('Missing Stripe publishable key');
}

export const stripeConfig = {
  publishableKey: stripePublishableKey,
  urlScheme: 'finance-app',
  merchantIdentifier: 'merchant.com.yourapp.finance',
};

// Types for Stripe responses
export interface StripeCheckoutSession {
  sessionId: string;
  url: string;
}

export interface StripeCustomerPortal {
  url: string;
}

export interface SubscriptionLimits {
  maxTransactions: number | null;
  maxAccounts: number | null;
  maxBudgets: number | null;
  maxGoals: number | null;
  canExportData: boolean;
  canUseAdvancedAnalytics: boolean;
  canUseRecurringTransactions: boolean;
  canAttachReceipts: boolean;
  canSetCustomCategories: boolean;
}

export interface SubscriptionStatus {
  subscription: any;
  isPremium: boolean;
  limits: SubscriptionLimits;
}