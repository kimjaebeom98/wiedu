import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  ScrollView,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { fetchCategories, fetchStudiesByCategory, PaginatedStudyResponse } from '../api/study';
import { StudyListResponse, Category, Subcategory } from '../types/study';
import { formatLocationDisplay } from '../utils/location';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type CategoryStudiesRouteProp = RouteProp<RootStackParamList, 'CategoryStudies'>;

const STUDY_METHOD_LABELS: Record<string, string> = {
  ONLINE: '온라인',
  OFFLINE: '오프라인',
  HYBRID: '온/오프라인',
};

export default function CategoryStudiesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<CategoryStudiesRouteProp>();
  const insets = useSafeAreaInsets();

  const { categoryId: initialCategoryId, categoryName: initialCategoryName } = route.params;

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(initialCategoryId);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<number | null>(null);
  const [studies, setStudies] = useState<StudyListResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Get current category and its subcategories
  const currentCategory = categories.find(c => c.id === selectedCategoryId);
  const subcategories = currentCategory?.subcategories || [];

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategories();
        setCategories(data);
      } catch (error) {
        console.error('Failed to load categories:', error);
      } finally {
        setCategoriesLoading(false);
      }
    };
    loadCategories();
  }, []);

  // Load studies when category changes
  const loadStudies = useCallback(async (catId: number, pageNum: number = 0) => {
    if (pageNum === 0) {
      setLoading(true);
      setStudies([]);
    } else {
      setLoadingMore(true);
    }

    try {
      const response: PaginatedStudyResponse = await fetchStudiesByCategory({
        categoryId: catId,
        page: pageNum,
        size: 10,
      });

      if (pageNum === 0) {
        setStudies(response.content);
      } else {
        setStudies(prev => [...prev, ...response.content]);
      }

      setHasMore(!response.last);
      setPage(pageNum);
    } catch (error) {
      console.error('Failed to load studies:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    loadStudies(selectedCategoryId, 0);
  }, [selectedCategoryId, loadStudies]);

  const handleCategorySelect = (catId: number) => {
    setSelectedCategoryId(catId);
    setSelectedSubcategoryId(null);
    setPage(0);
    setHasMore(true);
  };

  const handleSubcategorySelect = (subId: number | null) => {
    setSelectedSubcategoryId(subId);
    // TODO: Filter by subcategory when backend supports it
  };

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      loadStudies(selectedCategoryId, page + 1);
    }
  }, [loadingMore, hasMore, selectedCategoryId, page, loadStudies]);

  // Filter studies by subcategory (client-side for now)
  const filteredStudies = selectedSubcategoryId
    ? studies // TODO: Backend filter support needed
    : studies;

  const renderStudyCard = ({ item: study }: { item: StudyListResponse }) => (
    <TouchableOpacity
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
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator color="#8B5CF6" />
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyState}>
        <Feather name="inbox" size={48} color="#52525B" />
        <Text style={styles.emptyTitle}>스터디가 없어요</Text>
        <Text style={styles.emptyText}>
          이 카테고리에 등록된 스터디가 없습니다
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => navigation.navigate('StudySearch')}
        >
          <Feather name="search" size={20} color="#71717A" />
          <Text style={styles.searchText}>스터디 검색</Text>
        </TouchableOpacity>
      </View>

      {/* Category Tabs */}
      {categoriesLoading ? (
        <View style={styles.tabsLoading}>
          <ActivityIndicator color="#8B5CF6" />
        </View>
      ) : (
        <View style={styles.categoryTabsContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryTabs}
          >
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryTab,
                  selectedCategoryId === cat.id && styles.categoryTabActive,
                ]}
                onPress={() => handleCategorySelect(cat.id)}
              >
                <Text
                  style={[
                    styles.categoryTabText,
                    selectedCategoryId === cat.id && styles.categoryTabTextActive,
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Subcategory Chips */}
      {subcategories.length > 0 && (
        <View style={styles.subcategoryContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.subcategoryChips}
          >
            <TouchableOpacity
              style={[
                styles.subcategoryChip,
                selectedSubcategoryId === null && styles.subcategoryChipActive,
              ]}
              onPress={() => handleSubcategorySelect(null)}
            >
              <Text
                style={[
                  styles.subcategoryChipText,
                  selectedSubcategoryId === null && styles.subcategoryChipTextActive,
                ]}
              >
                전체
              </Text>
            </TouchableOpacity>
            {subcategories.map((sub) => (
              <TouchableOpacity
                key={sub.id}
                style={[
                  styles.subcategoryChip,
                  selectedSubcategoryId === sub.id && styles.subcategoryChipActive,
                ]}
                onPress={() => handleSubcategorySelect(sub.id)}
              >
                <Text
                  style={[
                    styles.subcategoryChipText,
                    selectedSubcategoryId === sub.id && styles.subcategoryChipTextActive,
                  ]}
                >
                  {sub.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Study List */}
      {loading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator color="#8B5CF6" size="large" />
        </View>
      ) : (
        <FlatList
          data={filteredStudies}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderStudyCard}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          showsVerticalScrollIndicator={false}
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
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    height: 44,
    backgroundColor: '#27272A',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 10,
  },
  searchText: {
    fontSize: 14,
    color: '#71717A',
  },
  tabsLoading: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryTabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#27272A',
  },
  categoryTabs: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryTab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  categoryTabActive: {
    borderBottomColor: '#8B5CF6',
  },
  categoryTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#71717A',
  },
  categoryTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  subcategoryContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#27272A',
  },
  subcategoryChips: {
    paddingHorizontal: 16,
    gap: 8,
  },
  subcategoryChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#27272A',
    borderWidth: 1,
    borderColor: '#3F3F46',
  },
  subcategoryChipActive: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  subcategoryChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#A1A1AA',
  },
  subcategoryChipTextActive: {
    color: '#FFFFFF',
  },
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#71717A',
    textAlign: 'center',
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
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
});
