import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { fetchMyProfile, fetchMyStudies } from '../api/mypage';
import { MyProfile, MyStudy } from '../types/mypage';
import { clearTokens } from '../storage/token';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const STUDY_STATUS_LABELS: Record<string, string> = {
  RECRUITING: '모집중',
  IN_PROGRESS: '진행중',
  COMPLETED: '완료',
  CANCELLED: '취소됨',
};

const ROLE_LABELS: Record<string, string> = {
  LEADER: '스터디장',
  MEMBER: '멤버',
};

export default function MyPageScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [profile, setProfile] = useState<MyProfile | null>(null);
  const [myStudies, setMyStudies] = useState<MyStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');

  const loadData = useCallback(async () => {
    try {
      const [profileData, studiesData] = await Promise.all([
        fetchMyProfile(),
        fetchMyStudies(),
      ]);
      setProfile(profileData);
      setMyStudies(studiesData);
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const handleLogout = async () => {
    await clearTokens();
    navigation.replace('Login');
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const filteredStudies = myStudies.filter((study) => {
    if (activeTab === 'active') {
      return study.status === 'RECRUITING' || study.status === 'IN_PROGRESS';
    }
    return study.status === 'COMPLETED';
  });

  const getTemperatureColor = (temp: number): string => {
    if (temp >= 40) return '#22C55E';
    if (temp >= 36.5) return '#8B5CF6';
    return '#71717A';
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
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#18181B" />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#8B5CF6"
            colors={['#8B5CF6']}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
            <Feather name="arrow-left" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>마이페이지</Text>
          <TouchableOpacity style={styles.settingsBtn}>
            <Feather name="settings" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileTop}>
            <View style={styles.avatarContainer}>
              {profile?.profileImage ? (
                <Image
                  source={{ uri: profile.profileImage }}
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Feather name="user" size={32} color="#71717A" />
                </View>
              )}
              {profile?.isStudyLeaderUnlocked && (
                <View style={styles.verifiedBadge}>
                  <Feather name="check" size={12} color="#FFFFFF" />
                </View>
              )}
            </View>

            <View style={styles.profileInfo}>
              <Text style={styles.nickname}>{profile?.nickname || '사용자'}</Text>
              <Text style={styles.email}>{profile?.email}</Text>
            </View>

            <TouchableOpacity style={styles.editBtn}>
              <Feather name="edit-2" size={16} color="#8B5CF6" />
            </TouchableOpacity>
          </View>

          {/* Temperature */}
          <View style={styles.temperatureSection}>
            <View style={styles.temperatureRow}>
              <Text style={styles.temperatureLabel}>활동 온도</Text>
              <Text
                style={[
                  styles.temperatureValue,
                  { color: getTemperatureColor(profile?.temperature || 36.5) },
                ]}
              >
                {profile?.temperature?.toFixed(1) || '36.5'}°C
              </Text>
            </View>
            <View style={styles.temperatureBar}>
              <View
                style={[
                  styles.temperatureFill,
                  {
                    width: `${Math.min((profile?.temperature || 36.5) / 50 * 100, 100)}%`,
                    backgroundColor: getTemperatureColor(profile?.temperature || 36.5),
                  },
                ]}
              />
            </View>
            {!profile?.isStudyLeaderUnlocked && (
              <Text style={styles.unlockHint}>
                스터디장 해금까지 {profile?.temperatureToUnlock?.toFixed(1)}°C 남음
              </Text>
            )}
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{profile?.stats?.activeStudyCount || 0}</Text>
              <Text style={styles.statLabel}>참여중</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{profile?.stats?.completedStudyCount || 0}</Text>
              <Text style={styles.statLabel}>완료</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{profile?.stats?.leadingStudyCount || 0}</Text>
              <Text style={styles.statLabel}>운영중</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{profile?.stats?.attendanceRate || 0}%</Text>
              <Text style={styles.statLabel}>출석률</Text>
            </View>
          </View>
        </View>

        {/* Study Leader Unlock Section */}
        {!profile?.isStudyLeaderUnlocked && (
          <View style={styles.unlockCard}>
            <View style={styles.unlockIcon}>
              <Feather name="lock" size={20} color="#8B5CF6" />
            </View>
            <View style={styles.unlockContent}>
              <Text style={styles.unlockTitle}>스터디장 기능 잠금</Text>
              <Text style={styles.unlockDesc}>
                활동 온도 40°C 이상 달성 시 스터디를 직접 만들 수 있어요
              </Text>
            </View>
          </View>
        )}

        {/* My Studies Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>내 스터디</Text>

          {/* Tabs */}
          <View style={styles.tabRow}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'active' && styles.tabActive]}
              onPress={() => setActiveTab('active')}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'active' && styles.tabTextActive,
                ]}
              >
                진행중
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'completed' && styles.tabActive]}
              onPress={() => setActiveTab('completed')}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'completed' && styles.tabTextActive,
                ]}
              >
                완료
              </Text>
            </TouchableOpacity>
          </View>

          {/* Study List */}
          {filteredStudies.length === 0 ? (
            <View style={styles.emptyState}>
              <Feather name="inbox" size={40} color="#52525B" />
              <Text style={styles.emptyStateText}>
                {activeTab === 'active'
                  ? '진행중인 스터디가 없어요'
                  : '완료한 스터디가 없어요'}
              </Text>
            </View>
          ) : (
            filteredStudies.map((study) => (
              <TouchableOpacity
                key={study.studyId}
                style={styles.studyCard}
                onPress={() =>
                  navigation.navigate('StudyDetail', { studyId: study.studyId })
                }
              >
                <View style={styles.studyCardLeft}>
                  {study.thumbnailImage ? (
                    <Image
                      source={{ uri: study.thumbnailImage }}
                      style={styles.studyThumbnail}
                    />
                  ) : (
                    <View style={styles.studyThumbnailPlaceholder}>
                      <Feather name="book-open" size={20} color="#71717A" />
                    </View>
                  )}
                </View>
                <View style={styles.studyCardRight}>
                  <View style={styles.studyTagRow}>
                    {study.category && (
                      <View style={styles.studyTag}>
                        <Text style={styles.studyTagText}>{study.category}</Text>
                      </View>
                    )}
                    <View
                      style={[
                        styles.roleTag,
                        study.myRole === 'LEADER' && styles.leaderTag,
                      ]}
                    >
                      <Text
                        style={[
                          styles.roleTagText,
                          study.myRole === 'LEADER' && styles.leaderTagText,
                        ]}
                      >
                        {ROLE_LABELS[study.myRole]}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.studyTitle} numberOfLines={1}>
                    {study.title}
                  </Text>
                  <View style={styles.studyMeta}>
                    <Feather name="users" size={12} color="#71717A" />
                    <Text style={styles.studyMetaText}>
                      {study.currentMembers}/{study.maxMembers}명
                    </Text>
                    <View
                      style={[
                        styles.statusDot,
                        {
                          backgroundColor:
                            study.status === 'RECRUITING'
                              ? '#22C55E'
                              : study.status === 'IN_PROGRESS'
                              ? '#3B82F6'
                              : '#71717A',
                        },
                      ]}
                    />
                    <Text style={styles.studyMetaText}>
                      {STUDY_STATUS_LABELS[study.status]}
                    </Text>
                  </View>
                </View>
                <Feather name="chevron-right" size={20} color="#52525B" />
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <TouchableOpacity style={styles.menuItem}>
            <Feather name="bell" size={20} color="#A1A1AA" />
            <Text style={styles.menuText}>알림 설정</Text>
            <Feather name="chevron-right" size={20} color="#52525B" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Feather name="help-circle" size={20} color="#A1A1AA" />
            <Text style={styles.menuText}>고객센터</Text>
            <Feather name="chevron-right" size={20} color="#52525B" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Feather name="file-text" size={20} color="#A1A1AA" />
            <Text style={styles.menuText}>이용약관</Text>
            <Feather name="chevron-right" size={20} color="#52525B" />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>로그아웃</Text>
        </TouchableOpacity>

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
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    backgroundColor: '#27272A',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  settingsBtn: {
    width: 40,
    height: 40,
    backgroundColor: '#27272A',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileCard: {
    marginHorizontal: 24,
    backgroundColor: '#27272A',
    borderRadius: 20,
    padding: 20,
  },
  profileTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#3F3F46',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#22C55E',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#27272A',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  nickname: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  email: {
    fontSize: 13,
    color: '#71717A',
    marginTop: 4,
  },
  editBtn: {
    width: 36,
    height: 36,
    backgroundColor: '#3F3F46',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  temperatureSection: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#3F3F46',
  },
  temperatureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  temperatureLabel: {
    fontSize: 14,
    color: '#A1A1AA',
  },
  temperatureValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  temperatureBar: {
    height: 6,
    backgroundColor: '#3F3F46',
    borderRadius: 3,
    overflow: 'hidden',
  },
  temperatureFill: {
    height: '100%',
    borderRadius: 3,
  },
  unlockHint: {
    fontSize: 12,
    color: '#71717A',
    marginTop: 8,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#3F3F46',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#71717A',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#3F3F46',
  },
  unlockCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    marginTop: 16,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  unlockIcon: {
    width: 44,
    height: 44,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unlockContent: {
    flex: 1,
    marginLeft: 12,
  },
  unlockTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  unlockDesc: {
    fontSize: 12,
    color: '#A1A1AA',
    marginTop: 4,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#27272A',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#8B5CF6',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#71717A',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#71717A',
  },
  studyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#27272A',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  studyCardLeft: {
    marginRight: 14,
  },
  studyThumbnail: {
    width: 56,
    height: 56,
    borderRadius: 12,
  },
  studyThumbnailPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#3F3F46',
    justifyContent: 'center',
    alignItems: 'center',
  },
  studyCardRight: {
    flex: 1,
  },
  studyTagRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  studyTag: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#3F3F46',
    borderRadius: 6,
  },
  studyTagText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#A1A1AA',
  },
  roleTag: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#3F3F46',
    borderRadius: 6,
  },
  leaderTag: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
  },
  roleTagText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#A1A1AA',
  },
  leaderTagText: {
    color: '#8B5CF6',
  },
  studyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  studyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  studyMetaText: {
    fontSize: 12,
    color: '#71717A',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: 8,
  },
  menuSection: {
    marginTop: 24,
    marginHorizontal: 24,
    backgroundColor: '#27272A',
    borderRadius: 16,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#3F3F46',
  },
  menuText: {
    flex: 1,
    fontSize: 15,
    color: '#E4E4E7',
    marginLeft: 12,
  },
  logoutBtn: {
    marginTop: 24,
    marginHorizontal: 24,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: 12,
  },
  logoutText: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 40,
  },
});
