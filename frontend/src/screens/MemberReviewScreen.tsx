import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Image,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CustomAlert } from '../components/common';
import { Feather } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { getMembersToReview, createMemberReview } from '../api/review';
import { StudyMemberToReview } from '../types/review';
import { useAlert } from '../hooks';

type MemberReviewScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'MemberReview'>;
type MemberReviewScreenRouteProp = RouteProp<RootStackParamList, 'MemberReview'>;

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

const MEMBER_TAGS = [
  { id: 'active', label: '적극적인 참여', emoji: '🔥' },
  { id: 'responsible', label: '책임감 있음', emoji: '💪' },
  { id: 'kind', label: '친절하고 배려심', emoji: '💕' },
  { id: 'prepared', label: '준비를 잘 해옴', emoji: '📝' },
  { id: 'helpful', label: '도움을 많이 줌', emoji: '🤝' },
  { id: 'positive', label: '긍정적인 에너지', emoji: '✨' },
];

export default function MemberReviewScreen() {
  const navigation = useNavigation<MemberReviewScreenNavigationProp>();
  const route = useRoute<MemberReviewScreenRouteProp>();
  const insets = useSafeAreaInsets();
  const alert = useAlert();
  const { studyId, studyTitle } = route.params;

  const [members, setMembers] = useState<StudyMemberToReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedMember, setSelectedMember] = useState<StudyMemberToReview | null>(null);
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

  useEffect(() => {
    loadMembers();
  }, [studyId]);

  const loadMembers = async () => {
    try {
      setLoading(true);
      setError(false);
      const data = await getMembersToReview(studyId);
      setMembers(data);
    } catch (err) {
      console.error('Failed to load members:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!selectedMember || !selectedRating) {
      alert.show({ title: '알림', message: '평점을 선택해주세요.', icon: 'alert-circle' });
      return;
    }

    setIsSubmitting(true);
    try {
      await createMemberReview(studyId, {
        revieweeId: selectedMember.userId,
        rating: selectedRating,
        content: content.trim() || undefined,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
      });

      // 리뷰 완료 후 멤버 목록 새로고침
      setMembers(prev =>
        prev.map(m =>
          m.userId === selectedMember.userId
            ? { ...m, alreadyReviewed: true }
            : m
        )
      );

      setSelectedMember(null);
      setSelectedRating(null);
      setSelectedTags([]);
      setContent('');

      alert.show({ title: '완료', message: '리뷰가 등록되었습니다.', icon: 'check-circle' });
    } catch (error: any) {
      const message = error.response?.data?.message || '리뷰 등록에 실패했습니다.';
      alert.show({ title: '오류', message, icon: 'x-circle' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const allReviewed = members.length > 0 && members.every(m => m.alreadyReviewed);

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#18181B" />
        <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
          <ActivityIndicator size="large" color="#8B5CF6" />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#18181B" />
        <View style={[styles.errorContainer, { paddingTop: insets.top }]}>
          <Feather name="wifi-off" size={48} color="#71717A" />
          <Text style={styles.errorTitle}>멤버 목록을 불러올 수 없습니다</Text>
          <Text style={styles.errorMessage}>네트워크 연결을 확인하고 다시 시도해주세요.</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadMembers}>
            <Feather name="refresh-cw" size={18} color="#FFFFFF" />
            <Text style={styles.retryButtonText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#18181B" />
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <Feather name="x" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>멤버 평가</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Description */}
        <View style={styles.descWrapper}>
          <Text style={styles.studyTitleText}>{studyTitle}</Text>
          <Text style={styles.descText}>
            함께한 멤버들을 평가해주세요.{'\n'}평가는 멤버의 온도에 반영됩니다.
          </Text>
        </View>

        {allReviewed ? (
          <View style={styles.allReviewedContainer}>
            <Text style={styles.allReviewedEmoji}>🎉</Text>
            <Text style={styles.allReviewedText}>모든 멤버 평가를 완료했습니다!</Text>
            <Text style={styles.allReviewedSubText}>
              평가해 주셔서 감사합니다.{'\n'}평가는 멤버의 온도에 반영됩니다.
            </Text>
            <TouchableOpacity
              style={styles.homeButton}
              onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Home' }] })}
            >
              <Text style={styles.homeButtonText}>홈으로 돌아가기</Text>
            </TouchableOpacity>
          </View>
        ) : selectedMember ? (
          /* Review Form */
          <View style={styles.reviewFormContainer}>
            <View style={styles.selectedMemberCard}>
              <View style={styles.memberAvatar}>
                {selectedMember.profileImage ? (
                  <Image source={{ uri: selectedMember.profileImage }} style={styles.memberAvatarImage} />
                ) : (
                  <Feather name="user" size={24} color="#71717A" />
                )}
              </View>
              <Text style={styles.memberName}>{selectedMember.nickname}</Text>
              <TouchableOpacity onPress={() => setSelectedMember(null)}>
                <Feather name="x" size={20} color="#71717A" />
              </TouchableOpacity>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>멤버 만족도</Text>
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
                <Text style={styles.tagsHint}>(선택 시 온도 보너스!)</Text>
              </View>
              <View style={styles.tagsContainer}>
                {MEMBER_TAGS.map((tag) => (
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
                      {tag.emoji} {tag.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>상세 리뷰</Text>
              <Text style={styles.inputHint}>작성하신 내용은 다른 멤버들에게 공개됩니다.</Text>
              <View style={styles.textInputContainer}>
                <TextInput
                  style={styles.textInputMultiline}
                  placeholder="함께 활동한 소감을 자유롭게 작성해주세요."
                  placeholderTextColor="#71717A"
                  multiline
                  value={content}
                  onChangeText={setContent}
                  textAlignVertical="top"
                  maxLength={300}
                />
                <Text style={styles.charCount}>{content.length}/300</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.submitButton,
                (!selectedRating || isSubmitting) && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmitReview}
              disabled={!selectedRating || isSubmitting}
            >
              <Text style={styles.submitButtonText}>
                {isSubmitting ? '등록 중...' : '평가 완료'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Member List */
          <View style={styles.memberList}>
            {members.map((member) => (
              <TouchableOpacity
                key={member.userId}
                style={[
                  styles.memberCard,
                  member.alreadyReviewed && styles.memberCardReviewed,
                ]}
                onPress={() => !member.alreadyReviewed && setSelectedMember(member)}
                disabled={member.alreadyReviewed}
              >
                <View style={styles.memberInfo}>
                  <View style={styles.memberAvatar}>
                    {member.profileImage ? (
                      <Image source={{ uri: member.profileImage }} style={styles.memberAvatarImage} />
                    ) : (
                      <Feather name="user" size={20} color="#71717A" />
                    )}
                  </View>
                  <Text style={styles.memberName}>{member.nickname}</Text>
                </View>
                {member.alreadyReviewed ? (
                  <View style={styles.reviewedBadge}>
                    <Feather name="check" size={14} color="#22C55E" />
                    <Text style={styles.reviewedText}>완료</Text>
                  </View>
                ) : (
                  <Feather name="chevron-right" size={20} color="#71717A" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
      <CustomAlert {...alert.alertProps} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#18181B',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#71717A',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  retryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 56,
    paddingHorizontal: 16,
    paddingBottom: 12,
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
  studyTitleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B5CF6',
    marginBottom: 8,
  },
  descText: {
    fontSize: 14,
    color: '#71717A',
    textAlign: 'center',
    lineHeight: 21,
  },
  allReviewedContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  allReviewedEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  allReviewedText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  allReviewedSubText: {
    fontSize: 14,
    color: '#71717A',
    textAlign: 'center',
    lineHeight: 21,
    marginTop: 8,
  },
  homeButton: {
    marginTop: 24,
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  homeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  memberList: {
    gap: 12,
    paddingBottom: 40,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#27272A',
    borderRadius: 12,
    padding: 16,
  },
  memberCardReviewed: {
    opacity: 0.6,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  memberAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#3F3F46',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  memberAvatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  memberName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  reviewedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#22C55E20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  reviewedText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#22C55E',
  },
  reviewFormContainer: {
    paddingBottom: 40,
  },
  selectedMemberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#27272A',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    marginBottom: 24,
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
    fontSize: 24,
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
  textInputMultiline: {
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
  textInput: {
    backgroundColor: '#27272A',
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: '#FFFFFF',
  },
  submitButton: {
    height: 52,
    borderRadius: 12,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
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
