import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { clearTokens } from '../storage/token';
import { RootStackParamList } from '../navigation/types';
import { fetchStudies, fetchCategories } from '../api/study';
import { StudyResponse, Category } from '../types/study';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Category icons mapping
const CATEGORY_ICONS: Record<string, string> = {
  LANGUAGE: 'globe',
  CAREER: 'briefcase',
  IT_DEV: 'code',
  CERTIFICATION: 'award',
  CIVIL_SERVICE: 'building',
  FINANCE: 'trending-up',
  DESIGN: 'pen-tool',
  BUSINESS: 'bar-chart-2',
};

// Member data (mock for now - will be replaced with API)
const MEMBERS = [
  { id: 1, name: '민수', badge: '🏆', badgeColor: '#F59E0B' },
  { id: 2, name: '지영', badge: '♥', badgeColor: '#EC4899' },
  { id: 3, name: '현우', badge: '⭐', badgeColor: '#3B82F6' },
  { id: 4, name: '서연', badge: '⚡', badgeColor: '#22C55E' },
];

// Study method labels
const STUDY_METHOD_LABELS: Record<string, string> = {
  ONLINE: '온라인',
  OFFLINE: '오프라인',
  HYBRID: '온/오프라인',
};

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [studies, setStudies] = useState<StudyResponse[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [studiesData, categoriesData] = await Promise.all([
        fetchStudies(),
        fetchCategories(),
      ]);
      setStudies(studiesData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const handleLogout = async () => {
    await clearTokens();
    navigation.replace('Login');
  };

  const getCategoryIcon = (code: string): string => {
    return CATEGORY_ICONS[code] || 'folder';
  };

  // Limit categories to 8 for display
  const displayCategories = categories.slice(0, 8);

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
        <View style={styles.topRow}>
          <TouchableOpacity style={styles.locationBtn}>
            <Text style={styles.locationText}>강남구</Text>
            <Feather name="chevron-down" size={20} color="#A1A1AA" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.searchBar}>
            <Feather name="search" size={20} color="#71717A" />
            <Text style={styles.searchText}>어떤 스터디를 찾고 계세요?</Text>
          </TouchableOpacity>
        </View>

        {/* Category Section */}
        <View style={styles.categorySection}>
          {loading ? (
            <ActivityIndicator color="#8B5CF6" style={{ marginVertical: 20 }} />
          ) : (
            <>
              <View style={styles.categoryRow}>
                {displayCategories.slice(0, 4).map((cat) => (
                  <TouchableOpacity key={cat.id} style={styles.categoryItem}>
                    <View style={styles.categoryCircle}>
                      <Feather name={getCategoryIcon(cat.code)} size={22} color="#E4E4E7" />
                    </View>
                    <Text style={styles.categoryName}>{cat.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.categoryRow}>
                {displayCategories.slice(4, 8).map((cat) => (
                  <TouchableOpacity key={cat.id} style={styles.categoryItem}>
                    <View style={styles.categoryCircle}>
                      <Feather name={getCategoryIcon(cat.code)} size={22} color="#E4E4E7" />
                    </View>
                    <Text style={styles.categoryName}>{cat.name}</Text>
                  </TouchableOpacity>
                ))}
                {displayCategories.length < 8 && (
                  <TouchableOpacity style={styles.categoryItem}>
                    <View style={styles.categoryCircle}>
                      <Feather name="more-horizontal" size={22} color="#E4E4E7" />
                    </View>
                    <Text style={styles.categoryName}>더보기</Text>
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}
        </View>

        {/* Members Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>근처 활동중인 멤버</Text>
            <TouchableOpacity>
              <Text style={styles.sectionMore}>더보기</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.membersRow}>
            {MEMBERS.map((member) => (
              <TouchableOpacity key={member.id} style={styles.memberItem}>
                <View style={styles.memberAvatar}>
                  <View
                    style={[
                      styles.memberBadge,
                      { backgroundColor: member.badgeColor },
                    ]}
                  >
                    <Text style={styles.memberBadgeIcon}>{member.badge}</Text>
                  </View>
                </View>
                <Text style={styles.memberName}>{member.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Studies Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>인기 스터디</Text>
            <TouchableOpacity>
              <Text style={styles.sectionMore}>전체보기</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator color="#8B5CF6" style={{ marginVertical: 20 }} />
          ) : studies.length === 0 ? (
            <View style={styles.emptyState}>
              <Feather name="inbox" size={40} color="#52525B" />
              <Text style={styles.emptyStateText}>아직 등록된 스터디가 없어요</Text>
              <TouchableOpacity
                style={styles.emptyStateBtn}
                onPress={() => navigation.navigate('StudyCreate')}
              >
                <Text style={styles.emptyStateBtnText}>첫 스터디 만들기</Text>
              </TouchableOpacity>
            </View>
          ) : (
            studies.map((study) => (
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
                    {study.subcategoryName && (
                      <Text style={styles.studySubcategory}>{study.subcategoryName}</Text>
                    )}
                  </View>
                  <View style={styles.studyMembers}>
                    <View style={styles.memberDot} />
                    <View style={[styles.memberDot, { marginLeft: -8 }]} />
                    <View style={[styles.memberDot, { marginLeft: -8 }]} />
                  </View>
                </View>
                <View style={styles.studyBottom}>
                  <View style={styles.studyMeta}>
                    <Feather name="users" size={14} color="#71717A" />
                    <Text style={styles.studyMetaText}>
                      {study.currentMembers}/{study.maxMembers}명
                    </Text>
                  </View>
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

          {/* Logout Button (temporary) */}
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>로그아웃</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Feather name="home" size={24} color="#8B5CF6" />
          <Text style={styles.navTextActive}>홈</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Feather name="compass" size={24} color="#71717A" />
          <Text style={styles.navText}>탐색</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navAddBtn}
          onPress={() => navigation.navigate('StudyCreate')}
        >
          <Feather name="plus" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
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
    gap: 16,
    paddingTop: 60,
    paddingBottom: 8,
  },
  locationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  searchBar: {
    flex: 1,
    height: 48,
    backgroundColor: '#27272A',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 10,
  },
  searchText: {
    fontSize: 14,
    color: '#71717A',
  },
  categorySection: {
    marginTop: 24,
    gap: 8,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  categoryItem: {
    flex: 1,
    backgroundColor: '#27272A',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  categoryCircle: {
    width: 44,
    height: 44,
    backgroundColor: '#3F3F46',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryName: {
    fontSize: 12,
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
  logoutBtn: {
    marginTop: 20,
    marginBottom: 100,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: 12,
  },
  logoutText: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '600',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
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
