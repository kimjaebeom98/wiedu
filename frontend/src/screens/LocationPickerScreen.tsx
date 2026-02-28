import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Platform,
} from 'react-native';
import MapView, { Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type LocationPickerRouteProp = RouteProp<RootStackParamList, 'LocationPicker'>;

const DEFAULT_REGION: Region = {
  latitude: 37.5665,
  longitude: 126.978,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

interface SelectedLocation {
  address: string;
  addressDetail: string;
  latitude: number;
  longitude: number;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

export default function LocationPickerScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<LocationPickerRouteProp>();
  const { onSelect, initialLocation } = route.params;
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);

  const [region, setRegion] = useState<Region>(() => {
    if (initialLocation) {
      return {
        latitude: initialLocation.latitude,
        longitude: initialLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
    }
    return DEFAULT_REGION;
  });

  const [selectedLocation, setSelectedLocation] = useState<SelectedLocation>({
    address: '',
    addressDetail: '',
    latitude: region.latitude,
    longitude: region.longitude,
  });

  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [isLocatingGPS, setIsLocatingGPS] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [isInitializing, setIsInitializing] = useState(!initialLocation);
  const [skipNextGeocode, setSkipNextGeocode] = useState(false);
  const pendingRegionRef = useRef<Region | null>(null);

  const debouncedRegion = useDebounce(region, 600);

  const reverseGeocode = useCallback(async (latitude: number, longitude: number) => {
    setIsReverseGeocoding(true);
    try {
      const results = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (results && results.length > 0) {
        const result = results[0];
        const parts: string[] = [];

        if (result.region) parts.push(result.region);
        if (result.city && result.city !== result.region) parts.push(result.city);
        if (result.district) parts.push(result.district);
        if (result.street) parts.push(result.street);

        const address = parts.join(' ') || '주소를 찾을 수 없습니다';
        const detail = result.streetNumber
          ? `${result.street || ''} ${result.streetNumber}`.trim()
          : result.name || '';

        setSelectedLocation({
          address,
          addressDetail: detail || address,
          latitude,
          longitude,
        });
      }
    } catch (err) {
      console.warn('Reverse geocode failed:', err);
      setSelectedLocation((prev) => ({
        ...prev,
        address: '주소를 찾을 수 없습니다',
        addressDetail: '',
        latitude,
        longitude,
      }));
    } finally {
      setIsReverseGeocoding(false);
    }
  }, []);

  // Auto-locate on mount if no initial location provided
  useEffect(() => {
    if (!initialLocation && isInitializing) {
      (async () => {
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status === 'granted') {
            const location = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Low,
            });
            const newRegion: Region = {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            };
            setRegion(newRegion);
            mapRef.current?.animateToRegion(newRegion, 500);
            setHasUserInteracted(true);
          }
        } catch (err) {
          console.warn('Auto-locate failed:', err);
          setHasUserInteracted(true);
        } finally {
          setIsInitializing(false);
        }
      })();
    } else if (initialLocation) {
      setHasUserInteracted(true);
    }
  }, [initialLocation, isInitializing]);

  // Only reverse geocode after user interaction (skip if address already set from search)
  useEffect(() => {
    if (hasUserInteracted) {
      if (skipNextGeocode) {
        setSkipNextGeocode(false);
        return;
      }
      reverseGeocode(debouncedRegion.latitude, debouncedRegion.longitude);
    }
  }, [debouncedRegion, reverseGeocode, hasUserInteracted, skipNextGeocode]);

  // Animate to pending region when screen regains focus (after returning from search)
  useFocusEffect(
    useCallback(() => {
      if (pendingRegionRef.current) {
        mapRef.current?.animateToRegion(pendingRegionRef.current, 500);
        pendingRegionRef.current = null;
      }
    }, [])
  );

  const handleRegionChangeComplete = useCallback((newRegion: Region) => {
    setRegion(newRegion);
    if (!hasUserInteracted) {
      setHasUserInteracted(true);
    }
  }, [hasUserInteracted]);

  const handleGPSPress = useCallback(async () => {
    setIsLocatingGPS(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setIsLocatingGPS(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const newRegion: Region = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };

      mapRef.current?.animateToRegion(newRegion, 500);
      setRegion(newRegion);
    } catch (err) {
      console.warn('GPS location failed:', err);
    } finally {
      setIsLocatingGPS(false);
    }
  }, []);

  const handleConfirm = useCallback(() => {
    onSelect(selectedLocation);
    navigation.goBack();
  }, [onSelect, selectedLocation, navigation]);

  const handleSearchSelect = useCallback((location: {
    address: string;
    addressDetail: string;
    latitude: number;
    longitude: number;
  }) => {
    // Update selected location directly from search result
    setSelectedLocation(location);

    // Store pending region for animation when screen regains focus
    const newRegion: Region = {
      latitude: location.latitude,
      longitude: location.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
    setRegion(newRegion);
    pendingRegionRef.current = newRegion;

    // Skip next reverse geocode since we already have address from search
    setSkipNextGeocode(true);
    setHasUserInteracted(true);
  }, []);

  const handleSearchPress = useCallback(() => {
    navigation.navigate('LocationSearch', { onSelect: handleSearchSelect });
  }, [navigation, handleSearchSelect]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Map (full screen) */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={region}
        onRegionChangeComplete={handleRegionChangeComplete}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
        userInterfaceStyle="dark"
      />

      {/* Search Bar (overlaid on map) */}
      <View style={[styles.searchBarContainer, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.searchBar} onPress={handleSearchPress} activeOpacity={0.8}>
          <Feather name="search" size={16} color="#71717A" />
          <Text style={styles.searchPlaceholder}>장소 검색</Text>
        </TouchableOpacity>
      </View>

      {/* Center Pin Marker (fixed, overlaid on map) */}
      <View style={styles.pinMarkerContainer} pointerEvents="none">
        <View style={styles.pinCircle}>
          <Feather name="map-pin" size={28} color="#FFFFFF" />
        </View>
        <View style={styles.pinTail} />
        <View style={styles.pinShadow} />
      </View>

      {/* Hint Text */}
      <View style={styles.hintContainer} pointerEvents="none">
        <Feather name="move" size={16} color="#A1A1AA" />
        <Text style={styles.hintText}>지도를 움직여 위치를 선택하세요</Text>
      </View>

      {/* GPS Button */}
      <TouchableOpacity
        style={[styles.gpsButton, { bottom: 240 + insets.bottom }]}
        onPress={handleGPSPress}
        disabled={isLocatingGPS}
      >
        {isLocatingGPS ? (
          <ActivityIndicator size="small" color="#8B5CF6" />
        ) : (
          <Feather name="crosshair" size={22} color="#8B5CF6" />
        )}
      </TouchableOpacity>

      {/* Bottom Sheet */}
      <View style={[styles.bottomSheet, { paddingBottom: insets.bottom + 16 }]}>
        {/* Handle Bar */}
        <View style={styles.handleBar} />

        {/* Label */}
        <Text style={styles.bottomSheetLabel}>선택한 위치</Text>

        {/* Address Row */}
        <View style={styles.addressRow}>
          <Feather name="map-pin" size={16} color="#8B5CF6" style={styles.addressIcon} />
          <View style={styles.addressTextContainer}>
            {isReverseGeocoding || isInitializing ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color="#A1A1AA" />
                <Text style={styles.loadingText}>
                  {isInitializing ? '현재 위치 확인 중...' : '주소 검색 중...'}
                </Text>
              </View>
            ) : selectedLocation.address ? (
              <>
                <Text style={styles.addressText} numberOfLines={1}>
                  {selectedLocation.address}
                </Text>
                {selectedLocation.addressDetail ? (
                  <Text style={styles.addressDetailText} numberOfLines={1}>
                    {selectedLocation.addressDetail}
                  </Text>
                ) : null}
              </>
            ) : (
              <Text style={styles.addressDetailText}>
                지도를 움직여 위치를 선택하세요
              </Text>
            )}
          </View>
        </View>

        {/* Confirm Button */}
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handleConfirm}
          activeOpacity={0.85}
        >
          <Text style={styles.confirmButtonText}>이 위치로 설정</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#18181B',
  },
  map: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  searchBarContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 12,
  },
  backBtn: {
    width: 44,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(39, 39, 42, 0.8)',
    borderRadius: 22,
  },
  searchBar: {
    flex: 1,
    height: 52,
    backgroundColor: 'rgba(39, 39, 42, 0.9)',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  searchPlaceholder: {
    fontSize: 15,
    color: '#71717A',
  },
  pinMarkerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 200,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  pinCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 10,
  },
  pinTail: {
    width: 4,
    height: 16,
    backgroundColor: '#8B5CF6',
    borderRadius: 2,
    marginTop: -2,
  },
  pinShadow: {
    width: 32,
    height: 10,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    marginTop: 4,
  },
  hintContainer: {
    position: 'absolute',
    bottom: 260,
    alignSelf: 'center',
    backgroundColor: 'rgba(39, 39, 44, 0.8)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    zIndex: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  hintText: {
    fontSize: 13,
    color: '#A1A1AA',
    fontWeight: '400',
  },
  gpsButton: {
    position: 'absolute',
    left: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#27272A',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#18181B',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    paddingHorizontal: 24,
    gap: 16,
    zIndex: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#3F3F46',
    alignSelf: 'center',
    marginBottom: 8,
  },
  bottomSheetLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#71717A',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    minHeight: 44,
  },
  addressIcon: {
    marginTop: 2,
  },
  addressTextContainer: {
    flex: 1,
    gap: 4,
    justifyContent: 'center',
    minHeight: 40,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: '#A1A1AA',
  },
  addressText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  addressDetailText: {
    fontSize: 13,
    color: '#A1A1AA',
  },
  confirmButton: {
    height: 52,
    backgroundColor: '#8B5CF6',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
