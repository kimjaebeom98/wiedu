import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { getMyBookmarks } from '../api/bookmark';
import { StudyListResponse } from '../types/study';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const STUDY_METHOD_LABELS: Record<string, string> = {
  ONLINE: '온라인',
  OFFLINE: '오프라인',
  HYBRID: '온/오프라인',
};

export default function BookmarkedStudiesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const [studies, setStudies] = useState<StudyListResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const loadBookmarks = useCallback(async (pageNum: number = 0, append: boolean = false) => {
    try {
      if (pageNum === 0) setLoading(true);
      else setLoadingMore(true);

      const response = await getMyBookmarks(pageNum, 10);

      if (append) {
        setStudies(prev => [...prev, ...response.content]);
      } else {
        setStudies(response.content);
      }

      setHasMore(response.number < response.totalPages - 1);
      setPage(pageNum);
    } catch (error) {
      console.error('Failed to load bookmarks:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadBookmarks(0);
    }, [loadBookmarks])
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadBookmarks(0);
    setRefreshing(false);
  }, [loadBookmarks]);

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      loadBookmarks(page + 1, true);
    }
  };

  const renderStudyItem = ({ item }: { item: StudyListResponse }) => (
    <TouchableOpacity
      style={styles.studyCard}
      onPress={() => navigation.navigate('StudyDetail', { studyId: item.id })}
      activeOpacity={0.7}
    >
      <View style={styles.studyContent}>
        <View style={styles.studyHeader}>
          <Text style={styles.studyTitle} numberOfLines={1}>{item.title}</Text>
          <View style={styles.bookmarkIcon}>
            <Feather name="bookmark" size={18} color="#8B5CF6" />
          </View>
        </View>

        <View style={styles.studyMeta}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{item.categoryName}</Text>
          </View>
          <Text style={styles.methodText}>
            {STUDY_METHOD_LABELS[item.studyMethod] || item.studyMethod}
          </Text>
        </View>

        <View style={styles.studyFooter}>
          <View style={styles.memberInfo}>
            <Feather name="users" size={14} color="#71717A" />
            <Text style={styles.memberText}>
              {item.currentMembers}/{item.maxMembers}명
            </Text>
          </View>
          {item.meetingRegion && (
            <View style={styles.locationInfo}>
              <Feather name="map-pin" size={14} color="#71717A" />
              <Text style={styles.locationText}>
                {item.meetingCity || item.meetingRegion}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Feather name="bookmark" size={48} color="#3F3F46" />
      <Text style={styles.emptyTitle}>찜한 스터디가 없어요</Text>
      <Text style={styles.emptyDescription}>
        관심있는 스터디를 찜해두면{'\n'}여기서 쉽게 찾아볼 수 있어요
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#8B5CF6" />
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#18181B" />
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#18181B" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>찜한 스터디</Text>
        <View style={styles.headerRight} />
      </View>

      <FlatList
        data={studies}
        renderItem={renderStudyItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={[
          styles.listContent,
          studies.length === 0 && styles.emptyList,
        ]}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#8B5CF6"
            colors={['#8B5CF6']}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#18181B',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#18181B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#18181B',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerRight: {
    width: 40,
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  emptyList: {
    flex: 1,
  },
  studyCard: {
    backgroundColor: '#27272A',
    borderRadius: 16,
    padding: 16,
  },
  studyContent: {
    gap: 12,
  },
  studyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  studyTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  bookmarkIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  studyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryBadge: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8B5CF6',
  },
  methodText: {
    fontSize: 12,
    color: '#71717A',
  },
  studyFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  memberText: {
    fontSize: 12,
    color: '#71717A',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 12,
    color: '#71717A',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 100,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#71717A',
    textAlign: 'center',
    lineHeight: 20,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});
