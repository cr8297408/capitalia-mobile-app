import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react-native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { AccountStackParamList } from '@/navigation/types';
import React, { useEffect } from 'react';

type HeaderAccountDetailProps = {
  navigation: StackNavigationProp<AccountStackParamList, 'AccountDetail'>;
  onEdit: () => void;
  onDelete: () => void;
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

export const useHeaderAccountDetail = ({
  navigation,
  onEdit,
  onDelete,
}: HeaderAccountDetailProps) => {
  useEffect(() => {
    navigation.setOptions({
      headerTitle: 'Account Details',
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
  }, [navigation, onEdit, onDelete]);

  return {};
};
