import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Image,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { getSessionDatesInMonth, getAttendancesByDate, getPendingAbsences } from '../../api/attendance';
import { AttendanceSummaryResponse, AttendanceResponse } from '../../types/attendance';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type StudyCalendarRouteProp = RouteProp<RootStackParamList, 'StudyCalendar'>;

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

export default function StudyCalendarScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<StudyCalendarRouteProp>();
  const { studyId, studyTitle, isLeader } = route.params;
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [sessionDates, setSessionDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [attendances, setAttendances] = useState<AttendanceSummaryResponse[]>([]);
  const [pendingAbsences, setPendingAbsences] = useState<AttendanceResponse[]>([]);
  const [loadingAttendances, setLoadingAttendances] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  useFocusEffect(
    useCallback(() => {
      loadSessionDates();
      if (isLeader) {
        loadPendingAbsences();
      }
    }, [year, month])
  );

  const loadSessionDates = async () => {
    try {
      setLoading(true);
      const dates = await getSessionDatesInMonth(studyId, year, month);
      setSessionDates(dates);
    } catch (error) {
      console.error('Failed to load session dates:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPendingAbsences = async () => {
    try {
      const absences = await getPendingAbsences(studyId);
      setPendingAbsences(absences);
    } catch (error) {
      console.error('Failed to load pending absences:', error);
    }
  };

  const loadAttendancesByDate = async (date: string) => {
    try {
      setLoadingAttendances(true);
      const data = await getAttendancesByDate(studyId, date);
      setAttendances(data);
    } catch (error) {
      console.error('Failed to load attendances:', error);
    } finally {
      setLoadingAttendances(false);
    }
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    loadAttendancesByDate(date);
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 2, 1));
    setSelectedDate(null);
    setAttendances([]);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month, 1));
    setSelectedDate(null);
    setAttendances([]);
  };

  const renderCalendar = () => {
    const firstDay = new Date(year, month - 1, 1).getDay();
    const lastDate = new Date(year, month, 0).getDate();
    const days: (number | null)[] = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= lastDate; i++) {
      days.push(i);
    }

    const weeks: (number | null)[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    return weeks.map((week, weekIndex) => (
      <View key={weekIndex} style={styles.weekRow}>
        {week.map((day, dayIndex) => {
          if (day === null) {
            return <View key={dayIndex} style={styles.dayCell} />;
          }

          const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const hasSession = sessionDates.includes(dateStr);
          const isSelected = selectedDate === dateStr;
          const isToday =
            new Date().getFullYear() === year &&
            new Date().getMonth() + 1 === month &&
            new Date().getDate() === day;

          return (
            <TouchableOpacity
              key={dayIndex}
              style={[
                styles.dayCell,
                isSelected && styles.dayCellSelected,
                isToday && !isSelected && styles.dayCellToday,
              ]}
              onPress={() => hasSession && handleDateSelect(dateStr)}
              disabled={!hasSession}
            >
              <Text
                style={[
                  styles.dayText,
                  dayIndex === 0 && styles.dayTextSunday,
                  dayIndex === 6 && styles.dayTextSaturday,
                  isSelected && styles.dayTextSelected,
                  !hasSession && styles.dayTextDisabled,
                ]}
              >
                {day}
              </Text>
              {hasSession && <View style={[styles.sessionDot, isSelected && styles.sessionDotSelected]} />}
            </TouchableOpacity>
          );
        })}
      </View>
    ));
  };

  const getStatusLabel = (status: string) => {
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

  const getStatusColor = (status: string) => {
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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#18181B" />

      {/* Header */}
      <View style={[styles.header, { marginTop: insets.top }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {studyTitle} 캘린더
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Pending Absences Banner for Leader */}
      {isLeader && pendingAbsences.length > 0 && (
        <TouchableOpacity
          style={styles.pendingBanner}
          onPress={() => {
            // Navigate to first pending absence session
            const firstPending = pendingAbsences[0];
            if (firstPending) {
              navigation.navigate('SessionAttendance', {
                sessionId: firstPending.sessionId,
                sessionTitle: '불참 신청 관리',
                studyId,
                isLeader: true,
              });
            }
          }}
        >
          <Feather name="alert-circle" size={18} color="#F59E0B" />
          <Text style={styles.pendingBannerText}>
            승인 대기 중인 불참 신청 {pendingAbsences.length}건
          </Text>
          <Feather name="chevron-right" size={18} color="#71717A" />
        </TouchableOpacity>
      )}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Month Navigation */}
        <View style={styles.monthNav}>
          <TouchableOpacity onPress={handlePrevMonth} style={styles.monthNavBtn}>
            <Feather name="chevron-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.monthText}>
            {year}년 {month}월
          </Text>
          <TouchableOpacity onPress={handleNextMonth} style={styles.monthNavBtn}>
            <Feather name="chevron-right" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Weekday Headers */}
        <View style={styles.weekdayRow}>
          {WEEKDAYS.map((day, index) => (
            <Text
              key={day}
              style={[
                styles.weekdayText,
                index === 0 && styles.weekdayTextSunday,
                index === 6 && styles.weekdayTextSaturday,
              ]}
            >
              {day}
            </Text>
          ))}
        </View>

        {/* Calendar Grid */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#8B5CF6" />
          </View>
        ) : (
          <View style={styles.calendarGrid}>{renderCalendar()}</View>
        )}

        {/* Selected Date Sessions */}
        {selectedDate && (
          <View style={styles.sessionsSection}>
            <Text style={styles.sectionTitle}>
              {selectedDate.replace(/-/g, '.')} 회차
            </Text>

            {loadingAttendances ? (
              <ActivityIndicator size="small" color="#8B5CF6" style={{ marginTop: 20 }} />
            ) : attendances.length === 0 ? (
              <Text style={styles.emptyText}>해당 날짜에 회차가 없습니다.</Text>
            ) : (
              attendances.map((summary, index) => (
                <TouchableOpacity
                  key={summary.sessionId}
                  style={styles.sessionCard}
                  onPress={() =>
                    navigation.navigate('SessionAttendance', {
                      sessionId: summary.sessionId,
                      sessionTitle: `${selectedDate.replace(/-/g, '.')} ${attendances.length > 1 ? `${index + 1}회차` : '회차'}`,
                      studyId,
                      isLeader,
                    })
                  }
                >
                  <View style={styles.sessionCardHeader}>
                    <Text style={styles.sessionCardTitle}>
                      {attendances.length > 1 ? `${index + 1}회차` : '출석 현황'}
                    </Text>
                    <Feather name="chevron-right" size={18} color="#71717A" />
                  </View>

                  <View style={styles.attendanceStats}>
                    <View style={styles.statItem}>
                      <View style={[styles.statDot, { backgroundColor: '#22C55E' }]} />
                      <Text style={styles.statText}>참석 {summary.attendingCount}</Text>
                    </View>
                    <View style={styles.statItem}>
                      <View style={[styles.statDot, { backgroundColor: '#F59E0B' }]} />
                      <Text style={styles.statText}>대기 {summary.pendingAbsenceCount}</Text>
                    </View>
                    <View style={styles.statItem}>
                      <View style={[styles.statDot, { backgroundColor: '#8B5CF6' }]} />
                      <Text style={styles.statText}>불참 {summary.approvedAbsenceCount}</Text>
                    </View>
                    <View style={styles.statItem}>
                      <View style={[styles.statDot, { backgroundColor: '#71717A' }]} />
                      <Text style={styles.statText}>미응답 {summary.notRespondedCount}</Text>
                    </View>
                  </View>

                  {/* Member Avatars */}
                  <View style={styles.memberAvatars}>
                    {summary.attendances.slice(0, 5).map((att, index) => (
                      <View
                        key={att.id}
                        style={[styles.avatar, { marginLeft: index > 0 ? -8 : 0 }]}
                      >
                        {att.userProfileImage ? (
                          <Image source={{ uri: att.userProfileImage }} style={styles.avatarImage} />
                        ) : (
                          <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarText}>
                              {att.userNickname?.charAt(0) || '?'}
                            </Text>
                          </View>
                        )}
                        <View
                          style={[
                            styles.statusIndicator,
                            { backgroundColor: getStatusColor(att.status) },
                          ]}
                        />
                      </View>
                    ))}
                    {summary.attendances.length > 5 && (
                      <View style={[styles.avatar, styles.avatarMore, { marginLeft: -8 }]}>
                        <Text style={styles.avatarMoreText}>
                          +{summary.attendances.length - 5}
                        </Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#18181B',
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
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  pendingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F59E0B20',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  pendingBannerText: {
    flex: 1,
    fontSize: 14,
    color: '#F59E0B',
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 24,
  },
  monthNavBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  weekdayRow: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  weekdayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '500',
    color: '#71717A',
  },
  weekdayTextSunday: {
    color: '#EF4444',
  },
  weekdayTextSaturday: {
    color: '#3B82F6',
  },
  calendarGrid: {
    paddingHorizontal: 8,
  },
  weekRow: {
    flexDirection: 'row',
  },
  dayCell: {
    flex: 1,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  dayCellSelected: {
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
  },
  dayCellToday: {
    backgroundColor: '#27272A',
    borderRadius: 12,
  },
  dayText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  dayTextSunday: {
    color: '#EF4444',
  },
  dayTextSaturday: {
    color: '#3B82F6',
  },
  dayTextSelected: {
    color: '#FFFFFF',
  },
  dayTextDisabled: {
    color: '#3F3F46',
  },
  sessionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#8B5CF6',
    marginTop: 4,
  },
  sessionDotSelected: {
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  sessionsSection: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#71717A',
    textAlign: 'center',
    paddingVertical: 20,
  },
  sessionCard: {
    backgroundColor: '#27272A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  sessionCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sessionCardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  attendanceStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statText: {
    fontSize: 13,
    color: '#A1A1AA',
  },
  memberAvatars: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#27272A',
    position: 'relative',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    backgroundColor: '#3F3F46',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  avatarMore: {
    backgroundColor: '#3F3F46',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarMoreText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#A1A1AA',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#27272A',
  },
});
