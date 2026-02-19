import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { StepProps } from '../types';
import { EXPERIENCE_OPTIONS } from '../constants';
import { styles } from '../styles';

export default function Step2Experience({ data, updateData }: StepProps) {
  return (
    <View style={styles.experienceList}>
      {EXPERIENCE_OPTIONS.map((item) => {
        const selected = data.experience === item.key;
        return (
          <TouchableOpacity
            key={item.key}
            style={[styles.optionCard, selected && styles.optionCardSelected]}
            onPress={() => updateData('experience', item.key)}
            activeOpacity={0.7}
          >
            <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
