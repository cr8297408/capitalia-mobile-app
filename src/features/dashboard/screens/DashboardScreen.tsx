import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/shared/hooks/useAuth';
import { PremiumBadge } from '@/shared/components/ui/PremiumBadge';
import { UpgradePrompt } from '@/shared/components/ui/UpgradePrompt';

export const DashboardScreen: React.FC = () => {
  const { user, isPremium } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>
            Welcome back{user?.user_metadata?.first_name ? `, ${user.user_metadata.first_name}` : ''}!
          </Text>
          {isPremium && (
            <View style={styles.premiumBadgeContainer}>
              <PremiumBadge />
            </View>
          )}
        </View>

        {/* Quick Stats Placeholder */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Financial Overview</Text>
          <Text style={styles.placeholder}>
            Dashboard coming soon with financial insights and charts
          </Text>
        </View>

        {/* Upgrade Prompt for Free Users */}
        {!isPremium && (
          <UpgradePrompt 
            feature="unlimited transactions and advanced analytics"
            description="Unlock the full potential of your financial management with premium features."
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  premiumBadgeContainer: {
    marginLeft: 16,
  },
  statsContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  placeholder: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    padding: 40,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
});