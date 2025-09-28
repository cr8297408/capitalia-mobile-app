import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  CreditCard, 
  Calendar, 
  Crown, 
  ExternalLink,
  Settings
} from 'lucide-react-native';
import { useAuth } from '@/shared/hooks/useAuth';
import { PremiumBadge } from '@/shared/components/ui/PremiumBadge';
import { useStripeCheckout } from '../hooks/useStripeCheckout';
import type { RootStackScreenProps } from '@/navigation/types';

type BillingScreenProps = RootStackScreenProps<'Billing'>;

export const BillingScreen: React.FC<BillingScreenProps> = ({ navigation }) => {
  const { user, subscription, isPremium } = useAuth();
  const { createCustomerPortalSession, isProcessing } = useStripeCheckout();

  const handleOpenBillingPortal = async () => {
    if (!user) return;
    
    try {
      await createCustomerPortalSession(user.id);
    } catch (error: any) {
      console.error('Error opening billing portal:', error);
    }
  };

  const handleUpgrade = () => {
    navigation.navigate('SubscriptionPlans');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#059669';
      case 'trialing':
        return '#2563EB';
      case 'past_due':
        return '#F59E0B';
      case 'canceled':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'trialing':
        return 'Free Trial';
      case 'past_due':
        return 'Past Due';
      case 'canceled':
        return 'Cancelled';
      case 'incomplete':
        return 'Incomplete';
      default:
        return status;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <CreditCard color="#2563EB" size={32} />
          <Text style={styles.title}>Billing & Subscription</Text>
          <Text style={styles.subtitle}>
            Manage your subscription and billing information
          </Text>
        </View>

        {/* Current Plan */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Plan</Text>
          
          <View style={styles.planCard}>
            <View style={styles.planHeader}>
              <View style={styles.planInfo}>
                <View style={styles.planTitleRow}>
                  <Text style={styles.planName}>
                    {isPremium ? 'Premium' : 'Free'}
                  </Text>
                  {isPremium && <PremiumBadge size="small" />}
                </View>
                
                {subscription && (
                  <View style={styles.statusContainer}>
                    <View 
                      style={[
                        styles.statusDot, 
                        { backgroundColor: getStatusColor(subscription.status) }
                      ]} 
                    />
                    <Text style={styles.statusText}>
                      {getStatusText(subscription.status)}
                    </Text>
                  </View>
                )}
              </View>
              
              <Crown color={isPremium ? "#F59E0B" : "#9CA3AF"} size={24} />
            </View>

            {subscription && (
              <View style={styles.planDetails}>
                <View style={styles.detailRow}>
                  <Calendar color="#6B7280" size={16} />
                  <Text style={styles.detailText}>
                    Renews on {formatDate(subscription.current_period_end)}
                  </Text>
                </View>
              </View>
            )}

            {!isPremium && (
              <TouchableOpacity 
                style={styles.upgradeButton}
                onPress={handleUpgrade}
              >
                <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Billing Management */}
        {isPremium && subscription && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Billing Management</Text>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleOpenBillingPortal}
              disabled={isProcessing}
            >
              <View style={styles.actionButtonContent}>
                <Settings color="#2563EB" size={20} />
                <View style={styles.actionButtonText}>
                  <Text style={styles.actionButtonTitle}>Manage Billing</Text>
                  <Text style={styles.actionButtonDescription}>
                    Update payment method, view invoices, and manage subscription
                  </Text>
                </View>
                {isProcessing ? (
                  <ActivityIndicator color="#2563EB" size="small" />
                ) : (
                  <ExternalLink color="#6B7280" size={16} />
                )}
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Plan Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Plan Features</Text>
          
          <View style={styles.featuresCard}>
            <View style={styles.featureItem}>
              <Text style={styles.featureLabel}>Transactions</Text>
              <Text style={styles.featureValue}>
                {isPremium ? 'Unlimited' : '100/month'}
              </Text>
            </View>
            
            <View style={styles.featureDivider} />
            
            <View style={styles.featureItem}>
              <Text style={styles.featureLabel}>Accounts</Text>
              <Text style={styles.featureValue}>
                {isPremium ? 'Unlimited' : '3 accounts'}
              </Text>
            </View>
            
            <View style={styles.featureDivider} />
            
            <View style={styles.featureItem}>
              <Text style={styles.featureLabel}>Budgets</Text>
              <Text style={styles.featureValue}>
                {isPremium ? 'Unlimited' : '5 budgets'}
              </Text>
            </View>
            
            <View style={styles.featureDivider} />
            
            <View style={styles.featureItem}>
              <Text style={styles.featureLabel}>Advanced Analytics</Text>
              <Text style={[
                styles.featureValue,
                { color: isPremium ? '#059669' : '#EF4444' }
              ]}>
                {isPremium ? 'Included' : 'Not Available'}
              </Text>
            </View>
            
            <View style={styles.featureDivider} />
            
            <View style={styles.featureItem}>
              <Text style={styles.featureLabel}>Data Export</Text>
              <Text style={[
                styles.featureValue,
                { color: isPremium ? '#059669' : '#EF4444' }
              ]}>
                {isPremium ? 'Included' : 'Not Available'}
              </Text>
            </View>
          </View>
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
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  planCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  planInfo: {
    flex: 1,
  },
  planTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  planName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  planDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#6B7280',
  },
  upgradeButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  upgradeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  actionButton: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  actionButtonText: {
    flex: 1,
  },
  actionButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  actionButtonDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  featuresCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  featureItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  featureDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  featureLabel: {
    fontSize: 16,
    color: '#111827',
  },
  featureValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
});