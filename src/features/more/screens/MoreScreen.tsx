import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  User, 
  Settings, 
  Crown, 
  CreditCard, 
  FileText, 
  Shield, 
  HelpCircle, 
  LogOut,
  ChevronRight
} from 'lucide-react-native';
import { useAuth } from '@/shared/hooks/useAuth';
import { PremiumBadge } from '@/shared/components/ui/PremiumBadge';
import { useNavigation } from '@react-navigation/native';
import type { RootStackNavigationProp } from '@/navigation/types';

export const MoreScreen: React.FC = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const { user, isPremium, signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            const { error } = await signOut();
            if (error) {
              Alert.alert('Error', 'Failed to sign out');
            }
          }
        },
      ]
    );
  };

  const handleUpgrade = () => {
    navigation.navigate('SubscriptionPlans');
  };

  const handleBilling = () => {
    navigation.navigate('Billing');
  };

  const handleProfile = () => {
    navigation.navigate('Profile');
  };

  const handleSettings = () => {
    navigation.navigate('Settings');
  };

  const handleExportData = () => {
    if (isPremium) {
      navigation.navigate('DataExport');
    } else {
      handleUpgrade();
    }
  };

  const handlePrivacySecurity = () => {
    navigation.navigate('PrivacySecurity');
  };

  const handleHelpSupport = () => {
    navigation.navigate('HelpSupport');
  };

  const menuItems = [
    {
      icon: User,
      title: 'Profile',
      subtitle: 'Manage your account',
      onPress: handleProfile,
    },
    {
      icon: Settings,
      title: 'Settings',
      subtitle: 'App preferences',
      onPress: handleSettings,
    },
    ...(isPremium ? [
      {
        icon: CreditCard,
        title: 'Billing & Subscription',
        subtitle: 'Manage your premium subscription',
        onPress: handleBilling,
        rightElement: <PremiumBadge size="small" />,
      }
    ] : [
      {
        icon: Crown,
        title: 'Upgrade to Premium',
        subtitle: 'Unlock all features',
        onPress: handleUpgrade,
        rightElement: <PremiumBadge size="small" />,
      }
    ]),
    {
      icon: FileText,
      title: 'Export Data',
      subtitle: isPremium ? 'Download your financial data' : 'Premium feature',
      onPress: handleExportData,
      disabled: !isPremium,
    },
    {
      icon: Shield,
      title: 'Privacy & Security',
      subtitle: 'Manage your privacy settings',
      onPress: handlePrivacySecurity,
    },
    {
      icon: HelpCircle,
      title: 'Help & Support',
      subtitle: 'Get help and contact support',
      onPress: handleHelpSupport,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>More</Text>
          {isPremium && (
            <View style={styles.premiumBadgeContainer}>
              <PremiumBadge />
            </View>
          )}
        </View>

        {/* User Info */}
        <View style={styles.userSection}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <User color="#6B7280" size={24} />
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>
                {user?.user_metadata?.first_name || 'User'}
              </Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
            </View>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.menuItem,
                item.disabled && styles.menuItemDisabled
              ]}
              onPress={item.onPress}
              disabled={item.disabled}
            >
              <View style={styles.menuItemLeft}>
                <View style={[
                  styles.menuItemIcon,
                  item.disabled && styles.menuItemIconDisabled
                ]}>
                  <item.icon 
                    color={item.disabled ? "#9CA3AF" : "#2563EB"} 
                    size={20} 
                  />
                </View>
                <View style={styles.menuItemText}>
                  <Text style={[
                    styles.menuItemTitle,
                    item.disabled && styles.menuItemTitleDisabled
                  ]}>
                    {item.title}
                  </Text>
                  <Text style={styles.menuItemSubtitle}>
                    {item.subtitle}
                  </Text>
                </View>
              </View>
              <View style={styles.menuItemRight}>
                {item.rightElement || (
                  <ChevronRight color="#9CA3AF" size={16} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign Out */}
        <View style={styles.signOutSection}>
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <LogOut color="#EF4444" size={20} />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <View style={styles.footer}>
          <Text style={styles.versionText}>Version 1.0.1</Text>
        </View>
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
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  premiumBadgeContainer: {
    marginLeft: 16,
  },
  userSection: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#6B7280',
  },
  menuSection: {
    paddingTop: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuItemDisabled: {
    opacity: 0.5,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EBF4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuItemIconDisabled: {
    backgroundColor: '#F9FAFB',
  },
  menuItemText: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  menuItemTitleDisabled: {
    color: '#9CA3AF',
  },
  menuItemSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  menuItemRight: {
    marginLeft: 16,
  },
  signOutSection: {
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  signOutText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
  footer: {
    alignItems: 'center',
    paddingTop: 32,
  },
  versionText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});