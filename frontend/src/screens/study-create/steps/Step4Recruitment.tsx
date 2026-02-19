import React from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Step4Props } from '../types';
import { styles } from '../styles';

export default function Step4Recruitment({ data, updateData }: Step4Props) {
  return (
    <View style={styles.stepInner}>
      {/* Max Members */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>최대 인원 <Text style={styles.required}>*</Text></Text>
        <View style={styles.counterRow}>
          <TouchableOpacity
            style={styles.counterBtn}
            onPress={() => updateData('maxMembers', Math.max(2, data.maxMembers - 1))}
          >
            <Feather name="minus" size={20} color="#8B5CF6" />
          </TouchableOpacity>
          <Text style={styles.counterValue}>{data.maxMembers}명</Text>
          <TouchableOpacity
            style={styles.counterBtn}
            onPress={() => updateData('maxMembers', Math.min(50, data.maxMembers + 1))}
          >
            <Feather name="plus" size={20} color="#8B5CF6" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Participation Fee */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>참가비</Text>
        <View style={styles.feeInputRow}>
          <TextInput
            style={[styles.textInput, styles.feeInput]}
            placeholder="0"
            placeholderTextColor="#52525B"
            value={String(data.participationFee)}
            onChangeText={v => {
              const num = v.replace(/[^0-9]/g, '');
              updateData('participationFee', num === '' ? 0 : Number(num));
            }}
            keyboardType="numeric"
            returnKeyType="done"
          />
          <Text style={styles.feeUnit}>원</Text>
        </View>
        <Text style={styles.fieldHintText}>무료 스터디는 0원으로 설정하세요</Text>
      </View>

      {/* Deposit */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>보증금</Text>
        <View style={styles.feeInputRow}>
          <TextInput
            style={[styles.textInput, styles.feeInput]}
            placeholder="0"
            placeholderTextColor="#52525B"
            value={String(data.deposit)}
            onChangeText={v => {
              const num = v.replace(/[^0-9]/g, '');
              updateData('deposit', num === '' ? 0 : Number(num));
            }}
            keyboardType="numeric"
            returnKeyType="done"
          />
          <Text style={styles.feeUnit}>원</Text>
        </View>
        <Text style={styles.fieldHintText}>출석/과제 완수 시 환급되는 보증금이에요</Text>
      </View>

      {/* Requirements */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>지원 자격 요건</Text>
        <TextInput
          style={[styles.textInput, styles.textAreaSmall]}
          placeholder="예: 매주 참석 가능한 분, 과제 제출 가능한 분"
          placeholderTextColor="#52525B"
          value={data.requirements}
          onChangeText={v => updateData('requirements', v)}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          maxLength={300}
        />
      </View>
    </View>
  );
}
