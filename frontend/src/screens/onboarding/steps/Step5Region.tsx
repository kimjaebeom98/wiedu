import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { StepProps } from '../types';
import { REGION_OPTIONS } from '../constants';
import { styles } from '../styles';

export default function Step5Region({ data, updateData }: StepProps) {
  const [searchText, setSearchText] = useState('');

  const filteredRegions = searchText
    ? REGION_OPTIONS.filter(r => r.includes(searchText))
    : REGION_OPTIONS.slice(0, 6); // 기본적으로 6개만 표시

  return (
    <View>
      {/* Search input */}
      <View style={styles.searchContainer}>
        <Feather name="search" size={20} color="#71717A" />
        <TextInput
          style={styles.searchInput}
          placeholder="지역 검색"
          placeholderTextColor="#71717A"
          value={searchText}
          onChangeText={setSearchText}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {/* GPS Button */}
      <TouchableOpacity style={styles.gpsBtn}>
        <Feather name="navigation" size={20} color="#8B5CF6" />
        <Text style={styles.gpsBtnText}>현재 위치로 설정</Text>
      </TouchableOpacity>

      {/* Region list */}
      <View style={styles.regionList}>
        {filteredRegions.map((region) => {
          const selected = data.region === region;
          return (
            <TouchableOpacity
              key={region}
              style={[styles.regionItem, selected && styles.regionItemSelected]}
              onPress={() => updateData('region', selected ? '' : region)}
              activeOpacity={0.7}
            >
              <Feather
                name="map-pin"
                size={18}
                color={selected ? "#8B5CF6" : "#71717A"}
              />
              <Text style={[styles.regionItemText, selected && styles.regionItemTextSelected]}>
                {region}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
