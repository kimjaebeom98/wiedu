import React, { useState } from 'react';
import { View, Image, StyleSheet, ImageStyle, ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface SafeImageProps {
  source?: string | null;
  style?: ImageStyle;
  containerStyle?: ViewStyle;
  fallbackIcon?: string;
  fallbackIconSize?: number;
  fallbackIconColor?: string;
  accessibilityLabel?: string;
}

/**
 * 이미지 로딩 실패 시 fallback을 표시하는 안전한 이미지 컴포넌트
 */
export default function SafeImage({
  source,
  style,
  containerStyle,
  fallbackIcon = 'image',
  fallbackIconSize = 24,
  fallbackIconColor = '#71717A',
  accessibilityLabel = '이미지',
}: SafeImageProps) {
  const [imageError, setImageError] = useState(false);
  const showImage = source && !imageError;

  if (showImage) {
    return (
      <Image
        source={{ uri: source }}
        style={[styles.image, style]}
        onError={() => setImageError(true)}
        accessibilityLabel={accessibilityLabel}
      />
    );
  }

  return (
    <View style={[styles.fallback, style, containerStyle]}>
      <Feather name={fallbackIcon as any} size={fallbackIconSize} color={fallbackIconColor} />
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    backgroundColor: '#3F3F46',
  },
  fallback: {
    backgroundColor: '#3F3F46',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
