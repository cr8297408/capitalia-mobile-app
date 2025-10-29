/**
 * Wompi Client Configuration
 * Reemplaza Stripe como procesador de pagos
 * Following Scope Rule Pattern - Infrastructure (usado por múltiples features)
 */

const wompiPublicKey = process.env.EXPO_PUBLIC_WOMPI_PUBLIC_KEY!;

if (!wompiPublicKey) {
  console.warn('⚠️ Missing Wompi public key - Payment features will not work');
}

export const wompiConfig = {
  publicKey: wompiPublicKey,
  apiUrl:
    process.env.EXPO_PUBLIC_WOMPI_API_URL || 'https://production.wompi.co/v1',
  currency: 'COP', // Colombian Pesos
  merchantId: process.env.EXPO_PUBLIC_WOMPI_MERCHANT_ID || '',
};

// Types for Wompi responses
export interface WompiCheckoutSession {
  success: boolean;
  publicKey: string;
  amount: number;
  currency: string;
  reference: string;
  customerEmail: string;
  redirectUrl: string;
  planId: string;
  wompiCustomerId: string;
}

export interface WompiTransaction {
  id: string;
  reference: string;
  status: 'APPROVED' | 'DECLINED' | 'PENDING' | 'ERROR' | 'VOIDED';
  amount_in_cents: number;
  currency: string;
  customer_email: string;
  payment_method_type: string;
  payment_method: {
    type: string;
    extra: {
      brand?: string;
      last_four?: string;
    };
  };
  created_at: string;
}

export interface WompiAcceptanceToken {
  acceptance_token: string;
  permalink: string;
}

export interface WompiPaymentSourceToken {
  token: string;
  payment_method: {
    type: string;
    extra: {
      name: string;
      brand: string;
      last_four: string;
      exp_month: string;
      exp_year: string;
    };
  };
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

export const defaultFreeLimits: SubscriptionLimits = {
  maxTransactions: 1000000,
  maxAccounts: 3,
  maxBudgets: 5,
  maxGoals: 3,
  canExportData: false,
  canUseAdvancedAnalytics: false,
  canUseRecurringTransactions: false,
  canAttachReceipts: false,
  canSetCustomCategories: false,
};
