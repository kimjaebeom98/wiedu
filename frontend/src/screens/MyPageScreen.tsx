import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Image,
  TextInput,
  Modal,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { getMyProfile, getMyStudies } from '../api/profile';
import { getMyStudyRequests, StudyRequestResponse } from '../api/study';
import { getMyBookmarks } from '../api/bookmark';
import { requestWithdrawal } from '../api/withdrawal';
import { getMemberReviews } from '../api/review';
import { StudyMemberReview } from '../types/review';
import { MyProfile, MyStudy } from '../types/profile';
import { StudyListResponse } from '../types/study';
import { logout } from '../api/auth';
import { getRefreshToken, clearTokens } from '../storage/token';
import { formatLocationFromAddress } from '../utils/location';
import { isValidImageUrl } from '../utils/image';
import {
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_COLORS,
  ApplicationStatus,
} from '../constants/studyStatus';

const CATEGORY_COLORS: Record<string, string> = {
  IT_DEV: '#8B5CF6',
  LANGUAGE: '#3B82F6',
  CERTIFICATION: '#22C55E',
  CAREER: '#F97316',
  BUSINESS: '#EF4444',
  FINANCE: '#FBBF24',
  DESIGN: '#EC4899',
  CIVIL_SERVICE: '#6366F1',
};

const CATEGORY_LABELS: Record<string, string> = {
  IT_DEV: '개발',
  LANGUAGE: '어학',
  CERTIFICATION: '자격증',
  CAREER: '취업',
  BUSINESS: '창업',
  FINANCE: '재테크',
  DESIGN: '디자인',
  CIVIL_SERVICE: '공무원',
};

// 멤버 리뷰 태그
const MEMBER_TAG_EMOJI: Record<string, string> = {
  active: '🔥',
  responsible: '💪',
  kind: '💕',
  prepared: '📝',
  helpful: '🤝',
  positive: '✨',
};

const MEMBER_TAG_LABEL: Record<string, string> = {
  active: '적극적인 참여',
  responsible: '책임감 있음',
  kind: '친절하고 배려심',
  prepared: '준비를 잘 해옴',
  helpful: '도움을 많이 줌',
  positive: '긍정적인 에너지',
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type ExpandedSection = 'participating' | 'leading' | 'bookmarked' | 'reviews' | null;

export default function MyPageScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState<MyProfile | null>(null);
  const [myStudies, setMyStudies] = useState<MyStudy[]>([]);
  const [myApplications, setMyApplications] = useState<StudyRequestResponse[]>([]);
  const [myBookmarks, setMyBookmarks] = useState<StudyListResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<ExpandedSection>(null);

  // 탈퇴 모달 관련 상태
  const [withdrawalModalVisible, setWithdrawalModalVisible] = useState(false);
  const [selectedStudyForWithdrawal, setSelectedStudyForWithdrawal] = useState<MyStudy | null>(null);
  const [withdrawalReason, setWithdrawalReason] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const swipeableRefs = useRef<Map<number, Swipeable | null>>(new Map());

  // 멤버 리뷰 관련 상태
  const [memberReviews, setMemberReviews] = useState<StudyMemberReview[]>([]);
  const [reviewStats, setReviewStats] = useState<{ totalCount: number; averageRating: number | null }>({
    totalCount: 0,
    averageRating: null,
  });

  const loadProfile = useCallback(async () => {
    try {
      setError(null);
      const [profileData, studiesData, applicationsData, bookmarksData] = await Promise.all([
        getMyProfile(),
        getMyStudies().catch(() => []),
        getMyStudyRequests().catch(() => []),
        getMyBookmarks(0, 5).catch(() => ({ content: [] })),
      ]);
      setProfile(profileData);
      setMyStudies(studiesData);

      // 멤버 리뷰 데이터 로드 (마이 프로필용)
      try {
        const reviews = await getMemberReviews(profileData.id);
        setMemberReviews(reviews);
        const totalCount = reviews.length;
        const averageRating = totalCount > 0
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalCount
          : null;
        setReviewStats({ totalCount, averageRating });
      } catch {
        // 리뷰 로드 실패해도 무시
      }
      setMyBookmarks(bookmarksData.content);

      // 3일 이내의 신청만 표시 (PENDING은 항상, APPROVED/REJECTED는 processedAt 기준 3일)
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      const filteredApplications = applicationsData.filter(app => {
        if (app.status === 'PENDING') return true;
        if (!app.processedAt) return false;
        return new Date(app.processedAt) >= threeDaysAgo;
      });
      setMyApplications(filteredApplications);
    } catch (err) {
      console.error('Failed to load profile:', err);
      setError('프로필을 불러오지 못했어요.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogout = async () => {
    try {
      const refreshToken = await getRefreshToken();
      if (refreshToken) {
        await logout(refreshToken);
      }
    } catch (error) {
      // 서버 로그아웃 실패해도 로컬 토큰은 삭제
    }
    await clearTokens();
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  const handleWithdrawalPress = (study: MyStudy) => {
    // 스터디장은 탈퇴할 수 없음
    if (study.myRole === 'LEADER') return;

    setSelectedStudyForWithdrawal(study);
    setWithdrawalReason('');
    setWithdrawalModalVisible(true);

    // 스와이프 닫기
    swipeableRefs.current.get(study.studyId)?.close();
  };

  const handleWithdrawalSubmit = async () => {
    if (!selectedStudyForWithdrawal || !withdrawalReason.trim()) return;

    try {
      setIsWithdrawing(true);
      await requestWithdrawal(selectedStudyForWithdrawal.studyId, withdrawalReason.trim());
      setWithdrawalModalVisible(false);
      setSelectedStudyForWithdrawal(null);
      setWithdrawalReason('');
      // 새로고침
      loadProfile();
    } catch (error) {
      // API 에러는 withErrorHandling에서 처리됨
    } finally {
      setIsWithdrawing(false);
    }
  };

  const renderRightActions = (study: MyStudy) => {
    // 스터디장은 스와이프 불가
    if (study.myRole === 'LEADER') return null;

    return (
      <TouchableOpacity
        style={styles.swipeAction}
        onPress={() => handleWithdrawalPress(study)}
      >
        <Feather name="log-out" size={20} color="#FFFFFF" />
        <Text style={styles.swipeActionText}>탈퇴</Text>
      </TouchableOpacity>
    );
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadProfile();
    }, [loadProfile])
  );

  const temperature = profile?.temperature ?? 0;

  const getExperienceBadge = (level: string | null): string => {
    if (!level) return '신입';
    const labels: Record<string, string> = {
      BEGINNER: '입문',
      JUNIOR: '초급',
      INTERMEDIATE: '중급',
      SENIOR: '고급',
      EXPERT: '전문가',
    };
    return labels[level] ?? level;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#18181B" />
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  if (error || !profile) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#18181B" />
        <Feather name="alert-circle" size={40} color="#71717A" />
        <Text style={styles.errorText}>{error ?? '프로필을 불러오지 못했어요.'}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={loadProfile}>
          <Text style={styles.retryBtnText}>다시 시도</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Feather name="log-out" size={16} color="#EF4444" />
          <Text style={styles.logoutBtnText}>로그아웃</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#18181B" />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
          <View style={styles.profileTabs}>
            <View style={styles.profileTabActive}>
              <Text style={styles.profileTabTextActive}>마이 프로필</Text>
            </View>
            <TouchableOpacity
              style={styles.profileTab}
              onPress={() => navigation.navigate('StudyLeader')}
            >
              <Text style={styles.profileTabText}>스터디장 프로필</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.headerMoreBtn}
            onPress={() => navigation.navigate('Settings')}
          >
            <Feather name="settings" size={24} color="#A1A1AA" />
          </TouchableOpacity>
        </View>

        {/* Profile Section */}
        <TouchableOpacity
          style={styles.profileCard}
          onPress={() => navigation.navigate('ProfileEdit')}
          activeOpacity={0.7}
        >
          {/* Edit indicator */}
          <View style={styles.editIndicator}>
            <Feather name="edit-2" size={14} color="#8B5CF6" />
          </View>

          {/* Avatar */}
          <View style={styles.avatarContainer}>
            {profile.profileImage ? (
              <Image source={{ uri: profile.profileImage }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatar}>
                <Feather name="user" size={44} color="#71717A" />
              </View>
            )}
          </View>

          {/* Name & Badge */}
          <View style={styles.nameRow}>
            <Text style={styles.nickname}>{profile.nickname}</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{getExperienceBadge(profile.experienceLevel)}</Text>
            </View>
          </View>

          {/* Region */}
          {profile.region ? (
            <View style={styles.regionRow}>
              <Feather name="map-pin" size={13} color="#71717A" />
              <Text style={styles.regionText}>{formatLocationFromAddress(profile.region)}</Text>
            </View>
          ) : null}

          {/* Temperature */}
          <View style={styles.tempSection}>
            <View style={styles.tempLabelRow}>
              <Text style={styles.tempLabel}>
                {profile.experienceLevel
                  ? `${getExperienceBadge(profile.experienceLevel)} 분야 `
                  : '개발 분야 '}
                <Text style={styles.tempValue}>{temperature.toFixed(1)}°C</Text>
              </Text>
            </View>

          </View>
        </TouchableOpacity>

        {/* Stats Section - Clickable Cards */}
        <View style={styles.statsCard}>
          <TouchableOpacity
            style={styles.statItem}
            onPress={() => setExpandedSection(expandedSection === 'participating' ? null : 'participating')}
            activeOpacity={0.7}
          >
            <Text style={styles.statNumber}>
              {myStudies.filter(s => s.status === 'RECRUITING' || s.status === 'IN_PROGRESS').length}
            </Text>
            <View style={styles.statLabelRow}>
              <Text style={styles.statLabel}>참여 스터디</Text>
              <Feather
                name={expandedSection === 'participating' ? 'chevron-up' : 'chevron-down'}
                size={14}
                color="#71717A"
              />
            </View>
          </TouchableOpacity>
          <View style={styles.statDivider} />
          <TouchableOpacity
            style={styles.statItem}
            onPress={() => setExpandedSection(expandedSection === 'leading' ? null : 'leading')}
            activeOpacity={0.7}
          >
            <Text style={styles.statNumber}>{myStudies.filter(s => s.myRole === 'LEADER' && (s.status === 'RECRUITING' || s.status === 'IN_PROGRESS')).length}</Text>
            <View style={styles.statLabelRow}>
              <Text style={styles.statLabel}>운영 스터디</Text>
              <Feather
                name={expandedSection === 'leading' ? 'chevron-up' : 'chevron-down'}
                size={14}
                color="#71717A"
              />
            </View>
          </TouchableOpacity>
          <View style={styles.statDivider} />
          <TouchableOpacity
            style={styles.statItem}
            onPress={() => setExpandedSection(expandedSection === 'bookmarked' ? null : 'bookmarked')}
            activeOpacity={0.7}
          >
            <Text style={styles.statNumber}>{myBookmarks.length}</Text>
            <View style={styles.statLabelRow}>
              <Text style={styles.statLabel}>찜한 스터디</Text>
              <Feather
                name={expandedSection === 'bookmarked' ? 'chevron-up' : 'chevron-down'}
                size={14}
                color="#71717A"
              />
            </View>
          </TouchableOpacity>
        </View>

        {/* Expanded Section - Participating Studies */}
        {expandedSection === 'participating' && myStudies.filter(s => s.status === 'RECRUITING' || s.status === 'IN_PROGRESS').length > 0 && (
          <View style={styles.expandedSection}>
            {myStudies.filter(s => s.status === 'RECRUITING' || s.status === 'IN_PROGRESS').slice(0, 3).map((study) => (
              <Swipeable
                key={study.studyId}
                ref={(ref) => { swipeableRefs.current.set(study.studyId, ref); }}
                renderRightActions={() => renderRightActions(study)}
                overshootRight={false}
                friction={2}
                enabled={study.myRole !== 'LEADER'}
              >
                <TouchableOpacity
                  style={styles.studyCard}
                  onPress={() => navigation.navigate('StudyDetail', { studyId: study.studyId })}
                >
                  {study.thumbnailImage ? (
                    <Image source={{ uri: study.thumbnailImage }} style={styles.studyThumb} />
                  ) : (
                    <View style={styles.studyThumbPlaceholder}>
                      <Feather name="book-open" size={24} color="#71717A" />
                    </View>
                  )}
                  <View style={styles.studyInfo}>
                    <View style={styles.studyNameRow}>
                      <Text style={styles.studyName} numberOfLines={1}>{study.title}</Text>
                      {study.myRole === 'LEADER' && (
                        <View style={styles.leaderBadge}>
                          <Text style={styles.leaderBadgeText}>스터디장</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.studyMeta}>
                      {study.category && (
                        <Text style={[
                          styles.studyTag,
                          { color: CATEGORY_COLORS[study.category] || '#8B5CF6' }
                        ]}>
                          {CATEGORY_LABELS[study.category] || study.category}
                        </Text>
                      )}
                      <Text style={styles.studyMembers}>멤버 {study.currentMembers}명</Text>
                    </View>
                  </View>
                  {study.myRole !== 'LEADER' && (
                    <Feather name="chevron-left" size={16} color="#52525B" style={styles.swipeHint} />
                  )}
                  <Feather name="chevron-right" size={20} color="#71717A" />
                </TouchableOpacity>
              </Swipeable>
            ))}
            {myStudies.length === 0 && (
              <View style={styles.emptyExpanded}>
                <Text style={styles.emptyExpandedText}>참여중인 스터디가 없어요</Text>
              </View>
            )}
          </View>
        )}
        {expandedSection === 'participating' && myStudies.length === 0 && (
          <View style={styles.expandedSection}>
            <View style={styles.emptyExpanded}>
              <Text style={styles.emptyExpandedText}>참여중인 스터디가 없어요</Text>
            </View>
          </View>
        )}

        {/* Expanded Section - Leading Studies */}
        {expandedSection === 'leading' && (
          <View style={styles.expandedSection}>
            {myStudies.filter(s => s.myRole === 'LEADER' && (s.status === 'RECRUITING' || s.status === 'IN_PROGRESS')).length > 0 ? (
              myStudies.filter(s => s.myRole === 'LEADER' && (s.status === 'RECRUITING' || s.status === 'IN_PROGRESS')).slice(0, 3).map((study) => (
                <TouchableOpacity
                  key={study.studyId}
                  style={styles.studyCard}
                  onPress={() => navigation.navigate('StudyDetail', { studyId: study.studyId })}
                >
                  {study.thumbnailImage ? (
                    <Image source={{ uri: study.thumbnailImage }} style={styles.studyThumb} />
                  ) : (
                    <View style={styles.studyThumbPlaceholder}>
                      <Feather name="users" size={24} color="#8B5CF6" />
                    </View>
                  )}
                  <View style={styles.studyInfo}>
                    <Text style={styles.studyName} numberOfLines={1}>{study.title}</Text>
                    <View style={styles.studyMeta}>
                      {study.category && (
                        <Text style={[
                          styles.studyTag,
                          { color: CATEGORY_COLORS[study.category] || '#8B5CF6' }
                        ]}>
                          {CATEGORY_LABELS[study.category] || study.category}
                        </Text>
                      )}
                      <Text style={styles.studyMembers}>멤버 {study.currentMembers}명</Text>
                    </View>
                  </View>
                  <Feather name="chevron-right" size={20} color="#71717A" />
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyExpanded}>
                <Text style={styles.emptyExpandedText}>운영중인 스터디가 없어요</Text>
              </View>
            )}
          </View>
        )}

        {/* Expanded Section - Bookmarked Studies */}
        {expandedSection === 'bookmarked' && (
          <View style={styles.expandedSection}>
            {myBookmarks.length > 0 ? (
              <>
                {myBookmarks.slice(0, 3).map((study) => (
                  <TouchableOpacity
                    key={study.id}
                    style={styles.studyCard}
                    onPress={() => navigation.navigate('StudyDetail', { studyId: study.id })}
                  >
                    {isValidImageUrl(study.coverImageUrl) ? (
                      <Image source={{ uri: study.coverImageUrl! }} style={styles.studyThumb} />
                    ) : (
                      <View style={styles.studyThumbPlaceholder}>
                        <Feather name="bookmark" size={24} color="#8B5CF6" />
                      </View>
                    )}
                    <View style={styles.studyInfo}>
                      <Text style={styles.studyName} numberOfLines={1}>{study.title}</Text>
                      <View style={styles.studyMeta}>
                        <Text style={[styles.studyTag, { color: CATEGORY_COLORS[study.categoryName] || '#8B5CF6' }]}>
                          {study.categoryName}
                        </Text>
                        <Text style={styles.studyMembers}>
                          {study.currentMembers}/{study.maxMembers}명
                        </Text>
                      </View>
                    </View>
                    <Feather name="chevron-right" size={20} color="#71717A" />
                  </TouchableOpacity>
                ))}
                {myBookmarks.length > 3 && (
                  <TouchableOpacity
                    style={styles.viewAllButton}
                    onPress={() => navigation.navigate('BookmarkedStudies')}
                  >
                    <Text style={styles.viewAllText}>전체보기</Text>
                    <Feather name="chevron-right" size={16} color="#8B5CF6" />
                  </TouchableOpacity>
                )}
              </>
            ) : (
              <View style={styles.emptyExpanded}>
                <Text style={styles.emptyExpandedText}>찜한 스터디가 없어요</Text>
              </View>
            )}
          </View>
        )}

        {/* My Member Reviews Card - Expandable */}
        {reviewStats.totalCount > 0 && (
          <>
            <TouchableOpacity
              style={styles.reviewCard}
              onPress={() => setExpandedSection(expandedSection === 'reviews' ? null : 'reviews')}
            >
              <View style={styles.reviewCardLeft}>
                <View style={styles.reviewIconContainer}>
                  <Feather name="message-square" size={20} color="#FBBF24" />
                </View>
                <View style={styles.reviewCardText}>
                  <Text style={styles.reviewCardTitle}>내가 받은 멤버 리뷰</Text>
                  <Text style={styles.reviewCardSubtitle}>
                    {reviewStats.totalCount}개의 리뷰 · 평균 {reviewStats.averageRating?.toFixed(1) || '-'}점
                  </Text>
                </View>
              </View>
              <Feather
                name={expandedSection === 'reviews' ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="#A1A1AA"
              />
            </TouchableOpacity>

            {expandedSection === 'reviews' && (
              <View style={styles.memberReviewsExpanded}>
                {memberReviews.map((review) => (
                  <View key={review.id} style={styles.memberReviewItem}>
                    <View style={styles.memberReviewHeader}>
                      <View style={styles.memberReviewerInfo}>
                        {review.reviewerProfileImage ? (
                          <Image
                            source={{ uri: review.reviewerProfileImage }}
                            style={styles.memberReviewerAvatar}
                          />
                        ) : (
                          <View style={styles.memberReviewerAvatarPlaceholder}>
                            <Feather name="user" size={14} color="#8B5CF6" />
                          </View>
                        )}
                        <Text style={styles.memberReviewerName}>{review.reviewerNickname}</Text>
                      </View>
                      <View style={styles.memberReviewStars}>
                        {Array.from({ length: 5 }, (_, i) => (
                          <Feather
                            key={i}
                            name="star"
                            size={12}
                            color={i < review.rating ? '#FBBF24' : '#3F3F46'}
                          />
                        ))}
                      </View>
                    </View>
                    {review.tags && review.tags.length > 0 && (
                      <View style={styles.memberReviewTags}>
                        {review.tags.map((tagId) => (
                          <View key={tagId} style={styles.memberReviewTag}>
                            <Text style={styles.memberReviewTagText}>
                              {MEMBER_TAG_EMOJI[tagId] || ''} {MEMBER_TAG_LABEL[tagId] || tagId}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}
                    {review.content && (
                      <Text style={styles.memberReviewContent}>{review.content}</Text>
                    )}
                    <Text style={styles.memberReviewMeta}>
                      {review.studyTitle} · {new Date(review.createdAt).toLocaleDateString('ko-KR')}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </>
        )}

        {/* My Applications Section */}
        {myApplications.length > 0 && (
          <View style={styles.myStudySection}>
            <View style={styles.myStudyHeader}>
              <Text style={styles.myStudyTitle}>가입 신청 현황</Text>
              <Text style={styles.applicationCount}>{myApplications.length}건</Text>
            </View>
            {myApplications.map((application) => (
              <TouchableOpacity
                key={application.id}
                style={styles.applicationCard}
                onPress={() => navigation.navigate('StudyDetail', { studyId: application.studyId })}
              >
                <View style={styles.applicationInfo}>
                  <Text style={styles.studyName} numberOfLines={1}>{application.studyTitle}</Text>
                  <Text style={styles.applicationDate}>
                    {new Date(application.createdAt).toLocaleDateString('ko-KR', {
                      month: 'long',
                      day: 'numeric',
                    })} 신청
                  </Text>
                </View>
                <View style={[
                  styles.applicationStatusBadge,
                  { backgroundColor: `${APPLICATION_STATUS_COLORS[application.status as ApplicationStatus]}20` }
                ]}>
                  <Text style={[
                    styles.applicationStatusText,
                    { color: APPLICATION_STATUS_COLORS[application.status as ApplicationStatus] }
                  ]}>
                    {APPLICATION_STATUS_LABELS[application.status as ApplicationStatus]}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Completed Studies Section - Review Prompt */}
        {/* 1달 이내의 종료된 스터디만 표시 */}
        {(() => {
          const oneMonthAgo = new Date();
          oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
          const recentCompletedStudies = myStudies.filter(s => {
            if (s.status !== 'COMPLETED') return false;
            if (!s.updatedAt) return true; // updatedAt 없으면 일단 표시
            return new Date(s.updatedAt) >= oneMonthAgo;
          });
          const needsReviewStudies = recentCompletedStudies.filter(s => !s.reviewCompleted);

          if (recentCompletedStudies.length === 0) return null;

          return (
            <View style={styles.myStudySection}>
              <View style={styles.myStudyHeader}>
                <View style={styles.completedHeaderLeft}>
                  <Feather name="check-circle" size={18} color="#22C55E" />
                  <Text style={styles.myStudyTitle}>종료된 스터디</Text>
                </View>
                {needsReviewStudies.length > 0 && (
                  <View style={styles.reviewNeededBadge}>
                    <Text style={styles.reviewNeededText}>리뷰 {needsReviewStudies.length}건</Text>
                  </View>
                )}
              </View>
              {recentCompletedStudies.map((study) => (
                <TouchableOpacity
                  key={study.studyId}
                  style={[
                    styles.completedStudyCard,
                    study.reviewCompleted && styles.completedStudyCardDone,
                  ]}
                  onPress={() => navigation.navigate('StudyDetail', { studyId: study.studyId })}
                >
                  {study.thumbnailImage ? (
                    <Image source={{ uri: study.thumbnailImage }} style={styles.studyThumb} />
                  ) : (
                    <View style={styles.studyThumbPlaceholder}>
                      <Feather name="award" size={24} color="#22C55E" />
                    </View>
                  )}
                  <View style={styles.studyInfo}>
                    <View style={styles.studyNameRow}>
                      <Text style={styles.studyName} numberOfLines={1}>{study.title}</Text>
                      {study.myRole === 'LEADER' && (
                        <View style={styles.leaderBadge}>
                          <Text style={styles.leaderBadgeText}>스터디장</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[
                      styles.completedHint,
                      study.reviewCompleted && styles.completedHintDone,
                    ]}>
                      {study.reviewCompleted ? '리뷰 작성 완료' : '탭하여 리뷰 작성하기'}
                    </Text>
                  </View>
                  <View style={[
                    styles.reviewArrow,
                    study.reviewCompleted && styles.reviewArrowDone,
                  ]}>
                    <Feather
                      name={study.reviewCompleted ? 'check' : 'edit-2'}
                      size={16}
                      color={study.reviewCompleted ? '#22C55E' : '#8B5CF6'}
                    />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          );
        })()}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* 탈퇴 사유 입력 모달 */}
      <Modal
        visible={withdrawalModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setWithdrawalModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIconContainer}>
                <Feather name="log-out" size={24} color="#EF4444" />
              </View>
              <Text style={styles.modalTitle}>스터디 탈퇴</Text>
              <Text style={styles.modalSubtitle}>
                {selectedStudyForWithdrawal?.title}
              </Text>
            </View>

            <Text style={styles.modalLabel}>탈퇴 사유</Text>
            <TextInput
              style={styles.reasonInput}
              placeholder="탈퇴 사유를 입력해주세요"
              placeholderTextColor="#71717A"
              value={withdrawalReason}
              onChangeText={setWithdrawalReason}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            <Text style={styles.modalNote}>
              * 탈퇴 신청 후 스터디장의 승인이 필요합니다.
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setWithdrawalModalVisible(false)}
                disabled={isWithdrawing}
              >
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  !withdrawalReason.trim() && styles.submitButtonDisabled,
                ]}
                onPress={handleWithdrawalSubmit}
                disabled={!withdrawalReason.trim() || isWithdrawing}
              >
                {isWithdrawing ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitButtonText}>탈퇴 신청</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    backgroundColor: '#18181B',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#71717A',
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: 8,
    backgroundColor: '#8B5CF6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  retryBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  logoutBtn: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  logoutBtnText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#EF4444',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
  },
  profileTabs: {
    flexDirection: 'row',
    gap: 12,
  },
  profileTab: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3F3F46',
  },
  profileTabActive: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#8B5CF6',
  },
  profileTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#71717A',
  },
  profileTabTextActive: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  headerMoreBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileCard: {
    backgroundColor: '#27272A',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    gap: 12,
    position: 'relative',
  },
  editIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 4,
  },
  avatar: {
    width: 100,
    height: 100,
    backgroundColor: '#3F3F46',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nickname: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  badge: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  regionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  regionText: {
    fontSize: 13,
    color: '#71717A',
  },
  tempSection: {
    width: '100%',
    gap: 8,
    marginTop: 4,
  },
  tempLabelRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  tempLabel: {
    fontSize: 14,
    color: '#A1A1AA',
    fontWeight: '500',
  },
  tempValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F97316',
  },
  statsCard: {
    backgroundColor: '#27272A',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#71717A',
  },
  statLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: '#3F3F46',
  },
  reviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#27272A',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#FBBF2430',
  },
  reviewCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  reviewIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FBBF2420',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewCardText: {
    gap: 4,
  },
  reviewCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  reviewCardSubtitle: {
    fontSize: 12,
    color: '#A1A1AA',
  },
  memberReviewsExpanded: {
    backgroundColor: '#27272A',
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    gap: 16,
  },
  memberReviewItem: {
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#3F3F46',
  },
  memberReviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  memberReviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  memberReviewerAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  memberReviewerAvatarPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#3F3F46',
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberReviewerName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  memberReviewStars: {
    flexDirection: 'row',
    gap: 2,
  },
  memberReviewTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  memberReviewTag: {
    backgroundColor: '#3F3F46',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  memberReviewTagText: {
    fontSize: 11,
    color: '#E4E4E7',
  },
  memberReviewContent: {
    fontSize: 13,
    color: '#E4E4E7',
    lineHeight: 20,
    marginBottom: 8,
  },
  memberReviewMeta: {
    fontSize: 11,
    color: '#71717A',
  },
  bottomSpacer: {
    height: 100,
  },
  myStudySection: {
    marginTop: 16,
    gap: 16,
  },
  myStudyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  myStudyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  myStudyMore: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8B5CF6',
  },
  studyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#27272A',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  studyThumb: {
    width: 56,
    height: 56,
    borderRadius: 8,
  },
  studyThumbPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#3F3F46',
    justifyContent: 'center',
    alignItems: 'center',
  },
  studyInfo: {
    flex: 1,
    gap: 4,
  },
  studyName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  studyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  studyTag: {
    fontSize: 12,
    fontWeight: '500',
  },
  studyMembers: {
    fontSize: 12,
    color: '#71717A',
  },
  applicationCount: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8B5CF6',
  },
  applicationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#27272A',
    borderRadius: 12,
    padding: 16,
  },
  applicationInfo: {
    flex: 1,
    gap: 4,
  },
  applicationDate: {
    fontSize: 12,
    color: '#71717A',
  },
  applicationStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  applicationStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  completedHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reviewNeededBadge: {
    backgroundColor: '#8B5CF620',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  reviewNeededText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  completedStudyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#27272A',
    borderRadius: 12,
    padding: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#22C55E30',
  },
  completedStudyCardDone: {
    borderColor: '#3F3F46',
    opacity: 0.7,
  },
  completedHint: {
    fontSize: 12,
    color: '#8B5CF6',
    marginTop: 2,
  },
  completedHintDone: {
    color: '#22C55E',
  },
  reviewArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#8B5CF620',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewArrowDone: {
    backgroundColor: '#22C55E20',
  },
  expandedSection: {
    backgroundColor: '#27272A',
    borderRadius: 16,
    padding: 12,
    marginTop: 8,
    gap: 8,
  },
  emptyExpanded: {
    padding: 24,
    alignItems: 'center',
  },
  emptyExpandedText: {
    fontSize: 14,
    color: '#71717A',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 4,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8B5CF6',
  },
  // 스와이프 관련 스타일
  swipeAction: {
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderRadius: 12,
    marginLeft: 8,
    gap: 4,
  },
  swipeActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  swipeHint: {
    marginRight: 4,
    opacity: 0.5,
  },
  studyNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  leaderBadge: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  leaderBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  // 탈퇴 모달 스타일
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#27272A',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 340,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#A1A1AA',
    textAlign: 'center',
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  reasonInput: {
    backgroundColor: '#3F3F46',
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: '#FFFFFF',
    minHeight: 100,
    marginBottom: 12,
  },
  modalNote: {
    fontSize: 12,
    color: '#71717A',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#3F3F46',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#EF4444',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#52525B',
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
