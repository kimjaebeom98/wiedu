import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DateTimePicker from '@react-native-community/datetimepicker';
import { RootStackParamList } from '../../navigation/types';
import { getSession, addSession, updateSession } from '../../api/curriculum';
import { SessionMode, SessionRequest } from '../../types/curriculum';
import { styles } from './styles';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type SessionEditRouteProp = RouteProp<RootStackParamList, 'SessionEdit'>;

export default function SessionEditScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<SessionEditRouteProp>();
  const { curriculumId, weekNumber, sessionId, sessionNumber, isNew } = route.params;
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [sessionDate, setSessionDate] = useState<Date | null>(null);
  const [sessionTime, setSessionTime] = useState<Date | null>(null);
  const [sessionMode, setSessionMode] = useState<SessionMode>('ONLINE');
  const [meetingLink, setMeetingLink] = useState('');
  const [meetingLocation, setMeetingLocation] = useState('');

  // Date/Time picker state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    if (!isNew && sessionId) {
      loadSession();
    }
  }, [sessionId, isNew]);

  const loadSession = async () => {
    try {
      const session = await getSession(sessionId!);
      setTitle(session.title || '');
      setContent(session.content || '');
      if (session.sessionDate) {
        setSessionDate(new Date(session.sessionDate));
      }
      if (session.sessionTime) {
        const [hours, minutes] = session.sessionTime.split(':');
        const time = new Date();
        time.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0);
        setSessionTime(time);
      }
      setSessionMode(session.sessionMode || 'ONLINE');
      setMeetingLink(session.meetingLink || '');
      setMeetingLocation(session.meetingLocation || '');
    } catch (error) {
      console.error('Failed to load session:', error);
      Alert.alert('오류', '회차 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return '날짜 선택';
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
  };

  const formatTime = (time: Date | null): string => {
    if (!time) return '시간';
    return `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`;
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('알림', '제목을 입력해주세요.');
      return;
    }

    setSaving(true);
    try {
      const sessionData: SessionRequest = {
        sessionNumber,
        title: title.trim(),
        content: content.trim(),
        sessionDate: sessionDate ? sessionDate.toISOString().split('T')[0] : null,
        sessionTime: sessionTime
          ? `${String(sessionTime.getHours()).padStart(2, '0')}:${String(sessionTime.getMinutes()).padStart(2, '0')}`
          : null,
        sessionMode,
        meetingLink: sessionMode === 'ONLINE' ? meetingLink.trim() || null : null,
        meetingLocation: sessionMode === 'OFFLINE' ? meetingLocation.trim() || null : null,
      };

      if (isNew) {
        await addSession(curriculumId, sessionData);
      } else {
        await updateSession(sessionId!, sessionData);
      }

      navigation.goBack();
    } catch (error: any) {
      Alert.alert('오류', error.message || '회차 저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleDateChange = (_event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setSessionDate(selectedDate);
    }
  };

  const handleTimeChange = (_event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setSessionTime(selectedTime);
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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#18181B" />

      {/* Header */}
      <View style={[styles.header, { marginTop: insets.top }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{sessionNumber}회차 설정</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          {saving ? (
            <ActivityIndicator size="small" color="#8B5CF6" />
          ) : (
            <Text style={styles.saveBtn}>저장</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={styles.formContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Title Section */}
        <View style={styles.formSection}>
          <Text style={styles.formLabel}>제목</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              value={title}
              onChangeText={setTitle}
              placeholder="회차 제목을 입력하세요"
              placeholderTextColor="#71717A"
            />
          </View>
        </View>

        {/* Content Section */}
        <View style={styles.formSection}>
          <Text style={styles.formLabel}>내용</Text>
          <View style={[styles.inputContainer, styles.textareaContainer]}>
            <TextInput
              style={[styles.textInput, styles.textarea]}
              value={content}
              onChangeText={setContent}
              placeholder="회차 내용을 입력하세요"
              placeholderTextColor="#71717A"
              multiline
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Date & Time Section */}
        <View style={styles.formSection}>
          <Text style={styles.formLabel}>날짜 & 시간</Text>
          <View style={styles.dateTimeRow}>
            <TouchableOpacity
              style={[styles.inputContainer, styles.dateInput]}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={[styles.inputText, !sessionDate && styles.placeholderText]}>
                {formatDate(sessionDate)}
              </Text>
              <Feather name="calendar" size={18} color="#71717A" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.inputContainer, styles.timeInput]}
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={[styles.inputText, !sessionTime && styles.placeholderText]}>
                {formatTime(sessionTime)}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Mode Toggle Section */}
        <View style={styles.formSection}>
          <Text style={styles.formLabel}>진행 방식</Text>
          <View style={styles.modeToggle}>
            <TouchableOpacity
              style={[styles.modeBtn, sessionMode === 'ONLINE' && styles.modeBtnActive]}
              onPress={() => setSessionMode('ONLINE')}
            >
              <Text
                style={[styles.modeBtnText, sessionMode === 'ONLINE' && styles.modeBtnTextActive]}
              >
                온라인
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeBtn, sessionMode === 'OFFLINE' && styles.modeBtnActive]}
              onPress={() => setSessionMode('OFFLINE')}
            >
              <Text
                style={[styles.modeBtnText, sessionMode === 'OFFLINE' && styles.modeBtnTextActive]}
              >
                오프라인
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Link/Location Section */}
        {sessionMode === 'ONLINE' ? (
          <View style={styles.formSection}>
            <Text style={styles.formLabel}>화상회의 링크</Text>
            <View style={styles.inputContainer}>
              <Feather name="link" size={18} color="#71717A" style={styles.inputIcon} />
              <TextInput
                style={[styles.textInput, styles.inputWithIcon]}
                value={meetingLink}
                onChangeText={setMeetingLink}
                placeholder="https://zoom.us/j/..."
                placeholderTextColor="#71717A"
                autoCapitalize="none"
                keyboardType="url"
              />
            </View>
          </View>
        ) : (
          <View style={styles.formSection}>
            <Text style={styles.formLabel}>장소</Text>
            <View style={styles.inputContainer}>
              <Feather name="map-pin" size={18} color="#71717A" style={styles.inputIcon} />
              <TextInput
                style={[styles.textInput, styles.inputWithIcon]}
                value={meetingLocation}
                onChangeText={setMeetingLocation}
                placeholder="오프라인 장소를 입력하세요"
                placeholderTextColor="#71717A"
              />
            </View>
          </View>
        )}

        {/* Info Note */}
        <View style={styles.noteSection}>
          <Feather name="info" size={18} color="#8B5CF6" />
          <Text style={styles.noteText}>
            회차를 저장하면 스터디원들에게 알림이 발송되어 참석 여부를 확인받습니다.
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={sessionDate || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}

      {/* Time Picker */}
      {showTimePicker && (
        <DateTimePicker
          value={sessionTime || new Date()}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleTimeChange}
          is24Hour
        />
      )}
    </View>
  );
}
