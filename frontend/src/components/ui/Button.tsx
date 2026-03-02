import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';
type FeatherIconName = React.ComponentProps<typeof Feather>['name'];

interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: FeatherIconName;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const COLORS = {
  primary: '#8B5CF6',
  primaryDark: '#7C3AED',
  surface: '#27272A',
  surfaceLight: '#3F3F46',
  border: '#3F3F46',
  text: '#FFFFFF',
  textMuted: '#A1A1AA',
};

export default function Button({
  title,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  fullWidth = false,
  disabled,
  style,
  textStyle,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const containerStyles: ViewStyle[] = [
    styles.base,
    styles[`size_${size}`],
    styles[`variant_${variant}`],
    fullWidth && styles.fullWidth,
    isDisabled && styles.disabled,
    style,
  ].filter(Boolean) as ViewStyle[];

  const textStyles: TextStyle[] = [
    styles.text,
    styles[`text_${size}`],
    styles[`textVariant_${variant}`],
    isDisabled && styles.textDisabled,
    textStyle,
  ].filter(Boolean) as TextStyle[];

  const iconSize = size === 'sm' ? 16 : size === 'lg' ? 22 : 18;
  const iconColor = variant === 'outline' || variant === 'ghost'
    ? (isDisabled ? COLORS.textMuted : COLORS.primary)
    : COLORS.text;

  return (
    <TouchableOpacity
      style={containerStyles}
      disabled={isDisabled}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: isDisabled }}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? COLORS.primary : COLORS.text}
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <Feather name={icon} size={iconSize} color={iconColor} style={styles.iconLeft} />
          )}
          <Text style={textStyles}>{title}</Text>
          {icon && iconPosition === 'right' && (
            <Feather name={icon} size={iconSize} color={iconColor} style={styles.iconRight} />
          )}
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },

  // Size variants
  size_sm: {
    height: 36,
    paddingHorizontal: 12,
    gap: 6,
  },
  size_md: {
    height: 48,
    paddingHorizontal: 16,
    gap: 8,
  },
  size_lg: {
    height: 56,
    paddingHorizontal: 20,
    gap: 10,
  },

  // Variant styles
  variant_primary: {
    backgroundColor: COLORS.primary,
  },
  variant_secondary: {
    backgroundColor: COLORS.surface,
  },
  variant_outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  variant_ghost: {
    backgroundColor: 'transparent',
  },

  // Text styles
  text: {
    fontWeight: '600',
  },
  text_sm: {
    fontSize: 14,
  },
  text_md: {
    fontSize: 16,
  },
  text_lg: {
    fontSize: 18,
  },
  textVariant_primary: {
    color: COLORS.text,
  },
  textVariant_secondary: {
    color: COLORS.text,
  },
  textVariant_outline: {
    color: COLORS.primary,
  },
  textVariant_ghost: {
    color: COLORS.primary,
  },
  textDisabled: {
    color: COLORS.textMuted,
  },

  // Icon styles
  iconLeft: {
    marginRight: 4,
  },
  iconRight: {
    marginLeft: 4,
  },
});
