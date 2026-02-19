import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { StepArrayProps } from '../types';
import { STUDY_STYLE_OPTIONS } from '../constants';
import { styles } from '../styles';

export default function Step4StudyStyle({ data, toggleArrayItem }: StepArrayProps) {
  return (
    <View style={styles.studyStyleList}>
      {STUDY_STYLE_OPTIONS.map((item) => {
        const selected = data.studyStyles.includes(item.key);
        return (
          <TouchableOpacity
            key={item.key}
            style={[styles.studyStyleCard, selected && styles.studyStyleCardSelected]}
            onPress={() => toggleArrayItem('studyStyles', item.key)}
            activeOpacity={0.7}
          >
            <Feather name={item.icon as any} size={20} color="#8B5CF6" />
            <Text style={[styles.studyStyleText, selected && styles.studyStyleTextSelected]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
