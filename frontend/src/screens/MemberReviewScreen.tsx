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
  { value: 5, emoji: '😍', label: '최고' },
  { value: 4, emoji: '😊', label: '좋음' },
  { value: 3, emoji: '😐', label: '보통' },
  { value: 2, emoji: '😕', label: '아쉬움' },
  { value: 1, emoji: '😞', label: '별로' },
];

export default function MemberReviewScreen() {
  const navigation = useNavigation<MemberReviewScreenNavigationProp>();
  const route = useRoute<MemberReviewScreenRouteProp>();
  const insets = useSafeAreaInsets();
  const alert = useAlert();
  const { studyId, studyTitle } = route.params;

  const [members, setMembers] = useState<StudyMemberToReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<StudyMemberToReview | null>(null);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadMembers();
  }, [studyId]);

  const loadMembers = async () => {
    try {
      const data = await getMembersToReview(studyId);
      setMembers(data);
    } catch (error: any) {
      const message = error.response?.data?.message || '멤버 목록을 불러오는데 실패했습니다.';
      alert.show({ title: '오류', message, icon: 'x-circle' });
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
              <Text style={styles.sectionTitle}>평가</Text>
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

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>한줄평 (선택)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="함께 활동한 소감을 남겨주세요."
                placeholderTextColor="#71717A"
                value={content}
                onChangeText={setContent}
                maxLength={100}
              />
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
