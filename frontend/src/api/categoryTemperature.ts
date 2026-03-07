import { getAuthClient } from './client';
import { withErrorHandling } from './apiError';
import { CategoryTemperature } from '../types/categoryTemperature';

export const getCategoryTemperatures = async (userId: number): Promise<CategoryTemperature[]> => {
  return withErrorHandling(
    async () => {
      const client = getAuthClient();
      const response = await client.get(`/api/users/${userId}/category-temperatures`);
      return response.data;
    },
    { defaultMessage: '카테고리별 온도를 불러오는데 실패했습니다.' }
  );
};
