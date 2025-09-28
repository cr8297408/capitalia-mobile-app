/**
 * Dashboard Header Component - Header with user greeting and notifications
 * Following Scope Rule Pattern - Component local to dashboard feature
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Bell, Settings } from 'lucide-react-native';
import { useAuth } from '@/shared/hooks/useAuth';

interface DashboardHeaderProps {
  onNotificationsPress?: () => void;
  onSettingsPress?: () => void;
  notificationCount?: number;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  onNotificationsPress,
  onSettingsPress,
  notificationCount = 0,
}) => {
  const { user } = useAuth();
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const getFormattedDate = () => {
    return new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <Text style={styles.greeting}>{getGreeting()}</Text>
        <Text style={styles.userName}>
          {user?.email?.split('@')[0] || 'Usuario'}
        </Text>
        <Text style={styles.date}>{getFormattedDate()}</Text>
      </View>
      
      <View style={styles.rightSection}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onNotificationsPress}
          accessible
          accessibilityLabel="Notificaciones"
        >
          <Bell size={24} color="#374151" />
          {notificationCount > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationText}>
                {notificationCount > 99 ? '99+' : notificationCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onSettingsPress}
          accessible
          accessibilityLabel="Configuración"
        >
          <Settings size={24} color="#374151" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  leftSection: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  date: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '400',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  notificationText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});