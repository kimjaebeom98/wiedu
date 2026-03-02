import React from 'react';
import { View, Image, Text, StyleSheet, ViewStyle, ImageStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  source?: string | null;
  name?: string;
  size?: AvatarSize;
  showBadge?: boolean;
  badgeColor?: string;
  style?: ViewStyle;
}

const SIZE_MAP: Record<AvatarSize, number> = {
  xs: 24,
  sm: 32,
  md: 48,
  lg: 64,
  xl: 96,
};

const FONT_SIZE_MAP: Record<AvatarSize, number> = {
  xs: 10,
  sm: 12,
  md: 18,
  lg: 24,
  xl: 36,
};

const ICON_SIZE_MAP: Record<AvatarSize, number> = {
  xs: 12,
  sm: 16,
  md: 24,
  lg: 32,
  xl: 48,
};

export default function Avatar({
  source,
  name,
  size = 'md',
  showBadge = false,
  badgeColor = '#22C55E',
  style,
}: AvatarProps) {
  const dimension = SIZE_MAP[size];
  const fontSize = FONT_SIZE_MAP[size];
  const iconSize = ICON_SIZE_MAP[size];

  const getInitial = (name?: string): string => {
    if (!name) return '';
    return name.charAt(0).toUpperCase();
  };

  const containerStyle: ViewStyle = {
    width: dimension,
    height: dimension,
    borderRadius: dimension / 2,
  };

  const imageStyle: ImageStyle = {
    width: dimension,
    height: dimension,
    borderRadius: dimension / 2,
  };

  const badgeSize = Math.max(dimension * 0.25, 8);

  return (
    <View style={[styles.container, containerStyle, style]}>
      {source ? (
        <Image
          source={{ uri: source }}
          style={[styles.image, imageStyle]}
          accessibilityLabel={name ? `${name}의 프로필 사진` : '프로필 사진'}
        />
      ) : (
        <View style={[styles.placeholder, containerStyle]}>
          {name ? (
            <Text style={[styles.initial, { fontSize }]}>{getInitial(name)}</Text>
          ) : (
            <Feather name="user" size={iconSize} color="#71717A" />
          )}
        </View>
      )}
      {showBadge && (
        <View
          style={[
            styles.badge,
            {
              width: badgeSize,
              height: badgeSize,
              borderRadius: badgeSize / 2,
              backgroundColor: badgeColor,
            },
          ]}
          accessibilityLabel="온라인"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  image: {
    backgroundColor: '#3F3F46',
  },
  placeholder: {
    backgroundColor: '#3F3F46',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initial: {
    fontWeight: '600',
    color: '#A1A1AA',
  },
  badge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: '#18181B',
  },
});
