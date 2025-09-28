import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Plus } from 'lucide-react-native';

import { useAuth } from '@/shared/hooks/useAuth';
import { usePremiumFeatures } from '@/shared/hooks/usePremiumFeatures';
import { PremiumBadge } from '@/shared/components/ui/PremiumBadge';
import { UpgradePrompt } from '@/shared/components/ui/UpgradePrompt';

import { DashboardHeader } from '../components/DashboardHeader';
import { DashboardStats } from '../components/DashboardStats';
import { CategoryExpensesChart } from '../components/CategoryExpensesChart';
import { DashboardInsights } from '../components/DashboardInsights';
import { RecentTransactions } from '../components/RecentTransactions';
import { useDashboard } from '../hooks/useDashboard';
import { useDashboardInsights, PeriodType } from '../hooks/useDashboardInsights';
import { dashboardStyles as styles } from './DashboardScreen.styles';

type RootStackParamList = {
  AddTransaction: { accountId?: string };
  TransactionDetail: { transactionId: string };
  Transactions: undefined;
  // Add other screen params as needed
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user, isPremium } = useAuth();
  const { isPremium: hasPremium } = usePremiumFeatures();
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('this_month');
  
  const {
    recentTransactions,
    isLoading,
    error,
    refresh,
  } = useDashboard();

  const {
    categoryExpenses,
    aiInsights,
    goalProgress,
    loading: insightsLoading,
    refresh: refreshInsights,
    changePeriod,
  } = useDashboardInsights();

  const handleAddTransaction = useCallback(() => {
    navigation.navigate('AddTransaction' as any);
  }, [navigation]);

  const handleViewAllTransactions = useCallback(() => {
    navigation.navigate('Transactions');
  }, [navigation]);

  const handleViewAllGoals = useCallback(() => {
    navigation.navigate('Goals' as any);
  }, [navigation]);

  const handleNotificationsPress = useCallback(() => {
    // TODO: Navigate to notifications screen
    console.log('Notifications pressed');
  }, []);

  const handleSettingsPress = useCallback(() => {
    navigation.navigate('More' as any);
  }, [navigation]);

  const handleRefresh = useCallback(() => {
    refresh();
    refreshInsights();
  }, [refresh, refreshInsights]);

  const handlePeriodChange = useCallback((period: PeriodType) => {
    setSelectedPeriod(period);
    changePeriod(period);
  }, [changePeriod]);

  const isLoadingData = isLoading || insightsLoading;

  const renderContent = () => {
    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error loading dashboard data</Text>
          <TouchableOpacity onPress={handleRefresh} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <>
        {/* Financial Stats */}
        <DashboardStats />

        {/* Category Expenses Chart */}
        <CategoryExpensesChart 
          data={categoryExpenses}
          selectedPeriod={selectedPeriod}
          onPeriodChange={handlePeriodChange}
        />

        {/* AI Insights and Goal Progress */}
        <DashboardInsights 
          aiInsights={aiInsights}
          goalProgress={goalProgress}
          onViewAllGoals={handleViewAllGoals}
          onViewInsight={(insight) => {
            console.log('Insight pressed:', insight);
            // TODO: Navigate to specific insight details
          }}
        />

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Transacciones Recientes</Text>
            <TouchableOpacity onPress={handleViewAllTransactions}>
              <Text style={styles.viewAllText}>Ver Todas</Text>
            </TouchableOpacity>
          </View>
          <RecentTransactions 
            transactions={recentTransactions}
            isLoading={isLoading}
          />
        </View>

        {/* Premium Upgrade Prompt */}
        {!hasPremium && !isLoadingData && (
          <UpgradePrompt 
            feature="desbloquear todas las funciones premium" 
            currentLimit="funciones básicas"
            style={styles.upgradePrompt}
          />
        )}
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl 
            refreshing={isLoadingData && !error} 
            onRefresh={handleRefresh}
            colors={['#3B82F6']}
            tintColor="#3B82F6"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Enhanced Header */}
        <DashboardHeader
          onNotificationsPress={handleNotificationsPress}
          onSettingsPress={handleSettingsPress}
          notificationCount={3} // TODO: Get from notifications service
        />

        {renderContent()}
      </ScrollView>
      
      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={handleAddTransaction}
        activeOpacity={0.8}
      >
        <Plus size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};
