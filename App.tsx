import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StripeProvider } from '@stripe/stripe-react-native';
import { AppNavigator } from '@/navigation/AppNavigator';
import { linking } from '@/navigation/linking';
import { stripeConfig } from '@/infrastructure/stripe/stripe-client';

export default function App() {
  return (
    <StripeProvider
      publishableKey={stripeConfig.publishableKey}
      urlScheme={stripeConfig.urlScheme}
      merchantIdentifier={stripeConfig.merchantIdentifier}
    >
      <NavigationContainer linking={linking}>
        <AppNavigator />
      </NavigationContainer>
    </StripeProvider>
  );
}