import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react-native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { BudgetStackParamList } from '@/navigation/types';
import React, { useEffect } from 'react';

type HeaderBudgetDetailProps = {
  navigation: StackNavigationProp<BudgetStackParamList, 'BudgetDetail'>;
  onEdit: () => void;
  onDelete: () => void;
  budgetName?: string;
};

const styles = StyleSheet.create({
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  headerRightContainer: {
    flexDirection: 'row',
    marginRight: 8,
  },
  headerIconButton: {
    padding: 8,
  },
  deleteButton: {
    marginLeft: 8,
  },
});

export const useHeaderBudgetDetail = ({
  navigation,
  onEdit,
  onDelete,
  budgetName,
}: HeaderBudgetDetailProps) => {
  useEffect(() => {
    navigation.setOptions({
      headerTitle: budgetName || 'Budget Details',
      headerTitleAlign: 'left',
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerButton}
        >
          <ArrowLeft color="#111827" size={24} />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <View style={styles.headerRightContainer}>
          <TouchableOpacity
            onPress={onEdit}
            style={styles.headerIconButton}
          >
            <Edit color="#2563EB" size={24} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onDelete}
            style={[styles.headerIconButton, styles.deleteButton]}
          >
            <Trash2 color="#EF4444" size={24} />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, onEdit, onDelete, budgetName]);

  return {};
};