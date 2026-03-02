import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TouchableOpacityProps,
} from 'react-native';

interface CardProps extends Omit<TouchableOpacityProps, 'style'> {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onPress?: () => void;
  style?: ViewStyle;
}

export default function Card({
  children,
  variant = 'default',
  padding = 'md',
  onPress,
  style,
  ...props
}: CardProps) {
  const cardStyles: ViewStyle[] = [
    styles.base,
    styles[`variant_${variant}`],
    styles[`padding_${padding}`],
    style,
  ].filter(Boolean) as ViewStyle[];

  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyles}
        onPress={onPress}
        activeOpacity={0.7}
        accessibilityRole="button"
        {...props}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyles}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 16,
    overflow: 'hidden',
  },

  // Variant styles
  variant_default: {
    backgroundColor: '#27272A',
  },
  variant_elevated: {
    backgroundColor: '#27272A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  variant_outlined: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#3F3F46',
  },

  // Padding styles
  padding_none: {
    padding: 0,
  },
  padding_sm: {
    padding: 12,
  },
  padding_md: {
    padding: 16,
  },
  padding_lg: {
    padding: 20,
  },
});
