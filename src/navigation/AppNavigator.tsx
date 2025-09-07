import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '@/shared/hooks/useAuth';
import { LoadingScreen } from '@/shared/components/ui/LoadingScreen';

// Navigators
import { AuthNavigator } from './AuthNavigator';
import { MainTabNavigator } from './MainTabNavigator';

// Modal screens
import { AddTransactionScreen } from '@/features/transaction-tracking/screens/AddTransactionScreen';
import { EditTransactionScreen } from '@/features/transaction-tracking/screens/EditTransactionScreen';
import { TransactionDetailScreen } from '@/features/transaction-tracking/screens/TransactionDetailScreen';
import { AddAccountScreen } from '@/features/account-management/account-add/screens/AddAccountScreen';
import { EditAccountScreen } from '@/features/account-management/screens/EditAccountScreen';
import { AddBudgetScreen } from '@/features/budget-management/screens/AddBudgetScreen';
import { EditBudgetScreen } from '@/features/budget-management/screens/EditBudgetScreen';
import { AddGoalScreen } from '@/features/goal-tracking/screens/AddGoalScreen';
import { EditGoalScreen } from '@/features/goal-tracking/screens/EditGoalScreen';

// Subscription screens
import { SubscriptionPlansScreen } from '@/features/subscription-management/screens/SubscriptionPlansScreen';
import { BillingScreen } from '@/features/subscription-management/screens/BillingScreen';
import { SubscriptionSuccessScreen } from '@/features/subscription-management/screens/SubscriptionSuccessScreen';

import type { RootStackParamList } from './types';

const Stack = createStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <>
          {/* Main App */}
          <Stack.Screen name="Main" component={MainTabNavigator} />
          
          {/* Modal Screens */}
          <Stack.Group screenOptions={{ presentation: 'modal' }}>
            <Stack.Screen
              name="TransactionDetail"
              component={TransactionDetailScreen}
              options={{ headerShown: true, title: 'Transaction Details' }}
            />
            <Stack.Screen
              name="AddTransaction"
              component={AddTransactionScreen}
              options={{ headerShown: true, title: 'Add Transaction' }}
            />
            <Stack.Screen
              name="EditTransaction"
              component={EditTransactionScreen}
              options={{ headerShown: true, title: 'Edit Transaction' }}
            />
            <Stack.Screen
              name="AddAccount"
              component={AddAccountScreen}
              options={{ headerShown: true, title: 'Add Account' }}
            />
            <Stack.Screen
              name="EditAccount"
              component={EditAccountScreen}
              options={{ headerShown: true, title: 'Edit Account' }}
            />
            <Stack.Screen
              name="AddBudget"
              component={AddBudgetScreen}
              options={{ headerShown: true, title: 'Add Budget' }}
            />
            <Stack.Screen
              name="EditBudget"
              component={EditBudgetScreen}
              options={{ headerShown: true, title: 'Edit Budget' }}
            />
            <Stack.Screen
              name="AddGoal"
              component={AddGoalScreen}
              options={{ headerShown: true, title: 'Add Goal' }}
            />
            <Stack.Screen
              name="EditGoal"
              component={EditGoalScreen}
              options={{ headerShown: true, title: 'Edit Goal' }}
            />
            
            {/* Subscription Modal Screens */}
            <Stack.Screen
              name="SubscriptionPlans"
              component={SubscriptionPlansScreen}
              options={{ headerShown: true, title: 'Choose Your Plan' }}
            />
            <Stack.Screen
              name="Billing"
              component={BillingScreen}
              options={{ headerShown: true, title: 'Billing & Subscription' }}
            />
            <Stack.Screen
              name="SubscriptionSuccess"
              component={SubscriptionSuccessScreen}
              options={{ headerShown: true, title: 'Welcome to Premium!' }}
            />
          </Stack.Group>
        </>
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
};