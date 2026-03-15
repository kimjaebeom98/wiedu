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
  Modal,
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
import LocationMapPickerScreen, { LocationResult } from '../LocationMapPickerScreen';

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
  const [meetingLatitude, setMeetingLatitude] = useState<number | null>(null);
  const [meetingLongitude, setMeetingLongitude] = useState<number | null>(null);
  const [meetingPlaceName, setMeetingPlaceName] = useState('');

  // Date/Time picker state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  // Temp values for picker
  const [tempDate, setTempDate] = useState<Date>(new Date());
  const [tempTime, setTempTime] = useState<Date>(() => {
    const d = new Date();
    d.setHours(20, 0, 0, 0);
    return d;
  });

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
        const date = new Date(session.sessionDate);
        setSessionDate(date);
        setTempDate(date);
      }
      if (session.sessionTime) {
        const [hours, minutes] = session.sessionTime.split(':');
        const time = new Date();
        time.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0);
        setSessionTime(time);
        setTempTime(time);
      }
      setSessionMode(session.sessionMode || 'ONLINE');
      setMeetingLink(session.meetingLink || '');
      setMeetingLocation(session.meetingLocation || '');
      setMeetingLatitude(session.meetingLatitude || null);
      setMeetingLongitude(session.meetingLongitude || null);
      setMeetingPlaceName(session.meetingPlaceName || '');
    } catch (error) {
      console.error('Failed to load session:', error);
      Alert.alert('오류', '회차 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return '날짜를 선택해주세요';
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
    const weekDay = weekDays[date.getDay()];
    return `${year}년 ${month}월 ${day}일 (${weekDay})`;
  };

  const formatTime = (time: Date | null): string => {
    if (!time) return '시간을 선택해주세요';
    const hours = time.getHours();
    const minutes = time.getMinutes();
    const period = hours >= 12 ? '오후' : '오전';
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${period} ${displayHours}:${minutes.toString().padStart(2, '0')}`;
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
        meetingLatitude: sessionMode === 'OFFLINE' ? meetingLatitude : null,
        meetingLongitude: sessionMode === 'OFFLINE' ? meetingLongitude : null,
        meetingPlaceName: sessionMode === 'OFFLINE' ? meetingPlaceName.trim() || null : null,
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
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      if (selectedDate) {
        setSessionDate(selectedDate);
        setTempDate(selectedDate);
      }
    } else if (selectedDate) {
      setTempDate(selectedDate);
    }
  };

  const handleTimeChange = (_event: any, selectedTime?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
      if (selectedTime) {
        setSessionTime(selectedTime);
        setTempTime(selectedTime);
      }
    } else if (selectedTime) {
      setTempTime(selectedTime);
    }
  };

  const confirmDate = () => {
    setSessionDate(tempDate);
    setShowDatePicker(false);
  };

  const confirmTime = () => {
    setSessionTime(tempTime);
    setShowTimePicker(false);
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

        {/* Date Section */}
        <View style={styles.formSection}>
          <Text style={styles.formLabel}>날짜</Text>
          <TouchableOpacity
            style={styles.pickerBtn}
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.7}
          >
            <Feather name="calendar" size={18} color="#8B5CF6" />
            <Text style={[styles.pickerBtnText, !sessionDate && styles.pickerBtnPlaceholder]}>
              {formatDate(sessionDate)}
            </Text>
            <Feather name="chevron-down" size={18} color="#71717A" />
          </TouchableOpacity>

          {/* iOS Date Picker Inline */}
          {showDatePicker && Platform.OS === 'ios' && (
            <View style={styles.pickerContainer}>
              <View style={styles.pickerHeader}>
                <TouchableOpacity onPress={confirmDate}>
                  <Text style={styles.pickerDone}>완료</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
                minimumDate={new Date()}
                locale="ko-KR"
                textColor="#FFFFFF"
              />
            </View>
          )}
        </View>

        {/* Time Section */}
        <View style={styles.formSection}>
          <Text style={styles.formLabel}>시간</Text>
          <TouchableOpacity
            style={styles.pickerBtn}
            onPress={() => setShowTimePicker(true)}
            activeOpacity={0.7}
          >
            <Feather name="clock" size={18} color="#8B5CF6" />
            <Text style={[styles.pickerBtnText, !sessionTime && styles.pickerBtnPlaceholder]}>
              {formatTime(sessionTime)}
            </Text>
            <Feather name="chevron-down" size={18} color="#71717A" />
          </TouchableOpacity>

          {/* iOS Time Picker Inline */}
          {showTimePicker && Platform.OS === 'ios' && (
            <View style={styles.pickerContainer}>
              <View style={styles.pickerHeader}>
                <TouchableOpacity onPress={confirmTime}>
                  <Text style={styles.pickerDone}>완료</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={tempTime}
                mode="time"
                display="spinner"
                onChange={handleTimeChange}
                minuteInterval={5}
                locale="ko-KR"
                textColor="#FFFFFF"
              />
            </View>
          )}
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
            <TouchableOpacity
              style={[
                styles.inputContainer,
                meetingPlaceName && { height: 'auto', minHeight: 56, paddingVertical: 12 },
              ]}
              onPress={() => setShowLocationPicker(true)}
              activeOpacity={0.7}
            >
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#8B5CF620', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                <Feather name="map-pin" size={18} color="#8B5CF6" />
              </View>
              <View style={{ flex: 1 }}>
                {meetingPlaceName ? (
                  <>
                    <Text style={{ fontSize: 15, fontWeight: '600', color: '#FFFFFF' }} numberOfLines={1}>
                      {meetingPlaceName}
                    </Text>
                    <Text style={{ fontSize: 13, color: '#A1A1AA', marginTop: 4 }} numberOfLines={2}>
                      {meetingLocation}
                    </Text>
                  </>
                ) : (
                  <Text style={{ fontSize: 15, color: '#71717A' }}>장소를 선택하세요</Text>
                )}
              </View>
              <Feather name="chevron-right" size={20} color="#71717A" />
            </TouchableOpacity>
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

      {/* Android Date Picker */}
      {showDatePicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={tempDate}
          mode="date"
          display="spinner"
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}

      {/* Android Time Picker */}
      {showTimePicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={tempTime}
          mode="time"
          display="spinner"
          onChange={handleTimeChange}
          minuteInterval={5}
        />
      )}

      {/* Location Picker Modal */}
      <Modal
        visible={showLocationPicker}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <LocationMapPickerScreen
          onSelect={(location: LocationResult) => {
            setMeetingPlaceName(location.name);
            setMeetingLocation(location.address);
            setMeetingLatitude(location.latitude);
            setMeetingLongitude(location.longitude);
            setShowLocationPicker(false);
          }}
          onBack={() => setShowLocationPicker(false)}
          initialLocation={
            meetingLatitude && meetingLongitude
              ? { latitude: meetingLatitude, longitude: meetingLongitude }
              : undefined
          }
        />
      </Modal>
    </View>
  );
}
