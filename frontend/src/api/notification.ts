import { getAuthClient } from './client';
import { withErrorHandling } from './apiError';
import { NotificationPage, UnreadCountResponse } from '../types/notification';

/**
 * 알림 목록 조회
 */
export const fetchNotifications = async (page: number = 0, size: number = 20): Promise<NotificationPage> => {
  return withErrorHandling(async () => {
    const client = getAuthClient();
    const response = await client.get<NotificationPage>('/api/notifications', {
      params: { page, size },
    });
    return response.data;
  }, { defaultMessage: '알림 목록을 불러오는데 실패했습니다.' });
};

/**
 * 읽지 않은 알림 수 조회
 */
export const fetchUnreadCount = async (): Promise<number> => {
  return withErrorHandling(async () => {
    const client = getAuthClient();
    const response = await client.get<UnreadCountResponse>('/api/notifications/unread-count');
    return response.data.count;
  }, { defaultMessage: '알림 수를 불러오는데 실패했습니다.' });
};

/**
 * 특정 알림 읽음 처리
 */
export const markNotificationAsRead = async (notificationId: number): Promise<void> => {
  return withErrorHandling(async () => {
    const client = getAuthClient();
    await client.patch(`/api/notifications/${notificationId}/read`);
  }, { defaultMessage: '알림 읽음 처리에 실패했습니다.' });
};

/**
 * 모든 알림 읽음 처리
 */
export const markAllNotificationsAsRead = async (): Promise<number> => {
  return withErrorHandling(async () => {
    const client = getAuthClient();
    const response = await client.patch<{ updated: number }>('/api/notifications/read-all');
    return response.data.updated;
  }, { defaultMessage: '알림 전체 읽음 처리에 실패했습니다.' });
};
