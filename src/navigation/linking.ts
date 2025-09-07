import type { LinkingOptions } from '@react-navigation/native';
import type { RootStackParamList } from './types';

export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['finance-app://', 'https://yourapp.com'],
  config: {
    screens: {
      Auth: {
        screens: {
          Login: 'auth/login',
          Register: 'auth/register',
          ForgotPassword: 'auth/forgot-password',
        },
      },
      Main: {
        screens: {
          Dashboard: 'dashboard',
          Transactions: {
            screens: {
              TransactionList: 'transactions',
              TransactionDetail: 'transactions/:transactionId',
            },
          },
          Budgets: {
            screens: {
              BudgetList: 'budgets',
              BudgetDetail: 'budgets/:budgetId',
            },
          },
          Accounts: {
            screens: {
              AccountList: 'accounts',
              AccountDetail: 'accounts/:accountId',
            },
          },
          Goals: {
            screens: {
              GoalList: 'goals',
              GoalDetail: 'goals/:goalId',
            },
          },
          More: 'more',
        },
      },
      // Modal screens
      TransactionDetail: 'transaction/:transactionId',
      AddTransaction: 'add-transaction',
      EditTransaction: 'edit-transaction/:transactionId',
      AddAccount: 'add-account',
      EditAccount: 'edit-account/:accountId',
      AddBudget: 'add-budget',
      EditBudget: 'edit-budget/:budgetId',
      AddGoal: 'add-goal',
      EditGoal: 'edit-goal/:goalId',
      // Subscription screens - for Stripe return URLs
      SubscriptionPlans: 'subscription/plans',
      Billing: 'subscription/billing',
      SubscriptionSuccess: 'subscription/success',
    },
  },
};