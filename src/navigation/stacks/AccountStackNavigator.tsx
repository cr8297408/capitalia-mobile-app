import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import { AccountListScreen } from '@/features/account-management/account-list/screens/AccountListScreen';
import { AccountDetailScreen } from '@/features/account-management/account-detail/screens/AccountDetailScreen';
import { AddAccountScreen } from '@/features/account-management/account-add/screens/AddAccountScreen';
import { EditAccountScreen } from '@/features/account-management/account-edit/screens/EditAccountScreen';

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
      <Stack.Screen 
        name="AddAccount" 
        component={AddAccountScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="EditAccount" 
        component={EditAccountScreen}
        options={{ headerShown: true, title: 'Edit Account' }}
      />
    </Stack.Navigator>
  );
};