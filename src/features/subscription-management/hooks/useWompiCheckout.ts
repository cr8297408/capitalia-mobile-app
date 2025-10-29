/**
 * Use Wompi Checkout Hook
 * Maneja el flujo de checkout y pagos con Wompi
 * Reemplaza useStripeCheckout
 * Following Scope Rule Pattern - Local a subscription-management feature
 */

import { useState } from 'react';
import { Linking, Alert } from 'react-native';
import { supabase } from '@/infrastructure/supabase/client';
import { wompiService } from '@/infrastructure/wompi/wompi-service';
import type { WompiCheckoutSession } from '@/infrastructure/wompi/wompi-client';

export const useWompiCheckout = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutSession, setCheckoutSession] =
    useState<WompiCheckoutSession | null>(null);

  /**
   * Crea una sesión de checkout y abre el enlace de pago de Wompi
   */
  const createCheckoutSession = async (priceId: string, userId: string) => {
    setIsProcessing(true);
    console.log(priceId, userId);
    try {
      // Get user data
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Call Edge Function to create checkout session
      const { data, error } = await supabase.functions.invoke(
        'create-wompi-checkout',
        {
          body: {
            priceId,
            userId,
            email: user.email,
            customerName: user.user_metadata?.first_name || user.email,
          },
        },
      );

      if (error) {
        throw error;
      }

      setCheckoutSession(data);

      // Generar enlace de pago de Wompi
      const paymentLink = wompiService.getPaymentLink({
        reference: data.reference,
        amountInCents: data.amount,
        currency: data.currency,
        redirectUrl: data.redirectUrl,
      });

      // Abrir enlace de pago en el navegador
      const canOpen = await Linking.canOpenURL(paymentLink);
      if (canOpen) {
        await Linking.openURL(paymentLink);
      } else {
        throw new Error('Cannot open payment link');
      }

      return data;
    } catch (error: any) {
      console.error('Error creating checkout session:', JSON.stringify(error));
      Alert.alert(
        'Error',
        error.message || 'Failed to create checkout session. Please try again.',
      );
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Crea un portal de gestión de suscripción
   * Nota: Wompi no tiene portal de cliente como Stripe
   * Redirigimos a la pantalla de facturación de la app
   */
  const createCustomerPortalSession = async () => {
    setIsProcessing(true);
    try {
      // En lugar de abrir un portal externo, mostramos la información en la app
      Alert.alert(
        'Gestionar Suscripción',
        'Puedes gestionar tu suscripción desde esta pantalla',
        [{ text: 'OK' }],
      );

      return { success: true };
    } catch (error: any) {
      console.error('Error accessing customer portal:', error);
      Alert.alert(
        'Error',
        'Failed to access customer portal. Please try again.',
      );
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Cancela la suscripción actual
   */
  const cancelSubscription = async (userId: string) => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        'cancel-subscription-wompi',
        {
          body: { userId },
        },
      );

      if (error) {
        throw error;
      }

      Alert.alert(
        'Suscripción Cancelada',
        'Tu suscripción ha sido cancelada exitosamente',
        [{ text: 'OK' }],
      );

      return data;
    } catch (error: any) {
      console.error('Error canceling subscription:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to cancel subscription. Please try again.',
      );
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Verifica el estado de una transacción
   */
  const checkTransactionStatus = async (transactionId: string) => {
    try {
      const transaction =
        await wompiService.getTransactionStatus(transactionId);
      return transaction;
    } catch (error) {
      console.error('Error checking transaction status:', error);
      throw error;
    }
  };

  return {
    isProcessing,
    checkoutSession,
    createCheckoutSession,
    createCustomerPortalSession,
    cancelSubscription,
    checkTransactionStatus,
  };
};
