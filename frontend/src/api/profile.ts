import { getAuthClient } from './client';
import { withErrorHandling } from './apiError';
import { MyProfile, MyStudy } from '../types/profile';

export const getMyProfile = async (): Promise<MyProfile> => {
  return withErrorHandling(
    async () => {
      const client = getAuthClient();
      const response = await client.get('/api/users/me');
      return response.data;
    },
    { defaultMessage: '프로필을 불러오는데 실패했습니다.' }
  );
};

export const getMyStudies = async (): Promise<MyStudy[]> => {
  return withErrorHandling(
    async () => {
      const client = getAuthClient();
      const response = await client.get('/api/users/me/studies');
      return response.data;
    },
    { defaultMessage: '스터디 목록을 불러오는데 실패했습니다.' }
  );
};
