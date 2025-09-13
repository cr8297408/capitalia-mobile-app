import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import { TransactionListScreen } from '@/features/transaction-tracking/transaction-list/screens/TransactionListScreen';
import { TransactionDetailScreen } from '@/features/transaction-tracking/transaction-detail/screens/TransactionDetailScreen';

import type { TransactionStackParamList } from '../types';

const Stack = createStackNavigator<TransactionStackParamList>();

export const TransactionStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TransactionList" component={TransactionListScreen} />
      <Stack.Screen 
        name="TransactionDetail" 
        component={TransactionDetailScreen}
        options={{ headerShown: true, title: 'Transaction Details' }}
      />
    </Stack.Navigator>
  );
};