import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Image,
  TextInput,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import {
  BoardPostListItem,
  PostCategory,
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  PageResponse,
} from '../../types/board';
import { fetchBoardPosts, togglePostLike } from '../../api/board';

interface BoardListViewProps {
  studyId: number;
  onPostPress: (postId: number) => void;
  onCreatePress: () => void;
}

type FilterCategory = 'ALL' | PostCategory;

const FILTER_TABS: { key: FilterCategory; label: string }[] = [
  { key: 'ALL', label: '전체' },
  { key: 'NOTICE', label: '공지' },
  { key: 'CHAT', label: '잡담' },
  { key: 'QNA', label: '질문' },
];

export default function BoardListView({
  studyId,
  onPostPress,
  onCreatePress,
}: BoardListViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('ALL');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [posts, setPosts] = useState<BoardPostListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [showSearch, setShowSearch] = useState(false);

  const loadPosts = useCallback(
    async (page: number = 0, isRefresh: boolean = false) => {
      try {
        if (page === 0) {
          isRefresh ? setRefreshing(true) : setLoading(true);
        } else {
          setLoadingMore(true);
        }

        const category = selectedCategory === 'ALL' ? undefined : selectedCategory;
        const response: PageResponse<BoardPostListItem> = await fetchBoardPosts(
          studyId,
          category,
          searchQuery || undefined,
          page,
          20
        );

        if (page === 0) {
          setPosts(response.content);
        } else {
          setPosts((prev) => [...prev, ...response.content]);
        }

        setHasMore(!response.last);
        setCurrentPage(page);
      } catch (error) {
        console.error('Failed to load posts:', error);
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [studyId, selectedCategory, searchQuery]
  );

  useEffect(() => {
    loadPosts(0);
  }, [selectedCategory, searchQuery]);

  const handleRefresh = () => {
    loadPosts(0, true);
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      loadPosts(currentPage + 1);
    }
  };

  const handleCategoryPress = (category: FilterCategory) => {
    setSelectedCategory(category);
  };

  const handleSearch = () => {
    setSearchQuery(searchKeyword.trim());
  };

  const handleClearSearch = () => {
    setSearchKeyword('');
    setSearchQuery('');
    setShowSearch(false);
  };

  const handleLikePress = async (postId: number, event: any) => {
    event.stopPropagation();
    try {
      const response = await togglePostLike(studyId, postId);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                isLiked: response.isLiked,
                likeCount: response.isLiked ? p.likeCount + 1 : p.likeCount - 1,
              }
            : p
        )
      );
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  const renderCategoryBadge = (category: PostCategory) => {
    const colors = CATEGORY_COLORS[category];
    const label = CATEGORY_LABELS[category];

    return (
      <View style={[styles.categoryBadge, { backgroundColor: colors.bg }]}>
        <Text style={[styles.categoryText, { color: colors.text }]}>{label}</Text>
      </View>
    );
  };

  const renderPost = ({ item }: { item: BoardPostListItem }) => (
    <TouchableOpacity
      style={styles.postCard}
      onPress={() => onPostPress(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.postHeader}>
        {renderCategoryBadge(item.category)}
      </View>

      <Text style={styles.postTitle} numberOfLines={1}>
        {item.title}
      </Text>

      <Text style={styles.postPreview} numberOfLines={2}>
        {item.preview}
      </Text>

      <View style={styles.postFooter}>
        <View style={styles.authorInfo}>
          {item.authorProfileImage ? (
            <Image
              source={{ uri: item.authorProfileImage }}
              style={styles.authorAvatar}
            />
          ) : (
            <View style={[styles.authorAvatar, styles.authorAvatarPlaceholder]}>
              <Feather name="user" size={14} color="#71717A" />
            </View>
          )}
          <Text style={styles.authorName}>{item.authorNickname}</Text>
        </View>

        <View style={styles.statsContainer}>
          <TouchableOpacity
            style={styles.statItem}
            onPress={(e) => handleLikePress(item.id, e)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather
              name={item.isLiked ? 'heart' : 'heart'}
              size={12}
              color={item.isLiked ? '#EF4444' : '#71717A'}
              style={item.isLiked ? { opacity: 1 } : {}}
            />
            <Text style={[styles.statText, item.isLiked && styles.likedText]}>
              {item.likeCount}
            </Text>
          </TouchableOpacity>
          <View style={styles.statItem}>
            <Feather name="message-circle" size={12} color="#71717A" />
            <Text style={styles.statText}>{item.commentCount}</Text>
          </View>
          <View style={styles.statItem}>
            <Feather name="eye" size={12} color="#71717A" />
            <Text style={styles.statText}>{item.viewCount}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => {
    if (loading) return null;

    return (
      <View style={styles.emptyContainer}>
        <Feather name="file-text" size={48} color="#52525B" />
        <Text style={styles.emptyText}>
          {searchQuery ? '검색 결과가 없습니다' : '게시글이 없습니다'}
        </Text>
        <Text style={styles.emptySubtext}>
          {searchQuery ? '다른 키워드로 검색해보세요' : '첫 번째 게시글을 작성해보세요'}
        </Text>
      </View>
    );
  };

  const renderFooter = () => {
    if (!loadingMore) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#8B5CF6" />
      </View>
    );
  };

  if (loading && posts.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      {showSearch && (
        <View style={styles.searchContainer}>
          <View style={styles.searchInputWrapper}>
            <Feather name="search" size={18} color="#71717A" />
            <TextInput
              style={styles.searchInput}
              placeholder="제목, 내용 검색"
              placeholderTextColor="#71717A"
              value={searchKeyword}
              onChangeText={setSearchKeyword}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
              autoFocus
            />
            {searchKeyword.length > 0 && (
              <TouchableOpacity onPress={handleClearSearch}>
                <Feather name="x" size={18} color="#71717A" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      <View style={styles.header}>
        <View style={styles.categoryTabs}>
          {FILTER_TABS.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.categoryTab,
                selectedCategory === tab.key && styles.categoryTabActive,
              ]}
              onPress={() => handleCategoryPress(tab.key)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.categoryTabText,
                  selectedCategory === tab.key && styles.categoryTabTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => setShowSearch(!showSearch)}
            activeOpacity={0.7}
          >
            <Feather name="search" size={20} color={showSearch || searchQuery ? '#8B5CF6' : '#FFFFFF'} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.createButton}
            onPress={onCreatePress}
            activeOpacity={0.7}
          >
            <Feather name="plus" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {searchQuery && (
        <View style={styles.searchResultHeader}>
          <Text style={styles.searchResultText}>
            "{searchQuery}" 검색 결과
          </Text>
          <TouchableOpacity onPress={handleClearSearch}>
            <Text style={styles.clearSearchText}>지우기</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#8B5CF6"
            colors={['#8B5CF6']}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
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
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#27272A',
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#27272A',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#FFFFFF',
  },
  searchResultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#27272A50',
  },
  searchResultText: {
    fontSize: 14,
    color: '#A1A1AA',
  },
  clearSearchText: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#27272A',
  },
  categoryTabs: {
    flexDirection: 'row',
    gap: 8,
    flex: 1,
  },
  categoryTab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#27272A',
  },
  categoryTabActive: {
    backgroundColor: '#8B5CF6',
  },
  categoryTabText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#A1A1AA',
  },
  categoryTabTextActive: {
    color: '#FFFFFF',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  searchButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#27272A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  postCard: {
    backgroundColor: '#27272A',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  postHeader: {
    flexDirection: 'row',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  postTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  postPreview: {
    fontSize: 14,
    lineHeight: 19.6,
    color: '#A1A1AA',
  },
  postFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  authorAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  authorAvatarPlaceholder: {
    backgroundColor: '#3F3F46',
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorName: {
    fontSize: 12,
    color: '#71717A',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#71717A',
  },
  likedText: {
    color: '#EF4444',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#A1A1AA',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#71717A',
    marginTop: 8,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#18181B',
  },
  footerLoader: {
    paddingVertical: 16,
    alignItems: 'center',
  },
});
