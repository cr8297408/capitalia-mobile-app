import { useState } from 'react';
import { Alert, Linking } from 'react-native';
import { supabase } from '@/infrastructure/supabase/client';

export const useStripeCheckout = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const createCheckoutSession = async (priceId: string, userId: string) => {
    try {
      setIsProcessing(true);

      // Call edge function to create checkout session
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          priceId,
          userId,
        }
      });

      if (error) throw error;

      // Open checkout URL
      if (data.url) {
        const canOpen = await Linking.canOpenURL(data.url);
        if (canOpen) {
          await Linking.openURL(data.url);
        } else {
          throw new Error('Unable to open checkout URL');
        }
      } else {
        throw new Error('No checkout URL received');
      }

    } catch (error) {
      console.error('Checkout error:', error);
      Alert.alert('Checkout Error', 'Failed to start checkout process. Please try again.');
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const createCustomerPortalSession = async (userId: string) => {
    try {
      setIsProcessing(true);

      // Call edge function to create customer portal session
      const { data, error } = await supabase.functions.invoke('create-customer-portal', {
        body: { userId }
      });

      if (error) throw error;

      // Open portal URL
      if (data.url) {
        const canOpen = await Linking.canOpenURL(data.url);
        if (canOpen) {
          await Linking.openURL(data.url);
        } else {
          throw new Error('Unable to open portal URL');
        }
      } else {
        throw new Error('No portal URL received');
      }

    } catch (error) {
      console.error('Portal error:', error);
      Alert.alert('Portal Error', 'Failed to open billing portal. Please try again.');
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    createCheckoutSession,
    createCustomerPortalSession,
    isProcessing,
  };
};