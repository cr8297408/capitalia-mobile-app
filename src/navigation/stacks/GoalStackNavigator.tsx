import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import { GoalListScreen } from '@/features/goal-tracking/screens/GoalListScreen';
import { GoalDetailScreen } from '@/features/goal-tracking/screens/GoalDetailScreen';

import type { GoalStackParamList } from '../types';

const Stack = createStackNavigator<GoalStackParamList>();

export const GoalStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="GoalList" component={GoalListScreen} />
      <Stack.Screen 
        name="GoalDetail" 
        component={GoalDetailScreen}
        options={{ headerShown: true, title: 'Goal Details' }}
      />
    </Stack.Navigator>
  );
};