import { getAuthClient } from './client';
import { withErrorHandling } from './apiError';
import { NearbyMember } from '../types/user';

/**
 * 근처 활동중인 멤버 조회
 * @param latitude 위도 (옵션, 없으면 프로필 위치 사용)
 * @param longitude 경도 (옵션, 없으면 프로필 위치 사용)
 * @param radius 반경 km (기본 10km)
 * @param limit 최대 조회 수 (기본 10)
 */
export const fetchNearbyMembers = async (
  latitude?: number,
  longitude?: number,
  radius: number = 10,
  limit: number = 10
): Promise<NearbyMember[]> => {
  return withErrorHandling(
    async () => {
      const client = getAuthClient();
      const params: Record<string, any> = { radius, limit };
      if (latitude !== undefined) params.latitude = latitude;
      if (longitude !== undefined) params.longitude = longitude;

      const response = await client.get('/api/users/nearby', { params });
      return response.data;
    },
    { defaultMessage: '근처 멤버를 불러오는데 실패했습니다.' }
  );
};
