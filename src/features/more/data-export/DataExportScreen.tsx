/**
 * Data Export Screen - Export financial data functionality
 * Following Scope Rule Pattern - Screen local to more feature
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  ArrowLeft, 
  Download, 
  FileSpreadsheet,
  Calendar,
  Database,
  Share,
  CheckCircle
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/shared/hooks/useAuth';

interface ExportOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  format: 'CSV' | 'JSON';
  dataType: 'transactions' | 'accounts' | 'budgets' | 'goals' | 'all';
}

const EXPORT_OPTIONS: ExportOption[] = [
  {
    id: 'transactions',
    title: 'Transactions',
    description: 'All your income and expense records with categories',
    icon: <FileSpreadsheet color="#10B981" size={20} />,
    format: 'CSV',
    dataType: 'transactions'
  },
  {
    id: 'accounts',
    title: 'Accounts',
    description: 'Bank accounts, credit cards, and cash accounts',
    icon: <Database color="#3B82F6" size={20} />,
    format: 'CSV',
    dataType: 'accounts'
  },
  {
    id: 'budgets',
    title: 'Budgets',
    description: 'Budget settings and spending history',
    icon: <Calendar color="#F59E0B" size={20} />,
    format: 'CSV',
    dataType: 'budgets'
  },
  {
    id: 'goals',
    title: 'Goals',
    description: 'Financial goals and progress tracking',
    icon: <CheckCircle color="#8B5CF6" size={20} />,
    format: 'CSV',
    dataType: 'goals'
  },
  {
    id: 'complete',
    title: 'Complete Backup',
    description: 'All data in JSON format for complete backup',
    icon: <Download color="#EF4444" size={20} />,
    format: 'JSON',
    dataType: 'all'
  }
];

export const DataExportScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [exportingItems, setExportingItems] = useState<Set<string>>(new Set());

  const exportData = async (option: ExportOption) => {
    setExportingItems(prev => new Set([...prev, option.id]));

    try {
      // Simulate API call for data export
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real app, you would:
      // 1. Fetch the data from Supabase
      // 2. Format it as CSV/JSON
      // 3. Use expo-sharing to share the file
      
      Alert.alert(
        'Export Complete',
        `Your ${option.title.toLowerCase()} data has been prepared. In a real implementation, this would generate a ${option.format} file that you can share or save.`,
        [
          {
            text: 'Share File',
            onPress: () => {
              // TODO: Use expo-sharing to share the generated file
              Alert.alert('File Shared', 'File sharing functionality would be implemented here.');
            }
          },
          { text: 'OK' }
        ]
      );
    } catch (error) {
      Alert.alert('Export Failed', 'There was an error exporting your data. Please try again.');
    } finally {
      setExportingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(option.id);
        return newSet;
      });
    }
  };

  const ExportOptionItem: React.FC<{
    option: ExportOption;
    onPress: () => void;
    isExporting: boolean;
  }> = ({ option, onPress, isExporting }) => (
    <TouchableOpacity
      style={[styles.exportOption, isExporting && styles.exportOptionDisabled]}
      onPress={onPress}
      disabled={isExporting}
    >
      <View style={styles.optionLeft}>
        <View style={[styles.optionIcon, { opacity: isExporting ? 0.5 : 1 }]}>
          {isExporting ? (
            <ActivityIndicator size="small" color="#2563EB" />
          ) : (
            option.icon
          )}
        </View>
        <View style={styles.optionText}>
          <Text style={[styles.optionTitle, { opacity: isExporting ? 0.5 : 1 }]}>
            {option.title}
          </Text>
          <Text style={[styles.optionDescription, { opacity: isExporting ? 0.5 : 1 }]}>
            {option.description}
          </Text>
          <Text style={[styles.optionFormat, { opacity: isExporting ? 0.5 : 1 }]}>
            Format: {option.format}
          </Text>
        </View>
      </View>
      <View style={styles.optionRight}>
        {isExporting ? (
          <Text style={styles.exportingText}>Preparing...</Text>
        ) : (
          <Download color="#2563EB" size={20} />
        )}
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
          <Text style={styles.title}>Export Data</Text>
          <View style={{ width: 32 }} />
        </View>

        {/* Introduction */}
        <View style={styles.introSection}>
          <Text style={styles.introTitle}>Export Your Financial Data</Text>
          <Text style={styles.introDescription}>
            Download your financial data in CSV or JSON format. Perfect for backup, 
            analysis in spreadsheet applications, or migrating to other financial tools.
          </Text>
        </View>

        {/* Export Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose Data to Export</Text>
          
          {EXPORT_OPTIONS.map(option => (
            <ExportOptionItem
              key={option.id}
              option={option}
              onPress={() => exportData(option)}
              isExporting={exportingItems.has(option.id)}
            />
          ))}
        </View>

        {/* Privacy Notice */}
        <View style={styles.privacyNotice}>
          <Text style={styles.privacyTitle}>Privacy & Security</Text>
          <Text style={styles.privacyText}>
            • Exported files contain sensitive financial information{'\n'}
            • Store exported files securely on your device{'\n'}
            • Delete exported files after transferring to your intended destination{'\n'}
            • Never share exported files through unsecured channels
          </Text>
        </View>

        {/* Format Information */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Export Formats</Text>
          
          <View style={styles.formatInfo}>
            <Text style={styles.formatTitle}>CSV (Comma-Separated Values)</Text>
            <Text style={styles.formatDescription}>
              Perfect for spreadsheet applications like Excel, Google Sheets, or Numbers. 
              Easy to read and manipulate.
            </Text>
          </View>

          <View style={styles.formatInfo}>
            <Text style={styles.formatTitle}>JSON (JavaScript Object Notation)</Text>
            <Text style={styles.formatDescription}>
              Complete structured data format. Ideal for developers and complete backups. 
              Preserves all relationships between data.
            </Text>
          </View>
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
  introSection: {
    padding: 24,
    backgroundColor: '#F9FAFB',
    marginTop: 16,
  },
  introTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  introDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
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
  exportOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  exportOptionDisabled: {
    opacity: 0.7,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 4,
  },
  optionFormat: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '500',
  },
  optionRight: {
    alignItems: 'center',
    marginLeft: 16,
  },
  exportingText: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  privacyNotice: {
    backgroundColor: '#FEF3C7',
    margin: 24,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  privacyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 8,
  },
  privacyText: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
  infoSection: {
    marginTop: 24,
    paddingHorizontal: 24,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  formatInfo: {
    marginBottom: 16,
  },
  formatTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  formatDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
});