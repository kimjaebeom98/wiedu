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

export interface UpdateProfileRequest {
  nickname?: string;  // 이름은 변경 불가 - 온보딩에서만 설정
  bio?: string | null;
  region?: string;
  latitude?: number | null;
  longitude?: number | null;
  interests?: string[];
}

export const updateMyProfile = async (data: UpdateProfileRequest): Promise<void> => {
  return withErrorHandling(
    async () => {
      const client = getAuthClient();
      await client.put('/api/users/me', data);
    },
    { defaultMessage: '프로필 저장에 실패했습니다.' }
  );
};

const MAX_ACTIVE_STUDIES = 3;

export const checkStudyLimitExceeded = async (): Promise<{ exceeded: boolean; count: number }> => {
  const myStudies = await getMyStudies();
  const activeCount = myStudies.filter(
    s => s.status === 'RECRUITING' || s.status === 'IN_PROGRESS'
  ).length;
  return {
    exceeded: activeCount >= MAX_ACTIVE_STUDIES,
    count: activeCount,
  };
};
