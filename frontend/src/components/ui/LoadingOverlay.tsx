import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

interface LoadingOverlayProps {
  message?: string;
  visible?: boolean;
}

export default function LoadingOverlay({
  message = '로딩 중...',
  visible = true,
}: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <View
      style={styles.container}
      accessibilityRole="alert"
      accessibilityLabel={message}
    >
      <ActivityIndicator size="large" color="#8B5CF6" />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(24, 24, 27, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  message: {
    marginTop: 16,
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
});
