import React, { useCallback } from 'react';
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

import { DashboardStats } from '../components/DashboardStats';
import { RecentTransactions } from '../components/RecentTransactions';
import { useDashboard } from '../hooks/useDashboard';
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
  
  const {
    recentTransactions,
    isLoading,
    error,
    refresh,
  } = useDashboard();

  const handleAddTransaction = useCallback(() => {
    navigation.navigate('AddTransaction' as any);
  }, [navigation]);

  const handleViewAllTransactions = useCallback(() => {
    navigation.navigate('Transactions');
  }, [navigation]);

  const handleRefresh = useCallback(() => {
    refresh();
  }, [refresh]);

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
        <DashboardStats />

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity onPress={handleViewAllTransactions}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <RecentTransactions 
            transactions={recentTransactions}
            isLoading={isLoading}
          />
        </View>

        {!hasPremium && !isLoading && (
          <UpgradePrompt 
            feature="unlock all premium features" 
            currentLimit="3 accounts"
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
            refreshing={isLoading && !error} 
            onRefresh={handleRefresh}
            colors={['#3B82F6']}
            tintColor="#3B82F6"
          />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user?.user_metadata?.name || 'User'}</Text>
              {isPremium && <PremiumBadge />}
            </View>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {renderContent()}
      </ScrollView>
      
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
