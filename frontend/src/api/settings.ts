import { getAuthClient } from './client';
import { NotificationSettings } from '../types/settings';

export const getNotificationSettings = async (): Promise<NotificationSettings> => {
  const client = getAuthClient();
  const response = await client.get<NotificationSettings>('/api/users/me/settings/notifications');
  return response.data;
};

export const updateNotificationSettings = async (settings: NotificationSettings): Promise<void> => {
  const client = getAuthClient();
  await client.put('/api/users/me/settings/notifications', settings);
};

export const withdrawAccount = async (): Promise<void> => {
  const client = getAuthClient();
  await client.delete('/api/users/me');
};
