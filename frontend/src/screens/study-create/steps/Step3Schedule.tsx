import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Step3Props } from '../types';
import { styles } from '../styles';
import {
  DAY_OPTIONS,
  STUDY_METHOD_OPTIONS,
  PLATFORM_OPTIONS,
  getDurationTypeFromWeeks,
  getWeeksFromDurationType,
} from '../constants';

export default function Step3Schedule({ data, updateData, toggleDay }: Step3Props) {
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState<Date>(() => {
    // Parse existing time or default to 8 PM
    const defaultDate = new Date();
    defaultDate.setHours(20, 0, 0, 0);
    return defaultDate;
  });

  // Local slider state for immediate visual feedback
  const storedWeeks = getWeeksFromDurationType(data.durationType);
  const [sliderValue, setSliderValue] = useState(storedWeeks);

  // Sync local state when parent data changes
  useEffect(() => {
    setSliderValue(storedWeeks);
  }, [storedWeeks]);

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

  const getDurationLabel = (weeks: number): string => {
    if (weeks >= 25) return '장기 (24주+)';
    return `${weeks}주`;
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

        {/* iOS: show inline picker, Android: show modal */}
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

      {/* Duration Slider */}
      <View style={styles.fieldGroup}>
        <View style={styles.durationHeader}>
          <Text style={styles.fieldLabel}>기간</Text>
          <Text style={styles.durationValue}>{getDurationLabel(sliderValue)}</Text>
        </View>
        <View style={styles.sliderContainer}>
          <Text style={styles.sliderMinLabel}>1주</Text>
          <Slider
            style={styles.slider}
            minimumValue={1}
            maximumValue={25}
            step={1}
            value={sliderValue}
            onValueChange={(value) => {
              setSliderValue(Math.round(value));
            }}
            onSlidingComplete={(value) => {
              const roundedValue = Math.round(value);
              setSliderValue(roundedValue);
              const durationType = getDurationTypeFromWeeks(roundedValue);
              updateData('durationType', durationType);
            }}
            minimumTrackTintColor="#8B5CF6"
            maximumTrackTintColor="#3F3F46"
            thumbTintColor="#8B5CF6"
          />
          <Text style={styles.sliderMaxLabel}>장기</Text>
        </View>
        <View style={styles.sliderTicks}>
          <Text style={styles.sliderTick}>4주</Text>
          <Text style={styles.sliderTick}>8주</Text>
          <Text style={styles.sliderTick}>12주</Text>
          <Text style={styles.sliderTick}>24주+</Text>
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
    </View>
  );
}
