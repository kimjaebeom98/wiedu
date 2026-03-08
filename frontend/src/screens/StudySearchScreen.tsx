import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Keyboard,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { searchStudies, PaginatedStudyResponse } from '../api/study';
import { StudyListResponse } from '../types/study';
import { formatLocationDisplay } from '../utils/location';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const STUDY_METHOD_LABELS: Record<string, string> = {
  ONLINE: '온라인',
  OFFLINE: '오프라인',
  HYBRID: '온/오프라인',
};

export default function StudySearchScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);

  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<StudyListResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // 자동 포커스
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSearch = useCallback(async (searchKeyword: string, pageNum: number = 0) => {
    if (!searchKeyword.trim()) return;

    if (pageNum === 0) {
      setLoading(true);
      setResults([]);
    } else {
      setLoadingMore(true);
    }

    try {
      const response: PaginatedStudyResponse = await searchStudies({
        keyword: searchKeyword.trim(),
        page: pageNum,
        size: 10,
      });

      if (pageNum === 0) {
        setResults(response.content);
      } else {
        setResults(prev => [...prev, ...response.content]);
      }

      setHasMore(!response.last);
      setPage(pageNum);
      setHasSearched(true);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  const handleSubmit = useCallback(() => {
    Keyboard.dismiss();
    handleSearch(keyword, 0);
  }, [keyword, handleSearch]);

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore && hasSearched) {
      handleSearch(keyword, page + 1);
    }
  }, [loadingMore, hasMore, hasSearched, keyword, page, handleSearch]);

  const handleClear = useCallback(() => {
    setKeyword('');
    setResults([]);
    setHasSearched(false);
    setPage(0);
    setHasMore(true);
    inputRef.current?.focus();
  }, []);

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
    if (!hasSearched) {
      return (
        <View style={styles.emptyState}>
          <Feather name="search" size={48} color="#52525B" />
          <Text style={styles.emptyTitle}>스터디 검색</Text>
          <Text style={styles.emptyText}>
            찾고 싶은 스터디 이름이나{'\n'}키워드를 입력해보세요
          </Text>
        </View>
      );
    }
    return (
      <View style={styles.emptyState}>
        <Feather name="inbox" size={48} color="#52525B" />
        <Text style={styles.emptyTitle}>검색 결과가 없어요</Text>
        <Text style={styles.emptyText}>
          다른 키워드로 검색해보세요
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Search Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.searchInputWrapper}>
          <Feather name="search" size={20} color="#71717A" />
          <TextInput
            ref={inputRef}
            style={styles.searchInput}
            placeholder="스터디 검색"
            placeholderTextColor="#71717A"
            value={keyword}
            onChangeText={setKeyword}
            onSubmitEditing={handleSubmit}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {keyword.length > 0 && (
            <TouchableOpacity onPress={handleClear}>
              <Feather name="x-circle" size={20} color="#71717A" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.searchBtn}
          onPress={handleSubmit}
        >
          <Text style={styles.searchBtnText}>검색</Text>
        </TouchableOpacity>
      </View>

      {/* Results */}
      {loading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator color="#8B5CF6" size="large" />
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderStudyCard}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
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
  searchInputWrapper: {
    flex: 1,
    height: 48,
    backgroundColor: '#27272A',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
  },
  searchBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 100,
    flexGrow: 1,
  },
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
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
    lineHeight: 20,
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
