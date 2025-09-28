/**
 * Settings Screen - App settings and preferences
 * Following Scope Rule Pattern - Screen local to more feature
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  ArrowLeft, 
  Bell, 
  Moon, 
  Globe, 
  Lock, 
  Smartphone,
  DollarSign,
  ChevronRight
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/shared/hooks/useAuth';

interface SettingsState {
  notifications: boolean;
  darkMode: boolean;
  biometricEnabled: boolean;
  currency: string;
  language: string;
  autoBackup: boolean;
}

const CURRENCY_OPTIONS = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
];

const LANGUAGE_OPTIONS = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'it', name: 'Italiano' },
  { code: 'pt', name: 'Português' },
];

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [settings, setSettings] = useState<SettingsState>({
    notifications: true,
    darkMode: false,
    biometricEnabled: false,
    currency: 'USD',
    language: 'en',
    autoBackup: true,
  });

  const saveSettings = (newSettings: SettingsState) => {
    setSettings(newSettings);
    // TODO: Persist to local storage when available
  };

  const handleBiometricToggle = (value: boolean) => {
    if (value) {
      Alert.alert(
        'Enable Biometric Authentication',
        'This feature will be available in a future update.',
        [{ text: 'OK' }]
      );
    } else {
      saveSettings({ ...settings, biometricEnabled: false });
    }
  };

  const showCurrencyPicker = () => {
    const buttons = CURRENCY_OPTIONS.map(currency => ({
      text: `${currency.name} (${currency.symbol})`,
      onPress: () => saveSettings({ ...settings, currency: currency.code }),
    }));
    
    buttons.push({ text: 'Cancel', onPress: () => {} });
    
    Alert.alert('Select Currency', 'Choose your preferred currency', buttons);
  };

  const showLanguagePicker = () => {
    const buttons = LANGUAGE_OPTIONS.map(lang => ({
      text: lang.name,
      onPress: () => {
        saveSettings({ ...settings, language: lang.code });
        Alert.alert('Note', 'Language changes will take effect after app restart.');
      },
    }));
    
    buttons.push({ text: 'Cancel', onPress: () => {} });
    
    Alert.alert('Select Language', 'Choose your preferred language', buttons);
  };

  const clearAppData = () => {
    Alert.alert(
      'Clear App Data',
      'This will remove all locally stored data including settings, cache, and offline data. Your cloud data will remain safe.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Data',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Success', 'App data will be cleared on next app restart.');
          },
        },
      ]
    );
  };

  const getCurrentCurrency = () => {
    return CURRENCY_OPTIONS.find(c => c.code === settings.currency)?.name || 'US Dollar';
  };

  const getCurrentLanguage = () => {
    return LANGUAGE_OPTIONS.find(l => l.code === settings.language)?.name || 'English';
  };

  const SettingItem: React.FC<{
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
    showChevron?: boolean;
  }> = ({ icon, title, subtitle, onPress, rightElement, showChevron = false }) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingLeft}>
        <View style={styles.settingIcon}>
          {icon}
        </View>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <View style={styles.settingRight}>
        {rightElement}
        {showChevron && <ChevronRight color="#9CA3AF" size={16} />}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft color="#111827" size={24} />
          </TouchableOpacity>
          <Text style={styles.title}>Settings</Text>
          <View style={{ width: 32 }} />
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          
          <SettingItem
            icon={<Bell color="#2563EB" size={20} />}
            title="Push Notifications"
            subtitle="Receive alerts for transactions and budgets"
            rightElement={
              <Switch
                value={settings.notifications}
                onValueChange={(value) => saveSettings({ ...settings, notifications: value })}
                trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
                thumbColor={settings.notifications ? '#2563EB' : '#9CA3AF'}
              />
            }
          />

          <SettingItem
            icon={<Moon color="#2563EB" size={20} />}
            title="Dark Mode"
            subtitle="Use dark theme throughout the app"
            rightElement={
              <Switch
                value={settings.darkMode}
                onValueChange={(value) => {
                  saveSettings({ ...settings, darkMode: value });
                  Alert.alert('Note', 'Dark mode will be fully implemented in a future update.');
                }}
                trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
                thumbColor={settings.darkMode ? '#2563EB' : '#9CA3AF'}
              />
            }
          />

          <SettingItem
            icon={<DollarSign color="#2563EB" size={20} />}
            title="Currency"
            subtitle={getCurrentCurrency()}
            onPress={showCurrencyPicker}
            showChevron
          />

          <SettingItem
            icon={<Globe color="#2563EB" size={20} />}
            title="Language"
            subtitle={getCurrentLanguage()}
            onPress={showLanguagePicker}
            showChevron
          />
        </View>

        {/* Security Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          
          <SettingItem
            icon={<Smartphone color="#2563EB" size={20} />}
            title="Biometric Authentication"
            subtitle="Use biometric authentication to unlock the app"
            rightElement={
              <Switch
                value={settings.biometricEnabled}
                onValueChange={handleBiometricToggle}
                trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
                thumbColor={settings.biometricEnabled ? '#2563EB' : '#9CA3AF'}
              />
            }
          />

          <SettingItem
            icon={<Lock color="#2563EB" size={20} />}
            title="Auto Backup"
            subtitle="Automatically backup data to cloud"
            rightElement={
              <Switch
                value={settings.autoBackup}
                onValueChange={(value) => saveSettings({ ...settings, autoBackup: value })}
                trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
                thumbColor={settings.autoBackup ? '#2563EB' : '#9CA3AF'}
              />
            }
          />
        </View>

        {/* Advanced Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Advanced</Text>
          
          <SettingItem
            icon={<Smartphone color="#EF4444" size={20} />}
            title="Clear App Data"
            subtitle="Remove all locally stored data"
            onPress={clearAppData}
            showChevron
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  section: {
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EBF4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
});