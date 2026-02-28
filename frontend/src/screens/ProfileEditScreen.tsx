import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import * as ImagePicker from 'expo-image-picker';
import { getMyProfile } from '../api/profile';
import { getAuthClient } from '../api/client';

const INTEREST_OPTIONS = [
  { key: 'IT_DEV', label: 'IT/개발', color: '#8B5CF6' },
  { key: 'LANGUAGE', label: '어학', color: '#3B82F6' },
  { key: 'CERTIFICATION', label: '자격증', color: '#22C55E' },
  { key: 'CAREER', label: '취업/이직', color: '#F97316' },
  { key: 'BUSINESS', label: '창업/사업', color: '#EF4444' },
  { key: 'FINANCE', label: '재테크', color: '#FBBF24' },
  { key: 'DESIGN', label: '디자인', color: '#EC4899' },
  { key: 'CIVIL_SERVICE', label: '공무원', color: '#6366F1' },
];

export default function ProfileEditScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [nickname, setNickname] = useState('');
  const [bio, setBio] = useState('');
  const [region, setRegion] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await getMyProfile();
      setNickname(data.nickname || '');
      setBio(data.bio || '');
      setRegion(data.region || '');
      setSelectedInterests(data.interests || []);
      setProfileImage(data.profileImage || null);
    } catch (err) {
      console.error('Failed to load profile:', err);
      Alert.alert('오류', '프로필을 불러오지 못했어요.');
    } finally {
      setLoading(false);
    }
  };

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
      setProfileImage(localUri);
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

      setProfileImage(response.data.imageUrl);
      Alert.alert('완료', '프로필 사진이 변경되었습니다.');
    } catch (err: any) {
      console.error('Failed to upload image:', err);
      Alert.alert('오류', '이미지 업로드에 실패했어요.');
    } finally {
      setUploading(false);
    }
  };

  const toggleInterest = (key: string) => {
    setSelectedInterests((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleSave = async () => {
    if (!nickname.trim()) {
      Alert.alert('오류', '닉네임을 입력해주세요.');
      return;
    }

    setSaving(true);
    try {
      const client = getAuthClient();
      await client.put('/api/users/me', {
        nickname: nickname.trim(),
        bio: bio.trim() || null,
        region: region.trim(),  // 빈 문자열 전송 시 백엔드에서 지역 삭제 처리
        latitude: region.trim() ? latitude : null,
        longitude: region.trim() ? longitude : null,
        interests: selectedInterests,
      });
      Alert.alert('완료', '프로필이 저장되었습니다.', [
        { text: '확인', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      console.error('Failed to save profile:', err);
      const message = err.response?.data?.message || '프로필 저장에 실패했어요.';
      Alert.alert('오류', message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#18181B" />
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <StatusBar barStyle="light-content" backgroundColor="#18181B" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="chevron-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>프로필 수정</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving} style={styles.saveBtn}>
          <Text style={[styles.saveBtnText, saving && styles.saveBtnDisabled]}>
            {saving ? '저장 중...' : '저장'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <TouchableOpacity style={styles.avatarWrapper} onPress={pickImage} disabled={uploading}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatar}>
                <Feather name="user" size={56} color="#71717A" />
              </View>
            )}
            {uploading ? (
              <View style={styles.uploadingOverlay}>
                <ActivityIndicator size="small" color="#FFFFFF" />
              </View>
            ) : (
              <View style={styles.cameraBtn}>
                <Feather name="camera" size={18} color="#FFFFFF" />
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={pickImage} disabled={uploading}>
            <Text style={styles.changePhotoText}>
              {uploading ? '업로드 중...' : '프로필 사진 변경'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          {/* Nickname */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>닉네임</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={nickname}
                onChangeText={setNickname}
                placeholder="닉네임을 입력해주세요"
                placeholderTextColor="#52525B"
                maxLength={20}
              />
            </View>
          </View>

          {/* Bio */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>한줄 소개</Text>
            <View style={styles.bioInputContainer}>
              <TextInput
                style={styles.bioInput}
                value={bio}
                onChangeText={setBio}
                placeholder="한줄 소개를 입력해주세요"
                placeholderTextColor="#52525B"
                maxLength={100}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Region */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>활동 지역</Text>
            <TouchableOpacity
              style={styles.inputContainer}
              onPress={() =>
                navigation.navigate('LocationPicker', {
                  onSelect: (location) => {
                    setRegion(location.address);
                    setLatitude(location.latitude);
                    setLongitude(location.longitude);
                  },
                })
              }
              activeOpacity={0.7}
            >
              <Text style={[styles.input, !region && styles.placeholderText]}>
                {region || '예: 서울 강남구'}
              </Text>
              <Feather name="chevron-right" size={18} color="#71717A" />
            </TouchableOpacity>
          </View>

          {/* Interests */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>관심 분야</Text>
            <View style={styles.interestTags}>
              {INTEREST_OPTIONS.map((option) => {
                const isSelected = selectedInterests.includes(option.key);
                return (
                  <TouchableOpacity
                    key={option.key}
                    style={[
                      styles.interestTag,
                      isSelected && { backgroundColor: `${option.color}20` },
                    ]}
                    onPress={() => toggleInterest(option.key)}
                  >
                    <Text
                      style={[
                        styles.interestTagText,
                        isSelected && { color: option.color },
                      ]}
                    >
                      {option.label}
                    </Text>
                    {isSelected && (
                      <Feather name="check" size={14} color={option.color} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#18181B',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#18181B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  saveBtn: {
    paddingHorizontal: 8,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 24,
  },
  scrollContent: {
    flexGrow: 1,
  },
  avatarSection: {
    alignItems: 'center',
    gap: 16,
    paddingVertical: 20,
  },
  avatarWrapper: {
    position: 'relative',
    width: 120,
    height: 120,
  },
  avatar: {
    width: 120,
    height: 120,
    backgroundColor: '#27272A',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  cameraBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    backgroundColor: '#8B5CF6',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changePhotoText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8B5CF6',
  },
  formSection: {
    gap: 24,
    paddingTop: 12,
  },
  field: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#A1A1AA',
  },
  inputContainer: {
    backgroundColor: '#27272A',
    borderRadius: 12,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  placeholderText: {
    color: '#52525B',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
  },
  bioInputContainer: {
    backgroundColor: '#27272A',
    borderRadius: 12,
    minHeight: 80,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  bioInput: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 22,
  },
  interestTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#27272A',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 4,
  },
  interestTagText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#A1A1AA',
  },
  bottomSpacer: {
    height: 100,
  },
});
