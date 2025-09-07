import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { 
  Home, 
  CreditCard, 
  PieChart, 
  Wallet, 
  Target,
  MoreHorizontal 
} from 'lucide-react-native';

// Stack navigators for each tab
import { DashboardStackNavigator } from './stacks/DashboardStackNavigator';
import { TransactionStackNavigator } from './stacks/TransactionStackNavigator';
import { BudgetStackNavigator } from './stacks/BudgetStackNavigator';
import { AccountStackNavigator } from './stacks/AccountStackNavigator';
import { GoalStackNavigator } from './stacks/GoalStackNavigator';
import { MoreScreen } from '@/features/more/screens/MoreScreen';

import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          paddingBottom: 8,
          paddingTop: 8,
          height: 64,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardStackNavigator}
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Transactions"
        component={TransactionStackNavigator}
        options={{
          title: 'Transactions',
          tabBarIcon: ({ color, size }) => <CreditCard color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Budgets"
        component={BudgetStackNavigator}
        options={{
          title: 'Budgets',
          tabBarIcon: ({ color, size }) => <PieChart color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Accounts"
        component={AccountStackNavigator}
        options={{
          title: 'Accounts',
          tabBarIcon: ({ color, size }) => <Wallet color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Goals"
        component={GoalStackNavigator}
        options={{
          title: 'Goals',
          tabBarIcon: ({ color, size }) => <Target color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="More"
        component={MoreScreen}
        options={{
          title: 'More',
          tabBarIcon: ({ color, size }) => <MoreHorizontal color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
};