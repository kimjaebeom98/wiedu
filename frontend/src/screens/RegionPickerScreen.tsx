import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  TextInput,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { REGIONS, getDistricts, District } from '../data/regions';

type RegionPickerRouteProp = RouteProp<RootStackParamList, 'RegionPicker'>;

// initialRegion 파싱 (예: "서울특별시 강남구" -> { province: "서울특별시", district: "강남구" })
const parseInitialRegion = (region?: string): { province: string | null; district: string | null } => {
  if (!region) return { province: null, district: null };
  const parts = region.split(' ');
  if (parts.length >= 2) {
    return { province: parts[0], district: parts.slice(1).join(' ') };
  }
  return { province: parts[0], district: null };
};

export default function RegionPickerScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RegionPickerRouteProp>();
  const insets = useSafeAreaInsets();

  // 초기 지역 파싱
  const initialParsed = useMemo(() => parseInitialRegion(route.params?.initialRegion), [route.params?.initialRegion]);
  const [currentDistrict] = useState<string | null>(initialParsed.district);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvince, setSelectedProvince] = useState<string | null>(initialParsed.province);
  const [mode, setMode] = useState<'province' | 'district'>(initialParsed.province ? 'district' : 'province');

  // 검색 결과
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    const results: Array<{ province: string; district: District; fullName: string }> = [];

    for (const province of REGIONS) {
      for (const district of province.districts) {
        const fullName = `${province.name} ${district.name}`;
        if (fullName.toLowerCase().includes(query) ||
            district.name.toLowerCase().includes(query) ||
            province.name.toLowerCase().includes(query)) {
          results.push({ province: province.name, district, fullName });
        }
      }
    }

    return results.slice(0, 20);
  }, [searchQuery]);

  // 시/도 선택
  const handleProvinceSelect = (provinceName: string) => {
    setSelectedProvince(provinceName);
    setMode('district');
    setSearchQuery('');
  };

  // 시/군/구 선택 완료
  const handleDistrictSelect = (district: District) => {
    if (!selectedProvince) return;

    const fullAddress = `${selectedProvince} ${district.name}`;

    if (route.params?.onSelect) {
      route.params.onSelect({
        address: fullAddress,
        latitude: district.lat,
        longitude: district.lng,
      });
    }

    navigation.goBack();
  };

  // 검색 결과에서 선택
  const handleSearchResultSelect = (result: { province: string; district: District; fullName: string }) => {
    const fullAddress = `${result.province} ${result.district.name}`;

    if (route.params?.onSelect) {
      route.params.onSelect({
        address: fullAddress,
        latitude: result.district.lat,
        longitude: result.district.lng,
      });
    }

    navigation.goBack();
  };

  // 뒤로가기 (시/군/구 선택 → 시/도 선택)
  const handleBack = () => {
    if (mode === 'district') {
      setMode('province');
      setSelectedProvince(null);
    } else {
      navigation.goBack();
    }
  };

  const districts = selectedProvince ? getDistricts(selectedProvince) : [];

  const renderProvinceItem = ({ item }: { item: typeof REGIONS[0] }) => (
    <TouchableOpacity
      style={styles.listItem}
      onPress={() => handleProvinceSelect(item.name)}
      activeOpacity={0.7}
    >
      <View style={styles.listItemContent}>
        <Feather name="map-pin" size={18} color="#8B5CF6" />
        <Text style={styles.listItemText}>{item.name}</Text>
      </View>
      <Feather name="chevron-right" size={20} color="#71717A" />
    </TouchableOpacity>
  );

  const renderDistrictItem = ({ item }: { item: District }) => {
    const isCurrentSelection = currentDistrict === item.name;
    return (
      <TouchableOpacity
        style={[styles.listItem, isCurrentSelection && styles.listItemSelected]}
        onPress={() => handleDistrictSelect(item)}
        activeOpacity={0.7}
      >
        <View style={styles.listItemContent}>
          <Feather name="map-pin" size={18} color={isCurrentSelection ? '#8B5CF6' : '#22C55E'} />
          <Text style={[styles.listItemText, isCurrentSelection && styles.listItemTextSelected]}>
            {item.name}
          </Text>
          {isCurrentSelection && (
            <View style={styles.currentBadge}>
              <Text style={styles.currentBadgeText}>현재</Text>
            </View>
          )}
        </View>
        <Feather name="check" size={20} color={isCurrentSelection ? '#8B5CF6' : '#71717A'} />
      </TouchableOpacity>
    );
  };

  const renderSearchResultItem = ({ item }: { item: { province: string; district: District; fullName: string } }) => (
    <TouchableOpacity
      style={styles.listItem}
      onPress={() => handleSearchResultSelect(item)}
      activeOpacity={0.7}
    >
      <View style={styles.listItemContent}>
        <Feather name="map-pin" size={18} color="#8B5CF6" />
        <View style={styles.searchResultTextContainer}>
          <Text style={styles.listItemText}>{item.district.name}</Text>
          <Text style={styles.searchResultSubText}>{item.province}</Text>
        </View>
      </View>
      <Feather name="check" size={20} color="#71717A" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#18181B" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <Feather name="chevron-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {mode === 'province' ? '시/도 선택' : selectedProvince}
        </Text>
        <View style={styles.placeholder} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Feather name="search" size={18} color="#71717A" />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="지역 검색 (예: 강남구, 분당)"
            placeholderTextColor="#52525B"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Feather name="x-circle" size={18} color="#71717A" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Content */}
      {searchQuery.length > 0 ? (
        // 검색 결과
        <FlatList
          data={searchResults}
          keyExtractor={(item, index) => `${item.province}-${item.district.name}-${index}`}
          renderItem={renderSearchResultItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Feather name="search" size={48} color="#3F3F46" />
              <Text style={styles.emptyText}>검색 결과가 없습니다</Text>
            </View>
          }
        />
      ) : mode === 'province' ? (
        // 시/도 목록
        <FlatList
          data={REGIONS}
          keyExtractor={(item) => item.name}
          renderItem={renderProvinceItem}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        // 시/군/구 목록
        <FlatList
          data={districts}
          keyExtractor={(item) => item.name}
          renderItem={renderDistrictItem}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <Text style={styles.listHeaderText}>
                {selectedProvince}의 시/군/구를 선택하세요
              </Text>
            </View>
          }
        />
      )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#27272A',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#27272A',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 8,
  },
  listItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  listItemText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  listItemSelected: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  listItemTextSelected: {
    color: '#8B5CF6',
  },
  currentBadge: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  currentBadgeText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  searchResultTextContainer: {
    flex: 1,
  },
  searchResultSubText: {
    fontSize: 13,
    color: '#71717A',
    marginTop: 2,
  },
  listHeader: {
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  listHeaderText: {
    fontSize: 14,
    color: '#A1A1AA',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#71717A',
  },
});
