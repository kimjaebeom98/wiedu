import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { getMyProfile } from '../api/profile';
import { getLeaderReviews } from '../api/review';
import { getCategoryTemperatures } from '../api/categoryTemperature';
import { MyProfile } from '../types/profile';
import { StudyLeaderReview, StudyLeaderReviewsResponse } from '../types/review';
import { CategoryTemperature } from '../types/categoryTemperature';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

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

export default function StudyLeaderScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [profile, setProfile] = useState<MyProfile | null>(null);
  const [reviewsData, setReviewsData] = useState<StudyLeaderReviewsResponse | null>(null);
  const [categoryTemps, setCategoryTemps] = useState<CategoryTemperature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const profileData = await getMyProfile();
      setProfile(profileData);

      const [reviews, categories] = await Promise.all([
        getLeaderReviews(profileData.id),
        getCategoryTemperatures(profileData.id),
      ]);
      setReviewsData(reviews);
      setCategoryTemps(categories);
    } catch (err) {
      console.error('Failed to load leader profile data:', err);
      setError('프로필을 불러오지 못했어요.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadData();
    }, [loadData])
  );

  const temperature = profile?.temperature ?? 0;
  const progressPercent = Math.min((temperature / 100) * 100, 100);

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

  const getTemperatureColor = (temp: number): string => {
    if (temp >= 70) return '#EF4444';
    if (temp >= 50) return '#F97316';
    if (temp >= 30) return '#FBBF24';
    return '#22C55E';
  };

  const getTemperatureGradient = (temp: number): [string, string] => {
    if (temp >= 70) return ['#F97316', '#EF4444'];
    if (temp >= 50) return ['#FBBF24', '#F97316'];
    if (temp >= 30) return ['#22C55E', '#FBBF24'];
    return ['#22C55E', '#22C55E'];
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
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
        <TouchableOpacity style={styles.retryBtn} onPress={loadData}>
          <Text style={styles.retryBtnText}>다시 시도</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const topCategories = [...categoryTemps]
    .sort((a, b) => b.temperature - a.temperature)
    .slice(0, 3);

  const averageRating = reviewsData?.averageRating ?? null;
  const totalReviewCount = reviewsData?.totalCount ?? 0;
  const reviews = reviewsData?.reviews ?? [];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#18181B" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="chevron-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>스터디장 프로필</Text>
        <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('ProfileEdit')}>
          <Text style={styles.editBtnText}>편집</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarWrapper}>
            {profile.profileImage ? (
              <Image source={{ uri: profile.profileImage }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatar}>
                <Feather name="user" size={48} color="#8B5CF6" />
              </View>
            )}
            <View style={styles.verifiedBadge}>
              <Feather name="check" size={16} color="#FFFFFF" />
            </View>
          </View>

          <View style={styles.nameRow}>
            <Text style={styles.name}>{profile.nickname}</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeIcon}>🔥</Text>
              <Text style={styles.badgeText}>{getExperienceBadge(profile.experienceLevel)}</Text>
            </View>
          </View>

          <View style={styles.tempDisplay}>
            <Text style={styles.tempLabel}>개발 분야</Text>
            <Text style={[styles.tempValue, { color: getTemperatureColor(temperature) }]}>
              {temperature.toFixed(1)}°C
            </Text>
          </View>

          <View style={styles.tempBarContainer}>
            <LinearGradient
              colors={getTemperatureGradient(temperature)}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.tempBarFill, { width: `${progressPercent}%` }]}
            />
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{profile.stats.leadingStudyCount}</Text>
            <Text style={styles.statLabel}>운영</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#22C55E' }]}>
              {profile.stats.attendanceRate}%
            </Text>
            <Text style={styles.statLabel}>완주율</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#FBBF24' }]}>
              {averageRating !== null ? averageRating.toFixed(1) : '-'}
            </Text>
            <Text style={styles.statLabel}>평점</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{totalReviewCount}</Text>
            <Text style={styles.statLabel}>리뷰</Text>
          </View>
        </View>

        {/* Category Temperature Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>분야별 전문성</Text>
          <View style={styles.card}>
            {topCategories.length === 0 ? (
              <View style={styles.emptyCategory}>
                <Feather name="bar-chart-2" size={24} color="#3F3F46" />
                <Text style={styles.emptyCategoryText}>스터디 활동 데이터가 쌓이면 표시됩니다</Text>
              </View>
            ) : (
              topCategories.map((cat) => (
                <CategoryBar
                  key={cat.category}
                  label={cat.label}
                  value={cat.temperature}
                  color={CATEGORY_COLORS[cat.category] ?? '#71717A'}
                />
              ))
            )}
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>소개</Text>
          <View style={styles.card}>
            <View style={styles.jobInfo}>
              <Feather name="briefcase" size={16} color="#8B5CF6" />
              <Text style={styles.jobText}>개발자</Text>
            </View>
            <Text style={styles.bioText}>
              {profile.bio || '아직 소개가 없어요. 편집 버튼을 눌러 소개를 작성해보세요!'}
            </Text>
          </View>
        </View>

        {/* Review Section */}
        <View style={styles.section}>
          <View style={styles.reviewHeader}>
            <Text style={styles.sectionTitle}>리뷰 {totalReviewCount}개</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>전체보기</Text>
            </TouchableOpacity>
          </View>
          {reviews.length === 0 ? (
            <View style={styles.emptyReview}>
              <Feather name="message-square" size={32} color="#3F3F46" />
              <Text style={styles.emptyReviewText}>아직 리뷰가 없어요</Text>
            </View>
          ) : (
            reviews.map((review) => (
              <ReviewCard key={review.id} review={review} formatDate={formatDate} />
            ))
          )}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

interface CategoryBarProps {
  label: string;
  value: number;
  color: string;
}

function CategoryBar({ label, value, color }: CategoryBarProps) {
  return (
    <View style={styles.categoryItem}>
      <View style={styles.categoryHeader}>
        <Text style={styles.categoryLabel}>{label}</Text>
        <Text style={[styles.categoryValue, { color }]}>{value.toFixed(1)}°C</Text>
      </View>
      <View style={styles.categoryBarBg}>
        <View style={[styles.categoryBarFill, { width: `${Math.min(value, 100)}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

interface ReviewCardProps {
  review: StudyLeaderReview;
  formatDate: (dateStr: string) => string;
}

function ReviewCard({ review, formatDate }: ReviewCardProps) {
  const stars = Array.from({ length: 5 }, (_, i) => i < review.rating);

  return (
    <View style={styles.reviewCard}>
      <View style={styles.reviewCardHeader}>
        <View style={styles.reviewerInfo}>
          {review.reviewerProfileImage ? (
            <Image source={{ uri: review.reviewerProfileImage }} style={styles.reviewerAvatar} />
          ) : (
            <View style={styles.reviewerAvatarPlaceholder}>
              <Feather name="user" size={16} color="#8B5CF6" />
            </View>
          )}
          <Text style={styles.reviewerNickname}>{review.reviewerNickname}</Text>
        </View>
        <View style={styles.starRow}>
          {stars.map((filled, idx) => (
            <Feather
              key={idx}
              name="star"
              size={12}
              color={filled ? '#FBBF24' : '#3F3F46'}
            />
          ))}
        </View>
      </View>
      <Text style={styles.reviewContent}>{review.content}</Text>
      <View style={styles.reviewMeta}>
        <Text style={styles.reviewStudyTitle}>{review.studyTitle}</Text>
        <Text style={styles.reviewDate}>{formatDate(review.createdAt)}</Text>
      </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
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
  editBtn: {
    paddingHorizontal: 8,
  },
  editBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 24,
  },
  profileSection: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  avatarWrapper: {
    position: 'relative',
    width: 100,
    height: 100,
  },
  avatar: {
    width: 100,
    height: 100,
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    backgroundColor: '#8B5CF6',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    gap: 4,
  },
  badgeIcon: {
    fontSize: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  tempDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tempLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#A1A1AA',
  },
  tempValue: {
    fontSize: 36,
    fontWeight: '700',
  },
  tempBarContainer: {
    width: 200,
    height: 8,
    backgroundColor: '#27272A',
    borderRadius: 4,
    overflow: 'hidden',
  },
  tempBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  statsSection: {
    flexDirection: 'row',
    backgroundColor: '#27272A',
    borderRadius: 16,
    padding: 16,
    justifyContent: 'space-around',
    marginTop: 20,
  },
  statItem: {
    alignItems: 'center',
    gap: 2,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#A1A1AA',
  },
  section: {
    marginTop: 20,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  card: {
    backgroundColor: '#27272A',
    borderRadius: 12,
    padding: 16,
    gap: 14,
  },
  categoryItem: {
    gap: 6,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#E4E4E7',
  },
  categoryValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  categoryBarBg: {
    height: 6,
    backgroundColor: '#3F3F46',
    borderRadius: 3,
    overflow: 'hidden',
  },
  categoryBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  jobInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  jobText: {
    fontSize: 14,
    color: '#A1A1AA',
  },
  bioText: {
    fontSize: 14,
    color: '#E4E4E7',
    lineHeight: 21,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: 14,
    color: '#8B5CF6',
  },
  emptyReview: {
    backgroundColor: '#27272A',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    gap: 8,
  },
  emptyReviewText: {
    fontSize: 14,
    color: '#71717A',
  },
  emptyCategory: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  emptyCategoryText: {
    fontSize: 13,
    color: '#71717A',
    textAlign: 'center',
  },
  reviewCard: {
    backgroundColor: '#27272A',
    borderRadius: 12,
    padding: 16,
    gap: 10,
  },
  reviewCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reviewerAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  reviewerAvatarPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewerNickname: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E4E4E7',
  },
  starRow: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewContent: {
    fontSize: 14,
    color: '#A1A1AA',
    lineHeight: 20,
  },
  reviewMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewStudyTitle: {
    fontSize: 12,
    color: '#71717A',
    flex: 1,
    marginRight: 8,
  },
  reviewDate: {
    fontSize: 12,
    color: '#52525B',
  },
  bottomSpacer: {
    height: 100,
  },
});
