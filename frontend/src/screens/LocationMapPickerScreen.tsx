import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  TextInput,
  FlatList,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { getBaseURL } from '../config/api';

const KAKAO_REST_API_KEY = process.env.EXPO_PUBLIC_KAKAO_REST_API_KEY;

export interface LocationResult {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

interface LocationMapPickerScreenProps {
  onSelect: (location: LocationResult) => void;
  onBack: () => void;
  initialLocation?: { latitude: number; longitude: number };
}

// Search places using Kakao API
const searchPlaces = async (query: string): Promise<LocationResult[]> => {
  if (!query.trim()) return [];
  try {
    const response = await fetch(
      `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(query)}&size=5`,
      { headers: { Authorization: `KakaoAK ${KAKAO_REST_API_KEY}` } }
    );
    if (!response.ok) return [];
    const data = await response.json();
    return data.documents.map((doc: any) => ({
      id: doc.id,
      name: doc.place_name,
      address: doc.road_address_name || doc.address_name,
      latitude: parseFloat(doc.y),
      longitude: parseFloat(doc.x),
    }));
  } catch {
    return [];
  }
};

// Reverse geocode using Kakao API
const reverseGeocode = async (lat: number, lng: number): Promise<{ name: string; address: string } | null> => {
  try {
    const response = await fetch(
      `https://dapi.kakao.com/v2/local/geo/coord2address.json?x=${lng}&y=${lat}`,
      { headers: { Authorization: `KakaoAK ${KAKAO_REST_API_KEY}` } }
    );
    if (!response.ok) return null;
    const data = await response.json();
    if (data.documents && data.documents.length > 0) {
      const doc = data.documents[0];
      const address = doc.road_address?.address_name || doc.address?.address_name || '';
      const buildingName = doc.road_address?.building_name;
      const name = buildingName && !/^\d+(-\d+)?$/.test(buildingName) ? buildingName : '선택한 위치';
      return { name, address };
    }
    return null;
  } catch {
    return null;
  }
};

export default function LocationMapPickerScreen({
  onSelect,
  onBack,
  initialLocation,
}: LocationMapPickerScreenProps) {
  const insets = useSafeAreaInsets();
  const webViewRef = useRef<WebView>(null);

  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationResult | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const defaultCenter = initialLocation || { latitude: 37.5665, longitude: 126.978 };

  // Build map URL from backend
  const mapUrl = `${getBaseURL()}/api/map/kakao?lat=${defaultCenter.latitude}&lng=${defaultCenter.longitude}&level=3`;

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      const results = await searchPlaces(query);
      setSearchResults(results);
      setShowResults(results.length > 0);
      setSearching(false);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const handleSelectSearchResult = useCallback((result: LocationResult) => {
    setSelectedLocation(result);
    setShowResults(false);
    setQuery('');
    Keyboard.dismiss();
    webViewRef.current?.injectJavaScript(`
      moveToLocation(${result.latitude}, ${result.longitude});
      true;
    `);
  }, []);

  const handleUseCurrentLocation = useCallback(async () => {
    setLoadingLocation(true);
    Keyboard.dismiss();
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLoadingLocation(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const { latitude, longitude } = loc.coords;

      webViewRef.current?.injectJavaScript(`
        moveToLocation(${latitude}, ${longitude});
        true;
      `);

      const geo = await reverseGeocode(latitude, longitude);
      setSelectedLocation({
        id: 'current',
        name: '현재 위치',
        address: geo?.address || '',
        latitude,
        longitude,
      });
    } catch (err) {
      console.error('Location error:', err);
    } finally {
      setLoadingLocation(false);
    }
  }, []);

  const handleMapMessage = useCallback(async (event: { nativeEvent: { data: string } }) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'mapReady' || data.type === 'pageLoaded') {
        setMapReady(true);
      } else if (data.type === 'locationSelected') {
        const { latitude, longitude } = data;
        const geo = await reverseGeocode(latitude, longitude);
        setSelectedLocation({
          id: `${latitude}-${longitude}`,
          name: geo?.name || '선택한 위치',
          address: geo?.address || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
          latitude,
          longitude,
        });
      }
    } catch {}
  }, []);

  const handleConfirm = useCallback(() => {
    if (selectedLocation) {
      onSelect(selectedLocation);
    }
  }, [selectedLocation, onSelect]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor="#18181B" />

      {/* Header with Search */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Feather name="chevron-left" size={26} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.searchInputContainer}>
          <Feather name="search" size={18} color="#71717A" />
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="장소 검색"
            placeholderTextColor="#71717A"
            returnKeyType="search"
          />
          {searching && <ActivityIndicator size="small" color="#8B5CF6" />}
        </View>
      </View>

      {/* Search Results */}
      {showResults && (
        <View style={styles.resultsContainer}>
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.resultItem}
                onPress={() => handleSelectSearchResult(item)}
              >
                <Feather name="map-pin" size={16} color="#8B5CF6" />
                <View style={styles.resultText}>
                  <Text style={styles.resultName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.resultAddress} numberOfLines={1}>{item.address}</Text>
                </View>
              </TouchableOpacity>
            )}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      )}

      {/* Map */}
      <View style={styles.mapContainer}>
        <WebView
          ref={webViewRef}
          source={{
            uri: mapUrl,
            headers: { 'ngrok-skip-browser-warning': 'true' },
          }}
          style={styles.map}
          onMessage={handleMapMessage}
          javaScriptEnabled
          domStorageEnabled
          scrollEnabled={false}
          originWhitelist={['*']}
          mixedContentMode="compatibility"
        />
        {!mapReady && (
          <View style={styles.mapLoading}>
            <ActivityIndicator size="large" color="#8B5CF6" />
          </View>
        )}

        {/* Current Location Button */}
        <TouchableOpacity
          style={styles.currentLocationBtn}
          onPress={handleUseCurrentLocation}
          disabled={loadingLocation}
          activeOpacity={0.8}
        >
          {loadingLocation ? (
            <ActivityIndicator size="small" color="#8B5CF6" />
          ) : (
            <Feather name="crosshair" size={22} color="#8B5CF6" />
          )}
        </TouchableOpacity>
      </View>

      {/* Bottom Panel */}
      {selectedLocation && (
        <View style={[styles.bottomPanel, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <View style={styles.selectedInfo}>
            <Feather name="map-pin" size={18} color="#8B5CF6" />
            <View style={styles.selectedText}>
              <Text style={styles.selectedName} numberOfLines={1}>{selectedLocation.name}</Text>
              <Text style={styles.selectedAddress} numberOfLines={1}>{selectedLocation.address}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
            <Text style={styles.confirmBtnText}>선택</Text>
          </TouchableOpacity>
        </View>
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
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
    gap: 4,
  },
  backBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#27272A',
    borderRadius: 10,
    height: 44,
    paddingHorizontal: 12,
    marginRight: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    height: '100%',
  },
  resultsContainer: {
    position: 'absolute',
    top: 70,
    left: 56,
    right: 16,
    maxHeight: 240,
    backgroundColor: '#27272A',
    borderRadius: 10,
    zIndex: 100,
    overflow: 'hidden',
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#3F3F46',
  },
  resultText: {
    flex: 1,
    gap: 2,
  },
  resultName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  resultAddress: {
    fontSize: 13,
    color: '#A1A1AA',
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  mapLoading: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#18181B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  currentLocationBtn: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  bottomPanel: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#27272A',
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 12,
  },
  selectedInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  selectedText: {
    flex: 1,
    gap: 2,
  },
  selectedName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  selectedAddress: {
    fontSize: 13,
    color: '#A1A1AA',
  },
  confirmBtn: {
    backgroundColor: '#8B5CF6',
    borderRadius: 10,
    paddingHorizontal: 20,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
