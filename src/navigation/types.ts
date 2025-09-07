import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import type { StackScreenProps } from '@react-navigation/stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

// Root Stack Navigator Types
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  // Modal screens
  TransactionList: { accountId?: string };
  TransactionDetail: { transactionId: string };
  AddTransaction: { accountId?: string };
  EditTransaction: { transactionId: string };
  AddAccount: undefined;
  EditAccount: { accountId: string };
  AddBudget: undefined;
  EditBudget: { budgetId: string };
  AddGoal: undefined;
  EditGoal: { goalId: string };
  // Subscription screens
  SubscriptionPlans: undefined;
  Billing: undefined;
  SubscriptionSuccess: { sessionId?: string };
};

// Auth Stack Navigator Types
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

// Main Tab Navigator Types
export type MainTabParamList = {
  Dashboard: undefined;
  Transactions: NavigatorScreenParams<TransactionStackParamList>;
  Budgets: NavigatorScreenParams<BudgetStackParamList>;
  Accounts: NavigatorScreenParams<AccountStackParamList>;
  Goals: NavigatorScreenParams<GoalStackParamList>;
  More: undefined;
};

// Nested Stack Navigator Types
export type TransactionStackParamList = {
  TransactionList: undefined;
  TransactionDetail: { transactionId: string };
};

export type BudgetStackParamList = {
  BudgetList: undefined;
  BudgetDetail: { budgetId: string };
};

export type AccountStackParamList = {
  AccountList: undefined;
  AccountDetail: { accountId: string };
  AddAccount: undefined;
  EditAccount: { accountId: string };
};

export type GoalStackParamList = {
  GoalList: undefined;
  GoalDetail: { goalId: string };
};

// Screen Props Types
export type RootStackScreenProps<T extends keyof RootStackParamList> = StackScreenProps<
  RootStackParamList,
  T
>;

export type AuthStackScreenProps<T extends keyof AuthStackParamList> = CompositeScreenProps<
  StackScreenProps<AuthStackParamList, T>,
  RootStackScreenProps<keyof RootStackParamList>
>;

export type MainTabScreenProps<T extends keyof MainTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, T>,
  RootStackScreenProps<keyof RootStackParamList>
>;

export type TransactionStackScreenProps<T extends keyof TransactionStackParamList> = CompositeScreenProps<
  StackScreenProps<TransactionStackParamList, T>,
  MainTabScreenProps<keyof MainTabParamList>
>;

export type AccountStackScreenProps<T extends keyof AccountStackParamList> = CompositeScreenProps<
  StackScreenProps<AccountStackParamList, T>,
  MainTabScreenProps<keyof MainTabParamList>
>;

// Navigation prop types for hooks
export type RootStackNavigationProp = RootStackScreenProps<keyof RootStackParamList>['navigation'];
export type MainTabNavigationProp = MainTabScreenProps<keyof MainTabParamList>['navigation'];

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}