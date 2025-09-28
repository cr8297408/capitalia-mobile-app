/**
 * Privacy & Security Screen - Privacy settings and security information
 * Following Scope Rule Pattern - Screen local to more feature
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  ArrowLeft, 
  Shield, 
  Eye, 
  Lock,
  Server,
  FileText,
  UserX,
  ChevronRight,
  ExternalLink
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

export const PrivacySecurityScreen: React.FC = () => {
  const navigation = useNavigation();

  const openPrivacyPolicy = () => {
    Linking.openURL('https://yourapp.com/privacy');
  };

  const openTermsOfService = () => {
    Linking.openURL('https://yourapp.com/terms');
  };

  const ContactSupport = () => {
    Linking.openURL('mailto:support@yourapp.com?subject=Privacy%20Inquiry');
  };

  const SecurityItem: React.FC<{
    icon: React.ReactNode;
    title: string;
    description: string;
    status?: string;
    statusColor?: string;
    onPress?: () => void;
  }> = ({ icon, title, description, status, statusColor = '#10B981', onPress }) => (
    <TouchableOpacity
      style={styles.securityItem}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.itemLeft}>
        <View style={styles.itemIcon}>
          {icon}
        </View>
        <View style={styles.itemText}>
          <Text style={styles.itemTitle}>{title}</Text>
          <Text style={styles.itemDescription}>{description}</Text>
          {status && (
            <Text style={[styles.itemStatus, { color: statusColor }]}>
              {status}
            </Text>
          )}
        </View>
      </View>
      {onPress && <ChevronRight color="#9CA3AF" size={16} />}
    </TouchableOpacity>
  );

  const PolicyItem: React.FC<{
    title: string;
    subtitle: string;
    onPress: () => void;
  }> = ({ title, subtitle, onPress }) => (
    <TouchableOpacity style={styles.policyItem} onPress={onPress}>
      <View style={styles.policyText}>
        <Text style={styles.policyTitle}>{title}</Text>
        <Text style={styles.policySubtitle}>{subtitle}</Text>
      </View>
      <ExternalLink color="#2563EB" size={16} />
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
          <Text style={styles.title}>Privacy & Security</Text>
          <View style={{ width: 32 }} />
        </View>

        {/* Security Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security Status</Text>
          
          <SecurityItem
            icon={<Shield color="#10B981" size={20} />}
            title="Data Encryption"
            description="Your financial data is encrypted at rest and in transit"
            status="Active"
            statusColor="#10B981"
          />

          <SecurityItem
            icon={<Lock color="#10B981" size={20} />}
            title="Secure Authentication"
            description="Multi-factor authentication and secure login"
            status="Enabled"
            statusColor="#10B981"
          />

          <SecurityItem
            icon={<Server color="#10B981" size={20} />}
            title="Secure Storage"
            description="Bank-grade security for your financial information"
            status="Protected"
            statusColor="#10B981"
          />

          {/* <SecurityItem
            icon={<Eye color="#F59E0B" size={20} />}
            title="Data Usage Tracking"
            description="Monitor how your data is being used within the app"
            status="View Details"
            statusColor="#2563EB"
            onPress={() => {
              // TODO: Navigate to data usage screen
            }}
          /> */}
        </View>

        {/* Legal & Policies */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal & Policies</Text>
          
          <PolicyItem
            title="Privacy Policy"
            subtitle="How we collect, use, and protect your data"
            onPress={openPrivacyPolicy}
          />

          <PolicyItem
            title="Terms of Service"
            subtitle="Terms and conditions for using our service"
            onPress={openTermsOfService}
          />

          <PolicyItem
            title="Contact Support"
            subtitle="Questions about privacy or security"
            onPress={ContactSupport}
          />
        </View>

        {/* Information Box */}
        <View style={styles.infoBox}>
          <Shield color="#2563EB" size={24} />
          <View style={styles.infoText}>
            <Text style={styles.infoTitle}>Your Data is Safe</Text>
            <Text style={styles.infoDescription}>
              We use industry-standard encryption and security measures to protect your financial information. 
              Your data is never shared with third parties without your explicit consent.
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
  securityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  itemText: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  itemStatus: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  policyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  policyText: {
    flex: 1,
  },
  policyTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  policySubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#EBF4FF',
    margin: 24,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  infoText: {
    flex: 1,
    marginLeft: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 8,
  },
  infoDescription: {
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
  },
});