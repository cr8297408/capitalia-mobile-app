import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Crown } from 'lucide-react-native';

interface PremiumBadgeProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
}

export const PremiumBadge: React.FC<PremiumBadgeProps> = ({ 
  size = 'medium', 
  showText = true 
}) => {
  const sizeConfig = {
    small: { iconSize: 12, fontSize: 10, padding: 4 },
    medium: { iconSize: 16, fontSize: 12, padding: 6 },
    large: { iconSize: 20, fontSize: 14, padding: 8 },
  };

  const config = sizeConfig[size];

  return (
    <View style={[styles.container, { padding: config.padding }]}>
      <Crown color="#F59E0B" size={config.iconSize} />
      {showText && (
        <Text style={[styles.text, { fontSize: config.fontSize }]}>
          PREMIUM
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  text: {
    marginLeft: 4,
    fontWeight: '700',
    color: '#D97706',
    letterSpacing: 0.5,
  },
});