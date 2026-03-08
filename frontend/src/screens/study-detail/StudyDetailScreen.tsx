import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Image,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import {
  getStudyDetail,
  closeStudy,
  completeStudy,
  getMyStudyRequests,
  getStudyRequests,
  approveStudyRequest,
  rejectStudyRequest,
  StudyRequestResponse,
} from '../../api/study';
import { getLeaderReviews } from '../../api/review';
import { StudyDetailResponse } from '../../types/study';
import { StudyLeaderReviewsResponse } from '../../types/review';
import { formatLocationDisplay } from '../../utils/location';
import { CustomAlert, AlertButton } from '../../components/common';
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
  const [leaderReviews, setLeaderReviews] = useState<StudyLeaderReviewsResponse | null>(null);
  const [processing, setProcessing] = useState(false);
  const [myApplication, setMyApplication] = useState<StudyRequestResponse | null>(null);
  const [applicants, setApplicants] = useState<StudyRequestResponse[]>([]);
  const [applicantsLoading, setApplicantsLoading] = useState(false);
  const [expandedCurriculums, setExpandedCurriculums] = useState<Set<number>>(new Set());
  const [showPolicyModal, setShowPolicyModal] = useState(false);

  // Toggle curriculum expansion
  const toggleCurriculum = (index: number) => {
    setExpandedCurriculums(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  // Custom Alert State
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    title: string;
    message?: string;
    buttons?: AlertButton[];
    icon?: 'alert-circle' | 'check-circle' | 'x-circle' | 'info' | 'user-check' | 'user-x' | 'lock' | 'calendar';
    iconColor?: string;
  }>({ title: '' });

  const showAlert = (config: typeof alertConfig) => {
    setAlertConfig(config);
    setAlertVisible(true);
  };

  const loadMyApplication = async () => {
    try {
      const requests = await getMyStudyRequests();
      const application = requests.find(r => r.studyId === studyId);
      setMyApplication(application || null);
    } catch (error) {
      // 로그인하지 않은 경우 무시
      console.log('Not logged in or failed to load applications');
    }
  };

  const loadApplicants = useCallback(async () => {
    setApplicantsLoading(true);
    try {
      const data = await getStudyRequests(studyId);
      setApplicants(data);
    } catch (error) {
      console.log('Failed to load applicants or not a leader');
    } finally {
      setApplicantsLoading(false);
    }
  }, [studyId]);

  useEffect(() => {
    loadStudyDetail();
    loadCurrentUser();
    loadMyApplication();
  }, [studyId]);

  // Reload study data when screen gains focus (e.g., returning from edit)
  useFocusEffect(
    useCallback(() => {
      loadStudyDetail();
      if (study?.leader?.id === currentUserId && study?.status === 'RECRUITING') {
        loadApplicants();
      }
    }, [study?.leader?.id, study?.status, currentUserId, loadApplicants])
  );

  const handleApproveApplicant = async (requestId: number) => {
    showAlert({
      title: '승인 확인',
      message: '이 신청자를 승인하시겠습니까?',
      icon: 'user-check',
      buttons: [
        { text: '취소', style: 'cancel' },
        {
          text: '승인',
          style: 'default',
          onPress: async () => {
            try {
              await approveStudyRequest(requestId);
              showAlert({
                title: '승인 완료',
                message: '신청이 승인되었습니다.',
                icon: 'check-circle',
                buttons: [{ text: '확인', style: 'default' }],
              });
              loadApplicants();
              loadStudyDetail();
            } catch (error: any) {
              showAlert({
                title: '오류',
                message: error.response?.data?.message || '승인에 실패했습니다.',
                icon: 'alert-circle',
                buttons: [{ text: '확인', style: 'default' }],
              });
            }
          },
        },
      ],
    });
  };

  const handleRejectApplicant = async (requestId: number) => {
    showAlert({
      title: '거절 확인',
      message: '이 신청자를 거절하시겠습니까?',
      icon: 'user-x',
      buttons: [
        { text: '취소', style: 'cancel' },
        {
          text: '거절',
          style: 'destructive',
          onPress: async () => {
            try {
              await rejectStudyRequest(requestId);
              showAlert({
                title: '거절 완료',
                message: '신청이 거절되었습니다.',
                icon: 'check-circle',
                buttons: [{ text: '확인', style: 'default' }],
              });
              loadApplicants();
            } catch (error: any) {
              showAlert({
                title: '오류',
                message: error.response?.data?.message || '거절에 실패했습니다.',
                icon: 'alert-circle',
                buttons: [{ text: '확인', style: 'default' }],
              });
            }
          },
        },
      ],
    });
  };

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
      // Load leader reviews after getting study detail
      if (data.leader?.id) {
        loadLeaderReviews(data.leader.id);
      }
      // Load applicants if user is the leader and study is recruiting
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        if (data.leader?.id === user.id && data.status === 'RECRUITING') {
          loadApplicants();
        }
      }
    } catch (error) {
      console.error('Failed to load study detail:', error);
      showAlert({
        title: '오류',
        message: '스터디 정보를 불러오는데 실패했습니다.',
        icon: 'alert-circle',
        buttons: [{ text: '확인', style: 'default' }],
      });
    } finally {
      setLoading(false);
    }
  };

  const loadLeaderReviews = async (leaderId: number) => {
    try {
      const reviews = await getLeaderReviews(leaderId);
      setLeaderReviews(reviews);
    } catch (error) {
      console.error('Failed to load leader reviews:', error);
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

  const handleWriteReview = () => {
    navigation.navigate('ReviewWrite', {
      studyId: study!.id,
      studyTitle: study!.title,
      leaderName: study!.leader.nickname,
      leaderProfileImage: study!.leader.profileImage,
    });
  };

  const handleMemberReview = () => {
    navigation.navigate('MemberReview', {
      studyId: study!.id,
      studyTitle: study!.title,
    });
  };

  const handleApplicantManagement = () => {
    navigation.navigate('ApplicantManagement', {
      studyId: study!.id,
      studyTitle: study!.title,
    });
  };

  const handleCloseStudy = () => {
    showAlert({
      title: '모집 마감',
      message: '스터디 모집을 마감하시겠습니까?\n마감 후에는 새로운 멤버를 받을 수 없습니다.',
      icon: 'lock',
      buttons: [
        { text: '취소', style: 'cancel' },
        {
          text: '마감하기',
          style: 'destructive',
          onPress: async () => {
            setProcessing(true);
            try {
              await closeStudy(studyId);
              showAlert({
                title: '마감 완료',
                message: '스터디 모집이 마감되었습니다.',
                icon: 'check-circle',
                buttons: [{ text: '확인', style: 'default' }],
              });
              loadStudyDetail();
            } catch (error: any) {
              console.error('Failed to close study:', error);
              showAlert({
                title: '오류',
                message: error.response?.data?.message || '스터디 마감에 실패했습니다.',
                icon: 'alert-circle',
                buttons: [{ text: '확인', style: 'default' }],
              });
            } finally {
              setProcessing(false);
            }
          },
        },
      ],
    });
  };

  const handleCompleteStudy = () => {
    showAlert({
      title: '스터디 종료',
      message: '스터디를 종료하시겠습니까?\n종료 후에는 멤버들이 리뷰를 작성할 수 있습니다.',
      icon: 'calendar',
      buttons: [
        { text: '취소', style: 'cancel' },
        {
          text: '종료하기',
          style: 'default',
          onPress: async () => {
            setProcessing(true);
            try {
              await completeStudy(studyId);
              showAlert({
                title: '종료 완료',
                message: '스터디가 종료되었습니다.\n멤버들에게 리뷰 작성을 요청해보세요!',
                icon: 'check-circle',
                buttons: [{ text: '확인', style: 'default' }],
              });
              loadStudyDetail();
            } catch (error: any) {
              console.error('Failed to complete study:', error);
              showAlert({
                title: '오류',
                message: error.response?.data?.message || '스터디 종료에 실패했습니다.',
                icon: 'alert-circle',
                buttons: [{ text: '확인', style: 'default' }],
              });
            } finally {
              setProcessing(false);
            }
          },
        },
      ],
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
          {study.leader.id === currentUserId && (
            <TouchableOpacity onPress={() => navigation.navigate('StudyCreate', { studyId: study.id })}>
              <Feather name="edit-2" size={22} color="#8B5CF6" />
            </TouchableOpacity>
          )}
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
        {(() => {
          const isLeader = study.leader.id === currentUserId;
          const showApplicantsTab = isLeader && study.status === 'RECRUITING';
          const tabs: TabType[] = showApplicantsTab
            ? ['intro', 'board', 'gallery', 'applicants']
            : ['intro', 'board', 'gallery'];
          const labels: Record<TabType, string> = {
            intro: '소개',
            board: '게시판',
            gallery: '사진첩',
            applicants: '가입관리',
          };
          const pendingCount = applicants.filter(a => a.status === 'PENDING').length;

          return tabs.map(tab => (
            <TouchableOpacity
              key={tab}
              style={styles.tab}
              onPress={() => {
                if (tab === 'applicants') {
                  // 신청자 관리 화면으로 이동
                  navigation.navigate('ApplicantManagement', {
                    studyId: study.id,
                    studyTitle: study.title,
                  });
                } else {
                  setActiveTab(tab);
                }
              }}
            >
              <View style={styles.tabLabelContainer}>
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                  {labels[tab]}
                </Text>
                {tab === 'applicants' && pendingCount > 0 && (
                  <View style={styles.tabBadge}>
                    <Text style={styles.tabBadgeText}>{pendingCount}</Text>
                  </View>
                )}
              </View>
              {activeTab === tab && <View style={styles.tabIndicator} />}
            </TouchableOpacity>
          ));
        })()}
      </View>

      {activeTab === 'board' ? (
        // 게시판 - 멤버만 접근 가능
        study.isMember ? (
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
        ) : (
          <View style={styles.memberOnlyContainer}>
            <View style={styles.memberOnlyIcon}>
              <Feather name="lock" size={32} color="#8B5CF6" />
            </View>
            <Text style={styles.memberOnlyTitle}>멤버 전용 공간입니다</Text>
            <Text style={styles.memberOnlyText}>
              게시판은 스터디 멤버만 이용할 수 있습니다.{'\n'}
              스터디에 참여해보세요!
            </Text>
            {study.status === 'RECRUITING' && (
              <TouchableOpacity style={styles.memberOnlyBtn} onPress={handleJoinStudy}>
                <Text style={styles.memberOnlyBtnText}>참여 신청하기</Text>
              </TouchableOpacity>
            )}
          </View>
        )
      ) : activeTab === 'gallery' ? (
        // 갤러리 - 멤버만 접근 가능
        study.isMember ? (
          <GalleryListView studyId={studyId} />
        ) : (
          <View style={styles.memberOnlyContainer}>
            <View style={styles.memberOnlyIcon}>
              <Feather name="lock" size={32} color="#8B5CF6" />
            </View>
            <Text style={styles.memberOnlyTitle}>멤버 전용 공간입니다</Text>
            <Text style={styles.memberOnlyText}>
              사진첩은 스터디 멤버만 이용할 수 있습니다.{'\n'}
              스터디에 참여해보세요!
            </Text>
            {study.status === 'RECRUITING' && (
              <TouchableOpacity style={styles.memberOnlyBtn} onPress={handleJoinStudy}>
                <Text style={styles.memberOnlyBtnText}>참여 신청하기</Text>
              </TouchableOpacity>
            )}
          </View>
        )
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
                {(study.meetingRegion || study.meetingCity) && (
                  <View style={styles.scheduleRow}>
                    <Feather name="map-pin" size={18} color="#8B5CF6" />
                    <Text style={styles.scheduleText}>
                      {[study.meetingRegion, study.meetingCity].filter(Boolean).join(' ')}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Members Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>참여 멤버</Text>
                <TouchableOpacity onPress={() => navigation.navigate('StudyMembers', { studyId: study.id, studyTitle: study.title })}>
                  <Text style={styles.viewMoreLink}>자세히보기</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.membersListContainer}>
                {study.members && study.members.length > 0 ? (
                  study.members.slice(0, 5).map((member) => (
                    <View key={member.id} style={styles.memberItem}>
                      <View style={styles.memberAvatarWrapper}>
                        <View style={styles.memberCircleAvatar}>
                          {member.profileImage ? (
                            <Image source={{ uri: member.profileImage }} style={styles.memberCircleAvatarImg} />
                          ) : (
                            <Feather name="user" size={22} color="#71717A" />
                          )}
                        </View>
                        {member.role === 'LEADER' && (
                          <View style={styles.leaderBadgeOverlay}>
                            <Feather name="star" size={12} color="#FFFFFF" />
                          </View>
                        )}
                      </View>
                      <Text style={styles.memberNickname} numberOfLines={1}>{member.nickname}</Text>
                    </View>
                  ))
                ) : (
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
                  <TouchableOpacity
                    key={idx}
                    style={styles.curriculumItem}
                    onPress={() => toggleCurriculum(idx)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.curriculumHeader}>
                      <View style={[styles.weekBadge, idx === 0 ? styles.weekBadgeActive : styles.weekBadgeInactive]}>
                        <Text style={styles.weekBadgeText}>{item.weekNumber}</Text>
                      </View>
                      <Text style={styles.curriculumText}>{item.title}</Text>
                      <Feather
                        name={expandedCurriculums.has(idx) ? 'chevron-up' : 'chevron-down'}
                        size={18}
                        color="#A1A1AA"
                      />
                    </View>
                    {expandedCurriculums.has(idx) && item.content && (
                      <View style={styles.curriculumContent}>
                        <Text style={styles.curriculumContentText}>{item.content}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Rules Section */}
            {study.rules && study.rules.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>스터디 규칙</Text>
                <View style={styles.rulesContainer}>
                  {study.rules.map((rule, idx) => (
                    <View key={idx} style={styles.ruleCard}>
                      <View style={styles.ruleNumberBadge}>
                        <Text style={styles.ruleNumberText}>{idx + 1}</Text>
                      </View>
                      <Text style={styles.ruleCardText}>{rule.content}</Text>
                    </View>
                  ))}
                  <View style={styles.ruleNotice}>
                    <Feather name="alert-circle" size={14} color="#F59E0B" />
                    <Text style={styles.ruleNoticeText}>
                      규칙 미준수 시 스터디장의 판단에 따라 제명될 수 있습니다
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Deposit Section */}
            {study.deposit && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>보증금 정보</Text>
                <View style={styles.depositCard}>
                  <View style={styles.depositHeader}>
                    <View style={styles.depositIconWrapper}>
                      <Feather name="dollar-sign" size={20} color="#22C55E" />
                    </View>
                    <View style={styles.depositInfo}>
                      <Text style={styles.depositLabel}>보증금</Text>
                      <Text style={styles.depositValue}>{study.deposit.toLocaleString()}원</Text>
                    </View>
                  </View>
                  {study.depositRefundPolicy && (
                    <TouchableOpacity
                      style={styles.policyLinkRow}
                      onPress={() => setShowPolicyModal(true)}
                    >
                      <Feather name="info" size={14} color="#8B5CF6" />
                      <Text style={styles.policyLinkText}>환불 정책 자세히보기</Text>
                      <Feather name="chevron-right" size={16} color="#8B5CF6" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}

            {/* Reviews Section - only show if completed */}
            {study.status === 'COMPLETED' && (
              <View style={styles.section}>
                <View style={styles.reviewButtonsContainer}>
                  <TouchableOpacity style={styles.writeReviewBtn} onPress={handleWriteReview}>
                    <Feather name="edit-2" size={16} color="#8B5CF6" />
                    <Text style={styles.writeReviewBtnText}>스터디장 리뷰</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.writeReviewBtn} onPress={handleMemberReview}>
                    <Feather name="users" size={16} color="#8B5CF6" />
                    <Text style={styles.writeReviewBtnText}>멤버 평가</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Spacer for bottom bar */}
            <View style={{ height: 200 }} />
          </>
        )}

      </ScrollView>
      )}

      {/* Bottom Bar */}
      {currentUserId !== null && (
        <View style={[styles.bottomBar, { paddingBottom: Math.max(20, insets.bottom + 12) }]}>
          {study.leader.id === currentUserId ? (
            // 스터디장 관리 버튼
            <View style={styles.leaderActionsWrapper}>
              {study.status === 'RECRUITING' && (
                <>
                  <View style={styles.leaderActionsContainer}>
                    <TouchableOpacity
                      style={[styles.leaderBtn, styles.closeBtn]}
                      onPress={handleCloseStudy}
                      disabled={processing}
                    >
                      {processing ? (
                        <ActivityIndicator size="small" color="#F87171" />
                      ) : (
                        <>
                          <Feather name="x-circle" size={18} color="#F87171" />
                          <Text style={styles.closeBtnText}>모집 마감</Text>
                        </>
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.leaderBtn, styles.completeBtn]}
                      onPress={handleCompleteStudy}
                      disabled={processing}
                    >
                      {processing ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <>
                          <Feather name="check-circle" size={18} color="#FFFFFF" />
                          <Text style={styles.completeBtnText}>스터디 종료</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                </>
              )}
              {study.status === 'IN_PROGRESS' && (
                <TouchableOpacity
                  style={[styles.joinBtn]}
                  onPress={handleCompleteStudy}
                  disabled={processing}
                >
                  {processing ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Feather name="check-circle" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                      <Text style={styles.joinBtnText}>스터디 종료하기</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
              {study.status === 'CLOSED' && (
                <View style={styles.statusMessage}>
                  <Feather name="lock" size={18} color="#71717A" />
                  <Text style={styles.statusMessageText}>마감된 스터디입니다</Text>
                </View>
              )}
              {study.status === 'COMPLETED' && (
                <View style={styles.statusMessage}>
                  <Feather name="check" size={18} color="#22C55E" />
                  <Text style={[styles.statusMessageText, { color: '#22C55E' }]}>완료된 스터디입니다</Text>
                </View>
              )}
            </View>
          ) : study.isMember ? (
            // 이미 멤버인 경우 - 하단 바 숨김 (null 반환)
            null
          ) : (
            // 일반 사용자 - 참여 신청 버튼
            study.status === 'RECRUITING' ? (
              myApplication ? (
                // 이미 신청한 경우 (대기중 또는 거절됨만 표시, 승인됨은 isMember로 처리)
                <View style={styles.applicationStatusContainer}>
                  <View style={[
                    styles.applicationStatusBtn,
                    myApplication.status === 'PENDING' && styles.pendingBtn,
                    myApplication.status === 'REJECTED' && styles.rejectedBtn,
                  ]}>
                    <Feather
                      name={myApplication.status === 'PENDING' ? 'clock' : 'x-circle'}
                      size={18}
                      color={myApplication.status === 'PENDING' ? '#F59E0B' : '#EF4444'}
                      style={{ marginRight: 8 }}
                    />
                    <Text style={[
                      styles.applicationStatusBtnText,
                      myApplication.status === 'PENDING' && styles.pendingText,
                      myApplication.status === 'REJECTED' && styles.rejectedText,
                    ]}>
                      {myApplication.status === 'PENDING' ? '신청 대기중' : '신청 거절됨'}
                    </Text>
                  </View>
                  {myApplication.status === 'REJECTED' && myApplication.rejectReason && (
                    <Text style={styles.rejectReasonText}>사유: {myApplication.rejectReason}</Text>
                  )}
                </View>
              ) : (
                <TouchableOpacity style={styles.joinBtn} onPress={handleJoinStudy}>
                  <Text style={styles.joinBtnText}>스터디 참여 신청하기</Text>
                </TouchableOpacity>
              )
            ) : (
              <View style={styles.statusMessage}>
                <Text style={styles.statusMessageText}>
                  {study.status === 'IN_PROGRESS' ? '진행 중인 스터디입니다' :
                   study.status === 'COMPLETED' ? '완료된 스터디입니다' :
                   '마감된 스터디입니다'}
                </Text>
              </View>
            )
          )}
        </View>
      )}

      {/* Custom Alert */}
      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        icon={alertConfig.icon}
        iconColor={alertConfig.iconColor}
        onClose={() => setAlertVisible(false)}
      />

      {/* Deposit Refund Policy Modal */}
      <Modal
        visible={showPolicyModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPolicyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>보증금 환불 정책</Text>
              <TouchableOpacity onPress={() => setShowPolicyModal(false)}>
                <Feather name="x" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <View style={styles.policyCard}>
                <View style={styles.policyIcon}>
                  <Feather name="dollar-sign" size={24} color="#22C55E" />
                </View>
                <Text style={styles.policyText}>
                  {study?.depositRefundPolicy || '환불 정책이 설정되지 않았습니다.'}
                </Text>
              </View>
              <View style={styles.policyNotice}>
                <Feather name="info" size={16} color="#8B5CF6" />
                <Text style={styles.policyNoticeText}>
                  환불 조건은 스터디장이 정한 기준에 따릅니다
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
