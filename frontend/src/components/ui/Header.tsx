import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type FeatherIconName = React.ComponentProps<typeof Feather>['name'];

interface HeaderProps {
  title: string;
  subtitle?: string;
  leftIcon?: FeatherIconName;
  rightIcon?: FeatherIconName;
  onLeftPress?: () => void;
  onRightPress?: () => void;
  leftComponent?: React.ReactNode;
  rightComponent?: React.ReactNode;
  transparent?: boolean;
  style?: ViewStyle;
}

export default function Header({
  title,
  subtitle,
  leftIcon,
  rightIcon,
  onLeftPress,
  onRightPress,
  leftComponent,
  rightComponent,
  transparent = false,
  style,
}: HeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + 12 },
        transparent && styles.transparent,
        style,
      ]}
    >
      {/* Left Section */}
      <View style={styles.leftSection}>
        {leftComponent ? (
          leftComponent
        ) : leftIcon ? (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onLeftPress}
            accessibilityRole="button"
            accessibilityLabel="뒤로 가기"
          >
            <Feather name={leftIcon} size={24} color="#FFFFFF" />
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>

      {/* Center Section */}
      <View style={styles.centerSection}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle && (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>

      {/* Right Section */}
      <View style={styles.rightSection}>
        {rightComponent ? (
          rightComponent
        ) : rightIcon ? (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onRightPress}
            accessibilityRole="button"
          >
            <Feather name={rightIcon} size={24} color="#A1A1AA" />
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#18181B',
  },
  transparent: {
    backgroundColor: 'transparent',
  },
  leftSection: {
    width: 44,
    alignItems: 'flex-start',
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
  },
  rightSection: {
    width: 44,
    alignItems: 'flex-end',
  },
  iconButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    width: 44,
    height: 44,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 13,
    color: '#71717A',
    marginTop: 2,
  },
});
