import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CheckCircle, Crown, ArrowRight } from 'lucide-react-native';
import { useAuth } from '@/shared/hooks/useAuth';
import { PremiumBadge } from '@/shared/components/ui/PremiumBadge';
import type { RootStackScreenProps } from '@/navigation/types';

type SuccessScreenProps = RootStackScreenProps<'SubscriptionSuccess'>;

export const SubscriptionSuccessScreen: React.FC<SuccessScreenProps> = ({ navigation, route }) => {
  const { refreshSubscription } = useAuth();
  const scaleValue = new Animated.Value(0);
  
  useEffect(() => {
    // Refresh subscription status
    refreshSubscription();
    
    // Animate success icon
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [refreshSubscription]);

  const handleContinue = () => {
    // Navigate to dashboard or close modal
    navigation.navigate('Main', { screen: 'Dashboard' });
  };

  const handleViewBilling = () => {
    navigation.navigate('Billing');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Success Animation */}
        <Animated.View 
          style={[
            styles.successIcon,
            { transform: [{ scale: scaleValue }] }
          ]}
        >
          <CheckCircle color="#059669" size={64} />
        </Animated.View>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Welcome to Premium!</Text>
            <PremiumBadge size="large" />
          </View>
          <Text style={styles.subtitle}>
            Your subscription is now active. Enjoy unlimited access to all premium features!
          </Text>
        </View>

        {/* Features Unlocked */}
        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>You now have access to:</Text>
          
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Crown color="#F59E0B" size={16} />
              <Text style={styles.featureText}>Unlimited transactions</Text>
            </View>
            
            <View style={styles.featureItem}>
              <Crown color="#F59E0B" size={16} />
              <Text style={styles.featureText}>Unlimited accounts & budgets</Text>
            </View>
            
            <View style={styles.featureItem}>
              <Crown color="#F59E0B" size={16} />
              <Text style={styles.featureText}>Advanced analytics & insights</Text>
            </View>
            
            <View style={styles.featureItem}>
              <Crown color="#F59E0B" size={16} />
              <Text style={styles.featureText}>Data export capabilities</Text>
            </View>
            
            <View style={styles.featureItem}>
              <Crown color="#F59E0B" size={16} />
              <Text style={styles.featureText}>Recurring transactions</Text>
            </View>
            
            <View style={styles.featureItem}>
              <Crown color="#F59E0B" size={16} />
              <Text style={styles.featureText}>Receipt attachments</Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={handleContinue}
          >
            <Text style={styles.primaryButtonText}>Start Using Premium</Text>
            <ArrowRight color="#ffffff" size={20} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={handleViewBilling}
          >
            <Text style={styles.secondaryButtonText}>View Billing Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successIcon: {
    marginBottom: 32,
    padding: 16,
    backgroundColor: '#ECFDF5',
    borderRadius: 50,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  featuresContainer: {
    width: '100%',
    marginBottom: 40,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 24,
  },
  featuresList: {
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#92400E',
    fontWeight: '500',
  },
  actions: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#2563EB',
    fontSize: 16,
    fontWeight: '600',
  },
});