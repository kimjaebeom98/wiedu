import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';

interface Step5RegionProps {
  data: { region: string };
  updateData: (key: 'region', value: string) => void;
  onOpenLocationPicker: () => void;
}

export default function Step5Region({ data, updateData, onOpenLocationPicker }: Step5RegionProps) {
  return (
    <View style={styles.container}>
      {/* Location Picker Button */}
      <TouchableOpacity
        style={styles.locationButton}
        onPress={onOpenLocationPicker}
        activeOpacity={0.7}
      >
        <Feather name="map-pin" size={20} color={data.region ? '#8B5CF6' : '#71717A'} />
        <Text style={[styles.locationText, !data.region && styles.placeholderText]} numberOfLines={1}>
          {data.region || '활동 지역을 선택해주세요'}
        </Text>
        <Feather name="chevron-right" size={20} color="#71717A" />
      </TouchableOpacity>

      {/* Selected Region Display */}
      {data.region ? (
        <View style={styles.selectedBox}>
          <View style={styles.selectedIcon}>
            <Feather name="check-circle" size={18} color="#22C55E" />
          </View>
          <View style={styles.selectedContent}>
            <Text style={styles.selectedLabel}>선택된 활동 지역</Text>
            <Text style={styles.selectedText} numberOfLines={2}>{data.region}</Text>
          </View>
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => updateData('region', '')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Feather name="x" size={18} color="#71717A" />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.hintBox}>
          <Feather name="info" size={16} color="#71717A" />
          <Text style={styles.hintText}>
            지도에서 주로 스터디하는 위치를 선택하면{'\n'}
            근처 스터디를 더 쉽게 찾을 수 있어요
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    backgroundColor: '#27272A',
    borderRadius: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  locationText: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
  },
  placeholderText: {
    color: '#52525B',
  },
  selectedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.2)',
  },
  selectedIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedContent: {
    flex: 1,
    gap: 4,
  },
  selectedLabel: {
    fontSize: 12,
    color: '#22C55E',
    fontWeight: '500',
  },
  selectedText: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  clearButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hintBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#27272A',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  hintText: {
    flex: 1,
    fontSize: 14,
    color: '#71717A',
    lineHeight: 20,
  },
});
