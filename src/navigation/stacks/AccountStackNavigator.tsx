import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import { AccountListScreen } from '@/features/account-management/screens/AccountListScreen';
import { AccountDetailScreen } from '@/features/account-management/AccountDetail/screens/AccountDetailScreen';

import type { AccountStackParamList } from '../types';

const Stack = createStackNavigator<AccountStackParamList>();

export const AccountStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AccountList" component={AccountListScreen} />
      <Stack.Screen 
        name="AccountDetail" 
        component={AccountDetailScreen}
        options={{ headerShown: true, title: 'Account Details' }}
      />
    </Stack.Navigator>
  );
};