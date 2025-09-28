import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import { BudgetListScreen } from '@/features/budget-management/budget-list/screens';
import { BudgetDetailScreen } from '@/features/budget-management/budget-detail/screens';

import type { BudgetStackParamList } from '../types';

const Stack = createStackNavigator<BudgetStackParamList>();

export const BudgetStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BudgetList" component={BudgetListScreen} />
      <Stack.Screen 
        name="BudgetDetail" 
        component={BudgetDetailScreen}
        options={{ headerShown: true, title: 'Budget Details' }}
      />
    </Stack.Navigator>
  );
};