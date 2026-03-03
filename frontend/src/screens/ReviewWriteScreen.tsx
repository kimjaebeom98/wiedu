import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { createReview } from '../api/review';

type ReviewWriteScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ReviewWrite'>;
type ReviewWriteScreenRouteProp = RouteProp<RootStackParamList, 'ReviewWrite'>;

interface SatisfactionOption {
  value: number;
  emoji: string;
  label: string;
}

const SATISFACTION_OPTIONS: SatisfactionOption[] = [
  { value: 5, emoji: '😍', label: '최고예요' },
  { value: 4, emoji: '😊', label: '좋아요' },
  { value: 3, emoji: '😐', label: '보통이에요' },
  { value: 2, emoji: '😕', label: '아쉬워요' },
  { value: 1, emoji: '😞', label: '별로예요' },
];

const REVIEW_TAGS = [
  { id: 'systematic', label: '체계적인 커리큘럼' },
  { id: 'friendly', label: '친절한 스터디장' },
  { id: 'communication', label: '원활한 소통' },
  { id: 'ontime', label: '시간 약속 준수' },
  { id: 'helpful', label: '많이 배움' },
  { id: 'atmosphere', label: '좋은 분위기' },
];

export default function ReviewWriteScreen() {
  const navigation = useNavigation<ReviewWriteScreenNavigationProp>();
  const route = useRoute<ReviewWriteScreenRouteProp>();
  const { studyId, studyTitle, leaderName, leaderProfileImage } = route.params;

  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleSubmit = async () => {
    if (!selectedRating) {
      Alert.alert('알림', '만족도를 선택해주세요.');
      return;
    }

    if (!content.trim()) {
      Alert.alert('알림', '리뷰 내용을 작성해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      // 선택된 태그를 content에 포함
      const tagLabels = selectedTags.map(tagId => {
        const tag = REVIEW_TAGS.find(t => t.id === tagId);
        return tag ? `#${tag.label}` : '';
      }).filter(Boolean).join(' ');

      const fullContent = tagLabels ? `${tagLabels}\n\n${content}` : content;

      await createReview(studyId, {
        rating: selectedRating,
        content: fullContent,
      });

      Alert.alert('완료', '리뷰가 등록되었습니다.', [
        { text: '확인', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      const message = error.response?.data?.message || '리뷰 등록에 실패했습니다.';
      Alert.alert('오류', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Loading Overlay */}
      {isSubmitting && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text style={styles.loadingText}>리뷰 등록 중...</Text>
        </View>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
            <Feather name="x" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>리뷰 작성</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Description */}
          <View style={styles.descWrapper}>
            <Text style={styles.descText}>
              같이 성장할 수 있는 스터디 문화를 만들기 위해{'\n'}평가를 남겨주세요.
            </Text>
          </View>

          {/* Profile Card */}
          <View style={styles.profileCard}>
            <View style={styles.avatar}>
              {leaderProfileImage ? (
                <Feather name="user" size={28} color="#71717A" />
              ) : (
                <Feather name="user" size={28} color="#71717A" />
              )}
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{leaderName}</Text>
              <Text style={styles.studyTitle}>{studyTitle}</Text>
            </View>
          </View>

          {/* Satisfaction Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>스터디 만족도</Text>
            <View style={styles.satisfactionOptions}>
              {SATISFACTION_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.satisfactionOption,
                    selectedRating === option.value && styles.satisfactionOptionSelected,
                  ]}
                  onPress={() => setSelectedRating(option.value)}
                >
                  <Text style={styles.satisfactionEmoji}>{option.emoji}</Text>
                  <Text style={[
                    styles.satisfactionLabel,
                    selectedRating === option.value && styles.satisfactionLabelSelected,
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Tags Section */}
          <View style={styles.section}>
            <View style={styles.tagsHeader}>
              <Text style={styles.sectionTitle}>어떤 점이 좋았나요?</Text>
              <Text style={styles.tagsHint}>(선택)</Text>
            </View>
            <View style={styles.tagsContainer}>
              {REVIEW_TAGS.map((tag) => (
                <TouchableOpacity
                  key={tag.id}
                  style={[
                    styles.tag,
                    selectedTags.includes(tag.id) && styles.tagSelected,
                  ]}
                  onPress={() => toggleTag(tag.id)}
                >
                  <Text style={[
                    styles.tagText,
                    selectedTags.includes(tag.id) && styles.tagTextSelected,
                  ]}>
                    {tag.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Text Input Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>상세 리뷰</Text>
            <Text style={styles.inputHint}>작성하신 내용은 다른 멤버들에게 공개됩니다.</Text>
            <View style={styles.textInputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="스터디 경험을 자유롭게 작성해주세요."
                placeholderTextColor="#71717A"
                multiline
                value={content}
                onChangeText={setContent}
                textAlignVertical="top"
              />
              <Text style={styles.charCount}>{content.length}/500</Text>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Buttons */}
        <View style={styles.bottomButtons}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>취소</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!selectedRating || !content.trim() || isSubmitting) && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!selectedRating || !content.trim() || isSubmitting}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? '등록 중...' : '등록하기'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#18181B',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(24, 24, 27, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#27272A',
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerPlaceholder: {
    width: 40,
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  descWrapper: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  descText: {
    fontSize: 14,
    color: '#71717A',
    textAlign: 'center',
    lineHeight: 21,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#27272A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3F3F46',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  studyTitle: {
    fontSize: 14,
    color: '#A1A1AA',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  satisfactionOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  satisfactionOption: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#27272A',
    flex: 1,
    marginHorizontal: 4,
  },
  satisfactionOptionSelected: {
    backgroundColor: '#8B5CF620',
    borderWidth: 2,
    borderColor: '#8B5CF6',
  },
  satisfactionEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  satisfactionLabel: {
    fontSize: 11,
    color: '#A1A1AA',
    textAlign: 'center',
  },
  satisfactionLabelSelected: {
    color: '#8B5CF6',
    fontWeight: '600',
  },
  tagsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  tagsHint: {
    fontSize: 12,
    color: '#71717A',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#27272A',
    borderWidth: 1,
    borderColor: '#3F3F46',
  },
  tagSelected: {
    backgroundColor: '#8B5CF620',
    borderColor: '#8B5CF6',
  },
  tagText: {
    fontSize: 13,
    color: '#A1A1AA',
  },
  tagTextSelected: {
    color: '#8B5CF6',
    fontWeight: '500',
  },
  inputHint: {
    fontSize: 12,
    color: '#71717A',
    marginBottom: 8,
  },
  textInputContainer: {
    backgroundColor: '#27272A',
    borderRadius: 12,
    padding: 14,
    minHeight: 120,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
    minHeight: 80,
  },
  charCount: {
    fontSize: 12,
    color: '#71717A',
    textAlign: 'right',
    marginTop: 8,
  },
  bottomButtons: {
    flexDirection: 'row',
    padding: 20,
    paddingBottom: 34,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#27272A',
  },
  cancelButton: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#27272A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#A1A1AA',
  },
  submitButton: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#3F3F46',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
