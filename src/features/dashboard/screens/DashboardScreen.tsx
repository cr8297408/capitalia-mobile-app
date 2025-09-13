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
    totalBalance,
    monthlyIncome,
    monthlyExpenses,
    savingsRate,
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
        <DashboardStats 
          totalBalance={totalBalance}
          monthlyIncome={monthlyIncome}
          monthlyExpenses={monthlyExpenses}
          savingsRate={savingsRate}
          isLoading={isLoading}
        />

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 8,
  },
  greeting: {
    fontSize: 16,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  userName: {
    fontSize: 22,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    marginRight: 8,
  },
  premiumBadge: {
    marginLeft: 8,
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: 'Inter-Medium',
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  upgradePrompt: {
    margin: 16,
    marginTop: 8,
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
  },
  viewAllText: {
    color: '#3B82F6',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  statsContainer: {
    paddingHorizontal: 24,
    marginVertical: 16,
  },
  placeholder: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
});
