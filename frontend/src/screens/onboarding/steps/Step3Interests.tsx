import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { StepArrayProps } from '../types';
import { INTEREST_OPTIONS } from '../constants';
import { styles } from '../styles';

export default function Step3Interests({ data, toggleArrayItem }: StepArrayProps) {
  // design.pen: 칩 형태로 3-3-2 배열
  return (
    <View style={styles.chipContainer}>
      {INTEREST_OPTIONS.map((item) => {
        const selected = data.interests.includes(item.key);
        return (
          <TouchableOpacity
            key={item.key}
            style={[styles.chip, selected && styles.chipSelected]}
            onPress={() => toggleArrayItem('interests', item.key)}
            activeOpacity={0.7}
          >
            <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
