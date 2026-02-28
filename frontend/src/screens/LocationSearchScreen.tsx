import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  TextInput,
  FlatList,
  ActivityIndicator,
  Alert,
  ListRenderItem,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as Location from 'expo-location';

export interface LocationData {
  id: string;
  name: string;
  address: string;
  distance?: string;
  latitude?: number;
  longitude?: number;
}

interface LocationSearchScreenProps {
  onSelect: (location: LocationData) => void;
  onBack: () => void;
}

const KAKAO_REST_API_KEY = process.env.EXPO_PUBLIC_KAKAO_REST_API_KEY;

// Kakao Local API search function
const searchLocations = async (query: string): Promise<LocationData[]> => {
  if (!query.trim()) return [];

  try {
    const response = await fetch(
      `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(query)}&size=10`,
      {
        headers: {
          Authorization: `KakaoAK ${KAKAO_REST_API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      console.error('Kakao API error:', response.status);
      return [];
    }

    const data = await response.json();

    return data.documents.map((doc: {
      id: string;
      place_name: string;
      road_address_name: string;
      address_name: string;
      distance?: string;
      x: string;
      y: string;
    }) => ({
      id: doc.id,
      name: doc.place_name,
      address: doc.road_address_name || doc.address_name,
      distance: doc.distance ? `${Math.round(Number(doc.distance) / 100) / 10}km` : undefined,
      latitude: parseFloat(doc.y),
      longitude: parseFloat(doc.x),
    }));
  } catch (err) {
    console.error('Search error:', err);
    return [];
  }
};

export default function LocationSearchScreen({ onSelect, onBack }: LocationSearchScreenProps) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationData[]>([]);
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<TextInput>(null);

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const data = await searchLocations(searchQuery);
      setResults(data);
    } catch (err) {
      console.error('Search error:', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, performSearch]);

  const handleUseCurrentLocation = async () => {
    setGettingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('권한 필요', '위치 접근 권한이 필요합니다.');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
      const { latitude, longitude } = loc.coords;

      // Reverse geocode to get address
      const geocode = await Location.reverseGeocodeAsync({ latitude, longitude });
      const place = geocode[0];

      const name = place?.name || '현재 위치';
      const address = [
        place?.city,
        place?.district,
        place?.street,
        place?.streetNumber,
      ]
        .filter(Boolean)
        .join(' ');

      const locationData: LocationData = {
        id: 'current',
        name,
        address: address || '주소를 찾을 수 없습니다',
        latitude,
        longitude,
      };

      onSelect(locationData);
    } catch (err) {
      console.error('Location error:', err);
      Alert.alert('오류', '현재 위치를 가져오지 못했어요.');
    } finally {
      setGettingLocation(false);
    }
  };

  const handleSelectResult = (item: LocationData) => {
    onSelect(item);
  };

  const renderItem: ListRenderItem<LocationData> = ({ item, index }) => (
    <TouchableOpacity
      style={styles.resultItem}
      onPress={() => handleSelectResult(item)}
      activeOpacity={0.7}
    >
      <View style={styles.resultIcon}>
        <Feather
          name="map-pin"
          size={18}
          color={index === 0 ? '#8B5CF6' : '#71717A'}
        />
      </View>
      <View style={styles.resultContent}>
        <Text style={styles.resultName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.resultAddress} numberOfLines={1}>
          {item.address}
        </Text>
        {item.distance ? (
          <Text style={styles.resultDistance}>{item.distance}</Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );

  const renderSeparator = () => <View style={styles.divider} />;

  const renderHeader = () => (
    <>
      <TouchableOpacity
        style={styles.currentLocationBtn}
        onPress={handleUseCurrentLocation}
        activeOpacity={0.7}
        disabled={gettingLocation}
      >
        {gettingLocation ? (
          <ActivityIndicator size="small" color="#8B5CF6" style={styles.locateIcon} />
        ) : (
          <Feather name="navigation" size={18} color="#8B5CF6" style={styles.locateIcon} />
        )}
        <Text style={styles.currentLocationText}>
          {gettingLocation ? '위치 가져오는 중...' : '현재 위치 사용'}
        </Text>
      </TouchableOpacity>
      {results.length > 0 && <View style={styles.divider} />}
    </>
  );

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="light-content" backgroundColor="#18181B" />

      {/* Search Row */}
      <View style={[styles.searchRow, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Feather name="chevron-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.searchInputWrapper}>
          <Feather name="search" size={16} color="#71717A" style={styles.searchIcon} />
          <TextInput
            ref={inputRef}
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="장소 검색"
            placeholderTextColor="#52525B"
            autoFocus
            returnKeyType="search"
            clearButtonMode="while-editing"
            selectionColor="#8B5CF6"
          />
          {loading && (
            <ActivityIndicator size="small" color="#8B5CF6" style={styles.loadingIndicator} />
          )}
        </View>
      </View>

      {/* Results List */}
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ItemSeparatorComponent={renderSeparator}
        ListHeaderComponent={renderHeader}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !loading && query.trim() ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>검색 결과가 없습니다</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#18181B',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#27272A',
    borderRadius: 12,
    height: 44,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchIcon: {
    flexShrink: 0,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#FFFFFF',
    height: '100%',
  },
  loadingIndicator: {
    flexShrink: 0,
  },
  listContent: {
    flexGrow: 1,
  },
  currentLocationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 12,
  },
  locateIcon: {
    width: 24,
    textAlign: 'center',
  },
  currentLocationText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#8B5CF6',
  },
  divider: {
    height: 1,
    backgroundColor: '#27272A',
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 12,
  },
  resultIcon: {
    width: 24,
    alignItems: 'center',
    marginTop: 2,
  },
  resultContent: {
    flex: 1,
    gap: 3,
  },
  resultName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  resultAddress: {
    fontSize: 14,
    color: '#A1A1AA',
  },
  resultDistance: {
    fontSize: 12,
    color: '#71717A',
    marginTop: 1,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#71717A',
  },
});
