import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Crown, ArrowRight } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { RootStackNavigationProp } from '@/navigation/types';

interface UpgradePromptProps {
  feature: string;
  currentLimit?: string | number;
  description?: string;
  style?: any;
}

export const UpgradePrompt: React.FC<UpgradePromptProps> = ({ 
  feature, 
  currentLimit,
  description,
  style 
}) => {
  const navigation = useNavigation<RootStackNavigationProp>();

  const handleUpgradePress = () => {
    navigation.navigate('SubscriptionPlans');
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconContainer}>
        <Crown color="#F59E0B" size={24} />
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title}>Upgrade to Premium</Text>
        <Text style={styles.description}>
          {description || `Unlock ${feature} and get unlimited access to all features.`}
        </Text>
        {currentLimit && (
          <Text style={styles.limit}>
            Current limit: {currentLimit}
          </Text>
        )}
      </View>

      <TouchableOpacity style={styles.upgradeButton} onPress={handleUpgradePress}>
        <Text style={styles.upgradeText}>Upgrade</Text>
        <ArrowRight color="#ffffff" size={16} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  iconContainer: {
    alignSelf: 'center',
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#ffffff',
    borderRadius: 50,
  },
  content: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#92400E',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 4,
  },
  limit: {
    fontSize: 12,
    color: '#D97706',
    fontWeight: '600',
    textAlign: 'center',
  },
  upgradeButton: {
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    gap: 8,
  },
  upgradeText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});