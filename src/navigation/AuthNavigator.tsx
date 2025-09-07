import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import { LoginScreen } from '@/features/authentication/screens/LoginScreen';
import { RegisterScreen } from '@/features/authentication/screens/RegisterScreen';
import { ForgotPasswordScreen } from '@/features/authentication/screens/ForgotPasswordScreen';

import type { AuthStackParamList } from './types';

const Stack = createStackNavigator<AuthStackParamList>();

export const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#ffffff' },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
};