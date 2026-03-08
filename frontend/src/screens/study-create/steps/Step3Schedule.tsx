import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Platform,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { Step3Props } from '../types';
import { styles } from '../styles';
import {
  DAY_OPTIONS,
  STUDY_METHOD_OPTIONS,
  PLATFORM_OPTIONS,
  getDurationTypeFromWeeks,
  getWeeksFromDurationType,
} from '../constants';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type DurationUnit = 'week' | 'month' | 'year';

const UNIT_LABELS: Record<DurationUnit, string> = {
  week: '주',
  month: '개월',
  year: '년',
};

// Convert to weeks for backend storage
const convertToWeeks = (value: number, unit: DurationUnit): number => {
  switch (unit) {
    case 'week':
      return value;
    case 'month':
      return value * 4;
    case 'year':
      return value * 52;
    default:
      return value;
  }
};

// Convert weeks to best display unit
const convertFromWeeks = (weeks: number): { value: number; unit: DurationUnit } => {
  if (weeks >= 52 && weeks % 52 === 0) {
    return { value: weeks / 52, unit: 'year' };
  }
  if (weeks >= 4 && weeks % 4 === 0) {
    return { value: weeks / 4, unit: 'month' };
  }
  return { value: weeks, unit: 'week' };
};

export default function Step3Schedule({ data, updateData, toggleDay }: Step3Props) {
  const navigation = useNavigation<NavigationProp>();
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDurationModal, setShowDurationModal] = useState(false);
  const [selectedTime, setSelectedTime] = useState<Date>(() => {
    const defaultDate = new Date();
    defaultDate.setHours(20, 0, 0, 0);
    return defaultDate;
  });

  // Duration state
  const storedWeeks = getWeeksFromDurationType(data.durationType);
  const initialDisplay = convertFromWeeks(storedWeeks);
  const [durationValue, setDurationValue] = useState(initialDisplay.value);
  const [durationUnit, setDurationUnit] = useState<DurationUnit>(initialDisplay.unit);

  // Modal input state
  const [modalValue, setModalValue] = useState('');
  const [modalUnit, setModalUnit] = useState<DurationUnit>('week');

  // Sync state when parent data changes
  useEffect(() => {
    const display = convertFromWeeks(storedWeeks);
    setDurationValue(display.value);
    setDurationUnit(display.unit);
  }, [storedWeeks]);

  const handleRegionSelect = (location: { address: string; latitude: number; longitude: number }) => {
    const parts = location.address.split(' ');
    const region = parts[0] || '';
    const city = parts.slice(1).join(' ') || '';

    updateData('meetingRegion', region);
    updateData('meetingCity', city);
    updateData('meetingLatitude', location.latitude);
    updateData('meetingLongitude', location.longitude);
  };

  const handleTimeChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    if (date) {
      setSelectedTime(date);
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const period = hours >= 12 ? '오후' : '오전';
      const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
      const timeString = `${period} ${displayHours}:${minutes.toString().padStart(2, '0')}`;
      updateData('time', timeString);
    }
  };

  // Update duration and sync to parent
  const updateDuration = (newValue: number, newUnit: DurationUnit) => {
    const minValue = 1;
    const maxWeeks = 260; // ~5 years max

    const weeks = convertToWeeks(newValue, newUnit);
    if (weeks < minValue || weeks > maxWeeks) return;

    setDurationValue(newValue);
    setDurationUnit(newUnit);

    const durationType = getDurationTypeFromWeeks(Math.min(weeks, 25));
    updateData('durationType', durationType);
  };

  const handleDecrement = () => {
    if (durationValue > 1) {
      updateDuration(durationValue - 1, durationUnit);
    } else if (durationUnit === 'year' && durationValue === 1) {
      // 1년 -> 6개월로 전환
      updateDuration(6, 'month');
    } else if (durationUnit === 'month' && durationValue === 1) {
      // 1개월 -> 3주로 전환
      updateDuration(3, 'week');
    }
  };

  const handleIncrement = () => {
    const weeks = convertToWeeks(durationValue + 1, durationUnit);
    if (weeks <= 260) {
      updateDuration(durationValue + 1, durationUnit);
    }
  };

  const openDurationModal = () => {
    setModalValue(durationValue.toString());
    setModalUnit(durationUnit);
    setShowDurationModal(true);
  };

  const applyModalDuration = () => {
    const numValue = parseInt(modalValue, 10);
    if (!isNaN(numValue) && numValue > 0) {
      updateDuration(numValue, modalUnit);
    }
    setShowDurationModal(false);
  };

  const getDurationDisplayText = (): string => {
    const weeks = convertToWeeks(durationValue, durationUnit);
    const mainText = `${durationValue}${UNIT_LABELS[durationUnit]}`;

    // Show conversion hint
    if (durationUnit === 'month' && durationValue >= 1) {
      return `${mainText} (${weeks}주)`;
    }
    if (durationUnit === 'year') {
      return `${mainText} (${durationValue * 12}개월)`;
    }
    if (durationUnit === 'week' && durationValue >= 4 && durationValue % 4 === 0) {
      return `${mainText} (${durationValue / 4}개월)`;
    }

    if (weeks >= 25) {
      return `${mainText} (장기)`;
    }

    return mainText;
  };

  return (
    <View style={styles.stepInner}>
      {/* Study Method */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>진행 방식 <Text style={styles.required}>*</Text></Text>
        <View style={styles.methodList}>
          {STUDY_METHOD_OPTIONS.map(opt => {
            const selected = data.studyMethod === opt.key;
            return (
              <TouchableOpacity
                key={opt.key}
                style={[styles.methodCard, selected && styles.methodCardSelected]}
                onPress={() => updateData('studyMethod', opt.key)}
                activeOpacity={0.7}
              >
                <Feather name={opt.icon as any} size={18} color={selected ? '#FFF' : '#8B5CF6'} />
                <Text style={[styles.methodText, selected && styles.methodTextSelected]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Days of Week */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>요일</Text>
        <View style={styles.dayRow}>
          {DAY_OPTIONS.map(day => {
            const selected = data.daysOfWeek.includes(day.key);
            return (
              <TouchableOpacity
                key={day.key}
                style={[styles.dayBtn, selected && styles.dayBtnSelected]}
                onPress={() => toggleDay(day.key)}
                activeOpacity={0.7}
              >
                <Text style={[styles.dayBtnText, selected && styles.dayBtnTextSelected]}>
                  {day.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Time with TimePicker */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>시간</Text>
        <TouchableOpacity
          style={styles.timePickerBtn}
          onPress={() => setShowTimePicker(true)}
          activeOpacity={0.7}
        >
          <Feather name="clock" size={18} color="#8B5CF6" />
          <Text style={[styles.timePickerText, !data.time && styles.timePickerPlaceholder]}>
            {data.time || '시간을 선택해주세요'}
          </Text>
          <Feather name="chevron-down" size={18} color="#71717A" />
        </TouchableOpacity>

        {showTimePicker && Platform.OS === 'ios' && (
          <View style={styles.timePickerContainer}>
            <View style={styles.timePickerHeader}>
              <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                <Text style={styles.timePickerDone}>완료</Text>
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={selectedTime}
              mode="time"
              display="spinner"
              onChange={handleTimeChange}
              minuteInterval={5}
              locale="ko-KR"
              textColor="#FFFFFF"
            />
          </View>
        )}
        {showTimePicker && Platform.OS === 'android' && (
          <DateTimePicker
            value={selectedTime}
            mode="time"
            display="spinner"
            onChange={handleTimeChange}
            minuteInterval={5}
          />
        )}
      </View>

      {/* Duration Stepper */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>기간</Text>
        <View style={styles.stepperContainer}>
          <TouchableOpacity
            style={styles.stepperBtn}
            onPress={handleDecrement}
            activeOpacity={0.7}
          >
            <Feather name="minus" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.stepperValueContainer}
            onPress={openDurationModal}
            activeOpacity={0.7}
          >
            <Text style={styles.stepperValue}>{getDurationDisplayText()}</Text>
            <Text style={styles.stepperHint}>탭하여 직접 입력</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.stepperBtn}
            onPress={handleIncrement}
            activeOpacity={0.7}
          >
            <Feather name="plus" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Platform (for ONLINE / HYBRID) */}
      {(data.studyMethod === 'ONLINE' || data.studyMethod === 'HYBRID') && (
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>플랫폼</Text>
          <View style={styles.chipContainer}>
            {PLATFORM_OPTIONS.map(p => {
              const selected = data.platform === p;
              return (
                <TouchableOpacity
                  key={p}
                  style={[styles.chip, selected && styles.chipSelected]}
                  onPress={() => updateData('platform', selected ? '' : p)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{p}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <TextInput
            style={[styles.textInput, { marginTop: 10 }]}
            placeholder="직접 입력"
            placeholderTextColor="#52525B"
            value={PLATFORM_OPTIONS.includes(data.platform) ? '' : data.platform}
            onChangeText={v => updateData('platform', v)}
            returnKeyType="done"
          />
        </View>
      )}

      {/* Region Picker (for OFFLINE / HYBRID) */}
      {(data.studyMethod === 'OFFLINE' || data.studyMethod === 'HYBRID') && (
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>활동 지역</Text>
          <TouchableOpacity
            style={styles.timePickerBtn}
            onPress={() => {
              navigation.navigate('RegionPicker', {
                onSelect: handleRegionSelect,
                initialRegion: data.meetingRegion ? `${data.meetingRegion} ${data.meetingCity}`.trim() : undefined,
              });
            }}
            activeOpacity={0.7}
          >
            <Feather name="map-pin" size={18} color="#8B5CF6" />
            <Text style={[styles.timePickerText, !data.meetingRegion && styles.timePickerPlaceholder]}>
              {data.meetingRegion ? `${data.meetingRegion} ${data.meetingCity}`.trim() : '활동 지역을 선택해주세요'}
            </Text>
            <Feather name="chevron-right" size={18} color="#71717A" />
          </TouchableOpacity>
        </View>
      )}

      {/* Duration Input Modal */}
      <Modal
        visible={showDurationModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDurationModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.durationModalOverlay}
        >
          <View style={styles.durationModalContent}>
            <View style={styles.durationModalHeader}>
              <Text style={styles.durationModalTitle}>기간 설정</Text>
              <TouchableOpacity onPress={() => setShowDurationModal(false)}>
                <Feather name="x" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.durationModalBody}>
              <TextInput
                style={styles.durationModalInput}
                keyboardType="number-pad"
                value={modalValue}
                onChangeText={setModalValue}
                placeholder="숫자 입력"
                placeholderTextColor="#71717A"
                autoFocus
              />

              <View style={styles.durationUnitSelector}>
                {(['week', 'month', 'year'] as DurationUnit[]).map(unit => (
                  <TouchableOpacity
                    key={unit}
                    style={[
                      styles.durationUnitBtn,
                      modalUnit === unit && styles.durationUnitBtnSelected,
                    ]}
                    onPress={() => setModalUnit(unit)}
                  >
                    <Text
                      style={[
                        styles.durationUnitBtnText,
                        modalUnit === unit && styles.durationUnitBtnTextSelected,
                      ]}
                    >
                      {UNIT_LABELS[unit]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {modalValue && !isNaN(parseInt(modalValue, 10)) && (
                <Text style={styles.durationModalPreview}>
                  = {convertToWeeks(parseInt(modalValue, 10), modalUnit)}주
                </Text>
              )}
            </View>

            <TouchableOpacity
              style={styles.durationModalApplyBtn}
              onPress={applyModalDuration}
            >
              <Text style={styles.durationModalApplyBtnText}>적용</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
