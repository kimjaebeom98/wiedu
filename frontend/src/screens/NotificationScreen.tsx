import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../api/notification';
import { Notification, NOTIFICATION_STYLES, NotificationType } from '../types/notification';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// 날짜 그룹핑을 위한 헬퍼 함수
const getDateGroup = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const notifDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (notifDate.getTime() === today.getTime()) {
    return '오늘';
  } else if (notifDate.getTime() === yesterday.getTime()) {
    return '어제';
  } else {
    return `${date.getMonth() + 1}월 ${date.getDate()}일`;
  }
};

// 상대 시간 포맷
const formatRelativeTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return '방금 전';
  if (diffMins < 60) return `${diffMins}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;

  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
};

interface GroupedNotifications {
  title: string;
  data: Notification[];
}

export default function NotificationScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const loadNotifications = useCallback(async (pageNum: number = 0, refresh: boolean = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else if (pageNum > 0) {
        setLoadingMore(true);
      }

      const data = await fetchNotifications(pageNum, 20);

      if (refresh || pageNum === 0) {
        setNotifications(data.content);
      } else {
        setNotifications(prev => [...prev, ...data.content]);
      }

      setHasMore(!data.last);
      setPage(pageNum);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications(0);
  }, [loadNotifications]);

  const handleRefresh = () => {
    loadNotifications(0, true);
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      loadNotifications(page + 1);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleNotificationPress = async (notification: Notification) => {
    // 읽음 처리
    if (!notification.isRead) {
      try {
        await markNotificationAsRead(notification.id);
        setNotifications(prev =>
          prev.map(n => (n.id === notification.id ? { ...n, isRead: true } : n))
        );
      } catch (error) {
        console.error('Failed to mark as read:', error);
      }
    }

    // 알림 타입에 따른 화면 이동
    if (notification.targetId && notification.targetType === 'STUDY') {
      switch (notification.type) {
        case 'REVIEW_REQUEST':
        case 'STUDY_COMPLETED':
          // 스터디 상세에서 리뷰 화면으로 이동할 수 있도록 studyId 전달
          navigation.navigate('StudyDetail', { studyId: notification.targetId });
          break;
        case 'STUDY_APPROVED':
        case 'STUDY_REJECTED':
          navigation.navigate('StudyDetail', { studyId: notification.targetId });
          break;
        case 'NEW_APPLICANT':
          // 지원자 관리 화면으로 이동 (studyTitle은 알림에서 추출)
          navigation.navigate('StudyDetail', { studyId: notification.targetId });
          break;
        default:
          navigation.navigate('StudyDetail', { studyId: notification.targetId });
      }
    }
  };

  // 알림을 날짜별로 그룹핑
  const groupedNotifications: GroupedNotifications[] = React.useMemo(() => {
    const groups: Record<string, Notification[]> = {};

    notifications.forEach(notif => {
      const group = getDateGroup(notif.createdAt);
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(notif);
    });

    return Object.entries(groups).map(([title, data]) => ({ title, data }));
  }, [notifications]);

  const renderNotificationItem = ({ item }: { item: Notification }) => {
    const style = NOTIFICATION_STYLES[item.type as NotificationType] || NOTIFICATION_STYLES.STUDY_COMPLETED;

    return (
      <TouchableOpacity
        style={[styles.notifItem, !item.isRead && styles.notifItemUnread]}
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.notifIcon, { backgroundColor: style.bgColor }]}>
          <Feather name={style.icon as any} size={22} color={style.color} />
        </View>
        <View style={styles.notifContent}>
          <Text style={styles.notifTitle}>{item.title}</Text>
          <Text style={styles.notifMessage} numberOfLines={2}>
            {item.message}
          </Text>
          <Text style={styles.notifTime}>{formatRelativeTime(item.createdAt)}</Text>
        </View>
        {!item.isRead && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  const renderSectionHeader = (title: string) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#18181B" />
        <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
          <ActivityIndicator size="large" color="#8B5CF6" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#18181B" />
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>알림</Text>
        <TouchableOpacity
          style={styles.settingsBtn}
          onPress={handleMarkAllAsRead}
        >
          <Feather name="check-circle" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      {notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather name="bell-off" size={48} color="#3F3F46" />
          <Text style={styles.emptyText}>알림이 없습니다</Text>
        </View>
      ) : (
        <FlatList
          data={groupedNotifications}
          keyExtractor={(item, index) => `section-${index}`}
          renderItem={({ item: section }) => (
            <View>
              {renderSectionHeader(section.title)}
              {section.data.map(notif => (
                <View key={notif.id}>
                  {renderNotificationItem({ item: notif })}
                </View>
              ))}
            </View>
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#8B5CF6"
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color="#8B5CF6" />
              </View>
            ) : null
          }
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 100,
    backgroundColor: '#27272A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 100,
    backgroundColor: '#27272A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  sectionHeader: {
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#71717A',
  },
  notifItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 12,
  },
  notifItemUnread: {
    opacity: 1,
  },
  notifIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifContent: {
    flex: 1,
    gap: 4,
  },
  notifTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  notifMessage: {
    fontSize: 13,
    color: '#A1A1AA',
    lineHeight: 18,
  },
  notifTime: {
    fontSize: 12,
    color: '#52525B',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8B5CF6',
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#52525B',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});
