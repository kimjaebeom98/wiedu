import { getAuthClient } from './client';
import { MyProfile, MyStudy } from '../types/mypage';

const apiClient = getAuthClient();

/**
 * 내 프로필 조회
 */
export const fetchMyProfile = async (): Promise<MyProfile> => {
  const response = await apiClient.get<MyProfile>('/api/users/me');
  return response.data;
};

/**
 * 내 스터디 목록 조회
 */
export const fetchMyStudies = async (params?: {
  status?: string;
  role?: string;
}): Promise<MyStudy[]> => {
  const response = await apiClient.get<MyStudy[]>('/api/users/me/studies', {
    params,
  });
  return response.data;
};
