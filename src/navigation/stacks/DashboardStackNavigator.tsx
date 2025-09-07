import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import { DashboardScreen } from '@/features/dashboard/screens/DashboardScreen';

const Stack = createStackNavigator();

export const DashboardStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DashboardMain" component={DashboardScreen} />
    </Stack.Navigator>
  );
};