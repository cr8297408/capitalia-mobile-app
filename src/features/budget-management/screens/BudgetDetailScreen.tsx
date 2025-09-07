import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { BudgetStackScreenProps } from '@/navigation/types';

type BudgetDetailScreenProps = BudgetStackScreenProps<'BudgetDetail'>;

export const BudgetDetailScreen: React.FC<BudgetDetailScreenProps> = ({ route }) => {
  const { budgetId } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.placeholder}>
          Budget details for ID: {budgetId}
        </Text>
        <Text style={styles.subtext}>
          Full implementation coming soon
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  placeholder: {
    fontSize: 16,
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});