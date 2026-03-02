import React from 'react';
import { View, StyleSheet, ActivityIndicator, StatusBar } from 'react-native';

interface LoadingScreenProps {
  backgroundColor?: string;
  indicatorColor?: string;
}

export default function LoadingScreen({
  backgroundColor = '#18181B',
  indicatorColor = '#8B5CF6',
}: LoadingScreenProps) {
  return (
    <View style={[styles.container, { backgroundColor }]}>
      <StatusBar barStyle="light-content" backgroundColor={backgroundColor} />
      <ActivityIndicator size="large" color={indicatorColor} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
