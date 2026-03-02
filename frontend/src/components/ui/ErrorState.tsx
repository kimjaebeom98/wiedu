import React from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Button from './Button';

type FeatherIconName = React.ComponentProps<typeof Feather>['name'];

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  icon?: FeatherIconName;
  fullScreen?: boolean;
  children?: React.ReactNode;
}

export default function ErrorState({
  message = '문제가 발생했습니다.',
  onRetry,
  retryLabel = '다시 시도',
  icon = 'alert-circle',
  fullScreen = true,
  children,
}: ErrorStateProps) {
  const content = (
    <>
      <Feather name={icon} size={48} color="#71717A" />
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <Button
          title={retryLabel}
          variant="outline"
          size="sm"
          onPress={onRetry}
          style={styles.retryButton}
        />
      )}
      {children}
    </>
  );

  if (fullScreen) {
    return (
      <View
        style={styles.fullScreenContainer}
        accessibilityRole="alert"
        accessibilityLabel={message}
      >
        <StatusBar barStyle="light-content" backgroundColor="#18181B" />
        {content}
      </View>
    );
  }

  return (
    <View
      style={styles.container}
      accessibilityRole="alert"
      accessibilityLabel={message}
    >
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#18181B',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    marginTop: 16,
    fontSize: 16,
    color: '#71717A',
    textAlign: 'center',
    lineHeight: 24,
  },
  retryButton: {
    marginTop: 20,
    minWidth: 120,
  },
});
