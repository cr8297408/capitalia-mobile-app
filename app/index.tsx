import React from 'react';
import { StripeProvider } from '@stripe/stripe-react-native';
import { AppNavigator } from '@/navigation/AppNavigator';
import { stripeConfig } from '@/infrastructure/stripe/stripe-client';

export default function Index() {
  return (
    <StripeProvider
      publishableKey={stripeConfig.publishableKey}
      urlScheme={stripeConfig.urlScheme}
      merchantIdentifier={stripeConfig.merchantIdentifier}
    >
      {/* Expo Router supplies the NavigationContainer; render navigators directly */}
      <AppNavigator />
    </StripeProvider>
  );
}
