import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

interface DividerProps {
  text?: string;
  spacing?: 'sm' | 'md' | 'lg';
  color?: string;
  style?: ViewStyle;
}

export default function Divider({
  text,
  spacing = 'md',
  color = '#3F3F46',
  style,
}: DividerProps) {
  const spacingValue = spacing === 'sm' ? 12 : spacing === 'lg' ? 32 : 24;

  if (text) {
    return (
      <View style={[styles.container, { paddingVertical: spacingValue }, style]}>
        <View style={[styles.line, { backgroundColor: color }]} />
        <Text style={styles.text}>{text}</Text>
        <View style={[styles.line, { backgroundColor: color }]} />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.simpleLine,
        { backgroundColor: color, marginVertical: spacingValue },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  line: {
    flex: 1,
    height: 1,
  },
  simpleLine: {
    height: 1,
  },
  text: {
    fontSize: 13,
    color: '#71717A',
  },
});
