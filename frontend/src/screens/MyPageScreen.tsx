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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { getMyProfile, getMyStudies } from '../api/profile';
import { MyProfile } from '../types/profile';
import { MyStudy } from '../types/mypage';

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

const UNLOCK_THRESHOLD = 40;

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function MyPageScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState<MyProfile | null>(null);
  const [myStudies, setMyStudies] = useState<MyStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    try {
      setError(null);
      const [profileData, studiesData] = await Promise.all([
        getMyProfile(),
        getMyStudies().catch(() => []),
      ]);
      setProfile(profileData);
      setMyStudies(studiesData);
    } catch (err) {
      console.error('Failed to load profile:', err);
      setError('프로필을 불러오지 못했어요.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadProfile();
    }, [loadProfile])
  );

  const temperature = profile?.temperature ?? 0;
  const progressPercent = Math.min((temperature / UNLOCK_THRESHOLD) * 100, 100);
  const temperatureToUnlock = profile?.temperatureToUnlock ?? Math.max(UNLOCK_THRESHOLD - temperature, 0);
  const isUnlocked = profile?.isStudyLeaderUnlocked ?? temperature >= UNLOCK_THRESHOLD;

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
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#18181B" />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
          <Text style={styles.headerTitle}>프로필</Text>
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
              <Text style={styles.regionText}>{profile.region}</Text>
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

            <View style={styles.progressBarTrack}>
              <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
            </View>

            {!isUnlocked ? (
              <Text style={styles.tempHint}>40°C 달성 시 스터디장 페이지 해금!</Text>
            ) : null}
          </View>
        </TouchableOpacity>

        {/* Stats Section */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {profile.stats.activeStudyCount + profile.stats.completedStudyCount}
            </Text>
            <Text style={styles.statLabel}>참여 스터디</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{profile.stats.leadingStudyCount}</Text>
            <Text style={styles.statLabel}>운영 스터디</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{profile.stats.attendanceRate}%</Text>
            <Text style={styles.statLabel}>출석률</Text>
          </View>
        </View>

        {/* Lock Section */}
        {!isUnlocked ? (
          <View style={styles.lockCard}>
            <View style={styles.lockIconContainer}>
              <Feather name="lock" size={28} color="#71717A" />
            </View>
            <Text style={styles.lockTitle}>스터디장 페이지 잠김</Text>
            <Text style={styles.lockDescription}>
              온도를 40°C까지 올리면{'\n'}스터디장 전용 기능이 해금돼요
            </Text>
            <View style={styles.lockProgressRow}>
              <View style={styles.lockProgressBarTrack}>
                <View style={[styles.lockProgressBarFill, { width: `${progressPercent}%` }]} />
              </View>
              <Text style={styles.lockProgressText}>
                {temperatureToUnlock.toFixed(1)}°C 더 필요
              </Text>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.leaderCard}
            onPress={() => navigation.navigate('StudyLeader')}
          >
            <View style={styles.leaderCardLeft}>
              <Feather name="unlock" size={22} color="#8B5CF6" />
              <View style={styles.leaderCardText}>
                <Text style={styles.leaderCardTitle}>스터디장 페이지</Text>
                <Text style={styles.leaderCardSubtitle}>스터디장 전용 기능을 이용하세요</Text>
              </View>
            </View>
            <Feather name="chevron-right" size={20} color="#A1A1AA" />
          </TouchableOpacity>
        )}

        {/* Participating Studies Section */}
        {myStudies.length > 0 && (
          <View style={styles.myStudySection}>
            <View style={styles.myStudyHeader}>
              <Text style={styles.myStudyTitle}>참여중인 스터디</Text>
              <TouchableOpacity>
                <Text style={styles.myStudyMore}>전체보기</Text>
              </TouchableOpacity>
            </View>
            {myStudies.slice(0, 3).map((study) => (
              <TouchableOpacity
                key={study.studyId}
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
            ))}
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
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
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
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
  progressBarTrack: {
    height: 8,
    backgroundColor: '#3F3F46',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#F97316',
    borderRadius: 4,
  },
  tempHint: {
    fontSize: 12,
    color: '#71717A',
    textAlign: 'center',
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
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: '#3F3F46',
  },
  lockCard: {
    backgroundColor: '#27272A',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    gap: 10,
    marginTop: 16,
  },
  lockIconContainer: {
    width: 60,
    height: 60,
    backgroundColor: '#3F3F46',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  lockTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  lockDescription: {
    fontSize: 13,
    color: '#71717A',
    textAlign: 'center',
    lineHeight: 20,
  },
  lockProgressRow: {
    width: '100%',
    gap: 8,
    marginTop: 4,
  },
  lockProgressBarTrack: {
    height: 8,
    backgroundColor: '#3F3F46',
    borderRadius: 4,
    overflow: 'hidden',
  },
  lockProgressBarFill: {
    height: '100%',
    backgroundColor: '#F97316',
    borderRadius: 4,
  },
  lockProgressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F97316',
    textAlign: 'center',
  },
  leaderCard: {
    backgroundColor: '#27272A',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  leaderCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  leaderCardText: {
    gap: 4,
  },
  leaderCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  leaderCardSubtitle: {
    fontSize: 12,
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
});
