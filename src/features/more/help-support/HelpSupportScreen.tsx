/**
 * Help & Support Screen - Customer support and help resources
 * Following Scope Rule Pattern - Screen local to more feature
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  ArrowLeft, 
  HelpCircle, 
  MessageCircle,
  Mail,
  Phone,
  ChevronRight,
  ChevronDown,
  Send
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

interface FAQ {
  question: string;
  answer: string;
}

const FAQ_DATA: FAQ[] = [
  {
    question: 'How do I add a new account?',
    answer: 'Go to the Accounts tab and tap the "+" button in the top right. Enter your account details including name, type, initial balance, and currency.'
  },
  {
    question: 'Why is my transaction not showing up?',
    answer: 'Make sure you have selected the correct account and date range. If the transaction was just added, try refreshing the screen by pulling down on the transaction list.'
  },
  {
    question: 'How do I set up a budget?',
    answer: 'Navigate to the Budgets tab, tap the "+" button, select a category, set your budget amount, and choose the time period (weekly, monthly, or yearly).'
  },
  {
    question: 'Can I export my financial data?',
    answer: 'Yes! Go to Settings > Export Data. You can export your transactions, accounts, and budgets as CSV files for use in other applications.'
  },
  {
    question: 'How secure is my financial data?',
    answer: 'We use bank-level security with 256-bit encryption. Your data is encrypted both in transit and at rest. We never store sensitive banking credentials.'
  },
  {
    question: 'How do I delete my account?',
    answer: 'Go to Settings > Privacy & Security > Delete Account. This action is permanent and will remove all your data from our servers.'
  }
];

export const HelpSupportScreen: React.FC = () => {
  const navigation = useNavigation();
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [supportMessage, setSupportMessage] = useState('');

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  const sendSupportMessage = () => {
    if (!supportMessage.trim()) {
      Alert.alert('Message Required', 'Please enter your message before sending.');
      return;
    }

    const subject = 'Support Request';
    const body = encodeURIComponent(supportMessage);
    const mailtoUrl = `mailto:support@yourapp.com?subject=${subject}&body=${body}`;
    
    Linking.openURL(mailtoUrl)
      .then(() => {
        setSupportMessage('');
        Alert.alert('Email Opened', 'Your default email client has been opened with your message.');
      })
      .catch(() => {
        Alert.alert('Error', 'Could not open email client. Please email us directly at support@yourapp.com');
      });
  };

  const ContactOption: React.FC<{
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    onPress: () => void;
  }> = ({ icon, title, subtitle, onPress }) => (
    <TouchableOpacity style={styles.contactOption} onPress={onPress}>
      <View style={styles.contactLeft}>
        <View style={styles.contactIcon}>
          {icon}
        </View>
        <View style={styles.contactText}>
          <Text style={styles.contactTitle}>{title}</Text>
          <Text style={styles.contactSubtitle}>{subtitle}</Text>
        </View>
      </View>
      <ChevronRight color="#9CA3AF" size={16} />
    </TouchableOpacity>
  );

  const FAQItem: React.FC<{
    faq: FAQ;
    index: number;
    isExpanded: boolean;
    onToggle: () => void;
  }> = ({ faq, index, isExpanded, onToggle }) => (
    <View style={styles.faqItem}>
      <TouchableOpacity style={styles.faqQuestion} onPress={onToggle}>
        <Text style={styles.faqQuestionText}>{faq.question}</Text>
        <ChevronDown 
          color="#6B7280" 
          size={16} 
          style={[
            styles.faqChevron,
            { transform: [{ rotate: isExpanded ? '180deg' : '0deg' }] }
          ]} 
        />
      </TouchableOpacity>
      {isExpanded && (
        <View style={styles.faqAnswer}>
          <Text style={styles.faqAnswerText}>{faq.answer}</Text>
        </View>
      )}
    </View>
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
          <Text style={styles.title}>Help & Support</Text>
          <View style={{ width: 32 }} />
        </View>

        {/* Contact Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Get in Touch</Text>
          
          <ContactOption
            icon={<Mail color="#2563EB" size={20} />}
            title="Email Support"
            subtitle="Get help via email - we respond within 24 hours"
            onPress={() => Linking.openURL('mailto:support@yourapp.com')}
          />

          <ContactOption
            icon={<MessageCircle color="#2563EB" size={20} />}
            title="Live Chat"
            subtitle="Chat with our support team (Mon-Fri, 9am-5pm)"
            onPress={() => Alert.alert('Coming Soon', 'Live chat will be available in a future update.')}
          />

          <ContactOption
            icon={<Phone color="#2563EB" size={20} />}
            title="Phone Support"
            subtitle="Call us for urgent issues"
            onPress={() => Linking.openURL('tel:+1-800-123-4567')}
          />
        </View>

        {/* Quick Message */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Send us a Message</Text>
          
          <View style={styles.messageContainer}>
            <TextInput
              style={styles.messageInput}
              placeholder="Describe your issue or question..."
              value={supportMessage}
              onChangeText={setSupportMessage}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <TouchableOpacity
              style={styles.sendButton}
              onPress={sendSupportMessage}
            >
              <Send color="#FFFFFF" size={16} />
              <Text style={styles.sendButtonText}>Send Message</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          
          {FAQ_DATA.map((faq, index) => (
            <FAQItem
              key={index}
              faq={faq}
              index={index}
              isExpanded={expandedFAQ === index}
              onToggle={() => toggleFAQ(index)}
            />
          ))}
        </View>

        {/* Additional Resources */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Resources</Text>
          
          <ContactOption
            icon={<HelpCircle color="#2563EB" size={20} />}
            title="User Guide"
            subtitle="Complete guide on how to use the app"
            onPress={() => Linking.openURL('https://yourapp.com/guide')}
          />

          <ContactOption
            icon={<HelpCircle color="#2563EB" size={20} />}
            title="Video Tutorials"
            subtitle="Watch step-by-step video guides"
            onPress={() => Linking.openURL('https://yourapp.com/tutorials')}
          />
        </View>

        {/* Support Info */}
        <View style={styles.infoBox}>
          <MessageCircle color="#2563EB" size={24} />
          <View style={styles.infoText}>
            <Text style={styles.infoTitle}>We're Here to Help</Text>
            <Text style={styles.infoDescription}>
              Our support team is committed to helping you manage your finances effectively. 
              Don't hesitate to reach out with any questions or feedback.
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
  contactOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  contactLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EBF4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contactText: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  contactSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  messageContainer: {
    marginHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  messageInput: {
    padding: 16,
    fontSize: 16,
    color: '#111827',
    minHeight: 100,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    paddingHorizontal: 20,
    margin: 12,
    borderRadius: 8,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  faqItem: {
    marginHorizontal: 24,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  faqQuestionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    flex: 1,
    marginRight: 12,
  },
  faqChevron: {
    transform: [{ rotate: '0deg' }],
  },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  faqAnswerText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginTop: 12,
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