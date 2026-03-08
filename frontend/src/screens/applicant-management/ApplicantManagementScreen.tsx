import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import {
  getStudyRequests,
  approveStudyRequest,
  rejectStudyRequest,
  StudyRequestResponse,
} from '../../api/study';
import { CustomAlert, AlertButton } from '../../components/common';
import { styles } from './styles';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ApplicantManagementRouteProp = RouteProp<RootStackParamList, 'ApplicantManagement'>;

type TabType = 'PENDING' | 'APPROVED' | 'REJECTED';

const AVATAR_COLORS = ['#8B5CF6', '#EC4899', '#3B82F6', '#22C55E', '#F59E0B'];

export default function ApplicantManagementScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ApplicantManagementRouteProp>();
  const { studyId, studyTitle } = route.params;
  const insets = useSafeAreaInsets();

  const [requests, setRequests] = useState<StudyRequestResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('PENDING');
  const [processing, setProcessing] = useState<number | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectTargetId, setRejectTargetId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<StudyRequestResponse | null>(null);

  // Custom Alert State
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    title: string;
    message?: string;
    buttons?: AlertButton[];
    icon?: 'alert-circle' | 'check-circle' | 'x-circle' | 'info' | 'user-check' | 'user-x';
    iconColor?: string;
  }>({ title: '' });

  const showAlert = (config: typeof alertConfig) => {
    setAlertConfig(config);
    setAlertVisible(true);
  };

  const loadRequests = useCallback(async () => {
    try {
      const data = await getStudyRequests(studyId);
      setRequests(data);
    } catch (error) {
      console.error('Failed to load requests:', error);
      showAlert({
        title: '오류',
        message: '신청 목록을 불러오는데 실패했습니다.',
        icon: 'alert-circle',
        buttons: [{ text: '확인', style: 'default' }],
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [studyId]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const onRefresh = () => {
    setRefreshing(true);
    loadRequests();
  };

  const filteredRequests = requests.filter(r => r.status === activeTab);

  const counts = {
    PENDING: requests.filter(r => r.status === 'PENDING').length,
    APPROVED: requests.filter(r => r.status === 'APPROVED').length,
    REJECTED: requests.filter(r => r.status === 'REJECTED').length,
  };

  const handleApprove = async (requestId: number) => {
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
            setProcessing(requestId);
            try {
              await approveStudyRequest(requestId);
              showAlert({
                title: '승인 완료',
                message: '신청이 승인되었습니다.',
                icon: 'check-circle',
                buttons: [{ text: '확인', style: 'default' }],
              });
              loadRequests();
            } catch (error: any) {
              showAlert({
                title: '오류',
                message: error.response?.data?.message || '승인에 실패했습니다.',
                icon: 'alert-circle',
                buttons: [{ text: '확인', style: 'default' }],
              });
            } finally {
              setProcessing(null);
            }
          },
        },
      ],
    });
  };

  const openRejectModal = (requestId: number) => {
    setRejectTargetId(requestId);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const handleReject = async () => {
    if (!rejectTargetId) return;

    setProcessing(rejectTargetId);
    setShowRejectModal(false);

    try {
      await rejectStudyRequest(rejectTargetId, rejectReason || undefined);
      showAlert({
        title: '거절 완료',
        message: '신청이 거절되었습니다.',
        icon: 'user-x',
        buttons: [{ text: '확인', style: 'default' }],
      });
      loadRequests();
    } catch (error: any) {
      showAlert({
        title: '오류',
        message: error.response?.data?.message || '거절에 실패했습니다.',
        icon: 'alert-circle',
        buttons: [{ text: '확인', style: 'default' }],
      });
    } finally {
      setProcessing(null);
      setRejectTargetId(null);
    }
  };

  const openDetailModal = (request: StudyRequestResponse) => {
    setSelectedRequest(request);
    setShowDetailModal(true);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}.${day} 신청`;
  };

  const getAvatarColor = (id: number) => AVATAR_COLORS[id % AVATAR_COLORS.length];

  // Parse message sections like [자기소개], [지원 동기] etc.
  const parseMessageSections = (message: string) => {
    if (!message) return [];

    const sectionRegex = /\[([^\]]+)\]\s*/g;
    const sections: { title: string; content: string }[] = [];
    let lastIndex = 0;
    let match;

    const matches: { title: string; startIndex: number; endIndex: number }[] = [];

    while ((match = sectionRegex.exec(message)) !== null) {
      matches.push({
        title: match[1],
        startIndex: match.index,
        endIndex: match.index + match[0].length,
      });
    }

    for (let i = 0; i < matches.length; i++) {
      const current = matches[i];
      const next = matches[i + 1];
      const contentEnd = next ? next.startIndex : message.length;
      const content = message.slice(current.endIndex, contentEnd).trim();

      if (content) {
        sections.push({
          title: current.title,
          content: content,
        });
      }
    }

    // If no sections found, return the whole message as a single section
    if (sections.length === 0 && message.trim()) {
      sections.push({
        title: '신청 메시지',
        content: message.trim(),
      });
    }

    return sections;
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

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity style={styles.headerBackBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>가입 관리</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {(['PENDING', 'APPROVED', 'REJECTED'] as TabType[]).map(tab => {
          const labels: Record<TabType, string> = {
            PENDING: '대기중',
            APPROVED: '승인됨',
            REJECTED: '거절됨',
          };
          const isActive = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {labels[tab]} {counts[tab]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Request List */}
      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8B5CF6" />}
      >
        {filteredRequests.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Feather name="inbox" size={48} color="#3F3F46" />
            <Text style={styles.emptyText}>
              {activeTab === 'PENDING' ? '대기 중인 신청이 없습니다' :
               activeTab === 'APPROVED' ? '승인된 신청이 없습니다' :
               '거절된 신청이 없습니다'}
            </Text>
          </View>
        ) : (
          filteredRequests.map((request) => {
            const sections = parseMessageSections(request.message);
            const firstSection = sections[0];

            return (
              <TouchableOpacity
                key={request.id}
                style={styles.applicantCard}
                onPress={() => openDetailModal(request)}
                activeOpacity={0.7}
              >
                {/* Card Header */}
                <View style={styles.cardHeader}>
                  {request.userProfileImage ? (
                    <Image
                      source={{ uri: request.userProfileImage }}
                      style={styles.cardAvatarImage}
                    />
                  ) : (
                    <View style={[styles.avatar, { backgroundColor: `${getAvatarColor(request.userId)}30` }]}>
                      <Feather name="user" size={22} color={getAvatarColor(request.userId)} />
                    </View>
                  )}
                  <View style={styles.cardInfo}>
                    <Text style={styles.applicantName}>{request.userNickname}</Text>
                    <View style={styles.metaRow}>
                      <Feather name="calendar" size={12} color="#71717A" />
                      <Text style={styles.metaText}>{formatDate(request.createdAt)}</Text>
                    </View>
                  </View>
                  <View style={styles.cardChevron}>
                    <Feather name="chevron-right" size={20} color="#71717A" />
                  </View>
                </View>

                {/* Card Content - First section preview */}
                {firstSection && (
                  <View style={styles.cardPreviewSection}>
                    <View style={styles.cardPreviewBadge}>
                      <Text style={styles.cardPreviewBadgeText}>{firstSection.title}</Text>
                    </View>
                    <Text style={styles.cardPreviewText} numberOfLines={2}>
                      {firstSection.content}
                    </Text>
                  </View>
                )}

                {/* Card Buttons - Only show for pending */}
                {activeTab === 'PENDING' && (
                  <View style={styles.cardButtons}>
                    <TouchableOpacity
                      style={styles.rejectBtn}
                      onPress={(e) => {
                        e.stopPropagation();
                        openRejectModal(request.id);
                      }}
                      disabled={processing === request.id}
                    >
                      {processing === request.id ? (
                        <ActivityIndicator size="small" color="#F87171" />
                      ) : (
                        <>
                          <Feather name="x" size={16} color="#F87171" />
                          <Text style={styles.rejectBtnText}>거절</Text>
                        </>
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.approveBtn}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleApprove(request.id);
                      }}
                      disabled={processing === request.id}
                    >
                      {processing === request.id ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <>
                          <Feather name="check" size={16} color="#FFFFFF" />
                          <Text style={styles.approveBtnText}>승인</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                )}

                {/* Status badge for approved/rejected */}
                {activeTab === 'APPROVED' && (
                  <View style={styles.cardStatusBadge}>
                    <Feather name="check-circle" size={14} color="#22C55E" />
                    <Text style={[styles.cardStatusBadgeText, { color: '#22C55E' }]}>승인 완료</Text>
                  </View>
                )}

                {activeTab === 'REJECTED' && (
                  <View style={styles.cardStatusSection}>
                    <View style={styles.cardStatusBadge}>
                      <Feather name="x-circle" size={14} color="#F87171" />
                      <Text style={[styles.cardStatusBadgeText, { color: '#F87171' }]}>거절됨</Text>
                    </View>
                    {request.rejectReason && (
                      <Text style={styles.cardRejectReasonText} numberOfLines={2}>
                        사유: {request.rejectReason}
                      </Text>
                    )}
                  </View>
                )}
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Reject Modal */}
      <Modal
        visible={showRejectModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRejectModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>거절 사유</Text>
              <TouchableOpacity onPress={() => setShowRejectModal(false)}>
                <Feather name="x" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.modalLabel}>거절 사유 (선택)</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="거절 사유를 입력해주세요"
                placeholderTextColor="#71717A"
                value={rejectReason}
                onChangeText={setRejectReason}
                multiline
                textAlignVertical="top"
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setShowRejectModal(false)}
                >
                  <Text style={styles.modalCancelBtnText}>취소</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalConfirmBtn} onPress={handleReject}>
                  <Text style={styles.modalConfirmBtnText}>거절하기</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Detail Modal */}
      <Modal
        visible={showDetailModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDetailModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.detailModalContent}>
            {/* Modal Header */}
            <View style={styles.detailModalHeader}>
              <TouchableOpacity
                style={styles.detailModalCloseBtn}
                onPress={() => setShowDetailModal(false)}
              >
                <Feather name="x" size={20} color="#A1A1AA" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.detailModalBody}
              contentContainerStyle={styles.detailModalBodyContent}
              showsVerticalScrollIndicator={false}
            >
              {selectedRequest && (
                <>
                  {/* Profile Section */}
                  <View style={styles.detailProfileSection}>
                    {selectedRequest.userProfileImage ? (
                      <Image
                        source={{ uri: selectedRequest.userProfileImage }}
                        style={styles.detailAvatarImage}
                      />
                    ) : (
                      <View style={[styles.detailAvatar, { backgroundColor: `${getAvatarColor(selectedRequest.userId)}30` }]}>
                        <Feather name="user" size={32} color={getAvatarColor(selectedRequest.userId)} />
                      </View>
                    )}
                    <Text style={styles.detailNickname}>{selectedRequest.userNickname}</Text>
                    <View style={styles.detailMetaRow}>
                      <Feather name="calendar" size={14} color="#71717A" />
                      <Text style={styles.detailMetaText}>{formatDate(selectedRequest.createdAt)}</Text>
                    </View>
                    {/* Status Badge */}
                    <View style={[
                      styles.detailStatusBadge,
                      selectedRequest.status === 'PENDING' && styles.detailStatusPending,
                      selectedRequest.status === 'APPROVED' && styles.detailStatusApproved,
                      selectedRequest.status === 'REJECTED' && styles.detailStatusRejected,
                    ]}>
                      <Feather
                        name={
                          selectedRequest.status === 'PENDING' ? 'clock' :
                          selectedRequest.status === 'APPROVED' ? 'check-circle' : 'x-circle'
                        }
                        size={14}
                        color={
                          selectedRequest.status === 'PENDING' ? '#F59E0B' :
                          selectedRequest.status === 'APPROVED' ? '#22C55E' : '#EF4444'
                        }
                      />
                      <Text style={[
                        styles.detailStatusText,
                        selectedRequest.status === 'PENDING' && { color: '#F59E0B' },
                        selectedRequest.status === 'APPROVED' && { color: '#22C55E' },
                        selectedRequest.status === 'REJECTED' && { color: '#EF4444' },
                      ]}>
                        {selectedRequest.status === 'PENDING' ? '대기중' :
                         selectedRequest.status === 'APPROVED' ? '승인됨' : '거절됨'}
                      </Text>
                    </View>
                  </View>

                  {/* Message Sections - Parsed */}
                  <View style={styles.detailSectionsContainer}>
                    {parseMessageSections(selectedRequest.message).map((section, index) => (
                      <View key={index} style={styles.detailQuestionSection}>
                        <View style={styles.detailQuestionHeader}>
                          <View style={styles.detailQuestionBadge}>
                            <Text style={styles.detailQuestionBadgeText}>{section.title}</Text>
                          </View>
                        </View>
                        <View style={styles.detailAnswerCard}>
                          <Text style={styles.detailAnswerText}>{section.content}</Text>
                        </View>
                      </View>
                    ))}
                    {!selectedRequest.message && (
                      <View style={styles.detailEmptyMessage}>
                        <Feather name="message-circle" size={24} color="#3F3F46" />
                        <Text style={styles.detailEmptyMessageText}>작성된 메시지가 없습니다.</Text>
                      </View>
                    )}
                  </View>

                  {/* Reject Reason (if rejected) */}
                  {selectedRequest.status === 'REJECTED' && selectedRequest.rejectReason && (
                    <View style={styles.detailRejectSection}>
                      <View style={styles.detailQuestionHeader}>
                        <View style={[styles.detailQuestionBadge, styles.detailRejectBadge]}>
                          <Text style={[styles.detailQuestionBadgeText, { color: '#F87171' }]}>거절 사유</Text>
                        </View>
                      </View>
                      <View style={styles.detailRejectCard}>
                        <Text style={styles.detailRejectText}>{selectedRequest.rejectReason}</Text>
                      </View>
                    </View>
                  )}

                  {/* Action Buttons (only for pending) */}
                  {selectedRequest.status === 'PENDING' && (
                    <View style={styles.detailActionButtons}>
                      <TouchableOpacity
                        style={styles.detailRejectBtn}
                        onPress={() => {
                          setShowDetailModal(false);
                          openRejectModal(selectedRequest.id);
                        }}
                      >
                        <Feather name="x" size={18} color="#F87171" />
                        <Text style={styles.detailRejectBtnText}>거절하기</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.detailApproveBtn}
                        onPress={() => {
                          setShowDetailModal(false);
                          handleApprove(selectedRequest.id);
                        }}
                      >
                        <Feather name="check" size={18} color="#FFFFFF" />
                        <Text style={styles.detailApproveBtnText}>승인하기</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

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
    </View>
  );
}
