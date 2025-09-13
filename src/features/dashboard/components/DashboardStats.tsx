import React from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { StatsCard } from './StatsCard';
import { useTheme } from '@react-navigation/native';
import { useDashboard } from '../hooks/useDashboard';

export const DashboardStats: React.FC = () => {
  const { colors } = useTheme();
  const {
    totalBalance,
    totalBalanceChange,
    totalBalanceIsPositive,
    monthlyIncome,
    monthlyIncomeChange,
    monthlyIncomeIsPositive,
    monthlyExpenses,
    monthlyExpensesChange,
    monthlyExpensesIsPositive,
    savingsRate,
    savingsRateChange,
    savingsRateIsPositive,
    isLoading,
    error,
  } = useDashboard();
  const windowWidth = Dimensions.get('window').width;
  const cardWidth = (windowWidth - 40) / 2 - 8; // Accounting for margins and padding

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={[styles.loadingCard, { backgroundColor: colors.card }]} />
        <View style={[styles.loadingCard, { backgroundColor: colors.card }]} />
        <View style={[styles.loadingCard, { backgroundColor: colors.card }]} />
      </View>
    );
  }

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={[styles.cardWrapper, { width: cardWidth }]}>
        <StatsCard 
          title="Total Balance" 
          value={totalBalance} 
          isCurrency 
          change={totalBalanceChange}
          isPositive={totalBalanceIsPositive}
        />
      </View>
      
      <View style={[styles.cardWrapper, { width: cardWidth }]}>
        <StatsCard 
          title="Monthly Income" 
          value={monthlyIncome} 
          isCurrency 
          change={monthlyIncomeChange}
          isPositive={monthlyIncomeIsPositive}
        />
      </View>
      
      <View style={[styles.cardWrapper, { width: cardWidth }]}>
        <StatsCard 
          title="Monthly Expenses" 
          value={monthlyExpenses} 
          isCurrency 
          change={monthlyExpensesChange}
          isPositive={monthlyExpensesIsPositive}
        />
      </View>
      
      <View style={[styles.cardWrapper, { width: cardWidth }]}>
        <StatsCard 
          title="Savings Rate" 
          value={savingsRate} 
          isPercentage 
          change={savingsRateChange}
          isPositive={savingsRateIsPositive}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  scrollContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  cardWrapper: {
    marginHorizontal: 4,
  },
  loadingCard: {
    width: 160,
    height: 100,
    borderRadius: 12,
    marginHorizontal: 4,
  },
});
