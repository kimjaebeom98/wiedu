import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { Step2Props } from '../types';
import { styles } from '../styles';

export default function Step2Description({ data, updateData }: Step2Props) {
  const descriptionLength = data.description.trim().length;
  const minLength = 10;
  const isValid = descriptionLength >= minLength;

  return (
    <View style={styles.stepInner}>
      {/* Description */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>스터디 소개 <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          placeholder="스터디를 소개해주세요. 어떤 스터디인지 자세히 설명할수록 좋아요."
          placeholderTextColor="#52525B"
          value={data.description}
          onChangeText={v => updateData('description', v)}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
          maxLength={1000}
        />
        <View style={styles.charCountRow}>
          <Text style={[styles.minCharHint, isValid && styles.minCharHintValid]}>
            {isValid ? '✓ 최소 글자 수 충족' : `최소 ${minLength}자 이상 입력해주세요 (현재 ${descriptionLength}자)`}
          </Text>
          <Text style={styles.charCount}>{data.description.length}/1000</Text>
        </View>
      </View>

      {/* Target Audience */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>모집 대상</Text>
        <TextInput
          style={[styles.textInput, styles.textAreaSmall]}
          placeholder="예: 토익 600점 이상, 매주 참여 가능한 분"
          placeholderTextColor="#52525B"
          value={data.targetAudience}
          onChangeText={v => updateData('targetAudience', v)}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          maxLength={300}
        />
      </View>

      {/* Goals */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>스터디 목표</Text>
        <TextInput
          style={[styles.textInput, styles.textAreaSmall]}
          placeholder="예: 3개월 내 토익 900점 달성"
          placeholderTextColor="#52525B"
          value={data.goals}
          onChangeText={v => updateData('goals', v)}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          maxLength={300}
        />
      </View>
    </View>
  );
}
