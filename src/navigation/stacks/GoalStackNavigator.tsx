import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import { GoalListScreen } from '@/features/goal-management/goal-list';
import { AddGoalScreen } from '@/features/goal-management/goal-add';
import { GoalDetailScreen } from '@/features/goal-management/goal-detail';

import type { GoalStackParamList } from '../types';

const Stack = createStackNavigator<GoalStackParamList>();

export const GoalStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="GoalList" component={GoalListScreen} />
      <Stack.Screen 
        name="AddGoal" 
        component={AddGoalScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="GoalDetail" 
        component={GoalDetailScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};