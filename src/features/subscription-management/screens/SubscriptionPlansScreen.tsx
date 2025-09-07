import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Crown, Check, X } from 'lucide-react-native';
import { supabase } from '@/infrastructure/supabase/client';
import { useAuth } from '@/shared/hooks/useAuth';
import { PremiumBadge } from '@/shared/components/ui/PremiumBadge';
import { useStripeCheckout } from '../hooks/useStripeCheckout';
import type { RootStackScreenProps } from '@/navigation/types';

type SubscriptionPlansScreenProps = RootStackScreenProps<'SubscriptionPlans'>;

interface SubscriptionPlan {
  id: string;
  stripe_price_id: string;
  name: string;
  amount: number;
  currency: string;
  interval: string;
  features: string[];
  max_transactions: number | null;
  max_accounts: number | null;
  max_budgets: number | null;
  can_export_data: boolean;
  can_use_advanced_analytics: boolean;
  can_use_recurring_transactions: boolean;
  can_attach_receipts: boolean;
  can_set_custom_categories: boolean;
}

export const SubscriptionPlansScreen: React.FC<SubscriptionPlansScreenProps> = ({ navigation }) => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  
  const { user, isPremium } = useAuth();
  const { createCheckoutSession, isProcessing } = useStripeCheckout();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('amount', { ascending: true });

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
      Alert.alert('Error', 'Failed to load subscription plans');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPlan = async (plan: SubscriptionPlan) => {
    if (!user) {
      Alert.alert('Error', 'Please log in to subscribe');
      return;
    }

    if (plan.amount === 0) {
      // Free plan - just close the modal
      navigation.goBack();
      return;
    }

    try {
      setSelectedPlan(plan.id);
      await createCheckoutSession(plan.stripe_price_id, user.id);
      // Checkout will handle navigation on success/cancel
    } catch (error) {
      console.error('Checkout error:', error);
      Alert.alert('Error', 'Failed to start checkout process');
    } finally {
      setSelectedPlan(null);
    }
  };

  const formatPrice = (amount: number, currency: string, interval: string) => {
    const price = amount / 100;
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    });
    
    return `${formatter.format(price)}/${interval}`;
  };

  const formatFeatureLimit = (limit: number | null, feature: string) => {
    if (limit === null) return `Unlimited ${feature}`;
    return `Up to ${limit} ${feature}`;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Loading plans...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Crown color="#F59E0B" size={32} />
          <Text style={styles.title}>Choose Your Plan</Text>
          <Text style={styles.subtitle}>
            Unlock premium features and take control of your finances
          </Text>
        </View>

        {/* Plans */}
        <View style={styles.plansContainer}>
          {plans.map((plan) => {
            const isCurrentlySelected = selectedPlan === plan.id;
            const isPremiumPlan = plan.amount > 0;
            const isYearlyPlan = plan.interval === 'year';
            
            return (
              <View 
                key={plan.id} 
                style={[
                  styles.planCard,
                  isPremiumPlan && styles.premiumPlanCard
                ]}
              >
                {/* Plan Header */}
                <View style={styles.planHeader}>
                  <View style={styles.planTitleRow}>
                    <Text style={styles.planName}>{plan.name}</Text>
                    {isPremiumPlan && <PremiumBadge size="small" />}
                  </View>
                  
                  <View style={styles.priceContainer}>
                    <Text style={styles.price}>
                      {formatPrice(plan.amount, plan.currency, plan.interval)}
                    </Text>
                    {isYearlyPlan && (
                      <Text style={styles.savings}>Save 17%</Text>
                    )}
                  </View>
                </View>

                {/* Features */}
                <View style={styles.featuresContainer}>
                  {/* Core limits */}
                  <View style={styles.featureItem}>
                    <Check color="#059669" size={16} />
                    <Text style={styles.featureText}>
                      {formatFeatureLimit(plan.max_transactions, 'transactions')}
                    </Text>
                  </View>
                  
                  <View style={styles.featureItem}>
                    <Check color="#059669" size={16} />
                    <Text style={styles.featureText}>
                      {formatFeatureLimit(plan.max_accounts, 'accounts')}
                    </Text>
                  </View>
                  
                  <View style={styles.featureItem}>
                    <Check color="#059669" size={16} />
                    <Text style={styles.featureText}>
                      {formatFeatureLimit(plan.max_budgets, 'budgets')}
                    </Text>
                  </View>

                  {/* Premium features */}
                  <View style={styles.featureItem}>
                    {plan.can_export_data ? (
                      <Check color="#059669" size={16} />
                    ) : (
                      <X color="#EF4444" size={16} />
                    )}
                    <Text style={[
                      styles.featureText,
                      !plan.can_export_data && styles.unavailableFeature
                    ]}>
                      Data export
                    </Text>
                  </View>

                  <View style={styles.featureItem}>
                    {plan.can_use_advanced_analytics ? (
                      <Check color="#059669" size={16} />
                    ) : (
                      <X color="#EF4444" size={16} />
                    )}
                    <Text style={[
                      styles.featureText,
                      !plan.can_use_advanced_analytics && styles.unavailableFeature
                    ]}>
                      Advanced analytics
                    </Text>
                  </View>

                  <View style={styles.featureItem}>
                    {plan.can_use_recurring_transactions ? (
                      <Check color="#059669" size={16} />
                    ) : (
                      <X color="#EF4444" size={16} />
                    )}
                    <Text style={[
                      styles.featureText,
                      !plan.can_use_recurring_transactions && styles.unavailableFeature
                    ]}>
                      Recurring transactions
                    </Text>
                  </View>

                  <View style={styles.featureItem}>
                    {plan.can_attach_receipts ? (
                      <Check color="#059669" size={16} />
                    ) : (
                      <X color="#EF4444" size={16} />
                    )}
                    <Text style={[
                      styles.featureText,
                      !plan.can_attach_receipts && styles.unavailableFeature
                    ]}>
                      Receipt attachments
                    </Text>
                  </View>
                </View>

                {/* Select Button */}
                <TouchableOpacity
                  style={[
                    styles.selectButton,
                    isPremiumPlan && styles.premiumSelectButton,
                    isCurrentlySelected && styles.selectedButton
                  ]}
                  onPress={() => handleSelectPlan(plan)}
                  disabled={isProcessing || isCurrentlySelected}
                >
                  {isCurrentlySelected ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text style={[
                      styles.selectButtonText,
                      isPremiumPlan && styles.premiumSelectButtonText
                    ]}>
                      {plan.amount === 0 ? 'Current Plan' : 'Upgrade Now'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Cancel anytime. All subscriptions include a 7-day free trial.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  scrollContent: {
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  plansContainer: {
    paddingHorizontal: 24,
    gap: 16,
  },
  planCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  premiumPlanCard: {
    borderColor: '#F59E0B',
    backgroundColor: '#FFFBEB',
  },
  planHeader: {
    marginBottom: 24,
  },
  planTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  planName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 12,
  },
  price: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
  },
  savings: {
    backgroundColor: '#DCFCE7',
    color: '#166534',
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  featuresContainer: {
    marginBottom: 24,
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#111827',
  },
  unavailableFeature: {
    color: '#6B7280',
    textDecorationLine: 'line-through',
  },
  selectButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  premiumSelectButton: {
    backgroundColor: '#2563EB',
  },
  selectedButton: {
    backgroundColor: '#9CA3AF',
  },
  selectButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  premiumSelectButtonText: {
    color: '#ffffff',
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});