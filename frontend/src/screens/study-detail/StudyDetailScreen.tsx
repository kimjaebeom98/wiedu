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
  Platform,
  Linking,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
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
import { getCurriculums, getCurriculumDetail } from '../../api/curriculum';
import { toggleBookmark as toggleBookmarkApi } from '../../api/bookmark';
import {
  requestWithdrawal,
  getMyWithdrawalRequest,
  cancelWithdrawalRequest,
  getWithdrawalRequests,
  approveWithdrawalRequest,
  WithdrawalRequestResponse,
} from '../../api/withdrawal';
import { StudyDetailResponse } from '../../types/study';
import { StudyLeaderReviewsResponse } from '../../types/review';
import { CurriculumResponse, SessionResponse } from '../../types/curriculum';
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
  const { studyId, initialTab } = route.params;
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
  const [curriculumData, setCurriculumData] = useState<CurriculumResponse[]>([]);
  const [curriculumLoading, setCurriculumLoading] = useState<Set<number>>(new Set());
  const [curriculumAccessDenied, setCurriculumAccessDenied] = useState<Set<number>>(new Set());
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkProcessing, setBookmarkProcessing] = useState(false);

  // Withdrawal state (member)
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [withdrawalReason, setWithdrawalReason] = useState('');
  const [withdrawalProcessing, setWithdrawalProcessing] = useState(false);
  const [myWithdrawalRequest, setMyWithdrawalRequest] = useState<WithdrawalRequestResponse | null>(null);

  // Withdrawal state (leader)
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequestResponse[]>([]);
  const [showWithdrawalListModal, setShowWithdrawalListModal] = useState(false);
  const [approvalProcessing, setApprovalProcessing] = useState<number | null>(null);

  // More menu state
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  // Toggle curriculum expansion and load sessions (uses curriculumId, not index)
  const toggleCurriculum = async (curriculumId: number) => {
    const isExpanded = expandedCurriculums.has(curriculumId);

    setExpandedCurriculums(prev => {
      const next = new Set(prev);
      if (next.has(curriculumId)) {
        next.delete(curriculumId);
      } else {
        next.add(curriculumId);
      }
      return next;
    });

    // Load sessions if expanding
    if (!isExpanded) {
      // Check if already loaded (sessions != null means already fetched, even if empty)
      const existing = curriculumData.find(c => c.id === curriculumId);
      if (existing?.sessions != null) return;

      setCurriculumLoading(prev => new Set(prev).add(curriculumId));
      try {
        const detail = await getCurriculumDetail(curriculumId);
        setCurriculumData(prev => {
          const filtered = prev.filter(c => c.id !== curriculumId);
          return [...filtered, detail].sort((a, b) => a.weekNumber - b.weekNumber);
        });
        // 성공 시 접근 거부 상태 해제
        setCurriculumAccessDenied(prev => {
          const next = new Set(prev);
          next.delete(curriculumId);
          return next;
        });
      } catch (error: any) {
        // 403 에러 (권한 없음) 처리 - 에러 메시지로 판단
        const errorMessage = error?.message || '';
        if (errorMessage.includes('권한') || errorMessage.includes('멤버')) {
          setCurriculumAccessDenied(prev => new Set(prev).add(curriculumId));
        }
        // 권한 에러가 아닌 경우만 콘솔에 출력 (토스트는 표시하지 않음)
      } finally {
        setCurriculumLoading(prev => {
          const next = new Set(prev);
          next.delete(curriculumId);
          return next;
        });
      }
    }
  };

  // Load curriculums data (sessions are loaded separately on expand)
  const loadCurriculumData = useCallback(async () => {
    try {
      const data = await getCurriculums(studyId);
      // Don't preserve sessions - they will be re-fetched when curriculum is expanded
      // This ensures fresh data after adding/editing sessions
      setCurriculumData(data);
    } catch (error) {
      console.error('Failed to load curriculums:', error);
    }
  }, [studyId]);

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
      // 해당 스터디의 모든 신청 중 가장 최신 것을 찾음 (여러 번 신청한 경우 대비)
      const studyApplications = requests
        .filter(r => r.studyId === studyId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setMyApplication(studyApplications[0] || null);
    } catch {
      // 로그인하지 않은 경우 무시
    }
  };

  const loadApplicants = useCallback(async () => {
    setApplicantsLoading(true);
    try {
      const data = await getStudyRequests(studyId);
      setApplicants(data);
    } catch {
      // 신청자 목록 로드 실패 (리더가 아닌 경우)
    } finally {
      setApplicantsLoading(false);
    }
  }, [studyId]);

  useEffect(() => {
    loadStudyDetail();
    loadCurrentUser();
    loadMyApplication();
    loadCurriculumData();
  }, [studyId]);

  // Handle initialTab when provided (e.g., from notification)
  useEffect(() => {
    if (initialTab && study) {
      // calendar tab is only available for members (memberRole is LEADER or MEMBER)
      if (initialTab === 'calendar' && study.memberRole) {
        setActiveTab(initialTab);
      } else if (initialTab !== 'calendar') {
        setActiveTab(initialTab);
      }
    }
  }, [initialTab, study]);

  // Reload study data when screen gains focus (e.g., returning from edit)
  useFocusEffect(
    useCallback(() => {
      loadStudyDetail();
      loadCurriculumData();
      // 세션 캐시 무효화 - 회차 추가/수정 후 돌아올 때 새로 로드하도록
      setExpandedCurriculums(new Set());
      if (study?.leader?.id === currentUserId && study?.status === 'RECRUITING') {
        loadApplicants();
      }
    }, [study?.leader?.id, study?.status, currentUserId, loadApplicants, loadCurriculumData])
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

  const handleToggleBookmark = async () => {
    if (bookmarkProcessing || !currentUserId) return;
    setBookmarkProcessing(true);
    try {
      const result = await toggleBookmarkApi(studyId);
      setIsBookmarked(result);
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
    } finally {
      setBookmarkProcessing(false);
    }
  };

  const loadStudyDetail = async () => {
    try {
      const data = await getStudyDetail(studyId);
      setStudy(data);
      setIsBookmarked(data.isBookmarked ?? false);
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

  // Load my withdrawal request
  const loadMyWithdrawalRequest = useCallback(async () => {
    if (!study?.isMember || study?.leader?.id === currentUserId) return;
    try {
      const request = await getMyWithdrawalRequest(studyId);
      setMyWithdrawalRequest(request);
    } catch (error) {
      console.error('Failed to load withdrawal request:', error);
    }
  }, [studyId, study?.isMember, study?.leader?.id, currentUserId]);

  useEffect(() => {
    loadMyWithdrawalRequest();
  }, [loadMyWithdrawalRequest]);

  // Load withdrawal requests for leader
  const loadWithdrawalRequests = useCallback(async () => {
    if (!study || study.leader?.id !== currentUserId) return;
    try {
      const requests = await getWithdrawalRequests(studyId);
      setWithdrawalRequests(requests);
    } catch (error) {
      console.error('Failed to load withdrawal requests:', error);
    }
  }, [studyId, study, currentUserId]);

  useEffect(() => {
    loadWithdrawalRequests();
  }, [loadWithdrawalRequests]);

  // Handle approve withdrawal (leader)
  const handleApproveWithdrawal = async (requestId: number, userNickname: string) => {
    showAlert({
      title: '탈퇴 승인',
      message: `${userNickname}님의 탈퇴를 승인하시겠습니까?\n\n승인 후에는 취소할 수 없습니다.`,
      icon: 'user-x',
      iconColor: '#EF4444',
      buttons: [
        { text: '취소', style: 'cancel' },
        {
          text: '승인',
          style: 'destructive',
          onPress: async () => {
            setApprovalProcessing(requestId);
            try {
              await approveWithdrawalRequest(requestId);
              showAlert({
                title: '승인 완료',
                message: `${userNickname}님의 탈퇴가 승인되었습니다.`,
                icon: 'check-circle',
                buttons: [{ text: '확인', style: 'default' }],
              });
              // Refresh data
              loadWithdrawalRequests();
              loadStudyDetail();
            } catch (error: any) {
              console.error('Failed to approve withdrawal:', error);
              showAlert({
                title: '오류',
                message: error.message || '탈퇴 승인에 실패했습니다.',
                icon: 'alert-circle',
                buttons: [{ text: '확인', style: 'default' }],
              });
            } finally {
              setApprovalProcessing(null);
            }
          },
        },
      ],
    });
  };

  // Handle withdrawal request
  const handleWithdrawalRequest = () => {
    // Show deposit warning if study has deposit
    const depositWarning = study?.deposit
      ? `\n\n⚠️ 보증금 ${study.deposit.toLocaleString()}원은 탈퇴 시 환불이 어려울 수 있습니다. 스터디장에게 직접 문의해주세요.`
      : '';

    showAlert({
      title: '스터디 탈퇴 신청',
      message: `탈퇴 사유를 입력해주세요.${depositWarning}`,
      icon: 'alert-circle',
      iconColor: '#EF4444',
      buttons: [
        { text: '취소', style: 'cancel' },
        {
          text: '다음',
          style: 'default',
          onPress: () => setShowWithdrawalModal(true),
        },
      ],
    });
  };

  // Submit withdrawal request
  const submitWithdrawalRequest = async () => {
    if (!withdrawalReason.trim()) {
      showAlert({
        title: '오류',
        message: '탈퇴 사유를 입력해주세요.',
        icon: 'alert-circle',
        buttons: [{ text: '확인', style: 'default' }],
      });
      return;
    }

    // Final confirmation
    showAlert({
      title: '정말 탈퇴하시겠습니까?',
      message: study?.deposit
        ? `탈퇴 신청 후 스터디장의 승인이 필요합니다.\n\n⚠️ 보증금 환불은 스터디장에게 직접 문의해주세요.`
        : '탈퇴 신청 후 스터디장의 승인이 필요합니다.',
      icon: 'alert-circle',
      iconColor: '#EF4444',
      buttons: [
        { text: '취소', style: 'cancel' },
        {
          text: '탈퇴 신청',
          style: 'destructive',
          onPress: async () => {
            setWithdrawalProcessing(true);
            try {
              const request = await requestWithdrawal(studyId, withdrawalReason.trim());
              setMyWithdrawalRequest(request);
              setShowWithdrawalModal(false);
              setWithdrawalReason('');
              showAlert({
                title: '탈퇴 신청 완료',
                message: '스터디장에게 탈퇴 신청이 전달되었습니다.\n승인되면 알림으로 안내드립니다.',
                icon: 'check-circle',
                buttons: [{ text: '확인', style: 'default' }],
              });
            } catch (error: any) {
              console.error('Failed to request withdrawal:', error);
              showAlert({
                title: '오류',
                message: error.message || '탈퇴 신청에 실패했습니다.',
                icon: 'alert-circle',
                buttons: [{ text: '확인', style: 'default' }],
              });
            } finally {
              setWithdrawalProcessing(false);
            }
          },
        },
      ],
    });
  };

  // Cancel withdrawal request
  const handleCancelWithdrawal = () => {
    if (!myWithdrawalRequest) return;

    showAlert({
      title: '탈퇴 신청 취소',
      message: '탈퇴 신청을 취소하시겠습니까?',
      icon: 'info',
      buttons: [
        { text: '아니오', style: 'cancel' },
        {
          text: '취소하기',
          style: 'default',
          onPress: async () => {
            setWithdrawalProcessing(true);
            try {
              await cancelWithdrawalRequest(myWithdrawalRequest.id);
              setMyWithdrawalRequest(null);
              showAlert({
                title: '취소 완료',
                message: '탈퇴 신청이 취소되었습니다.',
                icon: 'check-circle',
                buttons: [{ text: '확인', style: 'default' }],
              });
            } catch (error: any) {
              console.error('Failed to cancel withdrawal:', error);
              showAlert({
                title: '오류',
                message: error.message || '탈퇴 신청 취소에 실패했습니다.',
                icon: 'alert-circle',
                buttons: [{ text: '확인', style: 'default' }],
              });
            } finally {
              setWithdrawalProcessing(false);
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
          <TouchableOpacity onPress={handleToggleBookmark} disabled={bookmarkProcessing || !currentUserId}>
            <Feather name="bookmark" size={22} color={isBookmarked ? '#8B5CF6' : '#A1A1AA'} />
          </TouchableOpacity>
          {/* 더보기 메뉴 - 멤버만 표시 */}
          {study.isMember && (
            <TouchableOpacity onPress={() => setShowMoreMenu(true)}>
              <Feather name="more-vertical" size={22} color="#A1A1AA" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Tab Bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabBar}
        contentContainerStyle={styles.tabBarContent}
      >
        {(() => {
          const isLeader = study.leader.id === currentUserId;
          const showApplicantsTab = isLeader && study.status === 'RECRUITING';
          const showCalendarTab = study.isMember;
          let tabs: TabType[] = ['intro', 'board', 'gallery'];
          if (showCalendarTab) {
            tabs = ['intro', 'board', 'gallery', 'calendar'];
          }
          if (showApplicantsTab) {
            tabs = [...tabs, 'applicants'];
          }
          const labels: Record<TabType, string> = {
            intro: '소개',
            board: '게시판',
            gallery: '사진첩',
            calendar: '캘린더',
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
                } else if (tab === 'calendar') {
                  // 캘린더 화면으로 이동
                  navigation.navigate('StudyCalendar', {
                    studyId: study.id,
                    studyTitle: study.title,
                    isLeader: study.leader.id === currentUserId,
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
      </ScrollView>

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
                {study.subcategoryName && (
                  <View style={styles.subcategoryBadge}>
                    <Text style={styles.subcategoryBadgeText}>{study.subcategoryName}</Text>
                  </View>
                )}
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
            {curriculumData.length > 0 || study.leader.id === currentUserId ? (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>커리큘럼</Text>
                  {study.leader.id === currentUserId && (
                    <TouchableOpacity
                      onPress={() => navigation.navigate('CurriculumEdit', {
                        studyId: study.id,
                        studyTitle: study.title,
                      })}
                    >
                      <Text style={styles.viewMoreLink}>수정하기</Text>
                    </TouchableOpacity>
                  )}
                </View>
                {curriculumData.length > 0 ? (
                  curriculumData.map((curriculum, idx) => {
                    const sessions = curriculum.sessions || [];
                    const isExpanded = expandedCurriculums.has(curriculum.id);
                    const isLoading = curriculumLoading.has(curriculum.id);
                    const isAccessDenied = curriculumAccessDenied.has(curriculum.id);

                    return (
                      <View key={curriculum.id} style={styles.curriculumItem}>
                        <TouchableOpacity
                          onPress={() => toggleCurriculum(curriculum.id)}
                          activeOpacity={0.7}
                        >
                          <View style={styles.curriculumHeader}>
                            <View style={[styles.weekBadge, idx === 0 ? styles.weekBadgeActive : styles.weekBadgeInactive]}>
                              <Text style={styles.weekBadgeText}>{curriculum.weekNumber}</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text style={styles.curriculumText}>{curriculum.title}</Text>
                              <Text style={{ fontSize: 12, color: '#71717A', marginTop: 2 }}>
                                {curriculum.sessionCount}회차
                              </Text>
                            </View>
                            <Feather
                              name={isExpanded ? 'chevron-up' : 'chevron-down'}
                              size={18}
                              color="#A1A1AA"
                            />
                          </View>
                        </TouchableOpacity>
                        {isExpanded && (
                          <View style={styles.curriculumContent}>
                            {curriculum.content ? (
                              <Text style={[styles.curriculumContentText, { marginBottom: 12 }]}>
                                {curriculum.content}
                              </Text>
                            ) : null}
                            {isLoading ? (
                              <ActivityIndicator size="small" color="#8B5CF6" style={{ marginVertical: 12 }} />
                            ) : isAccessDenied ? (
                              <View style={{
                                backgroundColor: '#3F3F4620',
                                borderRadius: 8,
                                padding: 16,
                                alignItems: 'center',
                              }}>
                                <Feather name="lock" size={20} color="#71717A" style={{ marginBottom: 8 }} />
                                <Text style={{ fontSize: 13, color: '#71717A', textAlign: 'center' }}>
                                  스터디 멤버만 회차 정보를 볼 수 있습니다
                                </Text>
                              </View>
                            ) : sessions.length > 0 ? (
                              sessions.map((session) => (
                                <TouchableOpacity
                                  key={session.id}
                                  style={{
                                    backgroundColor: '#1F1F23',
                                    borderRadius: 12,
                                    padding: 14,
                                    marginTop: 8,
                                  }}
                                  activeOpacity={0.7}
                                  onPress={() => {
                                    if (session.sessionDate && study) {
                                      navigation.navigate('StudyCalendar', {
                                        studyId,
                                        studyTitle: study.title,
                                        isLeader: study.leader.id === currentUserId,
                                        initialDate: session.sessionDate,
                                      });
                                    }
                                  }}
                                >
                                  {/* 헤더: 회차 번호, 제목, 온/오프라인 배지 */}
                                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                                    <View style={{
                                      width: 28,
                                      height: 28,
                                      borderRadius: 14,
                                      backgroundColor: session.sessionMode === 'ONLINE' ? '#22C55E20' : '#F59E0B20',
                                      justifyContent: 'center',
                                      alignItems: 'center',
                                      marginRight: 10,
                                    }}>
                                      <Feather
                                        name={session.sessionMode === 'ONLINE' ? 'video' : 'map-pin'}
                                        size={14}
                                        color={session.sessionMode === 'ONLINE' ? '#22C55E' : '#F59E0B'}
                                      />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                      <Text style={{ fontSize: 15, color: '#FFFFFF', fontWeight: '600' }}>
                                        {session.sessionNumber}회차: {session.title || '제목 없음'}
                                      </Text>
                                    </View>
                                    <View style={{
                                      backgroundColor: session.sessionMode === 'ONLINE' ? '#22C55E20' : '#F59E0B20',
                                      paddingHorizontal: 8,
                                      paddingVertical: 4,
                                      borderRadius: 6,
                                    }}>
                                      <Text style={{
                                        fontSize: 11,
                                        fontWeight: '600',
                                        color: session.sessionMode === 'ONLINE' ? '#22C55E' : '#F59E0B',
                                      }}>
                                        {session.sessionMode === 'ONLINE' ? '온라인' : '오프라인'}
                                      </Text>
                                    </View>
                                  </View>

                                  {/* 일시 */}
                                  {session.sessionDate && (
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                                      <Feather name="calendar" size={12} color="#71717A" style={{ marginRight: 6 }} />
                                      <Text style={{ fontSize: 13, color: '#A1A1AA' }}>
                                        {session.sessionDate} {session.sessionTime || ''}
                                      </Text>
                                    </View>
                                  )}

                                  {/* 내용 */}
                                  {session.content && (
                                    <View style={{ marginBottom: 6 }}>
                                      <Text style={{ fontSize: 13, color: '#E4E4E7', lineHeight: 20 }}>
                                        {session.content}
                                      </Text>
                                    </View>
                                  )}

                                  {/* 회의 링크 (온라인) */}
                                  {session.sessionMode === 'ONLINE' && session.meetingLink && (
                                    <TouchableOpacity
                                      onPress={() => {
                                        Clipboard.setStringAsync(session.meetingLink!);
                                      }}
                                      activeOpacity={0.7}
                                      style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        backgroundColor: '#22C55E10',
                                        borderRadius: 8,
                                        padding: 10,
                                        marginTop: 6,
                                      }}
                                    >
                                      <Feather name="link" size={14} color="#22C55E" style={{ marginRight: 8 }} />
                                      <Text style={{ fontSize: 13, color: '#22C55E', flex: 1 }} numberOfLines={1}>
                                        {session.meetingLink}
                                      </Text>
                                      <Feather name="copy" size={14} color="#22C55E" style={{ marginLeft: 8 }} />
                                    </TouchableOpacity>
                                  )}

                                  {/* 장소 (오프라인) */}
                                  {session.sessionMode === 'OFFLINE' && session.meetingLocation && (
                                    <TouchableOpacity
                                      style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        backgroundColor: '#F59E0B10',
                                        borderRadius: 8,
                                        padding: 10,
                                        marginTop: 6,
                                      }}
                                      onPress={() => {
                                        if (session.meetingLatitude && session.meetingLongitude) {
                                          const placeName = encodeURIComponent(session.meetingPlaceName || session.meetingLocation || '');
                                          const url = Platform.select({
                                            ios: `maps:?q=${placeName}&ll=${session.meetingLatitude},${session.meetingLongitude}`,
                                            android: `geo:0,0?q=${session.meetingLatitude},${session.meetingLongitude}(${placeName})`,
                                          });
                                          if (url) Linking.openURL(url);
                                        }
                                      }}
                                      activeOpacity={session.meetingLatitude ? 0.7 : 1}
                                    >
                                      <Feather name="map-pin" size={14} color="#F59E0B" style={{ marginRight: 8 }} />
                                      <View style={{ flex: 1 }}>
                                        {session.meetingPlaceName && (
                                          <Text style={{ fontSize: 13, color: '#F59E0B', fontWeight: '600' }}>
                                            {session.meetingPlaceName}
                                          </Text>
                                        )}
                                        <Text style={{ fontSize: 12, color: '#F59E0B', opacity: 0.8 }}>
                                          {session.meetingLocation}
                                        </Text>
                                      </View>
                                      {session.meetingLatitude && (
                                        <Feather name="external-link" size={14} color="#F59E0B" style={{ marginLeft: 8 }} />
                                      )}
                                    </TouchableOpacity>
                                  )}
                                </TouchableOpacity>
                              ))
                            ) : (
                              <Text style={{ fontSize: 13, color: '#71717A', textAlign: 'center', paddingVertical: 8 }}>
                                등록된 회차가 없습니다
                              </Text>
                            )}
                          </View>
                        )}
                      </View>
                    );
                  })
                ) : (
                  <View style={styles.curriculumItem}>
                    <Text style={styles.curriculumContentText}>등록된 커리큘럼이 없습니다</Text>
                  </View>
                )}
              </View>
            ) : null}

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
                <Text style={styles.sectionTitle}>보증금</Text>
                <View style={styles.depositCard}>
                  <View style={styles.depositHeader}>
                    <View style={styles.depositIconWrapper}>
                      <Feather name="dollar-sign" size={16} color="#22C55E" />
                    </View>
                    <View style={styles.depositInfo}>
                      <Text style={styles.depositLabel}>참가비</Text>
                      <Text style={styles.depositValue}>{study.deposit.toLocaleString()}원</Text>
                    </View>
                  </View>
                  {study.depositRefundPolicy && (
                    <TouchableOpacity
                      style={styles.policyLinkRow}
                      onPress={() => setShowPolicyModal(true)}
                    >
                      <Feather name="info" size={12} color="#8B5CF6" />
                      <Text style={styles.policyLinkText}>환불 정책 보기</Text>
                      <Feather name="chevron-right" size={14} color="#8B5CF6" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}

            {/* Reviews Section - only show if completed */}
            {study.status === 'COMPLETED' && (
              <View style={styles.section}>
                <View style={styles.reviewButtonsContainer}>
                  {/* 스터디장은 자기 자신에게 리뷰를 작성할 수 없음 */}
                  {study.memberRole !== 'LEADER' && (
                    <TouchableOpacity style={styles.writeReviewBtn} onPress={handleWriteReview}>
                      <Feather name="edit-2" size={16} color="#8B5CF6" />
                      <Text style={styles.writeReviewBtnText}>스터디장 리뷰</Text>
                    </TouchableOpacity>
                  )}
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
              {/* 탈퇴 신청 관리 버튼 (대기 중인 신청이 있을 때) */}
              {withdrawalRequests.length > 0 && (study.status === 'RECRUITING' || study.status === 'IN_PROGRESS') && (
                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#27272A',
                    borderRadius: 12,
                    paddingVertical: 10,
                    paddingHorizontal: 16,
                    marginBottom: 8,
                    borderWidth: 1,
                    borderColor: '#EF4444',
                  }}
                  onPress={() => setShowWithdrawalListModal(true)}
                >
                  <Feather name="user-minus" size={16} color="#EF4444" />
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#EF4444', marginLeft: 8 }}>
                    탈퇴 신청 {withdrawalRequests.length}건
                  </Text>
                </TouchableOpacity>
              )}
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
            // 이미 멤버인 경우 - 탈퇴 대기 중일 때만 상태 표시 (탈퇴 버튼은 더보기 메뉴로 이동)
            study.status !== 'COMPLETED' && myWithdrawalRequest ? (
              <View style={styles.applicationStatusContainer}>
                <View style={[styles.applicationStatusBtn, styles.pendingBtn]}>
                  <Feather name="clock" size={18} color="#F59E0B" style={{ marginRight: 8 }} />
                  <Text style={[styles.applicationStatusBtnText, { color: '#F59E0B' }]}>
                    탈퇴 승인 대기 중
                  </Text>
                </View>
                <TouchableOpacity
                  style={{
                    height: 44,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                  onPress={handleCancelWithdrawal}
                  disabled={withdrawalProcessing}
                >
                  {withdrawalProcessing ? (
                    <ActivityIndicator size="small" color="#71717A" />
                  ) : (
                    <Text style={{ fontSize: 14, color: '#71717A' }}>신청 취소</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : null
          ) : (
            // 일반 사용자 - 참여 신청 버튼
            study.status === 'RECRUITING' ? (
              myApplication && myApplication.status === 'PENDING' ? (
                // 대기중인 신청
                <View style={styles.applicationStatusContainer}>
                  <View style={[styles.applicationStatusBtn, styles.pendingBtn]}>
                    <Feather name="clock" size={18} color="#F59E0B" style={{ marginRight: 8 }} />
                    <Text style={[styles.applicationStatusBtnText, styles.pendingText]}>
                      신청 대기중
                    </Text>
                  </View>
                </View>
              ) : myApplication && myApplication.status === 'REJECTED' ? (
                // 거절된 신청 - 3일 쿨다운 체크
                (() => {
                  const processedDate = myApplication.processedAt ? new Date(myApplication.processedAt) : null;
                  const cooldownEnd = processedDate ? new Date(processedDate.getTime() + 3 * 24 * 60 * 60 * 1000) : null;
                  const now = new Date();
                  const canReapply = cooldownEnd ? now >= cooldownEnd : true;
                  const remainingDays = cooldownEnd ? Math.ceil((cooldownEnd.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)) : 0;

                  if (canReapply) {
                    // 쿨다운 종료 - 재신청 가능
                    return (
                      <View style={styles.applicationStatusContainer}>
                        <View style={{
                          backgroundColor: '#27272A',
                          borderRadius: 12,
                          padding: 12,
                          marginBottom: 8,
                        }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                            <Feather name="info" size={14} color="#71717A" style={{ marginRight: 6 }} />
                            <Text style={{ fontSize: 13, color: '#71717A' }}>이전 신청이 거절되었습니다</Text>
                          </View>
                          {myApplication.rejectReason && (
                            <Text style={{ fontSize: 12, color: '#52525B', marginLeft: 20 }}>
                              사유: {myApplication.rejectReason}
                            </Text>
                          )}
                        </View>
                        <TouchableOpacity style={styles.joinBtn} onPress={handleJoinStudy}>
                          <Feather name="refresh-cw" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                          <Text style={styles.joinBtnText}>다시 신청하기</Text>
                        </TouchableOpacity>
                      </View>
                    );
                  } else {
                    // 쿨다운 중 - 재신청 불가
                    return (
                      <View style={styles.applicationStatusContainer}>
                        <View style={[styles.applicationStatusBtn, styles.rejectedBtn]}>
                          <Feather name="x-circle" size={18} color="#EF4444" style={{ marginRight: 8 }} />
                          <Text style={[styles.applicationStatusBtnText, styles.rejectedText]}>
                            신청 거절됨
                          </Text>
                        </View>
                        {myApplication.rejectReason && (
                          <Text style={styles.rejectReasonText}>사유: {myApplication.rejectReason}</Text>
                        )}
                        <Text style={{ fontSize: 12, color: '#71717A', textAlign: 'center', marginTop: 4 }}>
                          {remainingDays}일 후 재신청 가능
                        </Text>
                      </View>
                    );
                  }
                })()
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
        <View style={[styles.modalOverlay, { paddingBottom: insets.bottom }]}>
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

      {/* Withdrawal Request Modal */}
      <Modal
        visible={showWithdrawalModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowWithdrawalModal(false)}
      >
        <View style={[styles.modalOverlay, { paddingBottom: insets.bottom }]}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>탈퇴 사유 입력</Text>
              <TouchableOpacity onPress={() => setShowWithdrawalModal(false)}>
                <Feather name="x" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <View style={{ padding: 16 }}>
              <TextInput
                style={{
                  backgroundColor: '#3F3F46',
                  borderRadius: 12,
                  padding: 14,
                  color: '#FFFFFF',
                  fontSize: 15,
                  minHeight: 120,
                  textAlignVertical: 'top',
                }}
                placeholder="탈퇴 사유를 입력해주세요"
                placeholderTextColor="#71717A"
                value={withdrawalReason}
                onChangeText={setWithdrawalReason}
                multiline
                maxLength={500}
              />
              <Text style={{ color: '#71717A', fontSize: 12, marginTop: 8, textAlign: 'right' }}>
                {withdrawalReason.length}/500
              </Text>
              {study?.deposit && (
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  backgroundColor: '#EF444420',
                  borderRadius: 10,
                  padding: 12,
                  marginTop: 12,
                  gap: 8,
                }}>
                  <Feather name="alert-triangle" size={16} color="#EF4444" style={{ marginTop: 2 }} />
                  <Text style={{ flex: 1, fontSize: 13, color: '#EF4444', lineHeight: 18 }}>
                    보증금 {study.deposit.toLocaleString()}원은 탈퇴 시 환불이 어려울 수 있습니다. 스터디장에게 직접 문의해주세요.
                  </Text>
                </View>
              )}
              <TouchableOpacity
                style={{
                  backgroundColor: withdrawalReason.trim() ? '#EF4444' : '#3F3F46',
                  borderRadius: 12,
                  paddingVertical: 14,
                  alignItems: 'center',
                  marginTop: 16,
                }}
                onPress={submitWithdrawalRequest}
                disabled={!withdrawalReason.trim() || withdrawalProcessing}
              >
                {withdrawalProcessing ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>
                    탈퇴 신청하기
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Withdrawal List Modal (Leader) */}
      <Modal
        visible={showWithdrawalListModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowWithdrawalListModal(false)}
      >
        <View style={[styles.modalOverlay, { paddingBottom: insets.bottom }]}>
          <View style={[styles.modalContent, { maxHeight: '70%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>탈퇴 신청 관리</Text>
              <TouchableOpacity onPress={() => setShowWithdrawalListModal(false)}>
                <Feather name="x" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
              {withdrawalRequests.length === 0 ? (
                <View style={{ padding: 32, alignItems: 'center' }}>
                  <Feather name="inbox" size={40} color="#3F3F46" />
                  <Text style={{ fontSize: 14, color: '#71717A', marginTop: 12 }}>
                    대기 중인 탈퇴 신청이 없습니다
                  </Text>
                </View>
              ) : (
                <View style={{ padding: 16, gap: 12 }}>
                  {withdrawalRequests.map((request) => (
                    <View
                      key={request.id}
                      style={{
                        backgroundColor: '#27272A',
                        borderRadius: 12,
                        padding: 14,
                      }}
                    >
                      {/* User info */}
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                        {request.userProfileImage ? (
                          <Image
                            source={{ uri: request.userProfileImage }}
                            style={{ width: 36, height: 36, borderRadius: 18, marginRight: 10 }}
                          />
                        ) : (
                          <View style={{
                            width: 36,
                            height: 36,
                            borderRadius: 18,
                            backgroundColor: '#8B5CF630',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginRight: 10,
                          }}>
                            <Feather name="user" size={18} color="#8B5CF6" />
                          </View>
                        )}
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 15, fontWeight: '600', color: '#FFFFFF' }}>
                            {request.userNickname}
                          </Text>
                          <Text style={{ fontSize: 12, color: '#71717A', marginTop: 2 }}>
                            {new Date(request.createdAt).toLocaleDateString('ko-KR')} 신청
                          </Text>
                        </View>
                      </View>
                      {/* Reason */}
                      <View style={{
                        backgroundColor: '#18181B',
                        borderRadius: 8,
                        padding: 12,
                        marginBottom: 12,
                      }}>
                        <Text style={{ fontSize: 12, color: '#71717A', marginBottom: 4 }}>탈퇴 사유</Text>
                        <Text style={{ fontSize: 14, color: '#E4E4E7', lineHeight: 20 }}>
                          {request.reason}
                        </Text>
                      </View>
                      {/* Approve button */}
                      <TouchableOpacity
                        style={{
                          backgroundColor: '#EF4444',
                          borderRadius: 8,
                          paddingVertical: 10,
                          alignItems: 'center',
                          flexDirection: 'row',
                          justifyContent: 'center',
                          gap: 6,
                        }}
                        onPress={() => handleApproveWithdrawal(request.id, request.userNickname)}
                        disabled={approvalProcessing === request.id}
                      >
                        {approvalProcessing === request.id ? (
                          <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                          <>
                            <Feather name="check" size={16} color="#FFFFFF" />
                            <Text style={{ fontSize: 14, fontWeight: '600', color: '#FFFFFF' }}>
                              탈퇴 승인
                            </Text>
                          </>
                        )}
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* More Menu Modal */}
      <Modal
        visible={showMoreMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMoreMenu(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMoreMenu(false)}
        >
          <View style={{
            position: 'absolute',
            top: insets.top + 56,
            right: 16,
            backgroundColor: '#27272A',
            borderRadius: 12,
            overflow: 'hidden',
            minWidth: 160,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}>
            {/* 알림 설정 */}
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 14,
                paddingHorizontal: 16,
                gap: 12,
              }}
              onPress={() => {
                setShowMoreMenu(false);
                // TODO: 알림 설정 화면으로 이동
              }}
            >
              <Feather name="bell" size={18} color="#A1A1AA" />
              <Text style={{ fontSize: 15, color: '#FFFFFF' }}>알림 설정</Text>
            </TouchableOpacity>

            {/* 스터디 탈퇴 - 일반 멤버만 (리더 제외) */}
            {study?.isMember && study?.leader.id !== currentUserId && study?.status !== 'COMPLETED' && (
              <>
                <View style={{ height: 1, backgroundColor: '#3F3F46' }} />
                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 14,
                    paddingHorizontal: 16,
                    gap: 12,
                  }}
                  onPress={() => {
                    setShowMoreMenu(false);
                    handleWithdrawalRequest();
                  }}
                >
                  <Feather name="log-out" size={18} color="#EF4444" />
                  <Text style={{ fontSize: 15, color: '#EF4444' }}>스터디 탈퇴</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
