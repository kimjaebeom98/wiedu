import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Modal,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import {
  getPendingRequests,
  approveStudyRequest,
  rejectStudyRequest,
  StudyRequestResponse,
} from '../../api/study';
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

  const loadRequests = useCallback(async () => {
    try {
      const data = await getPendingRequests(studyId);
      setRequests(data);
    } catch (error) {
      console.error('Failed to load requests:', error);
      Alert.alert('오류', '신청 목록을 불러오는데 실패했습니다.');
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
    Alert.alert(
      '승인 확인',
      '이 신청자를 승인하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '승인',
          onPress: async () => {
            setProcessing(requestId);
            try {
              await approveStudyRequest(requestId);
              Alert.alert('완료', '신청이 승인되었습니다.');
              loadRequests();
            } catch (error: any) {
              Alert.alert('오류', error.response?.data?.message || '승인에 실패했습니다.');
            } finally {
              setProcessing(null);
            }
          },
        },
      ]
    );
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
      Alert.alert('완료', '신청이 거절되었습니다.');
      loadRequests();
    } catch (error: any) {
      Alert.alert('오류', error.response?.data?.message || '거절에 실패했습니다.');
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
        <Text style={styles.headerTitle}>신청자 관리</Text>
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
          filteredRequests.map((request) => (
            <View key={request.id} style={styles.applicantCard}>
              {/* Card Header */}
              <View style={styles.cardHeader}>
                <View style={[styles.avatar, { backgroundColor: `${getAvatarColor(request.userId)}40` }]}>
                  <Feather name="user" size={24} color={getAvatarColor(request.userId)} />
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.applicantName}>{request.userNickname}</Text>
                  <View style={styles.metaRow}>
                    <Text style={styles.metaText}>{formatDate(request.createdAt)}</Text>
                  </View>
                </View>
              </View>

              {/* Card Content */}
              <View style={styles.cardContent}>
                <Text style={styles.messageText} numberOfLines={3}>
                  {request.message}
                </Text>
                <TouchableOpacity onPress={() => openDetailModal(request)}>
                  <Text style={styles.viewMoreText}>자세히 보기 &rarr;</Text>
                </TouchableOpacity>
              </View>

              {/* Card Buttons - Only show for pending */}
              {activeTab === 'PENDING' && (
                <View style={styles.cardButtons}>
                  <TouchableOpacity
                    style={styles.rejectBtn}
                    onPress={() => openRejectModal(request.id)}
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
                    onPress={() => handleApprove(request.id)}
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
                <View style={styles.statusBadge}>
                  <Feather name="check-circle" size={14} color="#22C55E" />
                  <Text style={[styles.statusBadgeText, { color: '#22C55E' }]}>승인 완료</Text>
                </View>
              )}

              {activeTab === 'REJECTED' && (
                <View style={styles.statusBadge}>
                  <Feather name="x-circle" size={14} color="#F87171" />
                  <Text style={[styles.statusBadgeText, { color: '#F87171' }]}>거절됨</Text>
                  {request.rejectReason && (
                    <Text style={styles.rejectReasonText}>사유: {request.rejectReason}</Text>
                  )}
                </View>
              )}
            </View>
          ))
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
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>신청서 상세</Text>
              <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                <Feather name="x" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              {selectedRequest && (
                <>
                  <View style={styles.detailHeader}>
                    <View style={[styles.avatar, { backgroundColor: `${getAvatarColor(selectedRequest.userId)}40` }]}>
                      <Feather name="user" size={24} color={getAvatarColor(selectedRequest.userId)} />
                    </View>
                    <View style={styles.detailInfo}>
                      <Text style={styles.detailName}>{selectedRequest.userNickname}</Text>
                      <Text style={styles.detailDate}>{formatDate(selectedRequest.createdAt)}</Text>
                    </View>
                  </View>
                  <View style={styles.detailContent}>
                    <Text style={styles.detailMessage}>{selectedRequest.message}</Text>
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
