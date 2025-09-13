import React, { useCallback, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ArrowLeft, Save } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { BudgetStackParamList } from '@/navigation/types';

type SaveFunction = () => Promise<{ success: boolean; error?: string }>;

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
});

interface UseBudgetHeaderProps {
  onSave: SaveFunction;
  isLoading: boolean;
}

export const useBudgetHeader = ({ onSave, isLoading }: UseBudgetHeaderProps) => {
  const navigation = useNavigation<StackNavigationProp<BudgetStackParamList, 'AddBudget'>>();
  
  const handleSavePress = useCallback(async () => {
    try {
      const result = await onSave();
      if (result.error) {
        console.error('Error saving budget:', result.error);
      }
    } catch (error) {
      console.error('Unexpected error in save handler:', error);
    }
  }, [onSave]);

  useEffect(() => {
    const headerLeft = (props: { tintColor?: string }) => (
      <TouchableOpacity 
        onPress={() => navigation.goBack()}
        style={[styles.headerButton, { opacity: isLoading ? 0.5 : 1 }]}
        disabled={isLoading}
      >
        <ArrowLeft color={props.tintColor || '#111827'} size={24} />
      </TouchableOpacity>
    );

    const headerRight = (props: { tintColor?: string }) => (
      <View style={styles.headerRightContainer}>
        <TouchableOpacity 
          onPress={handleSavePress}
          style={[styles.headerIconButton, { opacity: isLoading ? 0.5 : 1 }]}
          disabled={isLoading}
        >
          <Save color={props.tintColor || '#2563EB'} size={24} />
        </TouchableOpacity>
      </View>
    );

    navigation.setOptions({
      headerTitle: 'Add Budget',
      headerTitleAlign: 'center',
      headerLeft,
      headerRight,
      headerLeftContainerStyle: { paddingLeft: 8 },
      headerRightContainerStyle: { paddingRight: 8 },
    });
  }, [navigation, handleSavePress, isLoading]);

  // This hook doesn't need to return anything as it sets up the header options
  return null;
};
