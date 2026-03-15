import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Image,
  TextInput,
  Alert,
  StyleSheet,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import {
  getAttendanceSummary,
  getMyAttendance,
  respondAttendance,
  processAbsence,
  cancelSession,
} from '../../api/attendance';
import { getSession } from '../../api/curriculum';
import {
  AttendanceSummaryResponse,
  AttendanceResponse,
  AttendanceStatus,
} from '../../types/attendance';
import { SessionResponse } from '../../types/curriculum';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type SessionAttendanceRouteProp = RouteProp<RootStackParamList, 'SessionAttendance'>;

export default function SessionAttendanceScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<SessionAttendanceRouteProp>();
  const { sessionId, sessionTitle, studyId, isLeader } = route.params;
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<SessionResponse | null>(null);
  const [summary, setSummary] = useState<AttendanceSummaryResponse | null>(null);
  const [myAttendance, setMyAttendance] = useState<AttendanceResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Absence reason modal
  const [showAbsenceModal, setShowAbsenceModal] = useState(false);
  const [absenceReason, setAbsenceReason] = useState('');

  // Approval modal for leader
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState<AttendanceResponse | null>(null);
  const [approvalComment, setApprovalComment] = useState('');

  // Cancel session modal for leader
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const [sessionData, summaryData, myData] = await Promise.all([
        getSession(sessionId),
        getAttendanceSummary(sessionId),
        getMyAttendance(sessionId),
      ]);
      setSession(sessionData);
      setSummary(summaryData);
      setMyAttendance(myData);
    } catch (error) {
      console.error('Failed to load attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAttend = async () => {
    try {
      setSubmitting(true);
      await respondAttendance(sessionId, { attending: true });
      Alert.alert('완료', '참석으로 응답했습니다.');
      loadData();
    } catch (error: any) {
      Alert.alert('오류', error.message || '응답에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAbsence = async () => {
    if (!absenceReason.trim()) {
      Alert.alert('알림', '불참 사유를 입력해주세요.');
      return;
    }

    try {
      setSubmitting(true);
      await respondAttendance(sessionId, {
        attending: false,
        absenceReason: absenceReason.trim(),
      });
      setShowAbsenceModal(false);
      setAbsenceReason('');
      Alert.alert('완료', '불참 신청이 접수되었습니다. 스터디장의 승인을 기다려주세요.');
      loadData();
    } catch (error: any) {
      Alert.alert('오류', error.message || '응답에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApproval = async (approved: boolean) => {
    if (!selectedAttendance) return;

    try {
      setSubmitting(true);
      await processAbsence(selectedAttendance.id, {
        approved,
        comment: approvalComment.trim() || undefined,
      });
      setShowApprovalModal(false);
      setSelectedAttendance(null);
      setApprovalComment('');
      Alert.alert('완료', approved ? '불참을 승인했습니다.' : '불참을 거절했습니다.');
      loadData();
    } catch (error: any) {
      Alert.alert('오류', error.message || '처리에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelSession = async () => {
    if (!cancelReason.trim()) {
      Alert.alert('알림', '취소 사유를 입력해주세요.');
      return;
    }

    Alert.alert(
      '회차 취소',
      '정말로 이 회차를 취소하시겠습니까?\n취소하면 모든 스터디원에게 알림이 발송됩니다.',
      [
        { text: '아니오', style: 'cancel' },
        {
          text: '취소하기',
          style: 'destructive',
          onPress: async () => {
            try {
              setSubmitting(true);
              await cancelSession(sessionId, cancelReason.trim());
              setShowCancelModal(false);
              setCancelReason('');
              Alert.alert('완료', '회차가 취소되었습니다.', [
                { text: '확인', onPress: () => navigation.goBack() },
              ]);
            } catch (error: any) {
              Alert.alert('오류', error.message || '취소에 실패했습니다.');
            } finally {
              setSubmitting(false);
            }
          },
        },
      ]
    );
  };

  const getStatusLabel = (status: AttendanceStatus) => {
    switch (status) {
      case 'ATTENDING':
        return '참석';
      case 'PENDING_ABSENCE':
        return '승인대기';
      case 'APPROVED_ABSENCE':
        return '불참(승인)';
      case 'REJECTED_ABSENCE':
        return '불참(거절)';
      default:
        return status;
    }
  };

  const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case 'ATTENDING':
        return '#22C55E';
      case 'PENDING_ABSENCE':
        return '#F59E0B';
      case 'APPROVED_ABSENCE':
        return '#8B5CF6';
      case 'REJECTED_ABSENCE':
        return '#EF4444';
      default:
        return '#71717A';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#18181B" />
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  const isCancelled = session?.cancelled || false;
  const canRespond = !isCancelled && (!myAttendance || myAttendance.status === 'REJECTED_ABSENCE');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#18181B" />

      {/* Header */}
      <View style={[styles.header, { marginTop: insets.top }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {sessionTitle}
        </Text>
        {isLeader && !isCancelled ? (
          <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowCancelModal(true)}>
            <Feather name="x-circle" size={20} color="#EF4444" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Cancelled Banner */}
        {isCancelled && (
          <View style={styles.cancelledBanner}>
            <Feather name="x-circle" size={20} color="#EF4444" />
            <View style={styles.cancelledBannerContent}>
              <Text style={styles.cancelledBannerTitle}>이 회차는 취소되었습니다</Text>
              {session?.cancellationReason && (
                <Text style={styles.cancelledBannerReason}>
                  사유: {session.cancellationReason}
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Summary Stats */}
        {summary && (
          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>참석 현황</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={[styles.statNumber, { color: '#22C55E' }]}>{summary.attendingCount}</Text>
                <Text style={styles.statLabel}>참석</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[styles.statNumber, { color: '#F59E0B' }]}>{summary.pendingAbsenceCount}</Text>
                <Text style={styles.statLabel}>승인대기</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[styles.statNumber, { color: '#8B5CF6' }]}>{summary.approvedAbsenceCount}</Text>
                <Text style={styles.statLabel}>불참</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[styles.statNumber, { color: '#71717A' }]}>{summary.notRespondedCount}</Text>
                <Text style={styles.statLabel}>미응답</Text>
              </View>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalText}>전체 멤버</Text>
              <Text style={styles.totalNumber}>{summary.totalMembers}명</Text>
            </View>
          </View>
        )}

        {/* My Response Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>내 응답</Text>
          {myAttendance ? (
            <View style={styles.myResponseCard}>
              <View style={styles.myResponseHeader}>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(myAttendance.status) + '20' }]}>
                  <View style={[styles.statusDot, { backgroundColor: getStatusColor(myAttendance.status) }]} />
                  <Text style={[styles.statusText, { color: getStatusColor(myAttendance.status) }]}>
                    {getStatusLabel(myAttendance.status)}
                  </Text>
                </View>
                <Text style={styles.respondedAt}>
                  {new Date(myAttendance.respondedAt).toLocaleDateString('ko-KR')}
                </Text>
              </View>
              {myAttendance.absenceReason && (
                <Text style={styles.absenceReason}>사유: {myAttendance.absenceReason}</Text>
              )}
              {myAttendance.approvalComment && (
                <Text style={styles.approvalComment}>
                  {myAttendance.status === 'REJECTED_ABSENCE' ? '거절 사유: ' : '승인자 코멘트: '}
                  {myAttendance.approvalComment}
                </Text>
              )}
            </View>
          ) : (
            <Text style={styles.noResponseText}>아직 응답하지 않았습니다.</Text>
          )}

          {canRespond && (
            <View style={styles.responseButtons}>
              <TouchableOpacity
                style={[styles.responseBtn, styles.attendBtn]}
                onPress={handleAttend}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Feather name="check-circle" size={18} color="#FFFFFF" />
                    <Text style={styles.responseBtnText}>참석</Text>
                  </>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.responseBtn, styles.absenceBtn]}
                onPress={() => setShowAbsenceModal(true)}
                disabled={submitting}
              >
                <Feather name="x-circle" size={18} color="#EF4444" />
                <Text style={[styles.responseBtnText, { color: '#EF4444' }]}>불참</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Members List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>멤버 응답 현황</Text>
          {summary?.attendances.map((att) => (
            <TouchableOpacity
              key={att.id}
              style={styles.memberCard}
              onPress={() => {
                if (isLeader && att.status === 'PENDING_ABSENCE') {
                  setSelectedAttendance(att);
                  setShowApprovalModal(true);
                }
              }}
              disabled={!isLeader || att.status !== 'PENDING_ABSENCE'}
            >
              <View style={styles.memberAvatar}>
                {att.userProfileImage ? (
                  <Image source={{ uri: att.userProfileImage }} style={styles.memberAvatarImage} />
                ) : (
                  <View style={styles.memberAvatarPlaceholder}>
                    <Text style={styles.memberAvatarText}>{att.userNickname?.charAt(0) || '?'}</Text>
                  </View>
                )}
              </View>
              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>{att.userNickname}</Text>
                {att.absenceReason && (
                  <Text style={styles.memberAbsenceReason} numberOfLines={1}>
                    {att.absenceReason}
                  </Text>
                )}
              </View>
              <View style={[styles.memberStatusBadge, { backgroundColor: getStatusColor(att.status) + '20' }]}>
                <Text style={[styles.memberStatusText, { color: getStatusColor(att.status) }]}>
                  {getStatusLabel(att.status)}
                </Text>
              </View>
              {isLeader && att.status === 'PENDING_ABSENCE' && (
                <Feather name="chevron-right" size={18} color="#71717A" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Absence Reason Modal */}
      <Modal visible={showAbsenceModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>불참 사유</Text>
            <Text style={styles.modalSubtitle}>스터디장의 승인이 필요합니다</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="불참 사유를 입력하세요"
              placeholderTextColor="#71717A"
              value={absenceReason}
              onChangeText={setAbsenceReason}
              multiline
              textAlignVertical="top"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalCancelBtn]}
                onPress={() => {
                  setShowAbsenceModal(false);
                  setAbsenceReason('');
                }}
              >
                <Text style={styles.modalCancelText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalConfirmBtn]}
                onPress={handleAbsence}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalConfirmText}>신청</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Approval Modal for Leader */}
      <Modal visible={showApprovalModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>불참 승인</Text>
            <View style={styles.approvalInfo}>
              <Text style={styles.approvalLabel}>신청자</Text>
              <Text style={styles.approvalValue}>{selectedAttendance?.userNickname}</Text>
            </View>
            <View style={styles.approvalInfo}>
              <Text style={styles.approvalLabel}>사유</Text>
              <Text style={styles.approvalValue}>{selectedAttendance?.absenceReason}</Text>
            </View>
            <TextInput
              style={styles.modalInput}
              placeholder="코멘트 (선택사항)"
              placeholderTextColor="#71717A"
              value={approvalComment}
              onChangeText={setApprovalComment}
              multiline
              textAlignVertical="top"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalRejectBtn]}
                onPress={() => handleApproval(false)}
                disabled={submitting}
              >
                <Text style={styles.modalRejectText}>거절</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalApproveBtn]}
                onPress={() => handleApproval(true)}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalApproveText}>승인</Text>
                )}
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => {
                setShowApprovalModal(false);
                setSelectedAttendance(null);
                setApprovalComment('');
              }}
            >
              <Text style={styles.modalCloseText}>취소</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Cancel Session Modal for Leader */}
      <Modal visible={showCancelModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.cancelModalHeader}>
              <Feather name="alert-triangle" size={32} color="#EF4444" />
              <Text style={styles.modalTitle}>회차 취소</Text>
            </View>
            <Text style={styles.cancelModalSubtitle}>
              취소하면 모든 스터디원에게 알림이 발송됩니다.
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="취소 사유를 입력하세요"
              placeholderTextColor="#71717A"
              value={cancelReason}
              onChangeText={setCancelReason}
              multiline
              textAlignVertical="top"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalCancelBtn]}
                onPress={() => {
                  setShowCancelModal(false);
                  setCancelReason('');
                }}
              >
                <Text style={styles.modalCancelText}>닫기</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalConfirmBtn]}
                onPress={handleCancelSession}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalConfirmText}>취소하기</Text>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#27272A',
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  statsCard: {
    backgroundColor: '#27272A',
    margin: 16,
    borderRadius: 12,
    padding: 16,
  },
  statsTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    color: '#A1A1AA',
    marginTop: 4,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#3F3F46',
  },
  totalText: {
    fontSize: 14,
    color: '#A1A1AA',
  },
  totalNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  myResponseCard: {
    backgroundColor: '#27272A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  myResponseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  respondedAt: {
    fontSize: 12,
    color: '#71717A',
  },
  absenceReason: {
    fontSize: 14,
    color: '#A1A1AA',
    marginTop: 12,
  },
  approvalComment: {
    fontSize: 14,
    color: '#F59E0B',
    marginTop: 8,
  },
  noResponseText: {
    fontSize: 14,
    color: '#71717A',
    textAlign: 'center',
    paddingVertical: 20,
  },
  responseButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  responseBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  attendBtn: {
    backgroundColor: '#22C55E',
  },
  absenceBtn: {
    backgroundColor: '#EF444420',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  responseBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#27272A',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  memberAvatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  memberAvatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    backgroundColor: '#3F3F46',
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberAvatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  memberAbsenceReason: {
    fontSize: 13,
    color: '#71717A',
    marginTop: 2,
  },
  memberStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  memberStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#27272A',
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#71717A',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalInput: {
    backgroundColor: '#3F3F46',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#FFFFFF',
    minHeight: 100,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelBtn: {
    backgroundColor: '#3F3F46',
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#A1A1AA',
  },
  modalConfirmBtn: {
    backgroundColor: '#EF4444',
  },
  modalConfirmText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  approvalInfo: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  approvalLabel: {
    width: 60,
    fontSize: 14,
    color: '#71717A',
  },
  approvalValue: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
  },
  modalRejectBtn: {
    backgroundColor: '#EF444420',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  modalRejectText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#EF4444',
  },
  modalApproveBtn: {
    backgroundColor: '#22C55E',
  },
  modalApproveText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalCloseBtn: {
    marginTop: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 14,
    color: '#71717A',
  },
  cancelModalHeader: {
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  cancelModalSubtitle: {
    fontSize: 14,
    color: '#A1A1AA',
    textAlign: 'center',
    marginBottom: 16,
  },
  cancelledBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EF444420',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EF4444',
    gap: 12,
  },
  cancelledBannerContent: {
    flex: 1,
  },
  cancelledBannerTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#EF4444',
  },
  cancelledBannerReason: {
    fontSize: 14,
    color: '#A1A1AA',
    marginTop: 4,
  },
});
