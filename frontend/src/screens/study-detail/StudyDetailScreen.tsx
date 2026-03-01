import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { getStudyDetail } from '../../api/study';
import { StudyDetailResponse } from '../../types/study';
import { styles } from './styles';
import { TabType } from './types';
import BoardListView from '../study-board/BoardListView';
import GalleryListView from '../study-gallery/GalleryListView';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type StudyDetailRouteProp = RouteProp<RootStackParamList, 'StudyDetail'>;

// Duration type labels
const DURATION_LABELS: Record<string, string> = {
  ONE_WEEK: '1주',
  TWO_WEEKS: '2주',
  THREE_WEEKS: '3주',
  FOUR_WEEKS: '4주',
  FIVE_WEEKS: '5주',
  SIX_WEEKS: '6주',
  EIGHT_WEEKS: '8주',
  TEN_WEEKS: '10주',
  TWELVE_WEEKS: '12주',
  SIXTEEN_WEEKS: '16주',
  TWENTY_WEEKS: '20주',
  TWENTY_FOUR_WEEKS: '24주',
  LONG_TERM: '장기',
};

// Study method labels
const METHOD_LABELS: Record<string, string> = {
  ONLINE: '온라인',
  OFFLINE: '오프라인',
  HYBRID: '온/오프라인',
};

// Day of week labels
const DAY_LABELS: Record<string, string> = {
  MON: '월',
  TUE: '화',
  WED: '수',
  THU: '목',
  FRI: '금',
  SAT: '토',
  SUN: '일',
};

const TAG_COLORS = ['#8B5CF620', '#3B82F620', '#22C55E20', '#F59E0B20'];
const TAG_TEXT_COLORS = ['#8B5CF6', '#3B82F6', '#22C55E', '#F59E0B'];
const MEMBER_AVATAR_COLORS = ['#6366F1', '#8B5CF6', '#A78BFA', '#C4B5FD'];

export default function StudyDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<StudyDetailRouteProp>();
  const { studyId } = route.params;
  const insets = useSafeAreaInsets();

  const [study, setStudy] = useState<StudyDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('intro');
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    loadStudyDetail();
    loadCurrentUser();
  }, [studyId]);

  const loadCurrentUser = async () => {
    try {
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setCurrentUserId(user.id);
      }
    } catch (error) {
      console.error('Failed to load current user:', error);
    }
  };

  const loadStudyDetail = async () => {
    try {
      const data = await getStudyDetail(studyId);
      setStudy(data);
    } catch (error) {
      console.error('Failed to load study detail:', error);
      Alert.alert('오류', '스터디 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const formatDaysOfWeek = (daysStr?: string): string => {
    if (!daysStr) return '';
    return daysStr
      .split(',')
      .map(d => DAY_LABELS[d.trim()] || d)
      .join(', ');
  };

  const handleJoinStudy = () => {
    navigation.navigate('StudyApply', {
      studyId: study!.id,
      studyTitle: study!.title,
      leaderName: study!.leader.nickname,
      currentMembers: study!.currentMembers,
      maxMembers: study!.maxMembers,
      rules: study!.rules || [],
      depositRefundPolicy: study!.depositRefundPolicy,
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#18181B" />
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  if (!study) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#18181B" />
        <Text style={styles.errorText}>스터디를 찾을 수 없습니다.</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>돌아가기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#18181B" />

      {/* Header */}
      <View style={[styles.header, { marginTop: insets.top }]}>
        <TouchableOpacity style={styles.headerBackBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>스터디 상세</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity>
            <Feather name="share-2" size={22} color="#A1A1AA" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Feather name="bookmark" size={22} color="#A1A1AA" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        {(['intro', 'board', 'gallery'] as TabType[]).map(tab => {
          const labels: Record<TabType, string> = { intro: '소개', board: '게시판', gallery: '사진첩' };
          return (
            <TouchableOpacity
              key={tab}
              style={styles.tab}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {labels[tab]}
              </Text>
              {activeTab === tab && <View style={styles.tabIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>

      {activeTab === 'board' ? (
        <BoardListView
          studyId={studyId}
          onPostPress={(postId) => navigation.navigate('BoardPostDetail', { studyId, postId })}
          onCreatePress={() => {
              const leaderId = study?.leader?.id;
              const isLeader = currentUserId !== null && leaderId !== undefined &&
                Number(currentUserId) === Number(leaderId);
              navigation.navigate('BoardPostCreate', { studyId, isLeader });
            }}
        />
      ) : activeTab === 'gallery' ? (
        <GalleryListView studyId={studyId} />
      ) : (
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {activeTab === 'intro' && (
          <>
            {/* Cover Image */}
            <View style={styles.coverImage}>
              {study.coverImageUrl ? (
                <Image source={{ uri: study.coverImageUrl }} style={styles.coverImg} />
              ) : (
                <Feather name="image" size={48} color="#3F3F46" />
              )}
            </View>

            {/* Info Section */}
            <View style={styles.infoSection}>
              <View style={styles.badgeRow}>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>{study.categoryName}</Text>
                </View>
                {study.studyMethod && (
                  <View
                    style={[
                      styles.methodBadge,
                      study.studyMethod === 'ONLINE' && styles.onlineBadge,
                      study.studyMethod === 'OFFLINE' && styles.offlineBadge,
                      study.studyMethod === 'HYBRID' && styles.hybridBadge,
                    ]}
                  >
                    <Text
                      style={[
                        styles.methodBadgeText,
                        study.studyMethod === 'ONLINE' && styles.onlineText,
                        study.studyMethod === 'OFFLINE' && styles.offlineText,
                        study.studyMethod === 'HYBRID' && styles.hybridText,
                      ]}
                    >
                      {METHOD_LABELS[study.studyMethod]}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={styles.studyTitle}>{study.title}</Text>
              <View style={styles.hostRow}>
                <View style={styles.hostAvatar}>
                  {study.leader.profileImage ? (
                    <Image source={{ uri: study.leader.profileImage }} style={styles.hostAvatarImg} />
                  ) : (
                    <Feather name="user" size={20} color="#71717A" />
                  )}
                </View>
                <View style={styles.hostInfo}>
                  <Text style={styles.hostName}>{study.leader.nickname}</Text>
                  <Text style={styles.hostTemp}>🌡️ {study.leader.temperature}°C</Text>
                </View>
              </View>
            </View>

            {/* Schedule Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>일정 정보</Text>
              <View style={styles.scheduleCard}>
                <View style={styles.scheduleRow}>
                  <Feather name="calendar" size={18} color="#8B5CF6" />
                  <Text style={styles.scheduleText}>
                    {formatDaysOfWeek(study.daysOfWeek) || '미정'}
                  </Text>
                </View>
                <View style={styles.scheduleRow}>
                  <Feather name="clock" size={18} color="#8B5CF6" />
                  <Text style={styles.scheduleText}>{study.time || '미정'}</Text>
                </View>
                <View style={styles.scheduleRow}>
                  <Feather name="repeat" size={18} color="#8B5CF6" />
                  <Text style={styles.scheduleText}>
                    {study.durationType ? DURATION_LABELS[study.durationType] : '미정'}
                  </Text>
                </View>
                {study.platform && (
                  <View style={styles.scheduleRow}>
                    <Feather name="video" size={18} color="#8B5CF6" />
                    <Text style={styles.scheduleText}>{study.platform}</Text>
                  </View>
                )}
                {study.meetingLocation && (
                  <View style={styles.scheduleRow}>
                    <Feather name="map-pin" size={18} color="#8B5CF6" />
                    <Text style={styles.scheduleText}>{study.meetingLocation}</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Members Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>참여 멤버</Text>
                <Text style={styles.membersCount}>
                  {study.currentMembers}/{study.maxMembers}명
                </Text>
              </View>
              <View style={styles.membersAvatars}>
                {Array.from({ length: Math.min(study.currentMembers, 4) }).map((_, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.memberAvatar,
                      {
                        marginLeft: idx > 0 ? -8 : 0,
                        backgroundColor: MEMBER_AVATAR_COLORS[idx % MEMBER_AVATAR_COLORS.length],
                      },
                    ]}
                  />
                ))}
                {study.currentMembers > 4 && (
                  <View style={[styles.memberAvatar, styles.memberAvatarMore]}>
                    <Text style={styles.memberAvatarMoreText}>+{study.currentMembers - 4}</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Description Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>스터디 소개</Text>
              <Text style={styles.descriptionText}>{study.description}</Text>
              {study.targetAudience && (
                <>
                  <Text style={styles.subSectionTitle}>대상</Text>
                  <Text style={styles.descriptionText}>{study.targetAudience}</Text>
                </>
              )}
              {study.goals && (
                <>
                  <Text style={styles.subSectionTitle}>목표</Text>
                  <Text style={styles.descriptionText}>{study.goals}</Text>
                </>
              )}
            </View>

            {/* Tags Section */}
            {study.tags && study.tags.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>스터디 태그</Text>
                <View style={styles.tagsWrap}>
                  {study.tags.map((tag, idx) => (
                    <View
                      key={idx}
                      style={[styles.tag, { backgroundColor: TAG_COLORS[idx % TAG_COLORS.length] }]}
                    >
                      <Text style={[styles.tagText, { color: TAG_TEXT_COLORS[idx % TAG_TEXT_COLORS.length] }]}>
                        {tag}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Curriculum Section */}
            {study.curriculums && study.curriculums.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>커리큘럼</Text>
                {study.curriculums.map((item, idx) => (
                  <View key={idx} style={styles.curriculumItem}>
                    <View style={[styles.weekBadge, idx === 0 ? styles.weekBadgeActive : styles.weekBadgeInactive]}>
                      <Text style={styles.weekBadgeText}>{item.weekNumber}</Text>
                    </View>
                    <Text style={styles.curriculumText}>{item.title}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Rules Section */}
            {study.rules && study.rules.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>스터디 규칙</Text>
                <View style={styles.rulesCard}>
                  {study.rules.map((rule, idx) => (
                    <Text key={idx} style={styles.ruleText}>
                      • {rule.content}
                    </Text>
                  ))}
                </View>
              </View>
            )}

            {/* Deposit Section */}
            {study.deposit && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>보증금 정보</Text>
                <View style={styles.feeCard}>
                  <View style={styles.feeRow}>
                    <Text style={styles.feeLabel}>보증금</Text>
                    <Text style={styles.feeValue}>{study.deposit.toLocaleString()}원</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Spacer for bottom bar */}
            <View style={{ height: 160 }} />
          </>
        )}

      </ScrollView>
      )}

      {/* Bottom Bar - 스터디장이 아닐 때만 표시 */}
      {currentUserId !== null && study.leader.id !== currentUserId && (
        <View style={[styles.bottomBar, { paddingBottom: Math.max(20, insets.bottom + 12) }]}>
          <TouchableOpacity style={styles.joinBtn} onPress={handleJoinStudy}>
            <Text style={styles.joinBtnText}>스터디 참여 신청하기</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
