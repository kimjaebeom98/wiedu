import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { StepProps } from '../types';
import { styles } from '../styles';

export default function Step6Profile({ data, updateData }: StepProps) {
  return (
    <View style={styles.profileContainer}>
      {/* Avatar placeholder */}
      <TouchableOpacity style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Feather name="camera" size={32} color="#71717A" />
        </View>
        <Text style={styles.avatarText}>프로필 사진 추가</Text>
      </TouchableOpacity>

      {/* Nickname */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>닉네임 (필수)</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="닉네임을 입력해주세요"
            placeholderTextColor="#52525B"
            value={data.nickname}
            onChangeText={(text) => updateData('nickname', text)}
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={20}
          />
        </View>
      </View>
    </View>
  );
}
