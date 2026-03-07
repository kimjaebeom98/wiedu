import { getAuthClient } from './client';
import { withErrorHandling } from './apiError';
import { NotificationSettings } from '../types/settings';

export const getNotificationSettings = async (): Promise<NotificationSettings> => {
  return withErrorHandling(
    async () => {
      const client = getAuthClient();
      const response = await client.get<NotificationSettings>('/api/users/me/settings/notifications');
      return response.data;
    },
    { defaultMessage: '알림 설정을 불러오는데 실패했습니다.' }
  );
};

export const updateNotificationSettings = async (settings: NotificationSettings): Promise<void> => {
  return withErrorHandling(
    async () => {
      const client = getAuthClient();
      await client.put('/api/users/me/settings/notifications', settings);
    },
    { defaultMessage: '알림 설정 저장에 실패했습니다.' }
  );
};

export const withdrawAccount = async (): Promise<void> => {
  return withErrorHandling(
    async () => {
      const client = getAuthClient();
      await client.delete('/api/users/me');
    },
    { defaultMessage: '회원 탈퇴에 실패했습니다. 잠시 후 다시 시도해주세요.' }
  );
};
