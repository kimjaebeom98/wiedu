import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { fetchNearbyStudiesPaginated, fetchPopularStudiesPaginated, PaginatedStudyResponse } from '../api/study';
import { StudyListResponse } from '../types/study';
import { formatLocationDisplay } from '../utils/location';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type StudyListRouteProp = RouteProp<RootStackParamList, 'StudyList'>;

const STUDY_METHOD_LABELS: Record<string, string> = {
  ONLINE: '온라인',
  OFFLINE: '오프라인',
  HYBRID: '온/오프라인',
};

export default function StudyListScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<StudyListRouteProp>();
  const insets = useSafeAreaInsets();

  const { type, title, location } = route.params;

  const [studies, setStudies] = useState<StudyListResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadStudies = useCallback(async (pageNum: number = 0) => {
    if (pageNum === 0) {
      setLoading(true);
      setStudies([]);
    } else {
      setLoadingMore(true);
    }

    try {
      let response: PaginatedStudyResponse;

      if (type === 'nearby' && location) {
        response = await fetchNearbyStudiesPaginated({
          latitude: location.latitude,
          longitude: location.longitude,
          page: pageNum,
          size: 10,
        });
      } else {
        response = await fetchPopularStudiesPaginated({
          page: pageNum,
          size: 10,
        });
      }

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
  }, [type, location]);

  useEffect(() => {
    loadStudies(0);
  }, [loadStudies]);

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      loadStudies(page + 1);
    }
  }, [loadingMore, hasMore, page, loadStudies]);

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
          {type === 'nearby' ? '근처에 등록된 스터디가 없습니다' : '등록된 스터디가 없습니다'}
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
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Subtitle for nearby */}
      {type === 'nearby' && location && (
        <View style={styles.subtitleContainer}>
          <Feather name="map-pin" size={14} color="#8B5CF6" />
          <Text style={styles.subtitleText}>{location.displayName} 주변</Text>
        </View>
      )}

      {/* Study List */}
      {loading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator color="#8B5CF6" size="large" />
        </View>
      ) : (
        <FlatList
          data={studies}
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
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  subtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingBottom: 12,
  },
  subtitleText: {
    fontSize: 14,
    color: '#A1A1AA',
  },
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
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
