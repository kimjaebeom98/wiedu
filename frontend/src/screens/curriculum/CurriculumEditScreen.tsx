import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import {
  getCurriculums,
  getCurriculumDetail,
  addCurriculum,
  updateCurriculum,
  deleteCurriculum,
  deleteSession,
} from '../../api/curriculum';
import { CurriculumResponse, SessionResponse } from '../../types/curriculum';
import { CustomAlert, AlertButton } from '../../components/common';
import { styles } from './styles';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type CurriculumEditRouteProp = RouteProp<RootStackParamList, 'CurriculumEdit'>;

export default function CurriculumEditScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<CurriculumEditRouteProp>();
  const { studyId, studyTitle } = route.params;
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [curriculums, setCurriculums] = useState<CurriculumResponse[]>([]);
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set());
  const [editingCurriculum, setEditingCurriculum] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  // Alert 상태
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    title: string;
    message: string;
    icon?: 'alert-circle' | 'check-circle';
    buttons?: AlertButton[];
  }>({ title: '', message: '' });
  const pendingDeleteAction = useRef<(() => Promise<void>) | null>(null);

  const showAlert = (title: string, message: string, icon?: 'alert-circle' | 'check-circle') => {
    setAlertConfig({ title, message, icon, buttons: undefined });
    setAlertVisible(true);
  };

  const showConfirm = (title: string, message: string, onConfirm: () => Promise<void>) => {
    pendingDeleteAction.current = onConfirm;
    setAlertConfig({
      title,
      message,
      icon: 'alert-circle',
      buttons: [
        { text: '취소', style: 'cancel', onPress: () => setAlertVisible(false) },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            setAlertVisible(false);
            if (pendingDeleteAction.current) {
              await pendingDeleteAction.current();
              pendingDeleteAction.current = null;
            }
          },
        },
      ],
    });
    setAlertVisible(true);
  };

  const loadCurriculums = useCallback(async () => {
    try {
      const data = await getCurriculums(studyId);
      // Load sessions for each curriculum
      const curriculumsWithSessions = await Promise.all(
        data.map(async (c) => {
          if (expandedWeeks.has(c.id)) {
            const detail = await getCurriculumDetail(c.id);
            return detail;
          }
          return c;
        })
      );
      setCurriculums(curriculumsWithSessions);
    } catch (error) {
      console.error('Failed to load curriculums:', error);
      showAlert('오류', '커리큘럼을 불러오는데 실패했습니다.', 'alert-circle');
    } finally {
      setLoading(false);
    }
  }, [studyId, expandedWeeks]);

  useEffect(() => {
    loadCurriculums();
  }, []);

  // Reload when returning from session edit
  useFocusEffect(
    useCallback(() => {
      if (!loading) {
        loadCurriculums();
      }
    }, [loadCurriculums, loading])
  );

  const toggleWeekExpand = async (curriculumId: number) => {
    const newExpanded = new Set(expandedWeeks);
    if (newExpanded.has(curriculumId)) {
      newExpanded.delete(curriculumId);
      setExpandedWeeks(newExpanded);
    } else {
      newExpanded.add(curriculumId);
      setExpandedWeeks(newExpanded);
      // Load sessions for this curriculum
      try {
        const detail = await getCurriculumDetail(curriculumId);
        setCurriculums((prev) =>
          prev.map((c) => (c.id === curriculumId ? detail : c))
        );
      } catch (error) {
        console.error('Failed to load curriculum detail:', error);
      }
    }
  };

  const handleAddWeek = async () => {
    setSaving(true);
    try {
      const newCurriculum = await addCurriculum(studyId);
      setCurriculums((prev) => [...prev, newCurriculum]);
      // 새로 추가된 주차를 자동으로 펼치고 편집 모드로
      setExpandedWeeks((prev) => new Set(prev).add(newCurriculum.id));
      setEditingCurriculum(newCurriculum.id);
      setEditTitle(newCurriculum.title);
      setEditContent(newCurriculum.content || '');
    } catch (error: any) {
      showAlert('오류', error.message || '주차 추가에 실패했습니다.', 'alert-circle');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteWeek = (curriculum: CurriculumResponse) => {
    showConfirm(
      '주차 삭제',
      `${curriculum.weekNumber}주차를 삭제하시겠습니까?\n해당 주차의 모든 회차도 함께 삭제됩니다.`,
      async () => {
        try {
          await deleteCurriculum(curriculum.id);
          setCurriculums((prev) => prev.filter((c) => c.id !== curriculum.id));
        } catch (error: any) {
          showAlert('오류', error.message || '주차 삭제에 실패했습니다.', 'alert-circle');
        }
      }
    );
  };

  const handleSaveCurriculum = async (curriculumId: number) => {
    if (!editTitle.trim()) {
      setEditingCurriculum(null);
      return;
    }
    try {
      await updateCurriculum(curriculumId, {
        title: editTitle.trim(),
        content: editContent.trim(),
      });
      setCurriculums((prev) =>
        prev.map((c) =>
          c.id === curriculumId
            ? { ...c, title: editTitle.trim(), content: editContent.trim() }
            : c
        )
      );
    } catch (error: any) {
      showAlert('오류', error.message || '주차 수정에 실패했습니다.', 'alert-circle');
    } finally {
      setEditingCurriculum(null);
    }
  };

  const handleAddSession = (curriculum: CurriculumResponse) => {
    const nextSessionNumber = (curriculum.sessions?.length || 0) + 1;
    if (nextSessionNumber > 7) {
      showAlert('알림', '주당 최대 7회차까지 추가할 수 있습니다.', 'alert-circle');
      return;
    }
    navigation.navigate('SessionEdit', {
      curriculumId: curriculum.id,
      weekNumber: curriculum.weekNumber,
      sessionNumber: nextSessionNumber,
      isNew: true,
    });
  };

  const handleEditSession = (session: SessionResponse, weekNumber: number) => {
    navigation.navigate('SessionEdit', {
      curriculumId: session.curriculumId,
      weekNumber,
      sessionId: session.id,
      sessionNumber: session.sessionNumber,
      isNew: false,
    });
  };

  const handleDeleteSession = (session: SessionResponse) => {
    showConfirm(
      '회차 삭제',
      `${session.sessionNumber}회차를 삭제하시겠습니까?`,
      async () => {
        try {
          await deleteSession(session.id);
          // Reload curriculum to get updated sessions
          const detail = await getCurriculumDetail(session.curriculumId);
          setCurriculums((prev) =>
            prev.map((c) => (c.id === session.curriculumId ? detail : c))
          );
        } catch (error: any) {
          showAlert('오류', error.message || '회차 삭제에 실패했습니다.', 'alert-circle');
        }
      }
    );
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
      <View style={[styles.header, { marginTop: insets.top }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>커리큘럼 수정</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {curriculums.map((curriculum) => (
          <View key={curriculum.id} style={styles.weekCard}>
            {/* Week Header */}
            <TouchableOpacity
              style={styles.weekHeader}
              onPress={() => toggleWeekExpand(curriculum.id)}
              activeOpacity={0.7}
            >
              <View style={styles.weekLeft}>
                <View
                  style={[
                    styles.weekBadge,
                    expandedWeeks.has(curriculum.id)
                      ? styles.weekBadgeActive
                      : styles.weekBadgeInactive,
                  ]}
                >
                  <Text style={styles.weekBadgeText}>{curriculum.weekNumber}</Text>
                </View>
                <TouchableOpacity
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
                  onPress={() => {
                    if (editingCurriculum !== curriculum.id) {
                      setEditingCurriculum(curriculum.id);
                      setEditTitle(curriculum.title);
                      setEditContent(curriculum.content || '');
                      if (!expandedWeeks.has(curriculum.id)) {
                        toggleWeekExpand(curriculum.id);
                      }
                    }
                  }}
                >
                  <Text style={styles.weekTitle}>{curriculum.title}</Text>
                  <Feather name="edit-2" size={14} color="#71717A" />
                </TouchableOpacity>
              </View>
              <View style={styles.weekRight}>
                <Text style={styles.weekCount}>{curriculum.sessionCount}회차</Text>
                <Feather
                  name={expandedWeeks.has(curriculum.id) ? 'chevron-up' : 'chevron-right'}
                  size={20}
                  color="#71717A"
                />
              </View>
            </TouchableOpacity>

            {/* Curriculum Edit Form */}
            {editingCurriculum === curriculum.id && (
              <View style={styles.curriculumEditForm}>
                <TextInput
                  style={styles.curriculumTitleInput}
                  value={editTitle}
                  onChangeText={setEditTitle}
                  placeholder="주제 입력"
                  placeholderTextColor="#52525B"
                  autoFocus
                />
                <TextInput
                  style={[styles.curriculumTitleInput, styles.curriculumContentInput]}
                  value={editContent}
                  onChangeText={setEditContent}
                  placeholder="내용 입력 (선택)"
                  placeholderTextColor="#52525B"
                  multiline
                  numberOfLines={2}
                  textAlignVertical="top"
                />
                <TouchableOpacity
                  style={styles.saveCurriculumBtn}
                  onPress={() => handleSaveCurriculum(curriculum.id)}
                >
                  <Text style={styles.saveCurriculumText}>저장</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Expanded Sessions */}
            {expandedWeeks.has(curriculum.id) && (
              <View style={styles.sessionsContainer}>
                {curriculum.sessions && curriculum.sessions.length > 0 ? (
                  curriculum.sessions.map((session) => (
                    <View key={session.id} style={styles.sessionItem}>
                      <TouchableOpacity
                        style={styles.sessionInfo}
                        onPress={() => handleEditSession(session, curriculum.weekNumber)}
                      >
                        <View style={styles.sessionLeft}>
                          <Text style={styles.sessionNumber}>{session.sessionNumber}회차</Text>
                          <Text style={styles.sessionTitle} numberOfLines={1}>
                            {session.title || '제목 없음'}
                          </Text>
                        </View>
                        <View style={styles.sessionRight}>
                          <View
                            style={[
                              styles.modeBadge,
                              session.sessionMode === 'ONLINE'
                                ? styles.onlineBadge
                                : styles.offlineBadge,
                            ]}
                          >
                            <Feather
                              name={session.sessionMode === 'ONLINE' ? 'video' : 'map-pin'}
                              size={12}
                              color={session.sessionMode === 'ONLINE' ? '#22C55E' : '#F59E0B'}
                            />
                          </View>
                          <Feather name="chevron-right" size={18} color="#71717A" />
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.deleteSessionBtn}
                        onPress={() => handleDeleteSession(session)}
                      >
                        <Feather name="trash-2" size={16} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  ))
                ) : (
                  <View style={styles.emptySession}>
                    <Text style={styles.emptySessionText}>등록된 회차가 없습니다</Text>
                  </View>
                )}

                {/* Add Session Button */}
                {(curriculum.sessions?.length || 0) < 7 && (
                  <TouchableOpacity
                    style={styles.addSessionBtn}
                    onPress={() => handleAddSession(curriculum)}
                  >
                    <Feather name="plus" size={16} color="#8B5CF6" />
                    <Text style={styles.addSessionText}>회차 추가</Text>
                  </TouchableOpacity>
                )}

                {/* Delete Week Button */}
                <TouchableOpacity
                  style={styles.deleteWeekBtn}
                  onPress={() => handleDeleteWeek(curriculum)}
                >
                  <Feather name="trash-2" size={14} color="#EF4444" />
                  <Text style={styles.deleteWeekText}>주차 삭제</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}

        {/* Add Week Button */}
        <TouchableOpacity
          style={styles.addWeekBtn}
          onPress={handleAddWeek}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#8B5CF6" />
          ) : (
            <>
              <Feather name="plus" size={18} color="#8B5CF6" />
              <Text style={styles.addWeekText}>주차 추가</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        icon={alertConfig.icon}
        buttons={alertConfig.buttons}
        onClose={() => setAlertVisible(false)}
      />
    </View>
  );
}
