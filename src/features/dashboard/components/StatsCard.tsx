import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatCurrency } from '@/shared/utils/formatters';

type StatsCardProps = {
  title: string;
  value: number;
  change?: number;
  isCurrency?: boolean;
  isPercentage?: boolean;
  isPositive?: boolean;
};

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  isCurrency = true,
  isPercentage = false,
  isPositive = true,
}) => {
  const formattedValue = isCurrency 
    ? formatCurrency(value) 
    : isPercentage 
      ? `${value.toFixed(1)}%`
      : value.toString();

  const changeText = change !== undefined ? (
    <Text 
      style={[
        styles.changeText,
        { color: isPositive ? '#10B981' : '#EF4444' }
      ]}
    >
      {change > 0 ? '↑' : '↓'} {Math.abs(change)}% from last month
    </Text>
  ) : null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.value}>{formattedValue}</Text>
      {changeText}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    flex: 1,
    margin: 4,
  },
  title: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
    fontFamily: 'Inter-Medium',
  },
  value: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
  },
  changeText: {
    fontSize: 12,
    marginTop: 4,
    fontFamily: 'Inter-Regular',
  },
});
