import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { getAuthClient } from '../../../api/client';
import { StepProps } from '../types';
import { styles } from '../styles';

export default function Step6Profile({ data, updateData }: StepProps) {
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 필요', '사진 접근 권한이 필요합니다.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const localUri = result.assets[0].uri;
      await uploadImage(localUri);
    }
  };

  const uploadImage = async (uri: string) => {
    setUploading(true);
    try {
      const client = getAuthClient();
      const formData = new FormData();

      const filename = uri.split('/').pop() || 'photo.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('file', {
        uri,
        name: filename,
        type,
      } as any);

      const response = await client.post('/api/users/me/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      updateData('profileImage', response.data.imageUrl);
    } catch (err: any) {
      console.error('Failed to upload image:', err);
      Alert.alert('오류', '이미지 업로드에 실패했어요. 나중에 다시 시도해주세요.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.profileContainer}>
      {/* Avatar with image picker */}
      <TouchableOpacity
        style={styles.avatarContainer}
        onPress={pickImage}
        disabled={uploading}
        activeOpacity={0.7}
      >
        <View style={styles.avatarWrapper}>
          {data.profileImage ? (
            <Image source={{ uri: data.profileImage }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatar}>
              <Feather name="user" size={40} color="#71717A" />
            </View>
          )}
          {uploading ? (
            <View style={styles.avatarOverlay}>
              <ActivityIndicator size="small" color="#FFFFFF" />
            </View>
          ) : (
            <View style={styles.cameraIconBadge}>
              <Feather name="camera" size={16} color="#FFFFFF" />
            </View>
          )}
        </View>
        <Text style={styles.avatarText}>
          {uploading ? '업로드 중...' : data.profileImage ? '사진 변경' : '프로필 사진 추가'}
        </Text>
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
