import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Image,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { fetchCategories, fetchNearbyStudies, fetchPopularStudies } from '../api/study';
import { getMyProfile, checkStudyLimitExceeded } from '../api/profile';
import { fetchUnreadCount } from '../api/notification';
import { fetchNearbyMembers } from '../api/user';
import { StudyListResponse, Category } from '../types/study';
import { NearbyMember } from '../types/user';
import { formatLocationFromAddress, formatLocationDisplay } from '../utils/location';
import CustomAlert from '../components/common/CustomAlert';

interface SelectedLocation {
  latitude: number;
  longitude: number;
  displayName: string;
  fullAddress: string;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Category icons mapping
const CATEGORY_ICONS: Record<string, string> = {
  LANGUAGE: 'globe',
  CAREER: 'briefcase',
  IT_DEV: 'code',
  CERTIFICATION: 'award',
  CIVIL_SERVICE: 'shield',
  FINANCE: 'trending-up',
  DESIGN: 'pen-tool',
  BUSINESS: 'bar-chart-2',
  EDUCATION: 'book-open',
  LIFESTYLE: 'heart',
  CONTENT: 'video',
};

// Study method labels
const STUDY_METHOD_LABELS: Record<string, string> = {
  ONLINE: '온라인',
  OFFLINE: '오프라인',
  HYBRID: '온/오프라인',
};

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const [popularStudies, setPopularStudies] = useState<StudyListResponse[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [nearbyStudies, setNearbyStudies] = useState<StudyListResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [popularLoading, setPopularLoading] = useState(true);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [nearbyError, setNearbyError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<SelectedLocation | null>(null);
  const [displayRegion, setDisplayRegion] = useState<string>('');
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [nearbyMembers, setNearbyMembers] = useState<NearbyMember[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [comingSoonAlert, setComingSoonAlert] = useState(false);
  const isInitialized = useRef(false);

  // 프로필 활동지역 로드 (앱 시작 시 항상 프로필 기준)
  const loadInitialLocation = useCallback(async () => {
    try {
      // 프로필 활동지역 사용
      const profile = await getMyProfile();
      if (profile?.region) {
        const displayName = formatLocationFromAddress(profile.region);
        setDisplayRegion(displayName);

        // 좌표가 있으면 근처 스터디 조회용으로 설정
        if (profile.latitude && profile.longitude) {
          const location: SelectedLocation = {
            latitude: profile.latitude,
            longitude: profile.longitude,
            displayName,
            fullAddress: profile.region,
          };
          setSelectedLocation(location);
          return location;
        }

        return null; // 좌표 없으면 근처 스터디 조회 불가
      }

      setDisplayRegion('');
      return null;
    } catch (error) {
      console.error('Failed to load initial location:', error);
      return null;
    }
  }, []);

  // 선택한 위치로 근처 스터디 조회
  const loadNearbyStudies = useCallback(async (location?: SelectedLocation | null) => {
    const loc = location ?? selectedLocation;
    if (!loc) {
      setNearbyStudies([]);
      return;
    }

    setNearbyLoading(true);
    setNearbyError(null);
    try {
      const nearby = await fetchNearbyStudies(loc.latitude, loc.longitude);
      setNearbyStudies(nearby);
    } catch (error: any) {
      console.error('Failed to load nearby studies:', error);
      setNearbyError(error?.message || '근처 스터디를 불러오지 못했습니다');
    } finally {
      setNearbyLoading(false);
    }
  }, [selectedLocation]);

  // 근처 활동중인 멤버 조회
  const loadNearbyMembersData = useCallback(async (location?: SelectedLocation | null) => {
    const loc = location ?? selectedLocation;
    if (!loc) {
      setNearbyMembers([]);
      return;
    }

    setMembersLoading(true);
    try {
      const members = await fetchNearbyMembers(loc.latitude, loc.longitude);
      setNearbyMembers(members);
    } catch (error: any) {
      console.error('Failed to load nearby members:', error);
      setNearbyMembers([]);
    } finally {
      setMembersLoading(false);
    }
  }, [selectedLocation]);

  const loadData = useCallback(async () => {
    try {
      const [popularData, categoriesData] = await Promise.all([
        fetchPopularStudies(5),
        fetchCategories(),
      ]);
      setPopularStudies(popularData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
      setPopularLoading(false);
      setRefreshing(false);
    }
  }, []);

  // 초기 로드
  useEffect(() => {
    const init = async () => {
      if (isInitialized.current) return;
      isInitialized.current = true;

      const location = await loadInitialLocation();
      await Promise.all([
        loadData(),
        loadNearbyStudies(location),
        loadNearbyMembersData(location),
      ]);
    };
    init();
  }, [loadData, loadInitialLocation, loadNearbyStudies, loadNearbyMembersData]);

  // 읽지 않은 알림 수 로드
  const loadUnreadCount = useCallback(async () => {
    try {
      const count = await fetchUnreadCount();
      setUnreadNotificationCount(count);
    } catch (error) {
      console.error('Failed to load unread count:', error);
    }
  }, []);

  // 스터디 생성 버튼 핸들러 (활성 스터디 3개 제한 체크)
  const handleCreateStudy = useCallback(async () => {
    try {
      const { exceeded, count } = await checkStudyLimitExceeded();
      if (exceeded) {
        Alert.alert(
          '스터디 생성 불가',
          `현재 ${count}개의 활성 스터디에 참여 중입니다.\n스터디는 최대 3개까지만 참여할 수 있습니다.`,
          [{ text: '확인' }]
        );
        return;
      }
      navigation.navigate('StudyCreate');
    } catch (error) {
      console.error('Failed to check study limit:', error);
      navigation.navigate('StudyCreate');
    }
  }, [navigation]);

  // 화면 포커스 시 프로필 지역 다시 로드 (프로필 수정 반영)
  const lastProfileRegionRef = useRef<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      // 초기화 완료 후에만 실행 (초기 로드와 중복 방지)
      if (!isInitialized.current) return;

      const refreshProfileLocation = async () => {
        try {
          const profile = await getMyProfile();
          if (profile?.region) {
            // 프로필 지역이 변경되지 않았으면 스킵
            if (lastProfileRegionRef.current === profile.region) {
              return;
            }
            lastProfileRegionRef.current = profile.region;

            const displayName = formatLocationFromAddress(profile.region);
            setDisplayRegion(displayName);

            if (profile.latitude && profile.longitude) {
              const location: SelectedLocation = {
                latitude: profile.latitude,
                longitude: profile.longitude,
                displayName,
                fullAddress: profile.region,
              };
              setSelectedLocation(location);

              // 근처 스터디 로드
              setNearbyLoading(true);
              try {
                const nearby = await fetchNearbyStudies(location.latitude, location.longitude);
                setNearbyStudies(nearby);
              } catch (error: any) {
                console.error('Failed to load nearby studies:', error);
              } finally {
                setNearbyLoading(false);
              }
            }
          }
        } catch (error) {
          console.error('Failed to refresh profile location:', error);
        }
      };

      refreshProfileLocation();
      loadUnreadCount();
    }, [loadUnreadCount])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      loadData(),
      loadNearbyStudies(),
      loadNearbyMembersData(),
    ]);
  }, [loadData, loadNearbyStudies, loadNearbyMembersData]);

  const handleLocationPress = useCallback(() => {
    navigation.navigate('RegionPicker', {
      onSelect: async (location: { address: string; latitude: number; longitude: number }) => {
        const displayName = formatLocationFromAddress(location.address);
        setDisplayRegion(displayName);

        const newLocation: SelectedLocation = {
          latitude: location.latitude,
          longitude: location.longitude,
          displayName,
          fullAddress: location.address,
        };
        setSelectedLocation(newLocation);

        // 새 위치로 근처 스터디 및 멤버 로드
        loadNearbyStudies(newLocation);
        loadNearbyMembersData(newLocation);
      },
    });
  }, [navigation, loadNearbyStudies, loadNearbyMembersData]);

  const getCategoryIcon = (code: string): string => {
    return CATEGORY_ICONS[code] || 'folder';
  };

  // Display all categories
  const displayCategories = categories;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#18181B" />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#8B5CF6"
            colors={['#8B5CF6']}
          />
        }
      >
        {/* Top Row - Location & Search */}
        <View style={[styles.topRow, { paddingTop: insets.top + 20 }]}>
          <TouchableOpacity style={styles.locationBtn} onPress={handleLocationPress}>
            <Text style={styles.locationText} numberOfLines={1}>
              {displayRegion || '위치 설정'}
            </Text>
            <Feather name="chevron-down" size={20} color="#A1A1AA" />
          </TouchableOpacity>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.searchBtn}
              onPress={() => navigation.navigate('StudySearch')}
            >
              <Feather name="search" size={20} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.notificationBtn}
              onPress={() => navigation.navigate('Notifications')}
            >
              <Feather name="bell" size={22} color="#FFFFFF" />
              {unreadNotificationCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>
                    {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Category Section */}
        <View style={styles.categorySection}>
          {loading ? (
            <ActivityIndicator color="#8B5CF6" style={{ marginVertical: 20 }} />
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryScrollContent}
            >
              {/* Split into pairs for 2 rows */}
              {Array.from({ length: Math.ceil(displayCategories.length / 2) }).map((_, colIdx) => (
                <View key={colIdx} style={styles.categoryColumn}>
                  {displayCategories.slice(colIdx * 2, colIdx * 2 + 2).map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      style={styles.categoryItem}
                      onPress={() => navigation.navigate('CategoryStudies', {
                        categoryId: cat.id,
                        categoryName: cat.name,
                      })}
                    >
                      <View style={styles.categoryCircle}>
                        <Feather name={getCategoryIcon(cat.code)} size={18} color="#E4E4E7" />
                      </View>
                      <Text style={styles.categoryName} numberOfLines={1}>{cat.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Members Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>근처 활동중인 멤버</Text>
          </View>

          {membersLoading ? (
            <ActivityIndicator color="#8B5CF6" style={{ marginVertical: 20 }} />
          ) : !selectedLocation ? (
            <View style={styles.emptyMembersState}>
              <Feather name="users" size={32} color="#52525B" />
              <Text style={styles.emptyMembersText}>위치를 설정하면 근처 멤버를 볼 수 있어요</Text>
            </View>
          ) : nearbyMembers.length === 0 ? (
            <View style={styles.emptyMembersState}>
              <Feather name="users" size={32} color="#52525B" />
              <Text style={styles.emptyMembersText}>근처에 활동중인 멤버가 없어요</Text>
            </View>
          ) : (
            <View style={styles.membersRow}>
              {nearbyMembers.slice(0, 4).map((member) => (
                <TouchableOpacity key={member.id} style={styles.memberItem}>
                  <View style={styles.memberAvatar}>
                    {member.profileImage ? (
                      <Image source={{ uri: member.profileImage }} style={styles.memberAvatarImage} />
                    ) : null}
                    {member.badge && member.badgeColor && (
                      <View
                        style={[
                          styles.memberBadge,
                          { backgroundColor: member.badgeColor },
                        ]}
                      >
                        <Text style={styles.memberBadgeIcon}>{member.badge}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.memberName} numberOfLines={1}>{member.nickname}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Nearby Studies Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>내 근처 스터디</Text>
            <TouchableOpacity
              onPress={() => {
                if (selectedLocation) {
                  navigation.navigate('StudyList', {
                    type: 'nearby',
                    title: '내 근처 스터디',
                    location: {
                      latitude: selectedLocation.latitude,
                      longitude: selectedLocation.longitude,
                      displayName: selectedLocation.displayName,
                    },
                  });
                }
              }}
              disabled={!selectedLocation}
            >
              <Text style={[styles.sectionMore, !selectedLocation && { opacity: 0.5 }]}>전체보기</Text>
            </TouchableOpacity>
          </View>

          {nearbyLoading ? (
            <ActivityIndicator color="#8B5CF6" style={{ marginVertical: 20 }} />
          ) : nearbyError ? (
            <View style={styles.emptyState}>
              <Feather name="alert-circle" size={40} color="#EF4444" />
              <Text style={styles.emptyStateText}>{nearbyError}</Text>
              <TouchableOpacity onPress={() => loadNearbyStudies()} style={{ marginTop: 8 }}>
                <Text style={{ color: '#8B5CF6' }}>다시 시도</Text>
              </TouchableOpacity>
            </View>
          ) : !selectedLocation ? (
            <View style={styles.emptyState}>
              <Feather name="map-pin" size={40} color="#52525B" />
              <Text style={styles.emptyStateText}>위치를 설정해주세요</Text>
              <TouchableOpacity onPress={handleLocationPress} style={{ marginTop: 8 }}>
                <Text style={{ color: '#8B5CF6' }}>위치 설정하기</Text>
              </TouchableOpacity>
            </View>
          ) : nearbyStudies.length === 0 ? (
            <View style={styles.emptyState}>
              <Feather name="map-pin" size={40} color="#52525B" />
              <Text style={styles.emptyStateText}>근처에 스터디가 없어요</Text>
            </View>
          ) : (
            nearbyStudies.slice(0, 3).map((study) => (
              <TouchableOpacity
                key={study.id}
                style={styles.studyCard}
                onPress={() => navigation.navigate('StudyDetail', { studyId: study.id })}
              >
                <View style={styles.studyTop}>
                  <View style={styles.studyInfo}>
                    <View style={styles.studyTagRow}>
                      <View style={styles.studyTag}>
                        <Text style={styles.studyTagText}>{study.categoryName}</Text>
                      </View>
                      {study.studyMethod && (
                        <View style={styles.studyMethodTag}>
                          <Text style={styles.studyMethodText}>
                            {STUDY_METHOD_LABELS[study.studyMethod] || study.studyMethod}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.studyTitle} numberOfLines={2}>{study.title}</Text>
                    <Text style={styles.studySubcategory}>by {study.leaderNickname}</Text>
                  </View>
                  <View style={styles.studyMembers}>
                    {study.memberProfileImages && study.memberProfileImages.length > 0 ? (
                      study.memberProfileImages.slice(0, 3).map((img, idx) => (
                        <View
                          key={idx}
                          style={[styles.memberDot, idx > 0 && { marginLeft: -8 }]}
                        >
                          {img ? (
                            <Image source={{ uri: img }} style={styles.memberDotImg} />
                          ) : (
                            <Feather name="user" size={14} color="#71717A" />
                          )}
                        </View>
                      ))
                    ) : (
                      <View style={styles.memberDot}>
                        <Feather name="user" size={14} color="#71717A" />
                      </View>
                    )}
                  </View>
                </View>
                <View style={styles.studyBottom}>
                  <View style={styles.studyMeta}>
                    <Feather name="users" size={14} color="#71717A" />
                    <Text style={styles.studyMetaText}>
                      {study.currentMembers}/{study.maxMembers}명
                    </Text>
                  </View>
                  {(study.meetingRegion || study.meetingCity) && (
                    <View style={styles.studyMeta}>
                      <Feather name="map-pin" size={14} color="#71717A" />
                      <Text style={styles.studyMetaText} numberOfLines={1}>
                        {formatLocationDisplay(study.meetingRegion, study.meetingCity)}
                      </Text>
                    </View>
                  )}
                  <View style={styles.studyMeta}>
                    <View style={[
                      styles.statusDot,
                      { backgroundColor: study.status === 'RECRUITING' ? '#22C55E' : '#71717A' }
                    ]} />
                    <Text style={[
                      styles.studyMetaText,
                      { color: study.status === 'RECRUITING' ? '#22C55E' : '#71717A' }
                    ]}>
                      {study.status === 'RECRUITING' ? '모집중' :
                       study.status === 'IN_PROGRESS' ? '진행중' :
                       study.status === 'COMPLETED' ? '완료' : '마감'}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Popular Studies Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>인기 스터디</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('StudyList', {
                type: 'popular',
                title: '인기 스터디',
              })}
            >
              <Text style={styles.sectionMore}>전체보기</Text>
            </TouchableOpacity>
          </View>

          {popularLoading ? (
            <ActivityIndicator color="#8B5CF6" style={{ marginVertical: 20 }} />
          ) : popularStudies.length === 0 ? (
            <View style={styles.emptyState}>
              <Feather name="inbox" size={40} color="#52525B" />
              <Text style={styles.emptyStateText}>아직 등록된 스터디가 없어요</Text>
              <TouchableOpacity
                style={styles.emptyStateBtn}
                onPress={handleCreateStudy}
              >
                <Text style={styles.emptyStateBtnText}>첫 스터디 만들기</Text>
              </TouchableOpacity>
            </View>
          ) : (
            popularStudies.map((study) => (
              <TouchableOpacity
                key={study.id}
                style={styles.studyCard}
                onPress={() => navigation.navigate('StudyDetail', { studyId: study.id })}
              >
                <View style={styles.studyTop}>
                  <View style={styles.studyInfo}>
                    <View style={styles.studyTagRow}>
                      <View style={styles.studyTag}>
                        <Text style={styles.studyTagText}>{study.categoryName}</Text>
                      </View>
                      {study.studyMethod && (
                        <View style={styles.studyMethodTag}>
                          <Text style={styles.studyMethodText}>
                            {STUDY_METHOD_LABELS[study.studyMethod] || study.studyMethod}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.studyTitle} numberOfLines={2}>{study.title}</Text>
                    <Text style={styles.studySubcategory}>by {study.leaderNickname}</Text>
                  </View>
                  <View style={styles.studyMembers}>
                    {study.memberProfileImages && study.memberProfileImages.length > 0 ? (
                      study.memberProfileImages.slice(0, 3).map((img, idx) => (
                        <View
                          key={idx}
                          style={[styles.memberDot, idx > 0 && { marginLeft: -8 }]}
                        >
                          {img ? (
                            <Image source={{ uri: img }} style={styles.memberDotImg} />
                          ) : (
                            <Feather name="user" size={14} color="#71717A" />
                          )}
                        </View>
                      ))
                    ) : (
                      <View style={styles.memberDot}>
                        <Feather name="user" size={14} color="#71717A" />
                      </View>
                    )}
                  </View>
                </View>
                <View style={styles.studyBottom}>
                  <View style={styles.studyMeta}>
                    <Feather name="users" size={14} color="#71717A" />
                    <Text style={styles.studyMetaText}>
                      {study.currentMembers}/{study.maxMembers}명
                    </Text>
                  </View>
                  {(study.meetingRegion || study.meetingCity) && (
                    <View style={styles.studyMeta}>
                      <Feather name="map-pin" size={14} color="#71717A" />
                      <Text style={styles.studyMetaText} numberOfLines={1}>
                        {formatLocationDisplay(study.meetingRegion, study.meetingCity)}
                      </Text>
                    </View>
                  )}
                  <View style={styles.studyMeta}>
                    <View style={[
                      styles.statusDot,
                      { backgroundColor: study.status === 'RECRUITING' ? '#22C55E' : '#71717A' }
                    ]} />
                    <Text style={[
                      styles.studyMetaText,
                      { color: study.status === 'RECRUITING' ? '#22C55E' : '#71717A' }
                    ]}>
                      {study.status === 'RECRUITING' ? '모집중' :
                       study.status === 'IN_PROGRESS' ? '진행중' :
                       study.status === 'COMPLETED' ? '완료' : '마감'}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}

          {/* Bottom spacer for navigation */}
          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={[styles.bottomNav, { paddingBottom: Math.max(12, insets.bottom) }]}>
        <TouchableOpacity style={styles.navItem}>
          <Feather name="home" size={24} color="#8B5CF6" />
          <Text style={styles.navTextActive}>홈</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setComingSoonAlert(true)}
        >
          <Feather name="compass" size={24} color="#71717A" />
          <Text style={styles.navText}>탐색</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navAddBtn}
          onPress={handleCreateStudy}
        >
          <Feather name="plus" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setComingSoonAlert(true)}
        >
          <Feather name="message-circle" size={24} color="#71717A" />
          <Text style={styles.navText}>채팅</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('MyPage')}
        >
          <Feather name="user" size={24} color="#71717A" />
          <Text style={styles.navText}>마이</Text>
        </TouchableOpacity>
      </View>

      {/* Coming Soon Alert */}
      <CustomAlert
        visible={comingSoonAlert}
        title="준비 중"
        message="해당 기능은 준비 중입니다."
        icon="info"
        onClose={() => setComingSoonAlert(false)}
        buttons={[{ text: '확인', style: 'default' }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#18181B',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 24,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
  },
  locationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    maxWidth: '60%',
  },
  locationText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
    marginRight: -8,
  },
  searchBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#27272A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#27272A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  categorySection: {
    marginTop: 20,
    marginHorizontal: -24,
  },
  categoryScrollContent: {
    paddingHorizontal: 24,
    gap: 8,
  },
  categoryColumn: {
    gap: 8,
  },
  categoryItem: {
    width: 68,
    backgroundColor: '#27272A',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  categoryCircle: {
    width: 36,
    height: 36,
    backgroundColor: '#3F3F46',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryName: {
    fontSize: 10,
    fontWeight: '500',
    color: '#E4E4E7',
  },
  section: {
    marginTop: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sectionMore: {
    fontSize: 13,
    fontWeight: '500',
    color: '#8B5CF6',
  },
  membersRow: {
    flexDirection: 'row',
    gap: 20,
  },
  memberItem: {
    alignItems: 'center',
    gap: 8,
  },
  memberAvatar: {
    width: 52,
    height: 52,
    backgroundColor: '#3F3F46',
    borderRadius: 26,
    position: 'relative',
  },
  memberBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 18,
    height: 18,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberBadgeIcon: {
    fontSize: 10,
    color: '#FFFFFF',
  },
  memberName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#A1A1AA',
    maxWidth: 52,
  },
  memberAvatarImage: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  emptyMembersState: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  emptyMembersText: {
    fontSize: 13,
    color: '#71717A',
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#71717A',
  },
  emptyStateBtn: {
    marginTop: 8,
    backgroundColor: '#8B5CF6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  emptyStateBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  studyCard: {
    backgroundColor: '#27272A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  studyTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  studyInfo: {
    flex: 1,
    gap: 6,
  },
  studyTagRow: {
    flexDirection: 'row',
    gap: 8,
  },
  studyTag: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#8B5CF6',
  },
  studyTagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  studyMethodTag: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#3F3F46',
  },
  studyMethodText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#A1A1AA',
  },
  studyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 4,
  },
  studySubcategory: {
    fontSize: 13,
    color: '#71717A',
  },
  studyMembers: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberDot: {
    width: 28,
    height: 28,
    backgroundColor: '#52525B',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#27272A',
  },
  memberDotImg: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  studyBottom: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 16,
  },
  studyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  studyMetaText: {
    fontSize: 13,
    color: '#71717A',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#18181B',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#27272A',
  },
  navItem: {
    width: 64,
    alignItems: 'center',
    gap: 4,
  },
  navText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#71717A',
  },
  navTextActive: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  navAddBtn: {
    width: 52,
    height: 52,
    backgroundColor: '#8B5CF6',
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -10,
  },
});
